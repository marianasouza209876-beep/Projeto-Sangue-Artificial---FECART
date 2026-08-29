import time
import json
import random
import math
import argparse
import sys
import requests

try:
    import serial
    from serial.tools import list_ports
except ImportError:
    print("Aviso: Biblioteca 'pyserial' não encontrada. O script rodará em modo simulado por padrão.")
    serial = None

# Configurações padrão
DEFAULT_API_URL = "http://localhost:8000/api/sensor-data"
DEFAULT_PORT = "COM3"
DEFAULT_BAUD = 9600

def gerar_dados_simulados(t, lote_id="SA-023", finalidade="Atendimento Pré-Hospitalar de Emergência"):
    """
    Gera dados biomédicos realistas baseados no mapeamento dos sensores.
    Para Atendimento Pré-Hospitalar de Emergência, mapeia para os 5 parâmetros B1-B5.
    """
    if "Emergência" in finalidade or "Atendimento" in finalidade or "SA-023" in lote_id:
        # B1: Saturação de O2 (Oxigenação): ideal 98.0%
        ox = 98.0 + random.uniform(-0.3, 0.3)
        # B2: Viscosidade: ideal 2.3 cP
        visc = 2.3 + random.uniform(-0.1, 0.1)
        # B3: Estabilidade Térmica: ideal 22.0°C
        temp = 22.0 + random.uniform(-0.2, 0.2)
        # B4: Tempo de Meia-Vida: ideal 24.0h
        meia_vida = 24.0 + random.uniform(-0.1, 0.1)
        # B5: Extração de O2 Tisular: ideal 42.0%
        extracao = 42.0 + random.uniform(-0.2, 0.2)
        
        return {
            "lote_id": lote_id,
            "finalidade": "Atendimento Pré-Hospitalar de Emergência",
            "oxigenacao": f"{ox:.1f}%",
            "temperatura": f"{temp:.1f}C",
            "vazao": "4.8 L/min",
            "b1_oxigenacao": f"{ox:.1f}%",
            "b2_viscosidade": f"{visc:.1f} cP",
            "b3_estabilidade_termica": f"{temp:.1f}°C",
            "b4_meia_vida": f"{meia_vida:.1f} h",
            "b5_extracao_o2": f"{extracao:.1f}%"
        }
    else:
        ox = 95.0 + 2.0 * math.sin(t / 20.0) + random.uniform(-0.4, 0.4)
        temp = 36.6 + 0.5 * math.sin(t / 40.0) + random.uniform(-0.1, 0.1)
        vazao = 4.8 + random.uniform(-0.1, 0.1)
        return {
            "lote_id": lote_id,
            "oxigenacao": f"{ox:.1f}%",
            "temperatura": f"{temp:.1f}C",
            "vazao": f"{vazao:.1f} L/min"
        }

def enviar_dados(url, payload):
    """
    Dispara o JSON para o endpoint HTTP POST da aplicação com tratamento de exceção de rede.
    """
    try:
        response = requests.post(url, json=payload, timeout=2.0)
        if response.status_code == 200:
            res_json = response.json()
            data_proc = res_json.get("data", {})
            ia_data = data_proc.get("ia_explicavel", {})
            nivel_risco = ia_data.get("nivel_risco", "N/A")
            risco_pct = ia_data.get("risco_degradacao_pct", 0)
            print(f"[HTTP 200] Enviado com sucesso! Lote: {payload['lote_id']} | Status IA: {nivel_risco} ({risco_pct}%)")
        else:
            print(f"[HTTP {response.status_code}] Servidor retornou código não-200: {response.text}")
    except requests.exceptions.RequestException as e:
        print(f"[Aviso de Conexão Backend] Não foi possível conectar ao endpoint HTTP: {e}")
    except Exception as ex:
        print(f"[Erro Genérico no Envio]: {ex}")

