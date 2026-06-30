import re

def limpar_e_converter_float(valor_bruto):
    """
    Remove caracteres especiais, unidades comuns e converte vírgula para ponto.
    """
    if valor_bruto is None:
        return None
    
    # Converter para string e limpar espaços
    txt = str(valor_bruto).strip().lower()
    
    # Substituir vírgulas por pontos e remover qualquer caractere que não seja número, ponto ou sinal de menos
    txt = txt.replace(",", ".")
    txt = re.sub(r"[^\d.-]", "", txt).strip()
    
    if not txt:
        return None
        
    try:
        return float(txt)
    except ValueError:
        return None

def processar_leituras(ox_bruto, temp_bruto, vazao_bruto):
    """
    CAMADA DE PROCESSAMENTO:
    1. Limpa ruídos de digitação das 3 variáveis principais.
    2. Normaliza Oxigenação para escala 0.0 a 1.0.
    3. Simula matematicamente as outras 2 variáveis biomédicas (pH, Viscosidade, Hematócrito)
       para manter o dashboard completo de 5 variáveis com embasamento clínico.
    4. Avalia as faixas de segurança iniciais.
    """
    ox = limpar_e_converter_float(ox_bruto)
    temp = limpar_e_converter_float(temp_bruto)
    vazao = limpar_e_converter_float(vazao_bruto)
    
    # Fallback para dados padrão se nulos ou corrompidos
    if ox is None:
        ox = 0.95
    if temp is None:
        temp = 36.5
    if vazao is None:
        vazao = 5.0

    # Se a oxigenação veio em formato > 1.0 (ex: 95 ou 95%), divide por 100
    if ox > 1.0:
        ox = ox / 100.0
    
    # Clampar oxigenação entre 0.0 e 1.0
    ox = max(0.0, min(1.0, ox))
    
    # --- SIMULAÇÃO CIENTÍFICA DE VARIÁVEIS SECUNDÁRIAS ---
    # pH: O pH normal do sangue é ~7.4. 
    # Acidose térmica: se temp > 38.0°C ou ox < 0.90, o pH fisiológico tende a cair.
    ph = 7.40
    if temp > 37.0:
        ph -= (temp - 37.0) * 0.05
    if ox < 0.92:
        ph -= (0.92 - ox) * 0.4
    ph = max(6.50, min(7.80, round(ph, 2)))
    
    # Viscosidade (normal de 3.5 a 4.5 cP):
    # Temperaturas frias aumentam a viscosidade (o sangue fica mais espesso).
    # Oxigenação baixa pode indicar estresse ou agregação molecular.
    viscosidade = 4.0
    if temp < 36.5:
        viscosidade += (36.5 - temp) * 0.15
    elif temp > 38.0:
        # Altas temperaturas podem quebrar ligações e afinar o composto
        viscosidade -= (temp - 38.0) * 0.1
    viscosidade = max(2.0, min(8.0, round(viscosidade, 1)))
    
    # Hematócrito (Normal de 37% a 48%):
    # No sangue artificial, o hematócrito é representado pela fração volumétrica dos carreadores de oxigênio.
    # Pode ser afetado pela taxa de vazão no loop de circulação do Arduino.
    hematocrito = 40.0
    if vazao < 4.0:
        # Menor fluxo simula agregação local ou perda de suspensão
        hematocrito -= (4.0 - vazao) * 2.0
    elif vazao > 6.0:
        # Alto fluxo pode gerar centrifugação/pressão excessiva
        hematocrito += (vazao - 6.0) * 1.5
    hematocrito = max(15.0, min(60.0, round(hematocrito, 1)))
    
    # --- AVALIAÇÃO DE SEGURANÇA ---
    # Limites ideais:
    # Oxigenação >= 90% (0.90)
    # Temperatura 35.5 - 37.5 °C
    # Vazão 4.0 - 5.5 L/min
    alertas = []
    status = "ESTÁVEL"
    
    if ox < 0.85:
        status = "CRÍTICO"
        alertas.append("Oxigenação em nível crítico de degradação (<85%).")
    elif ox < 0.90:
        status = "ALERTA"
        alertas.append("Oxigenação em sub-alerta clínico (85%-90%).")
        
    if temp > 38.0:
        status = "CRÍTICO"
        alertas.append("Estresse térmico detectado (>38°C). Risco de desnaturação de proteínas carreadoras.")
    elif temp > 37.5:
        if status != "CRÍTICO":
            status = "ALERTA"
        alertas.append("Temperatura em elevação leve (37.5°C-38°C).")
    elif temp < 35.0:
        status = "CRÍTICO"
        alertas.append("Hipotermia severa do composto artificial (<35°C).")
        
    if vazao < 3.0:
        status = "CRÍTICO"
        alertas.append("Fluxo de vazão crítico (<3.0 L/min), perigo de estagnação.")
    elif vazao < 4.0:
        if status != "CRÍTICO":
            status = "ALERTA"
        alertas.append("Redução leve de vazão (3.0-4.0 L/min).")
    elif vazao > 6.5:
        if status != "CRÍTICO":
            status = "ALERTA"
        alertas.append("Sobrecarga de pressão no circuito de vazão (>6.5 L/min).")
        
    alerta_msg = " • ".join(alertas) if alertas else "Parâmetros operando em condições ótimas."
    
    return {
        "oxigenacao_limpa": round(ox, 3),
        "temperatura_c": round(temp, 1),
        "vazao_l_min": round(vazao, 1),
        "ph": ph,
        "viscosidade_cp": viscosidade,
        "hematocrito_pct": hematocrito,
        "status": status,
        "alerta_mensagem": alerta_msg
    }
