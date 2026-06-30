def analisar_risco_ia(ox, temp, vazao, ph, viscosidade, hematocrito):
    """
    CAMADA DE IA EXPLICÁVEL:
    Mapeia os 5 parâmetros em um percentual cumulativo de risco de degradação e 
    fornece uma atribuição de peso de cada recurso (feature attribution) de forma transparente.
    """
    contribuicoes = []
    risco_base = 5.0  # Risco base de degradação inerente ao composto artificial
    
    # 1. Impacto da Temperatura (Faixa Ideal: 35.5 a 37.5 °C)
    contribuicao_temp = 0.0
    if temp > 37.5:
        excesso = temp - 37.5
        contribuicao_temp = excesso * 18.0
        if temp > 38.0:
            contribuicao_temp += 25.0  # Penalidade extra por calor excessivo
        contribuicoes.append(f"A temperatura de {temp}°C está acima do limite ideal de 37.5°C, aumentando o risco de desnaturação estrutural do transportador em +{contribuicao_temp:.1f}%.")
    elif temp < 35.5:
        deficit = 35.5 - temp
        contribuicao_temp = deficit * 15.0
        if temp < 35.0:
            contribuicao_temp += 15.0
        contribuicoes.append(f"Hipotermia do composto ({temp}°C) abaixo de 35.5°C acarreta perda de fluidez, somando +{contribuicao_temp:.1f}% ao risco.")
    
    # 2. Impacto da Oxigenação (Faixa Ideal: >= 90% ou 0.90)
    contribuicao_ox = 0.0
    if ox < 0.90:
        deficit = 0.90 - ox
        contribuicao_ox = deficit * 180.0
        if ox < 0.85:
            contribuicao_ox += 20.0
        contribuicoes.append(f"Saturação de oxigênio em {ox*100:.1f}% indica hipóxia do composto. O déficit de {deficit*100:.1f}% em relação ao nível de segurança somou +{contribuicao_ox:.1f}% de risco.")
        
    # 3. Impacto da Vazão (Faixa Ideal: 4.0 a 5.5 L/min)
    contribuicao_vazao = 0.0
    if vazao < 4.0:
        deficit = 4.0 - vazao
        contribuicao_vazao = deficit * 20.0
        if vazao < 3.0:
            contribuicao_vazao += 15.0
        contribuicoes.append(f"Fluxo lento ({vazao} L/min) aumenta o risco de sedimentação e estagnação do sangue artificial em +{contribuicao_vazao:.1f}%.")
    elif vazao > 5.5:
        excesso = vazao - 5.5
        contribuicao_vazao = excesso * 12.0
        contribuicoes.append(f"Fluxo acelerado ({vazao} L/min) gera estresse de cisalhamento nas membranas das microcápsulas, adicionando +{contribuicao_vazao:.1f}%.")
        
    # 4. Impacto do pH (Faixa Ideal: 7.35 a 7.45)
    contribuicao_ph = 0.0
    if ph < 7.35:
        desvio = 7.35 - ph
        contribuicao_ph = desvio * 120.0
        contribuicoes.append(f"Acidose detectada (pH {ph}). O desvio do pH fisiológico ideal soma +{contribuicao_ph:.1f}% de risco.")
    elif ph > 7.45:
        desvio = ph - 7.45
        contribuicao_ph = desvio * 100.0
        contribuicoes.append(f"Alcalose detectada (pH {ph}). O desvio do pH fisiológico ideal adiciona +{contribuicao_ph:.1f}% ao risco.")
        
    # 5. Impacto da Viscosidade (Faixa Ideal: 3.5 a 4.5 cP)
    contribuicao_visc = 0.0
    if viscosidade > 4.5:
        excesso = viscosidade - 4.5
        contribuicao_visc = excesso * 15.0
        contribuicoes.append(f"Hiperviscosidade ({viscosidade} cP) dificulta a microcirculação capilar, adicionando +{contribuicao_visc:.1f}% de risco de obstrução.")
    elif viscosidade < 3.5:
        deficit = 3.5 - viscosidade
        contribuicao_visc = deficit * 12.0
        contribuicoes.append(f"Hipoviscosidade ({viscosidade} cP) indica perda de coesão do polímero carreador, somando +{contribuicao_visc:.1f}% de risco de extravasamento.")

    # 6. Impacto do Hematócrito (Faixa Ideal: 37.0% a 48.0%)
    contribuicao_hem = 0.0
    if hematocrito < 37.0:
        deficit = 37.0 - hematocrito
        contribuicao_hem = deficit * 1.5
        contribuicoes.append(f"Hematócrito simulado abaixo do padrão ({hematocrito}%) reduz a capacidade líquida de transporte gasoso, somando +{contribuicao_hem:.1f}%.")
    elif hematocrito > 48.0:
        excesso = hematocrito - 48.0
        contribuicao_hem = excesso * 1.2
        contribuicoes.append(f"Hematócrito simulado elevado ({hematocrito}%) aumenta a resistência vascular periférica, somando +{contribuicao_hem:.1f}%.")

    # Calcular risco total (base + contribuições)
    risco_total = risco_base + contribuicao_temp + contribuicao_ox + contribuicao_vazao + contribuicao_ph + contribuicao_visc + contribuicao_hem
    risco_total = round(max(0.0, min(100.0, risco_total)), 1)
    
    # Classificação
    if risco_total < 20.0:
        nivel_risco = "SEGURO"
        justificativa = "A IA classifica o lote como SEGURO. Todos os parâmetros fisiológicos operam dentro da zona de resiliência homeostática. O risco calculado está no nível operacional padrão de pesquisa."
    elif risco_total < 50.0:
        nivel_risco = "ALERTA"
        justificativa = "A IA classifica o lote sob risco MODERADO (ALERTA). Há oscilações em sensores que demandam monitoramento frequente ou ajustes de circulação/térmicos antes que ocorra degradação do lote."
    else:
        nivel_risco = "CRÍTICO"
        justificativa = "A IA classifica o lote sob risco CRÍTICO de degradação. O composto está instável fisiologicamente e há iminência de precipitação ou perda de ligação gasosa. Recomenda-se descarte imediato ou resfriamento de emergência."

    return {
        "risco_degradacao_pct": risco_total,
        "nivel_risco": nivel_risco,
        "justificativa_geral": justificativa,
        "contribuicoes_sensores": contribuicoes,
        "pesos_atribuicao": {
            "oxigenacao": round(contribuicao_ox, 1),
            "temperatura": round(contribuicao_temp, 1),
            "vazao": round(contribuicao_vazao, 1),
            "ph": round(contribuicao_ph, 1),
            "viscosidade": round(contribuicao_visc, 1),
            "hematocrito": round(contribuicao_hem, 1)
        }
    }
