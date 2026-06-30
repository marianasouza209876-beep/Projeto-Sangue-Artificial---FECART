import time
import json
import random
import math
import argparse
import sys
import requests

try:
    import serial
except ImportError:
    print("Aviso: Biblioteca 'pyserial' nao encontrada. O script rodara em modo simulado por padrao.")
    serial = None

# Configuraçoes padrao
DEFAULT_API_URL = "http://localhost:8000/api/sensor-data"
DEFAULT_PORT = "COM3"
DEFAULT_BAUD = 9600

def gerar_dados_simulados(t, lote_id="SA-025"):
    """
    Gera dados biomédicos realistas baseados em ondas senoidais e ruído aleatório.
    Simula variaçoes fisiológicas de um lote de sangue artificial em circulaçao.
    """
    # Oxigenaçao: oscila entre 91% e 97% com pequenos ruidos
    ox = 94.0 + 3.0 * math.sin(t / 20.0) + random.uniform(-0.5, 0.5)
    ox_str = f"{ox:.1f}%"
    
    # Temperatura: oscila lentamente em torno de 36.6C, simulando aquecimento gradual
    temp = 36.6 + 0.8 * math.sin(t / 40.0) + random.uniform(-0.1, 0.1)
    
    # Simular anomalia térmica a cada 180 segundos para mostrar o alerta na feira!
    if (t % 240) > 180:
        # Febre térmica do composto
        temp += 2.0 * ((t % 240 - 180) / 60.0)
        
    temp_str = f"{temp:.1f}C"
    
    # Vazao: simula pulso da bomba, oscilando em torno de 4.8 L/min
    vazao = 4.8 + 0.6 * math.sin(t / 5.0) + random.uniform(-0.2, 0.2)
    vazao_str = f"{vazao:.1f} L/min"
    
    return {
        "lote_id": lote_id,
        "oxigenacao": ox_str,
        "temperatura": temp_str,
        "vazao": vazao_str
    }

def enviar_dados(url, payload):
    """
    Dispara o JSON para o endpoint HTTP POST do site.
    """
    try:
        response = requests.post(url, json=payload, timeout=2.0)
        if response.status_code == 200:
            res_json = response.json()
            data_proc = res_json.get("data", {})
            ia_data = data_proc.get("ia_explicavel", {})
            nivel_risco = ia_data.get("nivel_risco", "N/A")
            risco_pct = ia_data.get("risco_degradacao_pct", 0)
            print(f"[HTTP 200] Enviado com sucesso! Lote: {payload['lote_id']} | Oxigenacao: {payload['oxigenacao']} | Temp: {payload['temperatura']} | Vazao: {payload['vazao']}")
            print(f"       -> Camada de IA: Risco {risco_pct}% | Status: {nivel_risco}")
        else:
            print(f"[Erro HTTP {response.status_code}] Servidor recusou os dados: {response.text}")
    except requests.exceptions.RequestException as e:
        print(f"[Erro de Conexao] Nao foi possivel conectar a {url}. O backend do site esta rodando? ({e})")

def main():
    parser = argparse.ArgumentParser(description="Ponte de Comunicaçao Arduino -> Flowtificial API")
    parser.add_argument("--url", default=DEFAULT_API_URL, help="URL do endpoint HTTP POST do backend")
    parser.add_argument("--port", default=DEFAULT_PORT, help="Porta Serial do Arduino (ex: COM3, /dev/ttyUSB0)")
    parser.add_argument("--baud", type=int, default=DEFAULT_BAUD, help="Baudrate da conexao Serial")
    parser.add_argument("--simulado", action="store_true", help="Forçar modo simulado de sensores")
    parser.add_argument("--lote", default="SA-025", help="ID do Lote de Sangue Artificial a ser atualizado")
    
    args = parser.parse_args()
    
    print("==========================================================")
    print("       PONTE DE DADOS AUTOMATIZADA - FLOWTIFICIAL          ")
    print("==========================================================")
    print(f"Endpoint Alvo: {args.url}")
    print(f"Lote Monitorado: {args.lote}")
    
    modo_simulado = args.simulado or (serial is None)
    ser = None
    
    if not modo_simulado:
        try:
            print(f"Tentando conectar na porta serial {args.port} a {args.baud} bps...")
            ser = serial.Serial(args.port, args.baud, timeout=1.0)
            time.sleep(2.0) # Aguarda inicializaçao do Arduino
            print(f"Conectado com sucesso na porta {args.port}!")
        except Exception as e:
            print(f"Nao foi possivel abrir a porta {args.port}: {e}")
            print("Entrando em MODO SIMULADO AUTOMATICO (fallback)...")
            modo_simulado = True
            
    t = 0
    try:
        while True:
            if modo_simulado:
                payload = gerar_dados_simulados(t, args.lote)
                enviar_dados(args.url, payload)
                t += 2
                time.sleep(2.0)
            else:
                try:
                    if ser.in_waiting > 0:
                        linha = ser.readline().decode("utf-8", errors="ignore").strip()
                        if not linha:
                            continue
                            
                        print(f"[Serial Lida]: {linha}")
                        
                        # Espera formato JSON ou CSV do Arduino
                        # Exemplo CSV: SA-025,95%,36.5,4.8
                        # Exemplo JSON: {"lote_id": "SA-025", "oxigenacao": "95%", "temperatura": "36.5", "vazao": "4.8"}
                        
                        payload = None
                        if linha.startswith("{") and linha.endswith("}"):
                            try:
                                payload = json.loads(linha)
                            except json.JSONDecodeError:
                                pass
                        else:
                            partes = [p.strip() for p in linha.split(",")]
                            if len(partes) >= 3:
                                # Se nao veio lote_id na serial, usa o padrão do script
                                if len(partes) == 3:
                                    payload = {
                                        "lote_id": args.lote,
                                        "oxigenacao": partes[0],
                                        "temperatura": partes[1],
                                        "vazao": partes[2]
                                    }
                                else:
                                    payload = {
                                        "lote_id": partes[0],
                                        "oxigenacao": partes[1],
                                        "temperatura": partes[2],
                                        "vazao": partes[3]
                                    }
                        
                        if payload:
                            # Garantir campos necessarios
                            if "lote_id" not in payload:
                                payload["lote_id"] = args.lote
                            enviar_dados(args.url, payload)
                        else:
                            print(f"[Aviso] Formato de linha invalido na serial: {linha}")
                            
                except Exception as ex:
                    print(f"Erro na leitura serial: {ex}")
                    time.sleep(1.0)
                    
            time.sleep(0.1)
            
    except KeyboardInterrupt:
        print("\nPonte encerrada pelo operador.")
        if ser and ser.is_open:
            ser.close()
            print("Porta serial fechada.")

if __name__ == "__main__":
    main()
