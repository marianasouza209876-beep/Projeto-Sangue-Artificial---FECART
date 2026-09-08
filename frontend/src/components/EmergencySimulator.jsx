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
  ArrowLeft,
  Plus,
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
  ChevronRight,
  CheckCircle,
  BarChart3,
  AlertCircle
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
  // Controle de Visualização: 'dashboard' (Visão Resumida de Pacientes) | 'form' (Formulário de Entrada)
  const [viewMode, setViewMode] = useState("dashboard"); 
  const [currentStep, setCurrentStep] = useState(1); // 1. Dados | 2. Análise | 3. Resultado
  const [isGenerating, setIsGenerating] = useState(false);
  const [alertSuccess, setAlertSuccess] = useState(false);
  const [copiedReport, setCopiedReport] = useState(false);
  const [selectedPatientModal, setSelectedPatientModal] = useState(null); // Modal da Simulação Completa

  // Estado dos Campos do Formulário
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

  // Resultado da Última Triagem Gerada
  const [triageReport, setTriageReport] = useState(null);

  // Lista de Cards de Pacientes Triados (Fila de Atendimento)
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

  // Executa a triagem ao clicar em "INICIAR ANÁLISE >"
  const handleRunTriage = async () => {
    setIsGenerating(true);
    setCurrentStep(2);
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
        admitidoEm: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        triageReport: report
      };

      // Simulação do tempo de processamento da IA
      setTimeout(() => {
        setActiveQueue(prev => [novoPaciente, ...prev]);
        if (onAddPatientToQueue) onAddPatientToQueue(novoPaciente);
        setCurrentStep(3);
        setIsGenerating(false);
        setAlertSuccess(true);
        setViewMode("dashboard"); // Alterna automaticamente para a visão limpa do Dashboard
        setTimeout(() => setAlertSuccess(false), 5000);
      }, 1000);

    } catch {
      setIsGenerating(false);
    }
  };

  // Inicializa pacientes simulados no primeiro carregamento
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
          admitidoEm: "14:15",
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
          admitidoEm: "14:02",
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
      
      {/* ALERTA DE SUCESSO APÓS CONFIRMAÇÃO DA TRIAGEM */}
      {alertSuccess && (
        <div className="p-4 rounded-2xl border border-emerald-500/40 bg-emerald-950/70 text-emerald-300 flex items-center justify-between gap-4 shadow-[0_0_30px_rgba(0,229,163,0.25)] animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-white text-xs sm:text-sm font-display">
                TRIAGEM CONCLUÍDA E PACIENTE ADICIONADO À FILA!
              </p>
              <p className="text-[11px] text-emerald-300/90 font-mono mt-0.5">
                O laudo de 4 passos foi gerado pela IA. Clique em "Ver Simulação Completa" para visualizar os detalhes.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/40 hidden sm:inline-block">
            PROCESSADO
          </span>
        </div>
      )}

      {/* NAVEGAÇÃO 1: MODO DASHBOARD (TELA PRINCIPAL: DASHBOARD RESUMIDO DE PACIENTES) */}
      {viewMode === "dashboard" && (
        <div className="space-y-6">
          
          {/* CABEÇALHO DO DASHBOARD */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-950/90 border border-slate-800 p-6 rounded-2xl shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-purple-500 to-cyan-500" />
            
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-3">
                <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
                  <Activity className="h-5 w-5 animate-pulse" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-display">
                  Pacientes em Triagem
                </h1>
                <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  {activeQueue.length} {activeQueue.length === 1 ? "Paciente Ativo" : "Pacientes Ativos"}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                Painel de monitoramento e suporte de triagem de emergência com prescrição de sangue sintético.
              </p>
            </div>

            <Button
              onClick={() => {
                setCurrentStep(1);
                setViewMode("form");
              }}
              className="w-full sm:w-auto gap-2 bg-gradient-to-r from-rose-600 via-purple-600 to-cyan-600 hover:from-rose-500 hover:to-cyan-500 text-white font-extrabold text-xs shadow-[0_0_20px_rgba(244,63,94,0.35)] border border-rose-400/40 px-5 py-3 rounded-xl transition-all"
            >
              <Plus className="h-4 w-4" />
              + Nova Triagem
            </Button>
          </div>

          {/* LISTA DE CARDS RESUMIDOS DOS PACIENTES */}
          {activeQueue.length === 0 ? (
            <div className="text-center py-16 rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 space-y-3">
              <Brain className="h-10 w-10 text-slate-600 mx-auto" />
              <p className="text-slate-400 text-sm font-sans">
                Nenhum paciente na fila de triagem no momento.
              </p>
              <Button
                onClick={() => setViewMode("form")}
                variant="outline"
                className="border-slate-700 text-xs text-slate-200"
              >
                + Iniciar Nova Triagem
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {activeQueue.map((paciente) => (
                <div
                  key={paciente.id}
                  className="group relative overflow-hidden rounded-2xl glass-panel border border-slate-800 hover:border-rose-500/40 bg-slate-950/90 p-5 transition-all duration-300 shadow-xl hover:shadow-2xl"
                >
                  {/* FAIXA NEON DE GRAVIDADE NO TOPO */}
                  <div className={`absolute top-0 left-0 right-0 h-1 ${
                    paciente.prioridade.includes("VERMELHA") 
                      ? "bg-gradient-to-r from-rose-600 via-red-500 to-rose-600 shadow-[0_0_10px_rgba(244,63,94,0.6)]" 
                      : "bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500"
                  }`} />

                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
                    
                    {/* 1. LADO ESQUERDO: ID DO PACIENTE, FAIXA ETÁRIA E TIPO DE OCORRÊNCIA */}
                    <div className="space-y-2 max-w-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-extrabold text-white bg-slate-900 px-3 py-1 rounded-md border border-slate-800 shadow-inner">
                          {paciente.id}
                        </span>
                        <span className="text-xs font-semibold text-slate-300 font-sans">
                          • Faixa Etária: <strong className="text-white">{paciente.idade}</strong>
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-850">
                          {paciente.admitidoEm}
                        </span>
                      </div>

                      <h3 className="text-base sm:text-lg font-bold text-white font-display flex items-center gap-2">
                        {paciente.tipo_ocorrencia}
                      </h3>

                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-400 font-sans">
                          Lesões Aparentes: <strong className="text-slate-200">{paciente.lesoes_aparentes}</strong>
                        </span>
                      </div>
                    </div>

                    {/* 2. BADGE DE PRIORIDADE DE SEVERIDADE */}
                    <div className="flex items-center">
                      <span className={`text-xs font-mono font-extrabold px-3.5 py-1.5 rounded-full border flex items-center gap-1.5 ${
                        paciente.prioridade.includes("VERMELHA")
                          ? "bg-rose-500/15 text-rose-300 border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.25)]"
                          : "bg-amber-500/15 text-amber-300 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.25)]"
                      }`}>
                        <ShieldAlert className="h-3.5 w-3.5" />
                        {paciente.prioridade}
                      </span>
                    </div>

                    {/* 3. CENTRO (SINAIS E PRESCRIÇÃO RÁPIDA) */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full lg:w-auto">
                      {/* TIPO SANGUÍNEO */}
                      <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-center min-w-[100px]">
                        <span className="text-[9px] font-mono font-bold text-slate-400 block uppercase">TIPO SANGUÍNEO</span>
                        <span className="font-mono text-sm font-bold text-rose-400">{paciente.tipo_sanguineo}</span>
                      </div>

                      {/* GRAVIDADE SANGRAMENTO */}
                      <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-center min-w-[110px]">
                        <span className="text-[9px] font-mono font-bold text-slate-400 block uppercase">SANGRAMENTO</span>
                        <span className="font-mono text-sm font-bold text-amber-300">{paciente.existe_sangramento}</span>
                      </div>

                      {/* PRESCRIÇÃO SUGERIDA */}
                      <div className="p-2.5 rounded-xl bg-slate-900/90 border border-rose-500/30 text-center min-w-[150px]">
                        <span className="text-[9px] font-mono font-bold text-rose-400 block uppercase">PRESCRIÇÃO SUGERIDA</span>
                        <span className="font-mono text-sm font-extrabold text-white">
                          {paciente.volumeMl} mL <span className="text-[10px] text-cyan-300 font-sans font-normal">Sangue Artificial</span>
                        </span>
                      </div>
                    </div>

                    {/* 4. LADO DIREITO (AÇÃO PRINCIPAL) */}
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <Button
                        onClick={() => setSelectedPatientModal(paciente)}
                        size="sm"
                        className="gap-2 bg-gradient-to-r from-rose-600 via-purple-600 to-cyan-600 hover:from-rose-500 hover:to-cyan-500 text-white font-bold text-xs shadow-[0_0_15px_rgba(244,63,94,0.35)] px-4 py-2.5 rounded-xl transition-all"
                      >
                        <Eye className="h-4 w-4" />
                        Ver Simulação Completa
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
              ))}
            </div>
          )}

        </div>
      )}

      {/* NAVEGAÇÃO 2: MODO FORMULÁRIO (FORMULÁRIO DE ENTRADA DE PACIENTE) */}
      {viewMode === "form" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* CABEÇALHO E STEPPER */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 bg-slate-950/90 border border-slate-800 p-6 rounded-2xl shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-rose-500" />
            
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-3">
                {activeQueue.length > 0 && (
                  <button
                    onClick={() => setViewMode("dashboard")}
                    className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
                    title="Voltar para Pacientes em Triagem"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                )}
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

            {/* STEPPER EM 3 ETAPAS CIRCULARES E BADGE */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
              
              <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl">
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

              <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl flex items-center gap-2.5 max-w-xs">
                <Brain className="h-5 w-5 text-purple-400 flex-shrink-0 animate-pulse" />
                <p className="text-[11px] text-slate-300 font-sans leading-tight">
                  Cada informação importa. Quanto mais dados, maior a precisão da análise.
                </p>
              </div>

            </div>
          </div>

          {/* PAINEL PRINCIPAL DE FORMULÁRIO */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* BARRA LATERAL ESQUERDA (PAINEL INFORMATIVO DO PACIENTE) */}
            <div className="lg:col-span-4 flex flex-col justify-between glass-panel border border-slate-800 bg-slate-950/90 rounded-2xl p-5 space-y-6 relative overflow-hidden">
              <div className="space-y-4">
                
                <div className="border-b border-slate-800 pb-3">
                  <span className="font-mono text-xs font-bold text-rose-400 flex items-center gap-2">
                    <Heart className="h-4 w-4 text-rose-500 animate-pulse" />
                    INFORMAÇÕES DO PACIENTE
                  </span>
                  <p className="text-[11px] text-slate-400 font-sans mt-1">
                    Preencha os campos ao lado com atenção.
                  </p>
                </div>

                <div className="relative rounded-xl border border-slate-800/80 bg-slate-900/60 p-4 flex flex-col items-center justify-center space-y-3 shadow-inner min-h-[260px]">
                  
                  <div className="w-full flex items-center justify-between px-3 text-[10px] font-mono text-slate-400 border-b border-slate-800/60 pb-2">
                    <span className="flex items-center gap-1.5 text-rose-400">
                      <Activity className="h-3.5 w-3.5 text-rose-500 animate-pulse" />
                      ECG VITAL ACTIVE
                    </span>
                    <span className="text-emerald-400 font-bold">142 BPM</span>
                  </div>

                  <div className="relative my-2 flex items-center justify-center">
                    <svg className="w-28 h-44 text-slate-700" viewBox="0 0 100 180" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="50" cy="22" r="14" stroke="#ff0055" strokeWidth="1.8" strokeDasharray="3 3" className="animate-pulse" />
                      <path d="M32 40 L68 40 L62 105 L38 105 Z" stroke="#00d8ff" strokeWidth="1.8" />
                      <path d="M30 42 L16 90 L12 120" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" />
                      <path d="M70 42 L84 90 L88 120" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" />
                      <path d="M42 105 L38 165" stroke="#00ff9d" strokeWidth="1.8" strokeLinecap="round" />
                      <path d="M58 105 L62 165" stroke="#00ff9d" strokeWidth="1.8" strokeLinecap="round" />
                      <circle cx="45" cy="55" r="4" fill="#ff0055" className="animate-ping" />
                    </svg>

                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-full h-8 bg-rose-500/10 border-y border-rose-500/30 flex items-center justify-center">
                        <Activity className="h-6 w-full text-rose-400 animate-pulse" />
                      </div>
                    </div>
                  </div>

                  <div className="text-center font-mono text-[10px] text-slate-300 bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
                    MONITORAMENTO PRÉ-HOSPITALAR ATIVO
                  </div>
                </div>

              </div>

              <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl flex items-start gap-3">
                <Cpu className="h-5 w-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  A IA irá processar os dados, cruzar informações e indicar a melhor conduta.
                </p>
              </div>

            </div>

            {/* GRADE DE FORMULÁRIO DE SELEÇÃO (GRID 3x3) */}
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              
              {/* CARD 01 */}
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

              {/* CARD 02 */}
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

              {/* CARD 03 */}
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

              {/* CARD 04 */}
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

              {/* CARD 05 */}
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

              {/* CARD 06 */}
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

              {/* CARD 07 */}
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

              {/* CARD 08 */}
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

              {/* CARD 09: BOTÃO PRINCIPAL "INICIAR ANÁLISE >" */}
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

        </div>
      )}

      {/* MODAL POP-UP: RELATÓRIO COMPLETO DA IA (GLASSMORPHISM WITH BACKDROP-BLUR & GRID 2x2) */}
      {selectedPatientModal && (
        <Dialog open={!!selectedPatientModal} onOpenChange={() => setSelectedPatientModal(null)}>
          <DialogContent className="glass-panel border-rose-500/40 sm:max-w-5xl bg-slate-950/95 backdrop-blur-xl text-slate-100 max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-6">
            <DialogHeader className="border-b border-slate-800 pb-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400">
                    <Brain className="h-6 w-6 animate-pulse" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-extrabold text-white font-display flex items-center gap-2">
                      Análise de IA & Simulação Completa
                      <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-0.5 rounded-md">
                        {selectedPatientModal.id}
                      </span>
                    </DialogTitle>
                    <DialogDescription className="text-xs text-slate-400 font-sans mt-0.5">
                      Paciente: {selectedPatientModal.idade} • {selectedPatientModal.tipo_ocorrencia} • Resolução Estruturada em 4 Passos
                    </DialogDescription>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => handleCopyReport(selectedPatientModal.triageReport)}
                    variant="outline"
                    size="sm"
                    className="gap-2 text-xs border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800 hover:text-white"
                  >
                    {copiedReport ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-sky-400" />}
                    {copiedReport ? "LAUDO COPIADO!" : "Copiar Texto do Laudo"}
                  </Button>
                </div>
              </div>
            </DialogHeader>

            {/* CONTEÚDO DO MODAL DA IA EM 4 QUADROS (GRID 2x2) */}
            {selectedPatientModal.triageReport && (
              <div className="space-y-5 my-4">
                
                {/* BARRA DE RESUMO RÁPIDO DO PACIENTE NO MODAL */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2.5">
                    <Activity className="h-4 w-4 text-emerald-400 shrink-0" />
                    <div>
                      <span className="text-[9px] font-mono text-slate-400 block uppercase">STATUS DA SIMULAÇÃO</span>
                      <span className="text-xs font-bold font-mono text-emerald-400">FINALIZADA E ARMAZENADA</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2.5">
                    <UserCheck className="h-4 w-4 text-purple-400 shrink-0" />
                    <div>
                      <span className="text-[9px] font-mono text-slate-400 block uppercase">PACIENTE / TIPO ABO</span>
                      <span className="text-xs font-bold text-white font-mono">
                        {selectedPatientModal.idade} | ABO: <strong className="text-rose-400">{selectedPatientModal.tipo_sanguineo}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2.5">
                    <Clock className="h-4 w-4 text-cyan-400 shrink-0" />
                    <div>
                      <span className="text-[9px] font-mono text-slate-400 block uppercase">HORA DA ADMISSÃO</span>
                      <span className="text-xs font-bold text-slate-200 font-mono">
                        {selectedPatientModal.admitidoEm}
                      </span>
                    </div>
                  </div>
                </div>

                {/* GRADE 2x2 COMPLETA */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  
                  {/* QUADRO 1 */}
                  <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4 shadow-lg">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-rose-500" />
                        <h3 className="text-sm font-bold text-white font-display">1. DESCRIÇÃO DO PROBLEMA</h3>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded">
                          PRIORIDADE 1
                        </span>
                        <span className="text-[10px] font-mono font-bold bg-red-600 text-white px-2 py-0.5 rounded">
                          CRÍTICO
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                        INFORMAÇÕES PRINCIPAIS
                      </span>
                      <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                        <div><span className="text-slate-400">Ocorrência:</span> <strong className="text-white block">{selectedPatientModal.triageReport.paciente.tipo_ocorrencia}</strong></div>
                        <div><span className="text-slate-400">Sangramento:</span> <strong className="text-rose-400 block">{selectedPatientModal.triageReport.paciente.existe_sangramento}</strong></div>
                        <div><span className="text-slate-400">Tempo Decorrido:</span> <strong className="text-amber-300 block">{selectedPatientModal.triageReport.paciente.tempo_evento}</strong></div>
                        <div><span className="text-slate-400">Respiração:</span> <strong className="text-cyan-300 block">{selectedPatientModal.triageReport.paciente.respiracao}</strong></div>
                        <div><span className="text-slate-400">Consciência:</span> <strong className="text-purple-300 block">{selectedPatientModal.triageReport.paciente.estado_consciencia}</strong></div>
                        <div><span className="text-slate-400">Lesões:</span> <strong className="text-orange-300 block">{selectedPatientModal.triageReport.paciente.lesoes_aparentes}</strong></div>
                        <div><span className="text-slate-400">Histórico:</span> <strong className="text-slate-200 block truncate">{selectedPatientModal.triageReport.paciente.historico_relevante}</strong></div>
                        <div><span className="text-slate-400">Tipo Sanguíneo:</span> <strong className="text-rose-400 block">{selectedPatientModal.triageReport.paciente.tipo_sanguineo}</strong></div>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-1">
                      <span className="text-[10px] font-mono font-bold text-amber-400 uppercase flex items-center gap-1.5">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                        CENÁRIO DE EMERGÊNCIA PRÉ-HOSPITALAR
                      </span>
                      <p className="text-xs text-slate-300 font-sans leading-relaxed">
                        Vítima de {selectedPatientModal.triageReport.paciente.tipo_ocorrencia.toLowerCase()} com sangramento {selectedPatientModal.triageReport.paciente.existe_sangramento.toLowerCase()} ativo há {selectedPatientModal.triageReport.paciente.tempo_evento.toLowerCase()}. Ao exame físico, apresenta-se {selectedPatientModal.triageReport.paciente.estado_consciencia.toLowerCase()}, com respiração {selectedPatientModal.triageReport.paciente.respiracao.toLowerCase()} e lesões de gravidade {selectedPatientModal.triageReport.paciente.lesoes_aparentes.toLowerCase()}.
                      </p>
                    </div>
                  </div>

                  {/* QUADRO 2 */}
                  <div className="p-5 rounded-2xl border border-amber-500/30 bg-slate-900/60 space-y-4 shadow-lg">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="h-5 w-5 text-amber-400" />
                        <h3 className="text-sm font-bold text-white font-display">2. EXPLICAÇÃO DO PROBLEMA (FISIOPATOLOGIA)</h3>
                      </div>
                      <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded">
                        RISCO ELEVADO
                      </span>
                    </div>

                    <div className="space-y-3 text-xs text-slate-300 font-sans leading-relaxed">
                      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                        <span className="font-mono text-xs font-bold text-amber-300 block">1. Mecanismo de Choque:</span>
                        <p className="text-slate-300">Desenvolvimento de Choque Hipovolêmico Hemorrágico por perda maciça acelerada de volume intravascular.</p>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                        <span className="font-mono text-xs font-bold text-cyan-300 block">2. Comprometimento Respiratório:</span>
                        <p className="text-slate-300">Queda crítica no transporte tissular de oxigênio (DO₂), forçando anóxia celular periférica.</p>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                        <span className="font-mono text-xs font-bold text-purple-300 block">3. Fator Tempo e Acidose:</span>
                        <p className="text-slate-300">O tempo decorrido gera acúmulo acelerado de ácido láctico por glicólise anaeróbica.</p>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                        <span className="font-mono text-xs font-bold text-rose-400 block">4. Risco de Lesão Múltipla & Tríade do Trauma:</span>
                        <p className="text-slate-300">Vulnerabilidade iminente à tríade letal (Acidose Metabólica + Hipotermia + Coagulopatia por diluição).</p>
                      </div>
                    </div>
                  </div>

                  {/* QUADRO 3 */}
                  <div className="p-5 rounded-2xl border border-cyan-500/30 bg-slate-900/60 space-y-4 shadow-lg">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <Droplets className="h-5 w-5 text-cyan-400" />
                        <h3 className="text-sm font-bold text-white font-display">3. RESOLUÇÃO DO PROBLEMA (ANÁLISE SANGUÍNEA)</h3>
                      </div>
                      <span className="text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded">
                        SANGUE SINTÉTICO
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                          <span className="text-[9px] font-mono text-slate-400 uppercase block">PROTOCOLO DE ANÁLISE</span>
                          <p className="text-xs font-semibold text-emerald-400 font-mono">
                            {selectedPatientModal.triageReport.prescricao.compatibilidade}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-center">
                          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                            <span className="text-[9px] font-mono text-slate-400 block uppercase">VOLUME RECOMENDADO</span>
                            <span className="text-lg font-bold font-mono text-white">{selectedPatientModal.triageReport.prescricao.volume_ml} mL</span>
                          </div>
                          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                            <span className="text-[9px] font-mono text-slate-400 block uppercase">INFUSÃO AQUECIDA</span>
                            <span className="text-lg font-bold font-mono text-cyan-300">37.0 °C</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                        <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase block">
                          MÓDULOS SUGERIDOS DE COMPOSIÇÃO
                        </span>
                        <div className="space-y-1.5 text-xs font-mono">
                          <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center gap-2">
                            <span className="text-rose-400">🧬</span>
                            <span className="text-slate-200">HBOC-201 (Hemoglobina Sintética)</span>
                          </div>
                          <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center gap-2">
                            <span className="text-cyan-400">🧪</span>
                            <span className="text-slate-200">PFC-40 (Perfluorocarbono Isento)</span>
                          </div>
                          <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center gap-2">
                            <span className="text-purple-400">🩸</span>
                            <span className="text-slate-200">Tampão pH 7.40 & Oncótico</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* QUADRO 4 */}
                  <div className="p-5 rounded-2xl border border-purple-500/30 bg-slate-900/60 space-y-4 shadow-lg">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <Brain className="h-5 w-5 text-purple-400" />
                        <h3 className="text-sm font-bold text-white font-display">4. EXPLICAÇÃO DE COMO FOI RESOLVIDO (RACIOCÍNIO DA IA)</h3>
                      </div>
                      <span className="text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 px-2 py-0.5 rounded">
                        INFERÊNCIA IA
                      </span>
                    </div>

                    <div className="space-y-2.5 text-xs text-slate-300 font-sans">
                      <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-white font-mono block">1. Matriz de Compatibilidade Sanguínea:</strong>
                          Isenção Antigênica 100% Universal ativada devido à necessidade de infusão pré-hospitalar sem atraso por provas cruzadas.
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-white font-mono block">2. Balanço Volêmico Proporcional:</strong>
                          Cálculo da reposição baseada na severidade da hemorragia e no comprometimento respiratório detectado.
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-white font-mono block">3. Estabilidade Osmótica & Viscosidade:</strong>
                          Manutenção da viscosidade sanguínea em 2.5 cP e osmolaridade em 290 mOsm para preservação microcirculatória.
                        </div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
                        <span className="text-xs font-mono font-bold text-emerald-400 uppercase">
                          RESULTADO: CONFIGURAÇÃO SIMULADA ESTÁVEL
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold">
                        <BarChart3 className="h-3.5 w-3.5" />
                        92% CONFIANÇA DA ANÁLISE
                      </div>
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
