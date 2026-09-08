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
  X
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
  const [creationMode, setCreationMode] = useState("Com IA"); // "Com IA" | "Manual"
  const [isGenerating, setIsGenerating] = useState(false);
  const [alertSuccess, setAlertSuccess] = useState(false);
  const [copiedReport, setCopiedReport] = useState(false);
  const [selectedPatientModal, setSelectedPatientModal] = useState(null); // Modal da Simulação Completa em 4 Passos
  
  // Estado dos Campos Manuais
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

  // Lista de Cards de Pacientes Triados
  const [activeQueue, setActiveQueue] = useState([]);

  // Função Auxiliar para Gerar o Laudo de Triagem Completo em 4 Etapas
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

  // Função Principal de Execução da Triagem
  const handleRunTriage = async (overrideMode = null) => {
    const modeToUse = overrideMode || creationMode;
    setIsGenerating(true);
    setAlertSuccess(false);

    try {
      let params = { ...formParams };

      if (modeToUse === "Com IA") {
        params = {
          tipo_ocorrencia: OPCOES_TRIAGEM.tipo_ocorrencia[Math.floor(Math.random() * OPCOES_TRIAGEM.tipo_ocorrencia.length)],
          existe_sangramento: OPCOES_TRIAGEM.existe_sangramento[Math.floor(Math.random() * 2 + 2)], // Moderado ou Grave
          tempo_evento: OPCOES_TRIAGEM.tempo_evento[Math.floor(Math.random() * 3)],
          respiracao: OPCOES_TRIAGEM.respiracao[Math.floor(Math.random() * 2 + 2)],
          estado_consciencia: OPCOES_TRIAGEM.estado_consciencia[Math.floor(Math.random() * 2 + 2)],
          lesoes_aparentes: OPCOES_TRIAGEM.lesoes_aparentes[Math.floor(Math.random() * 2 + 2)],
          historico_relevante: "Informação desconhecida (Paciente Inconsciente)",
          idade: OPCOES_TRIAGEM.idade[Math.floor(Math.random() * OPCOES_TRIAGEM.idade.length)],
          tipo_sanguineo: OPCOES_TRIAGEM.tipo_sanguineo[Math.floor(Math.random() * OPCOES_TRIAGEM.tipo_sanguineo.length)]
        };
      }

      let report = null;
      try {
        const API_URL = import.meta.env.VITE_API_URL || "";
        const response = await fetch(`${API_URL}/api/triage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            modo: modeToUse,
            ...(modeToUse === "Manual" ? formParams : params)
          })
        });

        if (response.ok) {
          report = await response.json();
        } else {
          report = buildTriageReport(modeToUse, params);
        }
      } catch {
        report = buildTriageReport(modeToUse, params);
      }

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

      setActiveQueue(prev => [novoPaciente, ...prev]);
      if (onAddPatientToQueue) onAddPatientToQueue(novoPaciente);

      setAlertSuccess(true);
      setTimeout(() => setAlertSuccess(false), 3500);

    } finally {
      setIsGenerating(false);
    }
  };

  // Inicializa com 2 pacientes exemplares bem estruturados ao carregar
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

  // Copiar Relatório Formatado do Modal
  const handleCopyReport = (report) => {
    if (!report) return;
    navigator.clipboard.writeText(report.texto_formatado);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* 1. CABEÇALHO E REESTRUTURAÇÃO DE CONTEÚDO (TITULO DEFINIDO: TRIAGEM DE PACIENTES) */}
      <div className="relative overflow-hidden rounded-2xl glass-panel border border-rose-500/30 bg-gradient-to-r from-rose-950/40 via-slate-950 to-fuchsia-950/30 p-6 shadow-[0_0_30px_rgba(255,42,66,0.15)]">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-8 w-64 h-64 bg-fuchsia-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-rose-500 animate-ping" />
              <span className="font-mono text-xs uppercase tracking-widest text-rose-400 font-bold flex items-center gap-1.5">
                <Brain className="h-4 w-4 text-rose-500" />
                SISTEMA BIOMÉDICO DE SUPORTE EM URGÊNCIA (FECART)
              </span>
            </div>
            {/* Título Principal Reestruturado */}
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-display">
              Triagem de Pacientes: <span className="text-gradient-blood">Análise e Suporte Sanguíneo de Emergência</span>
            </h1>
            {/* Subcabeçalho Atualizado */}
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Avaliação biomédica contínua e triagem pré-hospitalar em tempo real. O motor de IA prescreve o sangue sintético de emergência (HBOCs / PFCs) para manutenção hemodinâmica antes da chegada ao hospital.
            </p>
          </div>

          {/* SELETOR DE MODO E DISPARADOR DE TRIAGEM */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
            <div className="flex rounded-lg bg-slate-950 p-1 border border-slate-800">
              <button
                onClick={() => setCreationMode("Com IA")}
                className={`px-3 py-2 text-xs font-bold rounded-md font-mono transition-all ${
                  creationMode === "Com IA"
                    ? "bg-rose-600 text-white shadow-[0_0_12px_rgba(225,29,72,0.5)]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                ⚡ COM IA (AUTÔNOMO)
              </button>
              <button
                onClick={() => setCreationMode("Manual")}
                className={`px-3 py-2 text-xs font-bold rounded-md font-mono transition-all ${
                  creationMode === "Manual"
                    ? "bg-rose-600 text-white shadow-[0_0_12px_rgba(225,29,72,0.5)]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                ✍️ MANUAL
              </button>
            </div>

            <Button
              onClick={() => handleRunTriage()}
              disabled={isGenerating}
              size="lg"
              className="gap-2 bg-gradient-to-r from-red-600 via-rose-600 to-fuchsia-600 hover:from-red-500 hover:to-fuchsia-500 text-white font-bold tracking-wide shadow-[0_0_20px_rgba(255,42,66,0.4)] border border-rose-400/30 px-5 py-5 text-xs rounded-xl"
            >
              <Zap className={`h-4 w-4 ${isGenerating ? "animate-spin" : "animate-bounce"}`} />
              {isGenerating ? "PROCESSANDO..." : "NOVA TRIAGEM"}
            </Button>
          </div>
        </div>
      </div>

      {/* FORMULÁRIO DE ENTRADA MANUAL (Exibido no Modo Manual) */}
      {creationMode === "Manual" && (
        <div className="glass-panel rounded-2xl p-5 border-rose-500/30 bg-slate-950/90 space-y-4 animate-in slide-in-from-top duration-300">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="font-mono text-xs font-bold text-rose-400 flex items-center gap-2">
              <Edit3 className="h-4 w-4" />
              FORMULÁRIO DE ENTRADA DE PACIENTE (9 PARAMETROS EXIGIDOS)
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              Caso inconsciente, o histórico relevante é opcional.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            <div className="space-y-1">
              <label className="text-[11px] font-mono font-bold text-slate-300">1. Tipo de ocorrência</label>
              <select
                value={formParams.tipo_ocorrencia}
                onChange={(e) => setFormParams({ ...formParams, tipo_ocorrencia: e.target.value })}
                className="w-full h-9 rounded-lg border border-slate-700 bg-slate-900 px-3 text-xs text-white"
              >
                {OPCOES_TRIAGEM.tipo_ocorrencia.map(op => <option key={op} value={op}>{op}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono font-bold text-slate-300">2. Existe sangramento?</label>
              <select
                value={formParams.existe_sangramento}
                onChange={(e) => setFormParams({ ...formParams, existe_sangramento: e.target.value })}
                className="w-full h-9 rounded-lg border border-slate-700 bg-slate-900 px-3 text-xs text-white"
              >
                {OPCOES_TRIAGEM.existe_sangramento.map(op => <option key={op} value={op}>{op}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono font-bold text-slate-300">3. Tempo desde o evento</label>
              <select
                value={formParams.tempo_evento}
                onChange={(e) => setFormParams({ ...formParams, tempo_evento: e.target.value })}
                className="w-full h-9 rounded-lg border border-slate-700 bg-slate-900 px-3 text-xs text-white"
              >
                {OPCOES_TRIAGEM.tempo_evento.map(op => <option key={op} value={op}>{op}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono font-bold text-slate-300">4. Respiração</label>
              <select
                value={formParams.respiracao}
                onChange={(e) => setFormParams({ ...formParams, respiracao: e.target.value })}
                className="w-full h-9 rounded-lg border border-slate-700 bg-slate-900 px-3 text-xs text-white"
              >
                {OPCOES_TRIAGEM.respiracao.map(op => <option key={op} value={op}>{op}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono font-bold text-slate-300">5. Estado de Consciência</label>
              <select
                value={formParams.estado_consciencia}
                onChange={(e) => setFormParams({ ...formParams, estado_consciencia: e.target.value })}
                className="w-full h-9 rounded-lg border border-slate-700 bg-slate-900 px-3 text-xs text-white"
              >
                {OPCOES_TRIAGEM.estado_consciencia.map(op => <option key={op} value={op}>{op}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono font-bold text-slate-300">6. Lesões aparentes</label>
              <select
                value={formParams.lesoes_aparentes}
                onChange={(e) => setFormParams({ ...formParams, lesoes_aparentes: e.target.value })}
                className="w-full h-9 rounded-lg border border-slate-700 bg-slate-900 px-3 text-xs text-white"
              >
                {OPCOES_TRIAGEM.lesoes_aparentes.map(op => <option key={op} value={op}>{op}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono font-bold text-slate-300">
                7. Histórico relevante {formParams.estado_consciencia === "Não responde" && "(Opcional)"}
              </label>
              <select
                value={formParams.historico_relevante}
                onChange={(e) => setFormParams({ ...formParams, historico_relevante: e.target.value })}
                className="w-full h-9 rounded-lg border border-slate-700 bg-slate-900 px-3 text-xs text-white"
              >
                {OPCOES_TRIAGEM.historico_relevante.map(op => <option key={op} value={op}>{op}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono font-bold text-slate-300">8. Idade do paciente</label>
              <select
                value={formParams.idade}
                onChange={(e) => setFormParams({ ...formParams, idade: e.target.value })}
                className="w-full h-9 rounded-lg border border-slate-700 bg-slate-900 px-3 text-xs text-white"
              >
                {OPCOES_TRIAGEM.idade.map(op => <option key={op} value={op}>{op}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono font-bold text-slate-300">9. Tipo sanguíneo</label>
              <select
                value={formParams.tipo_sanguineo}
                onChange={(e) => setFormParams({ ...formParams, tipo_sanguineo: e.target.value })}
                className="w-full h-9 rounded-lg border border-slate-700 bg-slate-900 px-3 text-xs text-white font-bold"
              >
                {OPCOES_TRIAGEM.tipo_sanguineo.map(op => <option key={op} value={op}>{op}</option>)}
              </select>
            </div>
          </div>
        </div>
      )}

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

      {/* 2. LAYOUT E ORGANIZAÇÃO DOS CARDS DE PACIENTES INDIVIDUAIS E LIMPOS */}
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
            Nenhum paciente triado no momento. Clique em <strong>"NOVA TRIAGEM"</strong> acima para gerar uma simulação!
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

                      {/* BADGE DE CORRESPONDÊNCIA DE GRAVIDADE */}
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
                    {/* FC */}
                    <div className="p-2.5 rounded-xl border border-rose-500/30 bg-rose-950/20 text-center min-w-[90px]">
                      <span className="text-[9px] font-mono font-bold text-slate-400 block">FC (BPM)</span>
                      <span className="font-mono text-lg font-bold text-rose-400">{paciente.fc}</span>
                    </div>

                    {/* PA */}
                    <div className="p-2.5 rounded-xl border border-amber-500/30 bg-amber-950/20 text-center min-w-[95px]">
                      <span className="text-[9px] font-mono font-bold text-slate-400 block">PA (mmHg)</span>
                      <span className="font-mono text-sm font-bold text-amber-300 leading-6">{paciente.pa}</span>
                    </div>

                    {/* SpO2 */}
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
                      {/* BOTÃO EXIGIDO: "VER SIMULAÇÃO COMPLETA" */}
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

      {/* 3. MODAL EXPANSÍVEL DA SIMULAÇÃO COMPLETA DA IA EM 4 PASSOS */}
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
                
                {/* BOTÃO COPIAR LAUDO NO TOPO DO MODAL */}
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
