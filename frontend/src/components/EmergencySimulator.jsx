import React, { useState, useEffect } from "react";
import {
  Zap,
  AlertTriangle,
  Heart,
  Activity,
  Droplets,
  Clock,
  UserCheck,
  Edit3,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Stethoscope,
  FileText,
  Copy,
  Check,
  Brain,
  Layers,
  Trash2,
  Eye,
  Cpu,
  RefreshCw,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// OPÇÕES VÁLIDAS OFICIAIS DO PROJETO FECART
export const OPCOES_TRIAGEM = {
  tipo_ocorrencia: [
    "Acidente de carro",
    "Hemorragia por perfuração",
    "Trauma",
    "Emergência clínica",
    "Causa desconhecida"
  ],
  existe_sangramento: [
    "Não",
    "Leve",
    "Moderado",
    "Grave"
  ],
  tempo_evento: [
    "Menos de 10 minutos",
    "10 - 30 minutos",
    "30 - 60 minutos",
    "Mais de 1 hora",
    "Desconhecido"
  ],
  respiracao: [
    "Normal",
    "Dificuldade",
    "Irregular",
    "Muito comprometida"
  ],
  estado_consciencia: [
    "Alerta",
    "Confuso",
    "Responde parcialmente",
    "Não responde"
  ],
  lesoes_aparentes: [
    "Nenhuma",
    "Leve",
    "Moderada",
    "Grave"
  ],
  historico_relevante: [
    "Nenhuma informação relevante",
    "Condição prévia conhecida",
    "Uso contínuo de medicamentos",
    "Alergia conhecida",
    "Informação desconhecida"
  ],
  idade: [
    "Crianças",
    "Adolescente",
    "Adulto",
    "Idoso"
  ],
  tipo_sanguineo: [
    "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Desconhecido"
  ]
};

export function EmergencySimulator({ onAddPatientToQueue }) {
  const [currentStep, setCurrentStep] = useState(1); // 1. Dados do Paciente | 2. Análise da IA | 3. Resultado
  const [isGenerating, setIsGenerating] = useState(false);
  const [alertSuccess, setAlertSuccess] = useState(false);
  const [copiedReport, setCopiedReport] = useState(false);
  const [selectedPatientModal, setSelectedPatientModal] = useState(null); // Modal da Simulação Completa
  
  // Estado dos Campos do Formulário (8 Campos)
  const [formParams, setFormParams] = useState({
    tipo_ocorrencia: "Hemorragia por perfuração",
    existe_sangramento: "Grave",
    tempo_evento: "10 - 30 minutos",
    respiracao: "Muito comprometida",
    estado_consciencia: "Não responde",
    lesoes_aparentes: "Grave",
    historico_relevante: "Informação desconhecida",
    idade: "Adulto",
    tipo_sanguineo: "Desconhecido"
  });

  // Resultado da Triagem Atual
  const [triageReport, setTriageReport] = useState(null);

  // Lista de Cards de Pacientes Triados
  const [activeQueue, setActiveQueue] = useState([]);

  // Função de Construção do Laudo de IA em 4 Etapas Estritas
  const buildTriageReport = (mode, f) => {
    const isDesconhecido = f.tipo_sanguineo === "Desconhecido";
    const vol = f.existe_sangramento === "Grave" ? 2000 : (f.existe_sangramento === "Moderado" ? 1200 : 500);
    
    const compat = isDesconhecido 
      ? "Indicação Crítica de Doador Universal Sintético (Sangue Artificial PFC/HBOC Universal Isento de Antígenos Rh/ABO - Equivalente a O Negativo)."
      : `Sangue Compatível Tipo ${f.tipo_sanguineo} (ou Sangue Artificial Universal Isento em caso de indisponibilidade).`;

    const e1 = `### 📋 FICHA CLÍNICA DO PACIENTE\n- **Tipo de Ocorrência:** ${f.tipo_ocorrencia}\n- **Existe Sangramento?:** ${f.existe_sangramento}\n- **Tempo desde o Evento:** ${f.tempo_evento}\n- **Respiração:** ${f.respiracao}\n- **Estado de Consciência:** ${f.estado_consciencia}\n- **Lesões Aparentes:** ${f.lesoes_aparentes}\n- **Histórico Relevante:** ${f.historico_relevante}\n- **Idade do Paciente:** ${f.idade}\n- **Tipo Sanguíneo:** ${f.tipo_sanguineo}\n\n#### 🚑 Cenário de Emergência Pré-Hospitalar\nVítima de ${f.tipo_ocorrencia.toLowerCase()} com sangramento ${f.existe_sangramento.toLowerCase()} ativo há ${f.tempo_evento.toLowerCase()}. Ao exame físico, apresenta-se ${f.estado_consciencia.toLowerCase()}, com respiração ${f.respiracao.toLowerCase()} e lesões de gravidade ${f.lesoes_aparentes.toLowerCase()}.`;

    const e2 = `#### 🧬 Impacto Fisiológico e Gravidade Sistêmica\n1. **Mecanismo de Choque**: O paciente desenvolve Choque Hipovolêmico Hemorrágico de Alto Risco por perda acelerada de volemia.\n2. **Comprometimento Respiratório**: A gravidade (${f.respiracao}) induz hipóxia tecidual severa com redução do transporte de oxigênio (DO₂).\n3. **Fator Tempo e Acidose**: O tempo decorrido (${f.tempo_evento}) eleva a produção anaeróbica de lactato.\n4. **Tríade Mortal do Trauma**: Risco iminente de acidose metabólica, hipotermia sintética e coagulopatia de consumo.`;

    const e3 = `#### 🩸 Protocolo de Análise e Indicação Sanguínea\n- **Compatibilidade Sanguínea:** ${compat}\n- **Volume Recomendado pela IA:** **${vol} mL** (Infusão aquecida a 37°C)\n- **Componentes Prioritários Formulados:**\n1. Carreadores Sintéticos de O₂ (HBOC-201 / PFC-40)\n2. Expansores Plasmáticos Oncóticos de Alta Densidade\n3. Tampão Fisiológico para Ajuste de pH (7.40)\n- **Objetivo Hemodinâmico:** Restabelecer a PAM ≥ 65 mmHg, oxigenação tecidual SpO₂ > 95% e prevenir parada cardiorrespiratória.`;

    const e4 = `#### 🧠 Raciocínio Lógico do Motor de IA\n1. **Matriz Sanguínea**: Como o tipo sanguíneo é '${f.tipo_sanguineo}', o motor ativou a infusão de Sangue Artificial 100% Universal Isento para evitar qualquer reação hemolítica imune.\n2. **Cálculo Volêmico**: Gravidade (${f.existe_sangramento}) + Lesões (${f.lesoes_aparentes}) justificaram a dose prescrevida de ${vol} mL.\n3. **Preservação de Órgãos**: Os compostos sintéticos garantem estabilidade osmótica (290 mOsm) e viscosidade ideal (2.5 cP) durante o transporte pré-hospitalar.`;

    const text = `## 🚑 RESOLUÇÃO DE TRIAGEM DE EMERGÊNCIA (MOTOR DE IA - FLOWTIFICIAL)\n**Modo de Criação:** \`${mode}\` \n\n### 1. DESCRIÇÃO DO PROBLEMA\n${e1}\n\n---\n### 2. EXPLICAÇÃO DO PROBLEMA\n${e2}\n\n---\n### 3. RESOLUÇÃO DO PROBLEMA (FOCO EM ANÁLISE SANGUÍNEA)\n${e3}\n\n---\n### 4. EXPLICAÇÃO DE COMO FOI RESOLVIDO\n${e4}`;

    return {
      success: true,
      modo: mode,
      paciente: f,
      etapas: {
        "1_descricao_problema": e1,
        "2_explicacao_problema": e2,
        "3_resolucao_problema": e3,
        "4_explicacao_como_resolvido": e4
      },
      prescricao: {
        volume_ml: vol,
        compatibilidade: compat,
        componentes: "1. HBOC/PFC Carreador Sintético de O₂\n2. Expansor Plasmático Oncótico\n3. Tampão Fisiológico",
        objetivo: "Restabelecer PAM ≥ 65 mmHg e SpO₂ > 95%"
      },
      texto_formatado: text
    };
  };

  // Função Principal disparada pelo Card 09 (INICIAR ANÁLISE >)
  const handleRunTriage = async () => {
    setIsGenerating(true);
    setCurrentStep(2); // Avança para o Passo 2: Análise da IA
    setAlertSuccess(false);

    try {
      let report = null;
      try {
        const API_URL = import.meta.env.VITE_API_URL || "";
        const response = await fetch(`${API_URL}/api/triage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            modo: "Manual",
            ...formParams
          })
        });

        if (response.ok) {
          report = await response.json();
        } else {
          report = buildTriageReport("Manual", formParams);
        }
      } catch {
        report = buildTriageReport("Manual", formParams);
      }

      setTriageReport(report);

      const p = report.paciente;
      const novoPaciente = {
        id: `PAC-${Math.floor(1000 + Math.random() * 9000)}`,
        nome: `Paciente Triado (${p.tipo_ocorrencia})`,
        idade: p.idade,
        prioridade: p.existe_sangramento === "Grave" ? "EMERGÊNCIA VERMELHA" : "URGÊNCIA LARANJA",
        tipo_ocorrencia: p.tipo_ocorrencia,
        existe_sangramento: p.existe_sangramento,
        tempo_evento: p.tempo_evento,
        respiracao: p.respiracao,
        estado_consciencia: p.estado_consciencia,
        lesoes_aparentes: p.lesoes_aparentes,
        historico_relevante: p.historico_relevante,
        tipo_sanguineo: p.tipo_sanguineo,
        fc: p.existe_sangramento === "Grave" ? Math.floor(135 + Math.random() * 20) : Math.floor(105 + Math.random() * 15),
        pa: p.existe_sangramento === "Grave" ? `${Math.floor(70 + Math.random() * 15)}/${Math.floor(40 + Math.random() * 10)} mmHg` : "95/60 mmHg",
        spo2: p.respiracao.includes("comprometida") ? Math.floor(80 + Math.random() * 7) : Math.floor(90 + Math.random() * 5),
        volumeMl: report.prescricao.volume_ml,
        solucao: "Sangue Sintético PFC/HBOC Universal (Isento Rh/ABO)",
        status: "TRIADO E PRONTO",
        admitidoEm: "Agora mesmo",
        triageReport: report
      };

      // Simulação do tempo de processamento da IA (1.2s)
      setTimeout(() => {
        setActiveQueue(prev => [novoPaciente, ...prev]);
        if (onAddPatientToQueue) onAddPatientToQueue(novoPaciente);
        setCurrentStep(3); // Avança para o Passo 3: Resultado
        setIsGenerating(false);
        setAlertSuccess(true);
        setTimeout(() => setAlertSuccess(false), 4000);
      }, 1200);

    } catch {
      setIsGenerating(false);
    }
  };

  // Inicializa a lista de pacientes ao carregar
  useEffect(() => {
    if (activeQueue.length === 0) {
      const p1Params = {
        tipo_ocorrencia: "Hemorragia por perfuração",
        existe_sangramento: "Grave",
        tempo_evento: "10 - 30 minutos",
        respiracao: "Muito comprometida",
        estado_consciencia: "Não responde",
        lesoes_aparentes: "Grave",
        historico_relevante: "Informação desconhecida (Paciente Inconsciente)",
        idade: "Adulto",
        tipo_sanguineo: "Desconhecido"
      };
      const r1 = buildTriageReport("Com IA", p1Params);

      const p2Params = {
        tipo_ocorrencia: "Acidente de carro",
        existe_sangramento: "Grave",
        tempo_evento: "Menos de 10 minutos",
        respiracao: "Irregular",
        estado_consciencia: "Responde parcialmente",
        lesoes_aparentes: "Grave",
        historico_relevante: "Condição prévia conhecida",
        idade: "Adolescente",
        tipo_sanguineo: "O-"
      };
      const r2 = buildTriageReport("Manual", p2Params);

      setActiveQueue([
        {
          id: "PAC-9041",
          nome: "Paciente Triado (Hemorragia Profunda)",
          idade: "Adulto",
          prioridade: "EMERGÊNCIA VERMELHA",
          tipo_ocorrencia: p1Params.tipo_ocorrencia,
          existe_sangramento: p1Params.existe_sangramento,
          tempo_evento: p1Params.tempo_evento,
          respiracao: p1Params.respiracao,
          estado_consciencia: p1Params.estado_consciencia,
          lesoes_aparentes: p1Params.lesoes_aparentes,
          historico_relevante: p1Params.historico_relevante,
          tipo_sanguineo: p1Params.tipo_sanguineo,
          fc: 142,
          pa: "75/45 mmHg",
          spo2: 82,
          volumeMl: 2000,
          solucao: "Sangue Sintético PFC/HBOC Universal (Isento Rh/ABO)",
          status: "EM INFUSÃO RÁPIDA",
          admitidoEm: "Há 4 min",
          triageReport: r1
        },
        {
          id: "PAC-8812",
          nome: "Vítima de Colisão Automobilística",
          idade: "Adolescente",
          prioridade: "EMERGÊNCIA VERMELHA",
          tipo_ocorrencia: p2Params.tipo_ocorrencia,
          existe_sangramento: p2Params.existe_sangramento,
          tempo_evento: p2Params.tempo_evento,
          respiracao: p2Params.respiracao,
          estado_consciencia: p2Params.estado_consciencia,
          lesoes_aparentes: p2Params.lesoes_aparentes,
          historico_relevante: p2Params.historico_relevante,
          tipo_sanguineo: p2Params.tipo_sanguineo,
          fc: 135,
          pa: "80/50 mmHg",
          spo2: 86,
          volumeMl: 2000,
          solucao: "Sangue Sintético O- Compatível",
          status: "AGUARDANDO LEITO",
          admitidoEm: "Há 12 min",
          triageReport: r2
        }
      ]);
    }
  }, []);

  const handleCopyReport = (report) => {
    if (!report) return;
    navigator.clipboard.writeText(report.texto_formatado);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* 1. CABEÇALHO E FLUXO (HEADER & STEPPER) */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 bg-slate-950/90 border border-slate-800 p-6 rounded-2xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-rose-500" />
        
        {/* IDENTIFICAÇÃO E TÍTULOS (TOPO ESQUERDO) */}
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase font-bold text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2.5 py-0.5 rounded-md">
              SIMULAÇÃO DE TRIAGEM
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-display">
            FORMULÁRIO DE ENTRADA DE PACIENTE
          </h1>
          <p className="text-xs text-slate-300 font-sans leading-relaxed">
            Preencha as informações abaixo para que a IA analise o cenário e gere a melhor resposta.
          </p>
        </div>

        {/* STEPPER & BADGE DE PRECISÃO DA IA (TOPO DIREITO) */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
          
          {/* STEPPER EM 3 ETAPAS CIRCULARES */}
          <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl">
            {/* ETAPA 1: DADOS DO PACIENTE */}
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-mono ${
                currentStep === 1
                  ? "bg-rose-600 text-white shadow-[0_0_12px_rgba(244,63,94,0.6)]"
                  : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
              }`}>
                1
              </div>
              <span className={`text-xs font-mono font-bold hidden sm:inline ${
                currentStep === 1 ? "text-white" : "text-slate-400"
              }`}>
                Dados do Paciente
              </span>
            </div>

            <ChevronRight className="h-3.5 w-3.5 text-slate-600" />

            {/* ETAPA 2: ANÁLISE DA IA */}
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-mono ${
                currentStep === 2
                  ? "bg-purple-600 text-white animate-pulse shadow-[0_0_12px_rgba(168,85,247,0.6)]"
                  : currentStep > 2
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                  : "bg-slate-800 text-slate-500"
              }`}>
                2
              </div>
              <span className={`text-xs font-mono font-bold hidden sm:inline ${
                currentStep === 2 ? "text-purple-300" : "text-slate-400"
              }`}>
                Análise da IA
              </span>
            </div>

            <ChevronRight className="h-3.5 w-3.5 text-slate-600" />

            {/* ETAPA 3: RESULTADO */}
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-mono ${
                currentStep === 3
                  ? "bg-cyan-500 text-white shadow-[0_0_12px_rgba(6,182,212,0.6)]"
                  : "bg-slate-800 text-slate-500"
              }`}>
                3
              </div>
              <span className={`text-xs font-mono font-bold hidden sm:inline ${
                currentStep === 3 ? "text-cyan-300" : "text-slate-400"
              }`}>
                Resultado
              </span>
            </div>
          </div>

          {/* BADGE INFORMATIVO DO CANTO SUPERIOR DIREITO COM ÍCONE DE CÉREBRO */}
          <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl flex items-center gap-2.5 max-w-xs">
            <Brain className="h-5 w-5 text-purple-400 flex-shrink-0 animate-pulse" />
            <p className="text-[11px] text-slate-300 font-sans leading-tight">
              Cada informação importa. Quanto mais dados, maior a precisão da análise.
            </p>
          </div>

        </div>
      </div>

      {/* PAINEL PRINCIPAL DE FORMULÁRIO (BARRA LATERAL + GRID 3x3) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* 2. BARRA LATERAL ESQUERDA (PAINEL INFORMATIVO DO PACIENTE - 4 COLUNAS) */}
        <div className="lg:col-span-4 flex flex-col justify-between glass-panel border border-slate-800 bg-slate-950/90 rounded-2xl p-5 space-y-6 relative overflow-hidden">
          <div className="space-y-4">
            
            {/* Título do Painel Informativo */}
            <div className="border-b border-slate-800 pb-3">
              <span className="font-mono text-xs font-bold text-rose-400 flex items-center gap-2">
                <Heart className="h-4 w-4 text-rose-500 animate-pulse" />
                INFORMAÇÕES DO PACIENTE
              </span>
              <p className="text-[11px] text-slate-400 font-sans mt-1">
                Preencha os campos ao lado com atenção.
              </p>
            </div>

            {/* SILHUETA CORPORAL EM NEON / LINHA FINA COM BATIMENTO CARDÍACO (ECG) */}
            <div className="relative rounded-xl border border-slate-800/80 bg-slate-900/60 p-4 flex flex-col items-center justify-center space-y-3 shadow-inner min-h-[260px]">
              
              {/* Gráfico ECG batimento cardíaco animado */}
              <div className="w-full flex items-center justify-between px-3 text-[10px] font-mono text-slate-400 border-b border-slate-800/60 pb-2">
                <span className="flex items-center gap-1.5 text-rose-400">
                  <Activity className="h-3.5 w-3.5 text-rose-500 animate-pulse" />
                  ECG VITAL ACTIVE
                </span>
                <span className="text-emerald-400 font-bold">142 BPM</span>
              </div>

              {/* Desenho da Silhueta Humana em Linha Neon */}
              <div className="relative my-2 flex items-center justify-center">
                <svg className="w-28 h-44 text-slate-700" viewBox="0 0 100 180" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Cabeça */}
                  <circle cx="50" cy="22" r="14" stroke="#ff0055" strokeWidth="1.8" strokeDasharray="3 3" className="animate-pulse" />
                  {/* Torax / Tronco */}
                  <path d="M32 40 L68 40 L62 105 L38 105 Z" stroke="#00d8ff" strokeWidth="1.8" />
                  {/* Braço Esquerdo */}
                  <path d="M30 42 L16 90 L12 120" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" />
                  {/* Braço Direito */}
                  <path d="M70 42 L84 90 L88 120" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" />
                  {/* Perna Esquerda */}
                  <path d="M42 105 L38 165" stroke="#00ff9d" strokeWidth="1.8" strokeLinecap="round" />
                  {/* Perna Direita */}
                  <path d="M58 105 L62 165" stroke="#00ff9d" strokeWidth="1.8" strokeLinecap="round" />
                  {/* Ponto Vermelho de Pulso no Coração */}
                  <circle cx="45" cy="55" r="4" fill="#ff0055" className="animate-ping" />
                </svg>

                {/* Linha de batimento ECG passando sobre o peito */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-full h-8 bg-rose-500/10 border-y border-rose-500/30 flex items-center justify-center">
                    <Activity className="h-6 w-full text-rose-400 animate-pulse" />
                  </div>
                </div>
              </div>

              {/* Status do Paciente na Silhueta */}
              <div className="text-center font-mono text-[10px] text-slate-300 bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
                MONITORAMENTO PRÉ-HOSPITALAR ATIVO
              </div>
            </div>

          </div>

          {/* BLOCO NO RODAPÉ DA BARRA COM ÍCONE DE MICROCHIP */}
          <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl flex items-start gap-3">
            <Cpu className="h-5 w-5 text-cyan-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              A IA irá processar os dados, cruzar informações e indicar a melhor conduta.
            </p>
          </div>

        </div>

        {/* 3. GRADE DE FORMULÁRIO DE SELEÇÃO (GRID 3x3 - 8 COLUNAS) */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* CARD 01: TIPO DE OCORRÊNCIA */}
          <div className="p-4 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900/60 flex flex-col justify-between space-y-3 transition-all">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <span className="font-mono text-[11px] font-bold text-amber-400 uppercase">01. TIPO DE OCORRÊNCIA</span>
            </div>
            <div>
              <p className="text-xs text-slate-300 font-medium mb-1.5">Qual foi a situação?</p>
              <select
                value={formParams.tipo_ocorrencia}
                onChange={(e) => setFormParams({ ...formParams, tipo_ocorrencia: e.target.value })}
                className="w-full h-10 rounded-lg border border-slate-700 bg-slate-950 px-3 text-xs text-white focus:border-rose-500 focus:outline-none"
              >
                {OPCOES_TRIAGEM.tipo_ocorrencia.map(op => <option key={op} value={op}>{op}</option>)}
              </select>
            </div>
          </div>

          {/* CARD 02: NÍVEL DE SANGRAMENTO */}
          <div className="p-4 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900/60 flex flex-col justify-between space-y-3 transition-all">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <Droplets className="h-4 w-4 text-rose-500" />
              <span className="font-mono text-[11px] font-bold text-rose-400 uppercase">02. NÍVEL DE SANGRAMENTO</span>
            </div>
            <div>
              <p className="text-xs text-slate-300 font-medium mb-1.5">Existe sangramento? Qual a gravidade?</p>
              <select
                value={formParams.existe_sangramento}
                onChange={(e) => setFormParams({ ...formParams, existe_sangramento: e.target.value })}
                className="w-full h-10 rounded-lg border border-slate-700 bg-slate-950 px-3 text-xs text-white focus:border-rose-500 focus:outline-none font-semibold text-rose-300"
              >
                {OPCOES_TRIAGEM.existe_sangramento.map(op => <option key={op} value={op}>{op}</option>)}
              </select>
            </div>
          </div>

          {/* CARD 03: TEMPO DESDE O EVENTO */}
          <div className="p-4 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900/60 flex flex-col justify-between space-y-3 transition-all">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <Clock className="h-4 w-4 text-sky-400" />
              <span className="font-mono text-[11px] font-bold text-sky-400 uppercase">03. TEMPO DESDE O EVENTO</span>
            </div>
            <div>
              <p className="text-xs text-slate-300 font-medium mb-1.5">Há quanto tempo ocorreu?</p>
              <select
                value={formParams.tempo_evento}
                onChange={(e) => setFormParams({ ...formParams, tempo_evento: e.target.value })}
                className="w-full h-10 rounded-lg border border-slate-700 bg-slate-950 px-3 text-xs text-white focus:border-rose-500 focus:outline-none"
              >
                {OPCOES_TRIAGEM.tempo_evento.map(op => <option key={op} value={op}>{op}</option>)}
              </select>
            </div>
          </div>

          {/* CARD 04: ESTADO DE CONSCIÊNCIA */}
          <div className="p-4 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900/60 flex flex-col justify-between space-y-3 transition-all">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <Brain className="h-4 w-4 text-purple-400" />
              <span className="font-mono text-[11px] font-bold text-purple-400 uppercase">04. ESTADO DE CONSCIÊNCIA</span>
            </div>
            <div>
              <p className="text-xs text-slate-300 font-medium mb-1.5">Como o paciente está respondendo?</p>
              <select
                value={formParams.estado_consciencia}
                onChange={(e) => setFormParams({ ...formParams, estado_consciencia: e.target.value })}
                className="w-full h-10 rounded-lg border border-slate-700 bg-slate-950 px-3 text-xs text-white focus:border-rose-500 focus:outline-none"
              >
                {OPCOES_TRIAGEM.estado_consciencia.map(op => <option key={op} value={op}>{op}</option>)}
              </select>
            </div>
          </div>

          {/* CARD 05: LESÕES APARENTES */}
          <div className="p-4 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900/60 flex flex-col justify-between space-y-3 transition-all">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <ShieldAlert className="h-4 w-4 text-orange-400" />
              <span className="font-mono text-[11px] font-bold text-orange-400 uppercase">05. LESÕES APARENTES</span>
            </div>
            <div>
              <p className="text-xs text-slate-300 font-medium mb-1.5">Há sinais de trauma visíveis?</p>
              <select
                value={formParams.lesoes_aparentes}
                onChange={(e) => setFormParams({ ...formParams, lesoes_aparentes: e.target.value })}
                className="w-full h-10 rounded-lg border border-slate-700 bg-slate-950 px-3 text-xs text-white focus:border-rose-500 focus:outline-none"
              >
                {OPCOES_TRIAGEM.lesoes_aparentes.map(op => <option key={op} value={op}>{op}</option>)}
              </select>
            </div>
          </div>

          {/* CARD 06: HISTÓRICO RELEVANTE */}
          <div className="p-4 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900/60 flex flex-col justify-between space-y-3 transition-all">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <FileText className="h-4 w-4 text-emerald-400" />
              <span className="font-mono text-[11px] font-bold text-emerald-400 uppercase">06. HISTÓRICO RELEVANTE</span>
            </div>
            <div>
              <p className="text-xs text-slate-300 font-medium mb-1.5">Condição prévia, alergia ou medicação?</p>
              <select
                value={formParams.historico_relevante}
                onChange={(e) => setFormParams({ ...formParams, historico_relevante: e.target.value })}
                className="w-full h-10 rounded-lg border border-slate-700 bg-slate-950 px-3 text-xs text-white focus:border-rose-500 focus:outline-none"
              >
                {OPCOES_TRIAGEM.historico_relevante.map(op => <option key={op} value={op}>{op}</option>)}
              </select>
            </div>
          </div>

          {/* CARD 07: IDADE DO PACIENTE */}
          <div className="p-4 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900/60 flex flex-col justify-between space-y-3 transition-all">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <UserCheck className="h-4 w-4 text-cyan-400" />
              <span className="font-mono text-[11px] font-bold text-cyan-400 uppercase">07. IDADE DO PACIENTE</span>
            </div>
            <div>
              <p className="text-xs text-slate-300 font-medium mb-1.5">Qual a faixa etária?</p>
              <select
                value={formParams.idade}
                onChange={(e) => setFormParams({ ...formParams, idade: e.target.value })}
                className="w-full h-10 rounded-lg border border-slate-700 bg-slate-950 px-3 text-xs text-white focus:border-rose-500 focus:outline-none"
              >
                {OPCOES_TRIAGEM.idade.map(op => <option key={op} value={op}>{op}</option>)}
              </select>
            </div>
          </div>

          {/* CARD 08: TIPO SANGUÍNEO */}
          <div className="p-4 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900/60 flex flex-col justify-between space-y-3 transition-all">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <Heart className="h-4 w-4 text-rose-400" />
              <span className="font-mono text-[11px] font-bold text-rose-400 uppercase">08. TIPO SANGUÍNEO</span>
            </div>
            <div>
              <p className="text-xs text-slate-300 font-medium mb-1.5">Qual o tipo sanguíneo?</p>
              <select
                value={formParams.tipo_sanguineo}
                onChange={(e) => setFormParams({ ...formParams, tipo_sanguineo: e.target.value })}
                className="w-full h-10 rounded-lg border border-slate-700 bg-slate-950 px-3 text-xs text-white font-bold focus:border-rose-500 focus:outline-none"
              >
                {OPCOES_TRIAGEM.tipo_sanguineo.map(op => <option key={op} value={op}>{op}</option>)}
              </select>
            </div>
          </div>

          {/* 4. CARD 09: ÁREA DE AÇÃO E BOTÃO DE SUBMISSÃO DESTACADO */}
          <div className="p-4 rounded-xl border border-rose-500/50 bg-gradient-to-br from-rose-950/60 via-slate-900 to-fuchsia-950/60 shadow-[0_0_25px_rgba(244,63,94,0.3)] flex flex-col justify-between space-y-3 transition-all">
            <div className="flex items-center justify-between border-b border-rose-500/30 pb-2">
              <span className="font-mono text-[11px] font-bold text-rose-300 uppercase flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-rose-400" />
                09. ANÁLISE DA IA
              </span>
              <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">
                PRONTO
              </span>
            </div>

            <div className="space-y-2">
              <p className="text-[11px] text-slate-300 font-sans leading-tight">
                Processar parâmetros com o motor de inferência da IA.
              </p>

              {/* BOTÃO PRINCIPAL DESTACADO: "INICIAR ANÁLISE >" */}
              <Button
                onClick={handleRunTriage}
                disabled={isGenerating}
                className="w-full h-11 bg-gradient-to-r from-red-600 via-rose-600 to-fuchsia-600 hover:from-red-500 hover:to-fuchsia-500 text-white font-extrabold text-xs tracking-wider shadow-[0_0_20px_rgba(244,63,94,0.6)] border border-rose-400/40 rounded-xl flex items-center justify-center gap-2"
              >
                <Brain className={`h-4 w-4 ${isGenerating ? "animate-spin" : ""}`} />
                {isGenerating ? "ANALISANDO..." : "INICIAR ANÁLISE >"}
              </Button>
            </div>
          </div>

        </div>

      </div>

      {/* NOTIFICAÇÃO DE FEEDBACK VISUAL AO ADICIONAR PACIENTE */}
      {alertSuccess && (
        <div className="p-4 rounded-xl border border-emerald-500/40 bg-emerald-950/60 text-emerald-300 flex items-center justify-between gap-4 shadow-[0_0_25px_rgba(0,229,163,0.2)] animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-white text-xs sm:text-sm">
                PACIENTE TRIADO E ADICIONADO ÀS SIMULAÇÕES!
              </p>
              <p className="text-[11px] text-emerald-400/90 font-mono">
                Análise da IA concluída com prescrição de suporte sanguíneo. Clique em "Ver Simulação Completa" em seu card para abrir a análise em 4 passos.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/40 hidden sm:inline-block">
            TRIAGEM FINALIZADA
          </span>
        </div>
      )}

      {/* PAINEL DE PACIENTES TRIADOS COM CARDS LIMPOS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-rose-500" />
            <h2 className="text-lg font-bold text-white font-display">
              Pacientes em Triagem ({activeQueue.length})
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Cards individuais e delimitados • Clique para expandir a simulação da IA
          </span>
        </div>

        {activeQueue.length === 0 ? (
          <div className="text-center py-12 rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 text-slate-500 text-sm">
            Nenhum paciente triado no momento. Preencha os dados acima e clique em <strong>"INICIAR ANÁLISE &gt;"</strong>!
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {activeQueue.map((paciente) => (
              <div
                key={paciente.id}
                className="group relative overflow-hidden rounded-2xl glass-panel border border-slate-800 hover:border-rose-500/40 bg-slate-950/90 p-5 transition-all duration-300 shadow-lg hover:shadow-2xl"
              >
                {/* Linha decorativa no topo do Card */}
                <div className={`absolute top-0 left-0 right-0 h-1 ${
                  paciente.prioridade.includes("VERMELHA") 
                    ? "bg-gradient-to-r from-rose-600 via-red-500 to-rose-600" 
                    : "bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500"
                }`} />

                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
                  
                  {/* ESQUERDA: ID, PACIENTE, TIPO OCORRÊNCIA E SANGRAMENTO */}
                  <div className="space-y-2 max-w-md">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-white bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800">
                        {paciente.id}
                      </span>

                      <span className={`text-[10px] font-mono font-extrabold px-3 py-1 rounded-full border flex items-center gap-1 ${
                        paciente.prioridade.includes("VERMELHA")
                          ? "bg-rose-500/15 text-rose-300 border-rose-500/40 shadow-[0_0_10px_rgba(244,63,94,0.2)]"
                          : "bg-amber-500/15 text-amber-300 border-amber-500/40"
                      }`}>
                        <ShieldAlert className="h-3 w-3" />
                        {paciente.prioridade}
                      </span>

                      <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-1 rounded border border-slate-850">
                        {paciente.admitidoEm}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-white font-display flex items-center gap-2">
                      {paciente.nome}
                      <span className="text-xs text-slate-400 font-normal font-sans">({paciente.idade})</span>
                    </h3>

                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="bg-slate-900/90 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-800 font-medium">
                        📌 {paciente.tipo_ocorrencia}
                      </span>
                      <span className="bg-rose-950/40 text-rose-300 px-2.5 py-1 rounded-lg border border-rose-900/40 font-medium">
                        🩸 Sangramento {paciente.existe_sangramento}
                      </span>
                      <span className="bg-slate-900/90 text-sky-300 px-2.5 py-1 rounded-lg border border-slate-800 font-mono">
                        Tipo ABO/Rh: {paciente.tipo_sanguineo}
                      </span>
                    </div>
                  </div>

                  {/* CENTRO: GRID DE SINAIS VITAIS ORGANIZADO EM COLUNAS DESTACADAS */}
                  <div className="grid grid-cols-3 gap-2.5 w-full lg:w-auto">
                    <div className="p-2.5 rounded-xl border border-rose-500/30 bg-rose-950/20 text-center min-w-[90px]">
                      <span className="text-[9px] font-mono font-bold text-slate-400 block">FC (BPM)</span>
                      <span className="font-mono text-lg font-bold text-rose-400">{paciente.fc}</span>
                    </div>

                    <div className="p-2.5 rounded-xl border border-amber-500/30 bg-amber-950/20 text-center min-w-[95px]">
                      <span className="text-[9px] font-mono font-bold text-slate-400 block">PA (mmHg)</span>
                      <span className="font-mono text-sm font-bold text-amber-300 leading-6">{paciente.pa}</span>
                    </div>

                    <div className="p-2.5 rounded-xl border border-cyan-500/30 bg-cyan-950/20 text-center min-w-[85px]">
                      <span className="text-[9px] font-mono font-bold text-slate-400 block">SpO₂ (%)</span>
                      <span className="font-mono text-lg font-bold text-cyan-300">{paciente.spo2}%</span>
                    </div>
                  </div>

                  {/* DIREITA: PRESCRIÇÃO E BOTÃO INTERATIVO "VER SIMULAÇÃO COMPLETA" */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-end justify-between gap-3 w-full lg:w-auto pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                    <div className="text-left sm:text-right lg:text-right">
                      <span className="text-[10px] font-mono uppercase text-slate-400 block">PRESCRIÇÃO SINTÉTICA</span>
                      <span className="font-mono text-xl font-extrabold text-white">
                        {paciente.volumeMl} <span className="text-xs text-rose-400 font-bold">mL</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <Button
                        onClick={() => setSelectedPatientModal(paciente)}
                        size="sm"
                        className="gap-2 bg-gradient-to-r from-rose-600 to-fuchsia-600 hover:from-rose-500 hover:to-fuchsia-500 text-white font-bold text-xs shadow-[0_0_15px_rgba(244,63,94,0.3)] px-4 py-2 rounded-xl"
                      >
                        <Eye className="h-4 w-4" />
                        VER SIMULAÇÃO COMPLETA
                      </Button>

                      <button
                        onClick={() => setActiveQueue(prev => prev.filter(p => p.id !== paciente.id))}
                        className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors"
                        title="Remover paciente"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL EXPANSÍVEL DA SIMULAÇÃO COMPLETA DA IA EM 4 PASSOS */}
      {selectedPatientModal && (
        <Dialog open={!!selectedPatientModal} onOpenChange={() => setSelectedPatientModal(null)}>
          <DialogContent className="glass-panel border-rose-500/40 sm:max-w-4xl bg-slate-950/95 text-slate-100 max-h-[90vh] overflow-y-auto">
            <DialogHeader className="border-b border-slate-800 pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400">
                    <Sparkles className="h-5 w-5" />
                  </span>
                  <div>
                    <DialogTitle className="text-lg font-bold text-white font-display flex items-center gap-2">
                      Análise de IA & Simulação Completa ({selectedPatientModal.id})
                    </DialogTitle>
                    <DialogDescription className="text-xs text-slate-400">
                      Resolução estruturada em 4 Passos para {selectedPatientModal.nome} • {selectedPatientModal.idade}
                    </DialogDescription>
                  </div>
                </div>
              </div>
            </DialogHeader>

            {/* CONTEÚDO EXPANDIDO DAS 4 ETAPAS OBRIGATÓRIAS */}
            {selectedPatientModal.triageReport && (
              <div className="space-y-5 my-3">
                <div className="flex items-center justify-between bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <span className="text-xs font-mono text-slate-300">
                    STATUS: <strong className="text-emerald-400">SIMULAÇÃO FINALIZADA E ARMAZENADA</strong>
                  </span>
                  <Button
                    onClick={() => handleCopyReport(selectedPatientModal.triageReport)}
                    variant="outline"
                    size="sm"
                    className="gap-2 text-xs border-slate-700 bg-slate-900 text-slate-200"
                  >
                    {copiedReport ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    {copiedReport ? "LAUDO COPIADO!" : "COPIAR TEXTO DO LAUDO"}
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* PASSO 1: DESCRIÇÃO DO PROBLEMA */}
                  <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 space-y-2">
                    <div className="flex items-center gap-2 text-rose-400 border-b border-slate-800 pb-2">
                      <FileText className="h-4 w-4" />
                      <h4 className="text-xs font-mono font-bold uppercase">1. DESCRIÇÃO DO PROBLEMA</h4>
                    </div>
                    <div className="text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-line">
                      {selectedPatientModal.triageReport.etapas["1_descricao_problema"]}
                    </div>
                  </div>

                  {/* PASSO 2: EXPLICAÇÃO DO PROBLEMA */}
                  <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-950/10 space-y-2">
                    <div className="flex items-center gap-2 text-amber-400 border-b border-slate-800 pb-2">
                      <AlertTriangle className="h-4 w-4" />
                      <h4 className="text-xs font-mono font-bold uppercase">2. EXPLICAÇÃO DO PROBLEMA (FISIOPATOLOGIA)</h4>
                    </div>
                    <div className="text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-line">
                      {selectedPatientModal.triageReport.etapas["2_explicacao_problema"]}
                    </div>
                  </div>

                  {/* PASSO 3: RESOLUÇÃO DO PROBLEMA (FOCO EM ANÁLISE SANGUÍNEA) */}
                  <div className="p-4 rounded-xl border border-cyan-500/30 bg-cyan-950/10 space-y-2">
                    <div className="flex items-center gap-2 text-cyan-400 border-b border-slate-800 pb-2">
                      <Droplets className="h-4 w-4" />
                      <h4 className="text-xs font-mono font-bold uppercase">3. RESOLUÇÃO DO PROBLEMA (ANÁLISE SANGUÍNEA)</h4>
                    </div>
                    <div className="text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-line">
                      {selectedPatientModal.triageReport.etapas["3_resolucao_problema"]}
                    </div>
                  </div>

                  {/* PASSO 4: EXPLICAÇÃO DE COMO FOI RESOLVIDO */}
                  <div className="p-4 rounded-xl border border-fuchsia-500/30 bg-fuchsia-950/10 space-y-2">
                    <div className="flex items-center gap-2 text-fuchsia-400 border-b border-slate-800 pb-2">
                      <Brain className="h-4 w-4" />
                      <h4 className="text-xs font-mono font-bold uppercase">4. EXPLICAÇÃO DE COMO FOI RESOLVIDO (RACIOCÍNIO DA IA)</h4>
                    </div>
                    <div className="text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-line">
                      {selectedPatientModal.triageReport.etapas["4_explicacao_como_resolvido"]}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}

    </div>
  );
}
