import streamlit as st
import pandas as pd
import time

# Configuração da página da feira cultural
st.set_page_config(
    page_title="Flowtificial - Plataforma Biomédica",
    page_icon="🔬",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Estilização personalizada para deixar o site bonito e profissional
st.markdown("""
<style>
    .reportview-container { background: #f0f2f6; }
    .main-title { color: #0056b3; font-weight: bold; }
    .layer-card { background-color: #ffffff; padding: 15px; border-radius: 8px; border-left: 5px solid #17a2b8; margin-bottom: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
    .chat-explicacao { background-color: #eef7f9; padding: 10px; border-radius: 5px; border: 1px solid #bbeeeb; margin-top: 5px; }
</style>
""", unsafe_allowed_html=True)

# ==========================================
# CAMADA 1 & 2: DADOS, PIPELINE E PROCESSAMENTO (Limpeza e Resiliência)
# ==========================================

def processar_e_normalizar_oxigenacao(texto_bruto):
    """
    CAMADA DE PROCESSAMENTO:
    Esta função remove qualquer erro de digitação comum na feira (ex: '95%', '95 pct', '95pco')
    e converte o dado bruto em uma unidade decimal padrão (0.0 a 1.0) para a IA trabalhar.
    """
    if not texto_bruto:
        return None
        
    # Limpeza de strings e caracteres especiais
    txt = str(texto_bruto).strip().lower()
    txt = txt.replace("%", "").replace("pct", "").replace("pco", "").replace("porcento", "").replace(",", ".")
    
    try:
        valor = float(txt)
        # Se o usuário digitou em formato de porcentagem inteira (ex: 95)
        if valor > 1.0:
            return valor / 100.0
        return valor
    except ValueError:
        return None

# Inicializando a Camada de Dados na memória do site (Session State)
if "banco_de_dados" not in st.session_state:
    st.session_state.banco_de_dados = pd.DataFrame([
        {"Lote": "SA-023", "Oxigenacao_Bruta": "95%", "Oxigenacao_Limpa": 0.95, "Temperatura_C": 36.5, "Status": "✅ ESTÁVEL"},
        {"Lote": "SA-024", "Oxigenacao_Bruta": "89 pct", "Oxigenacao_Limpa": 0.89, "Temperatura_C": 38.5, "Status": "🚨 CRÍTICO"}
    ])

# ==========================================
# PAINEL LATERAL: ENTRADA PRÁTICA (SIMULAÇÃO DE LIQUIDOS E SENSORES)
# ==========================================
st.sidebar.markdown("# 🧪 Flowtificial: Sensores & Líquidos")
st.sidebar.write("Use esta área para simular a leitura do sangue artificial que estará no seu estande.")

with st.sidebar.form("formulario_sensores"):
    id_lote = st.text_input("Etiqueta/ID do Lote de Líquido:", "SA-025")
    ox_bruta = st.text_input("Oxigenação lida (Teste erros de digitação):", "92pco")
    temp_lida = st.number_input("Temperatura (°C):", min_value=15.0, max_value=50.0, value=36.6, step=0.1)
    
    botao_enviar = st.form_submit_button("Salvar Leitura Biomédica")

if botao_enviar:
    # Passando os dados pela Camada 2 (Processamento) antes de salvar
    ox_normalizada = processar_e_normalizar_oxigenacao(ox_bruta)
    
    if ox_normalizada is not None:
        # Definindo alertas automáticos com base nas regras científicas
        if temp_lida > 38.0 or ox_normalizada < 0.90:
            status_alerta = "🚨 CRÍTICO"
        else:
            status_alerta = "✅ ESTÁVEL"
            
        # Criando o novo registro estruturado
        novo_registro = pd.DataFrame([{
            "Lote": id_lote.upper().strip(),
            "Oxigenacao_Bruta": ox_bruta,
            "Oxigenacao_Limpa": ox_normalizada,
            "Temperatura_C": temp_lida,
            "Status": status_alerta
        }])
        
        # Salvando na Camada de Dados
        st.session_state.banco_de_dados = pd.concat([st.session_state.banco_de_dados, novo_registro], ignore_index=True)
        st.sidebar.success(f"Lote {id_lote} salvo com Sucesso e Auditado!")
    else:
        st.sidebar.error("❌ Erro Crítico de Processamento: O valor digitado para Oxigenação é incompreensível. Tente usar números ou '%'.")

# ==========================================
# CORPO PRINCIPAL DO SITE: INTERFACE DA FEIRA
# ==========================================
st.markdown("<h1 class='main-title'>🔬 EcoSanguis: Ecossistema Inteligente de Pesquisa Translacional</h1>", unsafe_allowed_html=True)
st.write("Projeto Científico para Monitoramento Avançado de Sangue Artificial Hipotético.")

# Abas para os avaliadores navegarem pelas camadas do projeto
aba1, aba2, aba3 = st.tabs(["📊 Visão Geral das Camadas", "🗄️ Camada 1 & 2: Auditoria de Dados", "🤖 Camada 3 & 4: IA & Chatbot Explicável"])

with aba1:
    st.subheader("Arquitetura do Ecossistema Computacional")
    st.write("Nosso sistema transforma dados brutos e caóticos de laboratório em conhecimento clínico direto para tomada de decisão.")
    
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.markdown("<div class='layer-card'><h4>1. Dados</h4><p>Coleta registros de sensores, lotes e logs simulados de forma rastreável.</p></div>", unsafe_allowed_html=True)
    with col2:
        st.markdown("<div class='layer-card'><h4>2. Processamento</h4><p>Limpa strings inválidas, corrige digitação e normaliza unidades científicas.</p></div>", unsafe_allowed_html=True)
    with col3:
        st.markdown("<div class='layer-card'><h4>3. Inteligência Artificial</h4><p>Classifica riscos de degradação e anomalias térmicas com transparência algorítmica.</p></div>", unsafe_allowed_html=True)
    with col4:
        st.markdown("<div class='layer-card'><h4>4. Intermediação</h4><p>Interface conversacional que atua como um verdadeiro tradutor científico para o usuário humano.</p></div>", unsafe_allowed_html=True)

with aba2:
    st.subheader("Rastreabilidade, Auditoria e Reprodutibilidade")
    st.write("Tabela de dados lidos em tempo real. Veja como a Camada de Processamento traduz o que as pessoas digitam:")
    # Exibe a tabela do banco de dados atualizada
    st.dataframe(st.session_state.banco_de_dados, use_container_width=True)

with aba3:
    st.subheader("💬 Tradutor Científico Conversacional")
    st.write("Interaja com o agente inteligente. Ele consulta os dados práticos coletados e explica as conclusões com base nas fontes científicas:")

    # Inicializando as mensagens do Chatbot
    if "messages" not in st.session_state:
        st.session_state.messages = [
            {"role": "assistant", "content": "Olá! Sou o assistente clínico EcoSanguis. Pergunte-me sobre o estado de qualquer lote (Ex: 'Qual o estado do lote SA-023?') ou sobre como tratei erros de digitação!"}
        ]

    # Mostra o histórico na tela
    for msg in st.session_state.messages:
        with st.chat_message(msg["role"]):
            st.write(msg["content"])

    # Entrada do chat pelo usuário
    if pergunta := st.chat_input("Digite sua pergunta aqui (Ex: O lote SA-024 está degradado?)"):
        st.session_state.messages.append({"role": "user", "content": pergunta})
        with st.chat_message("user"):
            st.write(pergunta)
            
        # Processamento e Resposta da IA com Base nas Regras das suas Fontes
        with st.chat_message("assistant"):
            with st.spinner("Consultando camadas biomédicas..."):
                time.sleep(0.7) # Simula o tempo de pensamento da IA
                
                pergunta_ajustada = pergunta.upper()
                df_atual = st.session_state.banco_de_dados
                
                # Buscando se a pergunta cita algum lote existente na tabela
                lote_encontrado = None
                for lote_id in df_atual["Lote"]:
                    if lote_id in pergunta_ajustada:
                        lote_encontrado = lote_id
                        break
                
                # Motor de Resposta Inteligente baseado nas regras fixas de conhecimento
                if lote_encontrado:
                    # Filtra a linha correspondente do lote
                    dados_lote = df_atual[df_atual["Lote"] == lote_encontrado].iloc[0]
                    ox_pct = dados_lote["Oxigenacao_Limpa"] * 100
                    temp = dados_lote["Temperatura_C"]
                    status = dados_lote["Status"]
                    
                    if status == "🚨 CRÍTICO":
                        resposta = f"⚠️ **[ALERTA DA IA EXPLICÁVEL]**: O composto **{lote_encontrado}** apresenta alto risco de degradação estrutural. \n\n"
                        if temp > 38.0:
                            resposta += f"**Motivo Científico:** A temperatura registrada está em **{temp}°C**. Nossas fontes de referência apontam que se o composto passar de 38°C, ocorre perda funcional imediata das hemácias artificiais.\n"
                        if dados_lote["Oxigenacao_Limpa"] < 0.90:
                            resposta += f"**Motivo Científico:** A oxigenação limpa caiu para **{ox_pct}%**, ficando abaixo do limite seguro de 90% estipulado nos protocolos laboratoriais."
                    else:
                        resposta = f"✅ **[IA EXPLICA]**: O lote **{lote_encontrado}** encontra-se em estado ótimo e seguro para utilização experimental.\n\n" \
                                   f"**Justificativa Transparente:** Os níveis de oxigenação foram estabilizados em **{ox_pct}%** (dentro do intervalo ideal de 90-100%) e o monitoramento térmico indica **{temp}°C**, operando sem variações anômalas."
                
                elif "ERRO" in pergunta_ajustada or "DIGITAÇÃO" in pergunta_ajustada or "LIMPEZA" in pergunta_ajustada:
                    resposta = "🛠️ **[Módulo de Processamento Inteligente]**: Se um operador cometer um erro de digitação digitando caracteres como 'pct', 'pco' ou '%' junto com o número, o sistema intercepta essa string, remove o ruído textual e padroniza o dado bruto para float decimal puro. Isso garante que a IA nunca analise dados corrompidos!"
                else:
                    resposta = "🔬 **[Mediação Inteligente]**: Olá! Para que eu possa te dar um laudo explicável, por favor mencione o ID de um lote cadastrado no painel lateral (Ex: SA-023, SA-024, ou o lote que você acabou de criar!)."
                
                st.write(resposta)
                st.session_state.messages.append({"role": "assistant", "content": resposta})