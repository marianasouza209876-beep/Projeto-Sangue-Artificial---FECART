import re
from sqlalchemy.orm import Session
from .database import Lote, LeituraSensor
from .ai_model import analisar_risco_ia

def responder_pergunta_cientifica(pergunta: str, db: Session) -> str:
    """
    CAMADA DE INTERMEDIAÇÃO (TRADUTOR CIENTÍFICO):
    Interpreta a pergunta em linguagem humana, busca os dados reais mais recentes
    no banco de dados (Camada 1), e retorna um diagnóstico simplificado e explicável.
    """
    txt = pergunta.strip().upper()
    
    # 1. Procurar por menção de lotes (ex: SA-023, SA-024, SA-025)
    match_lote = re.search(r"SA-\d{3}", txt)
    
    if match_lote:
        lote_id = match_lote.group(0)
        lote = db.query(Lote).filter(Lote.id == lote_id).first()
        
        if not lote:
            return f"🔬 **[Tradutor Científico]**: Não encontrei nenhum lote cadastrado sob o identificador **{lote_id}**. Por favor, verifique se ele foi registrado corretamente no painel do laboratório."
            
        # Pegar a leitura mais recente deste lote
        leitura = db.query(LeituraSensor).filter(LeituraSensor.lote_id == lote_id).order_by(LeituraSensor.timestamp.desc()).first()
        
        if not leitura:
            return (
                f"🔬 **[Tradutor Científico]**: Encontrei o lote **{lote_id}** ({lote.composicao}), mas ainda não há nenhuma leitura "
                "de sensores enviada para ele. Por favor, ligue o Arduino ou dispare dados simulados para este lote para iniciarmos a análise!"
            )
            
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
            sugestao = "\n\n⚠️ **Recomendação Médica:** O lote está em perigo. É recomendado verificar se o aquecedor do banho-maria está muito quente, ou se o fluxo de oxigênio do aerador está bloqueado."
        elif status == "ALERTA":
            emoji = "⚠️"
            sugestao = "\n\n💡 **Recomendação:** Acompanhe de perto as próximas leituras dos sensores para verificar se as variáveis tendem a voltar ao normal."
        else:
            emoji = "✅"
            sugestao = "\n\n✨ **Condição Clínica:** O composto está saudável e em pleno funcionamento fisiológico para transporte de gases."
            
        resposta = (
            f"{emoji} **[Laudo Clínico Simplificado para {lote_id}]**\n\n"
            f"**Como o lote está?** Atualmente, o lote está classificado como **{status}**, com um risco calculado de **{risco}%** de sofrer degradação molecular.\n\n"
            f"**O que isso significa de forma simples?** \n"
            f"- A oxigenação limpa está em **{leitura.oxigenacao_limpa*100:.1f}%** (o ideal é acima de 90%).\n"
            f"- A temperatura do sangue está em **{leitura.temperatura_c:.1f}°C** (ideal é 36°C a 37.5°C).\n"
            f"- O fluxo circulatório (vazão) está em **{leitura.vazao_l_min:.1f} litros por minuto** (ideal é 4 a 5.5 L/min).\n\n"
            f"**Explicação da IA:** {analise['justificativa_geral']}"
            f"{sugestao}"
        )
        return resposta

    # 2. Perguntas sobre o estado geral dos sensores do Arduino
    if any(palavra in txt for palavra in ["SENSOR", "ARDUINO", "AGORA", "PORTA", "SITUAÇÃO ATUAL", "LEITURA"]):
        # Buscar a leitura mais recente de qualquer lote
        leitura_recente = db.query(LeituraSensor).order_by(LeituraSensor.timestamp.desc()).first()
        if not leitura_recente:
            return "🔬 **[Tradutor Científico]**: Ainda não recebemos nenhuma leitura de sensor do Arduino. Certifique-se de que o script de ponte `bridge_arduino.py` está rodando no computador da feira!"
            
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
        
        return (
            f"🔌 **[Monitoramento em Tempo Real - Lote {lote_id}]**\n\n"
            f"A leitura ativa mais recente do sensor aponta:\n"
            f"- **Oxigenação:** {leitura_recente.oxigenacao_limpa*100:.1f}% (Sensor Óptico de Saturação)\n"
            f"- **Temperatura:** {leitura_recente.temperatura_c:.1f}°C (Termistor NTC/DS18B20)\n"
            f"- **Vazão:** {leitura_recente.vazao_l_min:.1f} L/min (Sensor de Fluxo por Efeito Hall)\n"
            f"- **pH Estimado:** {leitura_recente.ph}\n"
            f"- **Viscosidade:** {leitura_recente.viscosidade_cp} cP\n"
            f"- **Hematócrito:** {leitura_recente.hematocrito_pct}%\n\n"
            f"**Diagnóstico:** O sistema está operando em estado **{status}** (Risco de {analise['risco_degradacao_pct']}%). "
            f"Caso queira entender detalhadamente os fatores deste diagnóstico, pergunte por: *'Por que o Lote {lote_id} está em risco?'*"
        )
        
    # 3. Explicar como funciona a limpeza/processamento
    if any(palavra in txt for palavra in ["LIMPEZA", "PROCESSAMENTO", "RUIDO", "ERRADO", "DIGIT"]):
        return (
            "🛠️ **[Explicação da Camada de Processamento]**\n\n"
            "Sensores físicos do Arduino e entradas humanas costumam conter ruídos. "
            "Por exemplo, se o operador digitar `'95 pct'` ou `'38,5C'`, a nossa Camada de Processamento:\n"
            "1. Remove caracteres de texto não numéricos (como `%`, `pct`, `C`).\n"
            "2. Substitui vírgulas por pontos decimais.\n"
            "3. Converte a oxigenação percentual (ex: `95.0`) em decimal matemático (`0.95`).\n"
            "4. Simula valores secundários confiáveis (como o pH e a viscosidade) por meio de regras clínicas.\n"
            "Isso garante que a Inteligência Artificial receba dados limpos e livres de erros!"
        )

    # 4. Explicar a arquitetura
    if any(palavra in txt for palavra in ["ARQUITETURA", "COMO FUNCIONA", "CAMADAS", "PROJETO"]):
        return (
            "🔬 **[Arquitetura do Nosso Projeto]**\n\n"
            "Nosso projeto é estruturado em **4 camadas principais**:\n"
            "1. **Camada de Dados:** Recebe os dados crus via API (`POST /api/sensor-data`) vindos do Arduino e armazena na base de dados SQLite.\n"
            "2. **Camada de Processamento:** Limpa ruídos, formata decimais, estima pH/viscosidade/hematócrito e avalia limites básicos.\n"
            "3. **Camada de IA Explicável:** Executa inferência sobre os dados limpos, atribuindo peso de risco a cada sensor de forma transparente.\n"
            "4. **Camada de Intermediação (Tradutor Científico):** É este chatbot, que traduz todos os gráficos complexos e termos médicos em uma conversa amigável para você!"
        )
        
    # 5. Explicação geral sobre sangue artificial
    if any(palavra in txt for palavra in ["SANGUE ARTIFICIAL", "O QUE E", "O QUE E ISSO", "PARA QUE SERVE", "COMPONENTE", "LOTE"]):
        return (
            "🩸 **[O que é Sangue Artificial?]**\n\n"
            "Sangue artificial é um composto biomédico líquido projetado em laboratório para simular a função principal do sangue humano: **o transporte de oxigênio e gás carbônico pelo corpo**.\n\n"
            "Ele é extremamente útil em situações de emergência (guerra, acidentes distantes) onde não há bolsas de sangue doadas compatíveis. "
            "Existem duas categorias principais pesquisadas:\n"
            "1. **HBOCs:** Hemoglobinas modificadas quimicamente (como o lote SA-024).\n"
            "2. **PFCs:** Perfluorocarbonos, compostos sintéticos baseados em fluorocarbonetos que dissolvem gases facilmente (como o lote SA-023).\n\n"
            "Nosso sistema monitora esses compostos para evitar que se degradem antes de serem usados!"
        )

    # 6. Fallback educacional
    return (
        "🔬 **[Tradutor Científico]**: Olá! Bem-vindo ao estande do Sangue Artificial Inteligente.\n\n"
        "Você pode fazer perguntas práticas como:\n"
        "- *'Qual o estado do Lote SA-023?'*\n"
        "- *'Por que o Lote SA-024 está em risco?'*\n"
        "- *'O que o sensor do Arduino está indicando agora?'*\n"
        "- *'Como funciona a Camada de Processamento?'*\n"
        "- *'O que é Sangue Artificial?'*\n\n"
        "Tente interagir com um dos lotes cadastrados ou envie dados de um lote novo via Arduino!"
    )