def ler_serial_com_tratamento_excecao(ser):
    """
    Leitura resiliente da porta serial USB do Arduino com tratamento completo de exceções
    para evitar travamentos do script caso a comunicação física seja interrompida ou cabo desconectado.
    """
    if not ser:
        return None
        
    try:
        if hasattr(ser, 'in_waiting') and ser.in_waiting > 0:
            linha_bytes = ser.readline()
            if linha_bytes:
                return linha_bytes.decode("utf-8", errors="ignore").strip()
    except (serial.SerialException, OSError, AttributeError, TypeError) as ser_err:
        print(f"⚠️ [EXCEÇÃO SERIAL CAPTURADA]: Comunicação com porta física interrompida ({ser_err}). Fallback automático para modo resiliência.")
        try:
            if hasattr(ser, 'close'):
                ser.close()
        except Exception:
            pass
        return "ERROR_DISCONNECTED"
    except Exception as general_err:
        print(f"⚠️ [ERRO SERIAL]: {general_err}")
        return None
        
    return None

def main():
    parser = argparse.ArgumentParser(description="Ponte de Comunicação Resiliente Arduino -> Flowtificial API")
    parser.add_argument("--url", default=DEFAULT_API_URL, help="URL do endpoint HTTP POST do backend")
    parser.add_argument("--port", default=DEFAULT_PORT, help="Porta Serial do Arduino (ex: COM3, /dev/ttyUSB0)")
    parser.add_argument("--baud", type=int, default=DEFAULT_BAUD, help="Baudrate da conexão Serial")
    parser.add_argument("--simulado", action="store_true", help="Forçar modo simulado de sensores")
    parser.add_argument("--lote", default="SA-023", help="ID do Lote de Sangue Artificial")
    
    args = parser.parse_args()
    
    print("==========================================================")
    print("    PONTE DE DADOS RESILIENTE ARDUINO - FLOWTIFICIAL       ")
    print("==========================================================")
    print(f"Endpoint Alvo: {args.url}")
    print(f"Lote Monitorado: {args.lote}")
    
    modo_simulado = args.simulado or (serial is None)
    ser = None
    
    if not modo_simulado:
        try:
            print(f"Conectando na porta serial {args.port} a {args.baud} bps...")
            ser = serial.Serial(args.port, args.baud, timeout=1.0)
            time.sleep(2.0) # Aguarda inicialização da placa física
            print(f"Conectado com sucesso na porta física {args.port}!")
        except Exception as e:
            print(f"Aviso: Não foi possível abrir a porta física {args.port}: {e}")
            print("Ativando MODO SIMULADO AUTOMÁTICO com resiliência a desconexões...")
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
                linha = ler_serial_com_tratamento_excecao(ser)
                
                if linha == "ERROR_DISCONNECTED":
                    print("Ativando modo simulado dinâmico devido à perda do cabo USB...")
                    modo_simulado = True
                    continue
                    
                if linha:
                    print(f"[Serial Lida]: {linha}")
                    payload = None
                    if linha.startswith("{") and linha.endswith("}"):
                        try:
                            payload = json.loads(linha)
                        except json.JSONDecodeError:
                            pass
                    else:
                        partes = [p.strip() for p in linha.split(",")]
                        if len(partes) >= 3:
                            payload = {
                                "lote_id": args.lote if len(partes) == 3 else partes[0],
                                "oxigenacao": partes[0] if len(partes) == 3 else partes[1],
                                "temperatura": partes[1] if len(partes) == 3 else partes[2],
                                "vazao": partes[2] if len(partes) == 3 else partes[3]
                            }
                    
                    if payload:
                        if "lote_id" not in payload:
                            payload["lote_id"] = args.lote
                        enviar_dados(args.url, payload)
                        
            time.sleep(0.2)
            
    except KeyboardInterrupt:
        print("\nPonte encerrada com segurança pelo operador.")
        if ser and hasattr(ser, 'is_open') and ser.is_open:
            try:
                ser.close()
            except Exception:
                pass
            print("Porta serial fechada.")

if __name__ == "__main__":
    main()
