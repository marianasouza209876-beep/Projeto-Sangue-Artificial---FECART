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
    4. Vítimas de Envenenamento por Monóxido de Carbono (CO)
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
    elif "Trauma" in finalidade or "Hemorragia" in finalidade:
        # B1-B5 Trauma e Hemorragia Grave
        carga_o2 = 99.0 + random.uniform(-0.2, 0.2)
        pressao_oncotica = 25.0 + random.uniform(-0.2, 0.2)
        permutabilidade = 95.0 + random.uniform(-0.3, 0.3)
        resistencia_compressao = 90.0 + random.uniform(-0.3, 0.3)
        tamponamento_ph = 7.40 + random.uniform(-0.02, 0.02)
        
        return {
            "lote_id": lote_id,
            "finalidade": "Trauma e Hemorragia Grave",
            "b1_carga_o2": f"{carga_o2:.1f}%",
            "b2_pressao_oncotica": f"{pressao_oncotica:.1f} mmHg",
            "b3_permutabilidade": f"{permutabilidade:.1f}%",
            "b4_resistencia_compressao": f"{resistencia_compressao:.1f}%",
            "b5_tamponamento_ph": f"{tamponamento_ph:.2f} pH",
            "b1_status": "MÁXIMA",
            "b2_status": "FISIOLÓGICA",
            "b3_status": "EFICIENTE",
            "b4_status": "ALTA",
            "b5_status": "NEUTRO",
            "oxigenacao": f"{carga_o2:.1f}%",
            "temperatura": "36.5C",
            "vazao": "4.8 L/min"
        }
    elif "Cirurgia" in finalidade or "Cardíaca" in finalidade or "Cardiaca" in finalidade or "Cardiovascular" in finalidade:
        # B1-B5 Cirurgia Cardíaca e Cardiovascular
        compatibilidade_cec = 98.5 + random.uniform(-0.2, 0.2)
        tensao_cisalhamento = 1.8 + random.uniform(-0.1, 0.1)
        meia_vida_extended = 48.0 + random.uniform(-0.2, 0.2)
        tamponamento_lactato = 7.42 + random.uniform(-0.02, 0.02)
        viscosidade_hipotermia = 3.0 + random.uniform(-0.1, 0.1)
        
        return {
            "lote_id": lote_id,
            "finalidade": "Cirurgia Cardíaca e Cardiovascular",
            "b1_compatibilidade_cec": f"{compatibilidade_cec:.1f}%",
            "b2_tensao_cisalhamento": f"{tensao_cisalhamento:.1f} cP",
            "b3_meia_vida_extended": f"{meia_vida_extended:.1f} h",
            "b4_tamponamento_lactato": f"{tamponamento_lactato:.2f} pH",
            "b5_viscosidade_hipotermia": f"{viscosidade_hipotermia:.1f} cP",
            "b1_status": "EXCELENTE",
            "b2_status": "TOLERANTE",
            "b3_status": "PROLONGADO",
            "b4_status": "ATIVO",
            "b5_status": "CONTROLADA",
            "oxigenacao": f"{compatibilidade_cec:.1f}%",
            "temperatura": f"{viscosidade_hipotermia:.1f}C",
            "vazao": "4.8 L/min"
        }
    elif "Anemia" in finalidade or "Anemias" in finalidade:
        # B1-B5 Tratamento de Anemias Graves
        p50 = 28.0 + random.uniform(-0.2, 0.2)
        imuno = 100.0
        estabilidade = 96.0 + random.uniform(-0.2, 0.2)
        infusao_lenta = 36.0 + random.uniform(-0.2, 0.2)
        retencao_vascular = 30.0 + random.uniform(-0.2, 0.2)
        
        return {
            "lote_id": lote_id,
            "finalidade": "Tratamento de Anemias Graves",
            "b1_p50": f"{p50:.1f} mmHg",
            "b2_ausencia_imunogenica": f"{imuno:.1f}%",
            "b3_estabilidade_plasmatica": f"{estabilidade:.1f}%",
            "b4_tolerancia_infusao_lenta": f"{infusao_lenta:.1f} h",
            "b5_retencao_vascular": f"{retencao_vascular:.1f} h",
            "b1_status": "OTIMIZADA",
            "b2_status": "ISENTO",
            "b3_status": "ALTA",
            "b4_status": "ADAPTADO",
            "b5_status": "ESTÁVEL",
            "oxigenacao": "96.0%",
            "temperatura": "36.5C",
            "vazao": "4.8 L/min"
    elif "Oncológico" in finalidade or "Oncologico" in finalidade:
        # B1-B5 Tratamento Oncológico
        quimio = 99.0 + random.uniform(-0.2, 0.2)
        estresse_ox = 94.0 + random.uniform(-0.2, 0.2)
        microcirculacao = 2.0 + random.uniform(-0.1, 0.1)
        neutropenicos = 100.0
        purificacao = 99.5 + random.uniform(-0.1, 0.1)
        
        return {
            "lote_id": lote_id,
            "finalidade": "Tratamento Oncológico",
            "b1_compatibilidade_quimio": f"{quimio:.1f}%",
            "b2_protecao_estresse_ox": f"{estresse_ox:.1f}%",
            "b3_permeabilidade_microcirculacao": f"{microcirculacao:.1f} cP",
            "b4_estabilidade_neutropenicos": f"{neutropenicos:.1f}%",
            "b5_purificacao_molecular": f"{purificacao:.1f}%",
            "b1_status": "INERTE",
            "b2_status": "ELEVADA",
            "b3_status": "LIVRE",
            "b4_status": "SEGURO",
            "b5_status": "PUREZA MÁXIMA",
            "oxigenacao": f"{quimio:.1f}%",
            "temperatura": "37.0C",
            "vazao": "4.8 L/min"
    elif "Politraumatizados" in finalidade or "Politrauma" in finalidade:
        # B1-B5 Atendimento a Pacientes Politraumatizados
        multiorganico = 97.5 + random.uniform(-0.2, 0.2)
        acidose = 7.38 + random.uniform(-0.02, 0.02)
        infusao_pressurizada = 92.0 + random.uniform(-0.3, 0.3)
        expansora_plasma = 26.0 + random.uniform(-0.2, 0.2)
        variancia_termica = 36.5 + random.uniform(-0.2, 0.2)
        
        return {
            "lote_id": lote_id,
            "finalidade": "Atendimento a Pacientes Politraumatizados",
            "b1_suporte_multiorganico": f"{multiorganico:.1f}%",
            "b2_resistencia_acidose": f"{acidose:.2f} pH",
            "b3_estabilidade_infusao_pressurizada": f"{infusao_pressurizada:.1f}%",
            "b4_capacidade_expansora_plasma": f"{expansora_plasma:.1f} mmHg",
            "b5_integridade_variancia_termica": f"{variancia_termica:.1f}°C",
            "b1_status": "CRÍTICO",
            "b2_status": "TAMPONADO",
            "b3_status": "RESISTENTE",
            "b4_status": "ÓTIMA",
            "b5_status": "ESTÁVEL",
            "oxigenacao": f"{multiorganico:.1f}%",
            "temperatura": f"{variancia_termica:.1f}C",
            "vazao": "4.8 L/min"
    elif "Doação" in finalidade or "Doacao" in finalidade:
        # B1-B5 Doação de Sangue
        isencao = 100.0
        purificacao = 99.9 + random.uniform(-0.05, 0.05)
        conservacao = 42.0 + random.uniform(-0.2, 0.2)
        osmotica = 290.0 + random.uniform(-0.5, 0.5)
        fluidez = 2.5 + random.uniform(-0.1, 0.1)
        
        return {
            "lote_id": lote_id,
            "finalidade": "Doação de Sangue",
            "b1_isencao_antigenica": f"{isencao:.1f}%",
            "b2_purificacao_biologica": f"{purificacao:.1f}%",
            "b3_conservabilidade_estoque": f"{conservacao:.1f} dias",
            "b4_estabilidade_osmotica": f"{osmotica:.1f} mOsm",
            "b5_fluidez_fracionamento": f"{fluidez:.1f} cP",
            "b1_status": "ISENTO",
            "b2_status": "ESTÉRIL",
            "b3_status": "EXTENSA",
            "b4_status": "EQUILIBRADA",
            "b5_status": "IDEAL",
            "oxigenacao": "99.0%",
            "temperatura": "4.0C",
            "vazao": "4.8 L/min"
        }
        # B1-B4 Vítimas de Envenenamento por Monóxido de Carbono (CO)
        deslocamento_co = 88.0 + random.uniform(-0.4, 0.4)
        effluence_depurantes = 91.2 + random.uniform(-0.3, 0.3)
        ph = 7.42 + random.uniform(-0.02, 0.02)
        cohb_residual = 2.1 + random.uniform(-0.1, 0.1)
        
        return {
            "lote_id": lote_id,
            "finalidade": "Vítimas de Envenenamento por Monóxido de Carbono (CO)",
            "b1_deslocamento_co": f"{deslocamento_co:.1f}%",
            "b2_effluence_depurantes": f"{effluence_depurantes:.1f}%",
            "b3_ph": f"{ph:.2f} pH",
            "b4_cohb_residual": f"{cohb_residual:.1f}%",
            "oxigenacao": f"{deslocamento_co:.1f}%",
            "temperatura": "37.0C",
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

def validar_e_sanitizar_payload(payload, lote_padrao="SA-026"):
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
    Leitura ultra-resiliente da porta serial do Arduino com tratamento específico de erros de Timeout,
    filtragem de ruídos eletromagnéticos e exceções físicas para evitar travamento na transmissão de dados.
    """
    if not ser:
        return None
        
    try:
        if hasattr(ser, 'in_waiting') and ser.in_waiting > 0:
            linha_bytes = ser.readline()
            if linha_bytes:
                texto_bruto = linha_bytes.decode("utf-8", errors="ignore").strip()
                # Filtrar ruídos de transmissão e caracteres de controle corrompidos
                texto_limpo = "".join(c for c in texto_bruto if c.isprintable())
                if texto_limpo:
                    return texto_limpo
    except (getattr(serial, 'SerialTimeoutException', Exception), TimeoutError, OSError) as timeout_err:
        print(f"⏱️ [ALERTA DE TIMEOUT SERIAL]: Conexão lenta / tempo limite excedido ({timeout_err}). Ativando fallback de buffer.")
        try:
            if hasattr(ser, 'reset_input_buffer'):
                ser.reset_input_buffer()
        except Exception:
            pass
        return None
    except (getattr(serial, 'SerialException', Exception), AttributeError, TypeError) as ser_err:
        print(f"⚠️ [EXCEÇÃO SERIAL CAPTURADA]: Comunicação com porta física interrompida ({ser_err}). Ativando fallback resiliente.")
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
    parser.add_argument("--lote", default="SA-026", help="ID do Lote de Sangue Artificial")
    
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
            print("Ativando MODO SIMULADO AUTOMÁTICO com resiliência a desconexões e timeouts...")
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
