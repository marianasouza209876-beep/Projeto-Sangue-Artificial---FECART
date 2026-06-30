import sys
import os

# Adiciona o diretório atual no PATH para importar
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.processing import processar_leituras, limpar_e_converter_float
from app.ai_model import analisar_risco_ia

def testar_limpeza_string():
    print("Testando Camada de Processamento (Limpeza de Ruídos)...")
    
    # Casos de teste de digitação comum da feira
    assert limpar_e_converter_float("95%") == 95.0
    assert limpar_e_converter_float("36.5C") == 36.5
    assert limpar_e_converter_float("36,5") == 36.5
    assert limpar_e_converter_float("4.8L/min") == 4.8
    assert limpar_e_converter_float("92pco") == 92.0
    assert limpar_e_converter_float("89 pct") == 89.0
    
    # Caso nulo
    assert limpar_e_converter_float(None) is None
    
    print("OK: Camada de Processamento: Limpeza concluida com sucesso!")

def testar_normalizacao_e_alarmes():
    print("Testando Camada de Processamento (Normalizacao e Alarmes)...")
    
    # Testar oxigenacao maior que 1.0 e normalizacao
    res = processar_leituras(ox_bruto="95%", temp_bruto="36.5C", vazao_bruto="4.8")
    assert res["oxigenacao_limpa"] == 0.95
    assert res["temperatura_c"] == 36.5
    assert res["vazao_l_min"] == 4.8
    assert res["status"] == "ESTÁVEL"
    
    # Testar limites criticos de febre termica e oxigenacao
    res_critico = processar_leituras(ox_bruto="82%", temp_bruto="39.2", vazao_bruto="2.5")
    assert res_critico["status"] == "CRÍTICO"
    assert "Estresse térmico" in res_critico["alerta_mensagem"]
    
    print("OK: Camada de Processamento: Normalizacao e Limites de Alerta aprovados!")

def testar_ia_explicavel():
    print("Testando Camada de IA Explicavel (Inferencia e Laudos)...")
    
    # Cenario seguro
    ia_seguro = analisar_risco_ia(ox=0.95, temp=36.5, vazao=4.8, ph=7.41, viscosidade=3.8, hematocrito=42.0)
    assert ia_seguro["nivel_risco"] == "SEGURO"
    assert ia_seguro["risco_degradacao_pct"] < 20.0
    
    # Cenario critico por temperatura
    ia_critico = analisar_risco_ia(ox=0.82, temp=39.2, vazao=2.5, ph=7.15, viscosidade=6.2, hematocrito=30.0)
    assert ia_critico["nivel_risco"] == "CRÍTICO"
    assert ia_critico["risco_degradacao_pct"] > 50.0
    assert len(ia_critico["contribuicoes_sensores"]) > 0
    
    print("OK: Camada de IA Explicavel: Laudos e calculo de risco estruturado validados!")

if __name__ == "__main__":
    print("=============================================")
    print("    RODANDO SUITE DE TESTES DO BACKEND       ")
    print("=============================================")
    try:
        testar_limpeza_string()
        testar_normalizacao_e_alarmes()
        testar_ia_explicavel()
        print("\n[SUCESSO] TODOS OS TESTES PASSARAM COM SUCESSO!")
        sys.exit(0)
    except AssertionError as e:
        print(f"\n[ERRO] FALHA NOS TESTES: {e}")
        sys.exit(1)
    except Exception as ex:
        print(f"\n[ERRO] ERRO INESPERADO: {ex}")
        sys.exit(1)
