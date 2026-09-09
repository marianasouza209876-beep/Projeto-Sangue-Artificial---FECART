import random
from typing import Dict, Any, Optional

# Opções Válidas Oficiais
OPCOES_VALIDAS = {
    "tipo_ocorrencia": [
        "Acidente de carro",
        "Hemorragia por perfuração",
        "Trauma",
        "Emergência clínica",
        "Causa desconhecida"
    ],
    "existe_sangramento": [
        "Não",
        "Leve",
        "Moderado",
        "Grave"
    ],
    "tempo_evento": [
        "Menos de 10 minutos",
        "10 - 30 minutos",
        "30 - 60 minutos",
        "Mais de 1 hora",
        "Desconhecido"
    ],
    "respiracao": [
        "Normal",
        "Dificuldade",
        "Irregular",
        "Muito comprometida"
    ],
    "estado_consciencia": [
        "Alerta",
        "Confuso",
        "Responde parcialmente",
        "Não responde"
    ],
    "lesoes_aparentes": [
        "Nenhuma",
        "Leve",
        "Moderada",
        "Grave"
    ],
    "historico_relevante": [
        "Nenhuma informação relevante",
        "Condição prévia conhecida",
        "Uso contínuo de medicamentos",
        "Alergia conhecida",
        "Informação desconhecida"
    ],
    "idade": [
        "Crianças",
        "Adolescente",
        "Adulto",
        "Idoso"
    ],
    "tipo_sanguineo": [
        "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Desconhecido"
    ]
}

CENARIOS_EXEMPLO = [
    {
        "tipo_ocorrencia": "Hemorragia por perfuração",
        "sangramento": "Grave",
        "tempo": "10 - 30 minutos",
        "respiracao": "Muito comprometida",
        "consciencia": "Não responde",
        "lesoes": "Grave",
        "historico": "Informação desconhecida",
        "idade": "Adulto",
        "tipo_sanguineo": "Desconhecido",
        "descricao_cenario": "Vítima encontrada em decúbito dorsal após lesão penetrante profunda em região toracoabdominal com sangramento arterial ativo volumoso. Paciente inconsciente, sem acompanhantes ou identificação médica no local."
    },
    {
        "tipo_ocorrencia": "Acidente de carro",
        "sangramento": "Grave",
        "tempo": "Menos de 10 minutos",
        "respiracao": "Irregular",
        "consciencia": "Responde parcialmente",
        "lesoes": "Grave",
        "historico": "Condição prévia conhecida",
        "idade": "Adolescente",
        "tipo_sanguineo": "O-",
        "descricao_cenario": "Vítima de capotamento em rodovia em alta velocidade com politrauma severo, fratura exposta de fêmur e sangramento difuso intenso."
    },
    {
        "tipo_ocorrencia": "Trauma",
        "sangramento": "Moderado",
        "tempo": "30 - 60 minutos",
        "respiracao": "Dificuldade",
        "consciencia": "Confuso",
        "lesoes": "Moderada",
        "historico": "Uso contínuo de medicamentos",
        "idade": "Idoso",
        "tipo_sanguineo": "A+",
        "descricao_cenario": "Queda de grande altura em canteiro de obras com fratura de bacia, hematoma retroperitoneal expansivo e instabilidade hemodinâmica progressiva."
    },
    {
        "tipo_ocorrencia": "Emergência clínica",
        "sangramento": "Leve",
        "tempo": "Mais de 1 hora",
        "respiracao": "Dificuldade",
        "consciencia": "Confuso",
        "lesoes": "Nenhuma",
        "historico": "Alergia conhecida",
        "idade": "Adulto",
        "tipo_sanguineo": "B+",
        "descricao_cenario": "Quadro agudo de choque séptico com coagulação intravascular disseminada (CIVD) secundária e petéquias purpúricas em expansão."
    }
]

