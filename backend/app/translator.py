import re
from sqlalchemy.orm import Session
from .database import Lote, LeituraSensor
from .ai_model import analisar_risco_ia
from .triage_engine import executar_triagem_emergencia

from typing import Optional

def responder_pergunta_cientifica(pergunta: str, db: Session, finalidade: Optional[str] = None, lote_id: Optional[str] = None) -> str:
    """
    CAMADA DE INTERMEDIAÇÃO (TRADUTOR CIENTÍFICO):
    Interpreta a pergunta e retorna respostas diretas, com no máximo duas frases curtas.
    """
    txt = pergunta.strip().upper()
    
    # 0. Perguntas ou comandos de Triagem de Emergência
    if any(palavra in txt for palavra in ["TRIAGEM", "SIMULAR TRIAGEM", "MODO MANUAL", "MODO COM IA", "PACIENTE DE EMERGENCIA", "OCORRENCIA"]):
        modo = "Manual" if "MANUAL" in txt else "Com IA"
        res = executar_triagem_emergencia(modo=modo)
        return res["texto_formatado"]
    
    # 1. Procurar por menção de lotes (ex: SA-023, SA-024, SA-025)
    match_lote = re.search(r"SA-\d{3}", txt)
    
    if match_lote:
        lote_id = match_lote.group(0)
        lote = db.query(Lote).filter(Lote.id == lote_id).first()
        
        if not lote:
            return f"🔬 Não encontrei o lote {lote_id}. Verifique o identificador no painel."
            
        # Pegar a leitura mais recente deste lote
        leitura = db.query(LeituraSensor).filter(LeituraSensor.lote_id == lote_id).order_by(LeituraSensor.timestamp.desc()).first()
        
        if not leitura:
            return f"🔬 Lote {lote_id} encontrado, mas ainda não há leitura de sensores. Envie dados do Arduino para iniciar a análise."
            
        # Executar a IA explicável para gerar a análise
        analise = analisar_risco_ia(
            ox=leitura.oxigenacao_limpa,
            temp=leitura.temperatura_c,
            vazao=leitura.vazao_l_min,
            ph=leitura.ph,
            viscosidade=leitura.viscosidade_cp,
            hematocrito=leitura.hematocrito_pct
        )
        
        status = leitura.status
        risco = analise["risco_degradacao_pct"]
        
        if status == "CRÍTICO":
            emoji = "🚨"
            sugestao = "Verifique temperatura e fluxo imediatamente."
        elif status == "ALERTA":
            emoji = "⚠️"
            sugestao = "Acompanhe as próximas leituras e ajuste o circuito se necessário."
        else:
            emoji = "✅"
            sugestao = "O composto está apto para o monitoramento atual."
            
        fin_nome = finalidade or (lote.finalidade if lote else None)
        fin_info = f" ({fin_nome})" if fin_nome else ""
        resposta = f"{emoji} Lote {lote_id}{fin_info}: **{status}** (risco de {risco}%). O₂ {leitura.oxigenacao_limpa*100:.1f}%, temperatura {leitura.temperatura_c:.1f}°C e vazão {leitura.vazao_l_min:.1f} L/min. {sugestao}"
        return resposta

    # 2. Perguntas sobre o estado geral dos sensores do Arduino
    if any(palavra in txt for palavra in ["SENSOR", "ARDUINO", "AGORA", "PORTA", "SITUAÇÃO ATUAL", "LEITURA"]):
        # Buscar a leitura mais recente de qualquer lote
        leitura_recente = db.query(LeituraSensor).order_by(LeituraSensor.timestamp.desc()).first()
        if not leitura_recente:
            return "🔬 Ainda não há leitura do Arduino. Conecte o dispositivo e envie uma nova medição."
            
        lote_id = leitura_recente.lote_id
        analise = analisar_risco_ia(
            ox=leitura_recente.oxigenacao_limpa,
            temp=leitura_recente.temperatura_c,
            vazao=leitura_recente.vazao_l_min,
            ph=leitura_recente.ph,
            viscosidade=leitura_recente.viscosidade_cp,
            hematocrito=leitura_recente.hematocrito_pct
        )
        
        status = leitura_recente.status
        
        return f"🔌 Lote {lote_id}: **{status}**, risco de {analise['risco_degradacao_pct']}%. O₂ {leitura_recente.oxigenacao_limpa*100:.1f}%, temperatura {leitura_recente.temperatura_c:.1f}°C e vazão {leitura_recente.vazao_l_min:.1f} L/min."
        
    # 3. Explicar como funciona a limpeza/processamento
    if any(palavra in txt for palavra in ["LIMPEZA", "PROCESSAMENTO", "RUIDO", "ERRADO", "DIGIT"]):
        return "🛠️ A camada remove ruídos, padroniza números e prepara os dados para a IA. Ex.: `95 pct` vira `0,95`."

    # 4. Explicar a arquitetura
    if any(palavra in txt for palavra in ["ARQUITETURA", "COMO FUNCIONA", "CAMADAS", "PROJETO"]):
        return "🔬 O projeto integra dados do Arduino, processamento, IA explicável e o assistente Flow. Cada camada transforma leituras em decisões claras."
        
    # 5. Explicação geral sobre sangue artificial
    if any(palavra in txt for palavra in ["SANGUE ARTIFICIAL", "O QUE E", "O QUE E ISSO", "PARA QUE SERVE", "COMPONENTE", "LOTE"]):
        return "🩸 Sangue artificial é um composto que auxilia o transporte de oxigênio. A Flow monitora HBOCs e PFCs para reduzir o risco de degradação."

    # 6. Fallback educacional
    return "🔬 Pergunte pelo status de um lote, pelas leituras do Arduino ou pelo sangue artificial. Use um ID como SA-023 para uma resposta específica."
