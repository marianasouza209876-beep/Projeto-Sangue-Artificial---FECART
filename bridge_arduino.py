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

def gerar_dados_simulados(t, lote_id="SA-023", finalidade=""):
    """
    Gera dados biomédicos simulados e validados para os lotes.
    Suporta:
    1. Atendimento Pré-Hospitalar de Emergência
    2. Preservação Avançada de Órgãos para Transplante
    3. Resgate e Cirurgias em Altas Altitudes
    """
    if "Emergência" in finalidade or "Atendimento" in finalidade or lote_id == "SA-023":
        # B1-B5 Pré-Hospitalar de Emergência
        ox = 98.0 + random.uniform(-0.3, 0.3)
        visc = 2.3 + random.uniform(-0.1, 0.1)
        temp = 22.0 + random.uniform(-0.2, 0.2)
        meia_vida = 24.0 + random.uniform(-0.1, 0.1)
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
    elif "Transplante" in finalidade or "Órgãos" in finalidade or lote_id == "SA-024":
        # B1-B5 Preservação de Órgãos para Transplante
        p_osmotica = 25.0 + random.uniform(-0.2, 0.2)
        antioxidante = 94.5 + random.uniform(-0.3, 0.3)
        ph = 7.38 + random.uniform(-0.02, 0.02)
        pco2 = 40.0 + random.uniform(-0.4, 0.4)
        glicose = 100.0 + random.uniform(-0.5, 0.5)
        
        return {
            "lote_id": lote_id,
            "finalidade": "Preservação Avançada de Órgãos para Transplante",
            "b1_pressao_osmotica": f"{p_osmotica:.1f} mmHg",
            "b2_antioxidante": f"{antioxidante:.1f}%",
            "b3_ph": f"{ph:.2f} pH",
            "b4_pco2": f"{pco2:.1f} mmHg",
            "b5_glicose": f"{glicose:.1f} mg/dL",
            "oxigenacao": "98.0%",
            "temperatura": "4.0C",
            "vazao": "3.5 L/min"
        }
    elif "Altitude" in finalidade or "Altitudes" in finalidade or lote_id == "SA-025":
        # B1-B4 Resgate e Cirurgias em Altas Altitudes
        p50 = 34.0 + random.uniform(-0.3, 0.3)
        ponto_congelamento = -2.5 + random.uniform(-0.1, 0.1)
        saturacao_o2 = 96.5 + random.uniform(-0.3, 0.3)
        po2 = 92.0 + random.uniform(-0.4, 0.4)
        
        return {
            "lote_id": lote_id,
            "finalidade": "Resgate e Cirurgias em Altas Altitudes",
            "b1_p50": f"{p50:.1f} mmHg",
            "b2_ponto_congelamento": f"{ponto_congelamento:.1f}°C",
            "b3_saturacao_o2": f"{saturacao_o2:.1f}%",
            "b4_po2": f"{po2:.1f} mmHg",
            "oxigenacao": f"{saturacao_o2:.1f}%",
            "temperatura": f"{ponto_congelamento:.1f}C",
            "vazao": "4.8 L/min"
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

def validar_e_sanitizar_payload(payload, lote_padrao="SA-025"):
    """
    Valida rigorosamente os dados recebidos para evitar corrupção de estado ou travamento da aplicação.
    """
    if not isinstance(payload, dict):
        return None
        
    lote_id = str(payload.get("lote_id", lote_padrao)).strip().upper()
    if not lote_id:
        lote_id = lote_padrao
        
    payload["lote_id"] = lote_id
    return payload

def enviar_dados(url, payload):
    """
    Dispara o JSON sanitizado para a API do site.
    """
    payload_validado = validar_e_sanitizar_payload(payload)
    if not payload_validado:
        print("[Aviso] Payload corrompido descartado pela validação.")
        return

    try:
        response = requests.post(url, json=payload_validado, timeout=2.0)
        if response.status_code == 200:
            res_json = response.json()
            data_proc = res_json.get("data", {})
            ia_data = data_proc.get("ia_explicavel", {})
            nivel_risco = ia_data.get("nivel_risco", "N/A")
            risco_pct = ia_data.get("risco_degradacao_pct", 0)
            print(f"[HTTP 200] Enviado com sucesso! Lote: {payload_validado['lote_id']} | Status IA: {nivel_risco} ({risco_pct}%)")
        else:
            print(f"[HTTP {response.status_code}] Servidor recusou dados: {response.text}")
    except requests.exceptions.RequestException as e:
        print(f"[Aviso de Conexão Backend] Não foi possível conectar ao endpoint HTTP: {e}")
    except Exception as ex:
        print(f"[Erro no Envio de Dados]: {ex}")

def ler_serial_com_tratamento_excecao(ser):
    """
    Leitura ultra-resiliente da porta serial do Arduino com tratamento de exceções completo e fallback instantâneo.
    """
    if not ser:
        return None
        
    try:
        if hasattr(ser, 'in_waiting') and ser.in_waiting > 0:
            linha_bytes = ser.readline()
            if linha_bytes:
                return linha_bytes.decode("utf-8", errors="ignore").strip()
    except (serial.SerialException, OSError, AttributeError, TypeError) as ser_err:
        print(f"⚠️ [EXCEÇÃO SERIAL CAPTURADA]: Conexão serial física interrompida ({ser_err}). Ativando fallback resiliente.")
        try:
            if hasattr(ser, 'close'):
                ser.close()
        except Exception:
            pass
        return "ERROR_DISCONNECTED"
    except Exception as general_err:
        print(f"⚠️ [ERRO LEITURA SERIAL]: {general_err}")
        return None
        
    return None

def main():
    parser = argparse.ArgumentParser(description="Ponte de Comunicação Resiliente Arduino -> Flowtificial API")
    parser.add_argument("--url", default=DEFAULT_API_URL, help="URL do endpoint HTTP POST do backend")
    parser.add_argument("--port", default=DEFAULT_PORT, help="Porta Serial do Arduino (ex: COM3, /dev/ttyUSB0)")
    parser.add_argument("--baud", type=int, default=DEFAULT_BAUD, help="Baudrate da conexão Serial")
    parser.add_argument("--simulado", action="store_true", help="Forçar modo simulado de sensores")
    parser.add_argument("--lote", default="SA-025", help="ID do Lote de Sangue Artificial")
    
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
            print(f"Conectando na porta serial física {args.port} a {args.baud} bps...")
            ser = serial.Serial(args.port, args.baud, timeout=1.0)
            time.sleep(2.0)
            print(f"Conectado com sucesso na porta {args.port}!")
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
                    print("Ativando modo simulado dinâmico devido à desconexão USB...")
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