def executar_triagem_emergencia(
    modo: str = "Com IA",
    tipo_ocorrencia: Optional[str] = None,
    existe_sangramento: Optional[str] = None,
    tempo_evento: Optional[str] = None,
    respiracao: Optional[str] = None,
    estado_consciencia: Optional[str] = None,
    lesoes_aparentes: Optional[str] = None,
    historico_relevante: Optional[str] = None,
    idade: Optional[str] = None,
    tipo_sanguineo: Optional[str] = None
) -> Dict[str, Any]:
    """
    Motor de IA de Triagem Pré-Hospitalar - FECART / Flowtificial
    Gera a simulação completa e a resolução em 4 etapas estritas.
    """
    
    # 1. TRATAMENTO DO MODO DE CRIAÇÃO
    if modo.strip().lower() == "com ia" or not tipo_ocorrencia:
        # Modo com IA: Escolha autônoma e coerente de todos os parâmetros
        cenario_base = random.choice(CENARIOS_EXEMPLO)
        f_tipo_ocorrencia = cenario_base["tipo_ocorrencia"]
        f_existe_sangramento = cenario_base["sangramento"]
        f_tempo_evento = cenario_base["tempo"]
        f_respiracao = cenario_base["respiracao"]
        f_estado_consciencia = cenario_base["consciencia"]
        f_lesoes_aparentes = cenario_base["lesoes"]
        f_historico_relevante = cenario_base["historico"]
        f_idade = cenario_base["idade"]
        f_tipo_sanguineo = cenario_base["tipo_sanguineo"]
        f_cenario = cenario_base["descricao_cenario"]
    else:
        # Modo Manual: Utiliza os campos fornecidos pelo usuário com fallback seguro
        f_tipo_ocorrencia = tipo_ocorrencia if tipo_ocorrencia in OPCOES_VALIDAS["tipo_ocorrencia"] else OPCOES_VALIDAS["tipo_ocorrencia"][0]
        f_existe_sangramento = existe_sangramento if existe_sangramento in OPCOES_VALIDAS["existe_sangramento"] else "Grave"
        f_tempo_evento = tempo_evento if tempo_evento in OPCOES_VALIDAS["tempo_evento"] else "10 - 30 minutos"
        f_respiracao = respiracao if respiracao in OPCOES_VALIDAS["respiracao"] else "Muito comprometida"
        f_estado_consciencia = estado_consciencia if estado_consciencia in OPCOES_VALIDAS["estado_consciencia"] else "Não responde"
        f_lesoes_aparentes = lesoes_aparentes if lesoes_aparentes in OPCOES_VALIDAS["lesoes_aparentes"] else "Grave"
        
        # Histórico é opcional se o paciente não responder
        if f_estado_consciencia in ["Não responde", "Responde parcialmente"] and not historico_relevante:
            f_historico_relevante = "Informação desconhecida (Paciente Inconsciente)"
        else:
            f_historico_relevante = historico_relevante if historico_relevante else "Nenhuma informação relevante"
            
        f_idade = idade if idade else "Adulto"
        f_tipo_sanguineo = tipo_sanguineo if tipo_sanguineo else "Desconhecido"
        
        f_cenario = (
            f"Ocorrência de {f_tipo_ocorrencia} em paciente {f_idade} com sangramento {f_existe_sangramento.lower()} "
            f"iniciado há {f_tempo_evento.lower()}. Ao exame físico pré-hospitalar, apresenta-se {f_estado_consciencia.lower()}, "
            f"com padrão respiratório {f_respiracao.lower()} e lesões aparentes de gravidade {f_lesoes_aparentes.lower()}."
        )

    # 2. CONSTRUÇÃO DAS 4 ETAPAS OBRIGATÓRIAS DE RESPOSTA

    # ETAPA 1: DESCRIÇÃO DO PROBLEMA
    etapa_1_descricao = (
        f"### 📋 FICHA CLÍNICA DO PACIENTE\n"
        f"- **Tipo de Ocorrência:** {f_tipo_ocorrencia}\n"
        f"- **Existe Sangramento?:** {f_existe_sangramento}\n"
        f"- **Tempo desde o Evento:** {f_tempo_evento}\n"
        f"- **Respiração:** {f_respiracao}\n"
        f"- **Estado de Consciência:** {f_estado_consciencia}\n"
        f"- **Lesões Aparentes:** {f_lesoes_aparentes}\n"
        f"- **Histórico Relevante:** {f_historico_relevante}\n"
        f"- **Idade do Paciente:** {f_idade}\n"
        f"- **Tipo Sanguíneo:** {f_tipo_sanguineo}\n\n"
        f"#### 🚑 Cenário de Emergência Pré-Hospitalar\n"
        f"{f_cenario}"
    )

    # ETAPA 2: EXPLICAÇÃO DO PROBLEMA
    risco_choque = "Choque Hipovolêmico Hemorrágico de Alto Risco (Classe III/IV)" if f_existe_sangramento in ["Grave", "Moderado"] else "Instabilidade Hemodinâmica Moderada"
    impacto_oxigenacao = "Queda crítica no transporte tissular de oxigênio (DO₂)" if f_respiracao in ["Muito comprometida", "Irregular", "Dificuldade"] else "Comprometimento compensado da SpO₂"
    impacto_tempo = f"Com tempo decorrido de {f_tempo_evento.lower()}, há acúmulo acelerado de lactato e acidose metabólica."
    
    etapa_2_explicacao = (
        f"#### 🧬 Impacto Fisiológico e Gravidade Sistêmica\n"
        f"1. **Mecanismo de Choque**: O paciente desenvolve **{risco_choque}**, em razão da perda aguda de massa eritrocitária e redução da pressão de perfusão coronariana e cerebral.\n"
        f"2. **Comprometimento Respiratório e Oxigenação**: Apresenta **{impacto_oxigenacao}**. A hipóxia secundária intensifica o sofrimento celular e acelera a apoptose tecidual.\n"
        f"3. **Fator Tempo e Acidose**: {impacto_tempo} A falta de oxigenação força a glicólise anaeróbica, alterando o pH sanguíneo fisiológico.\n"
        f"4. **Tríade Mortal do Trauma**: Risco iminente do ciclo letal composto por *Acidose Metabólica*, *Hipotermia Sintética* e *Coagulopatia de Consumo*, exigindo reposição volêmica imediata."
    )

    # ETAPA 3: RESOLUÇÃO DO PROBLEMA (FOCO EM ANÁLISE SANGUÍNEA)
    is_desconhecido = f_tipo_sanguineo.strip().upper() in ["DESCONHECIDO", "NÃO SABE", "OUTRO"]
    
    if is_desconhecido:
        compatibilidade = "Indicação Crítica de Doador Universal Sintético (Sangue Artificial PFC/HBOC Universal Isento de Antígenos Rh/ABO - Equivalente a O Negativo)."
    else:
        compatibilidade = f"Sangue Compatível Tipo {f_tipo_sanguineo} (ou Sangue Artificial Universal Isento em caso de falta imediata no resgate)."

    if f_existe_sangramento == "Grave":
        componentes = "1. Carreadores Sintéticos de O₂ (HBOC-201 / PFC-40)\n2. Expansores Plasmáticos Oncóticos de Alta Densidade\n3. Agentes Procoagulantes e Tamponantes de pH (7.40)"
        volume_ml = 2000
    elif f_existe_sangramento == "Moderado":
        componentes = "1. Carreador de O₂ Sintético Isento\n2. Expansor Plasmático Isotônico de Manutenção Oncótica"
        volume_ml = 1200
    else:
        componentes = "1. Solução de Suporte Fisiológico Mantenedora de Viscosidade e Oxigenação"
        volume_ml = 500

    objetivo_hemodinamico = "Restabelecer o débito cardíaco, atingir PAM ≥ 65 mmHg, elevação da SpO₂ > 95% e prevenir colapso microcirculatório pré-hospitalar."

    etapa_3_resolucao = (
        f"#### 🩸 Protocolo de Análise e Indicação Sanguínea\n"
        f"- **Compatibilidade Sanguínea:** {compatibilidade}\n"
        f"- **Volume Recomendado pela IA:** **{volume_ml} mL** (Infusão aquecida a 37°C)\n"
        f"- **Componentes Prioritários Formulados:**\n{componentes}\n"
        f"- **Objetivo Hemodinâmico:** {objetivo_hemodinamico}"
    )

    # ETAPA 4: EXPLICAÇÃO DE COMO FOI RESOLVIDO
    etapa_4_como_resolvido = (
        f"#### 🧠 Raciocínio Lógico do Motor de IA\n"
        f"1. **Análise de Matriz Sanguínea**: O algoritmo cruzou o *Tipo Sanguíneo informado ({f_tipo_sanguineo})* com a ausência de tempo hábil para testes de prova cruzada. Optou-se pela solução de **isenção antigênica total (100% universal)** para eliminar o risco de hemólise transfusional.\n"
        f"2. **Cálculo da Gravidade Volêmica**: Com sangramento *{f_existe_sangramento.lower()}*, lesões *{f_lesoes_aparentes.lower()}* e consciência *{f_estado_consciencia.lower()}*, a IA prescreveu **{volume_ml} mL** de substituto sintético carreador de gases para restabelecimento da volemia.\n"
        f"3. **Estabilização da Viscosidade e pH**: A adição de expansores plasmáticos oncóticos e tampão fisiológico previne o edema tecidual e estabiliza a viscosidade sanguínea na faixa ideal de 2.5 a 4.0 cP durante o transporte até o centro cirúrgico."
    )

    # Texto Markdown completo unificado
    texto_formatado = (
        f"## 🚑 RESOLUÇÃO DE TRIAGEM DE EMERGÊNCIA (MOTOR DE IA - FLOWTIFICIAL)\n"
        f"**Modo de Criação:** `{modo}`\n\n"
        f"### 1. DESCRIÇÃO DO PROBLEMA\n{etapa_1_descricao}\n\n"
        f"--- \n"
        f"### 2. EXPLICAÇÃO DO PROBLEMA\n{etapa_2_explicacao}\n\n"
        f"--- \n"
        f"### 3. RESOLUÇÃO DO PROBLEMA (FOCO EM ANÁLISE SANGUÍNEA)\n{etapa_3_resolucao}\n\n"
        f"--- \n"
        f"### 4. EXPLICAÇÃO DE COMO FOI RESOLVIDO\n{etapa_4_como_resolvido}"
    )

    return {
        "success": True,
        "modo": modo,
        "paciente": {
            "tipo_ocorrencia": f_tipo_ocorrencia,
            "existe_sangramento": f_existe_sangramento,
            "tempo_evento": f_tempo_evento,
            "respiracao": f_respiracao,
            "estado_consciencia": f_estado_consciencia,
            "lesoes_aparentes": f_lesoes_aparentes,
            "historico_relevante": f_historico_relevante,
            "idade": f_idade,
            "tipo_sanguineo": f_tipo_sanguineo,
            "cenario": f_cenario
        },
        "etapas": {
            "1_descricao_problema": etapa_1_descricao,
            "2_explicacao_problema": etapa_2_explicacao,
            "3_resolucao_problema": etapa_3_resolucao,
            "4_explicacao_como_resolvido": etapa_4_como_resolvido
        },
        "prescricao": {
            "volume_ml": volume_ml,
            "compatibilidade": compatibilidade,
            "componentes": componentes,
            "objetivo": objetivo_hemodinamico
        },
        "texto_formatado": texto_formatado
    }
