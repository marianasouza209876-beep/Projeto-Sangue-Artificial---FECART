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
  Trash2
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
  const [editModalOpen, setEditModalOpen] = useState(false);
  
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

  // Resultado da Triagem em 4 Etapas
  const [triageReport, setTriageReport] = useState(null);

  // Fila de Atendimento
  const [activeQueue, setActiveQueue] = useState([
    {
      id: "PAC-9041",
      nome: "Paciente Triado (Perfurante)",
      idade: "Adulto",
      quadro: "Hemorragia por perfuração • Sangramento Grave",
      fc: 142,
      pa: "75/45 mmHg",
      spo2: 82,
      volumeMl: 2000,
      solucao: "Sangue Sintético PFC/HBOC Universal (Isento Rh/ABO)",
      status: "EM INFUSÃO RÁPIDA",
      admitidoEm: "Há 4 min",
      prioridade: "EMERGÊNCIA VERMELHA"
    }
  ]);

  // Função Principal de Execução da Triagem
  const handleRunTriage = async (overrideMode = null) => {
    const modeToUse = overrideMode || creationMode;
    setIsGenerating(true);
    setAlertSuccess(false);

    try {
      // Tentar requisitar do backend FastAPI
      const API_URL = import.meta.env.VITE_API_URL || "";
      const response = await fetch(`${API_URL}/api/triage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modo: modeToUse,
          ...(modeToUse === "Manual" ? formParams : {})
        })
      });

      if (response.ok) {
        const data = await response.json();
        setTriageReport(data);
      } else {
        throw new Error("Erro na API de triagem");
      }
    } catch (err) {
      console.warn("Fallback offline local da Triagem por IA:", err);
      // Fallback local se a API estiver indisponível
      const localResult = generateLocalTriage(modeToUse, formParams);
      setTriageReport(localResult);
    } finally {
      setIsGenerating(false);
    }
  };

  // Fallback Local de Triagem
  const generateLocalTriage = (mode, params) => {
    let f = { ...params };
    if (mode === "Com IA") {
      f = {
        tipo_ocorrencia: OPCOES_TRIAGEM.tipo_ocorrencia[Math.floor(Math.random() * OPCOES_TRIAGEM.tipo_ocorrencia.length)],
        existe_sangramento: OPCOES_TRIAGEM.existe_sangramento[3], // Grave
        tempo_evento: OPCOES_TRIAGEM.tempo_evento[1], // 10 - 30 min
        respiracao: OPCOES_TRIAGEM.respiracao[3], // Muito comprometida
        estado_consciencia: OPCOES_TRIAGEM.estado_consciencia[3], // Não responde
        lesoes_aparentes: OPCOES_TRIAGEM.lesoes_aparentes[3], // Grave
        historico_relevante: "Informação desconhecida (Paciente Inconsciente)",
        idade: "Adulto",
        tipo_sanguineo: "Desconhecido"
      };
    }

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

  // Executa uma simulação inicial ao carregar
  useEffect(() => {
    if (!triageReport) {
      handleRunTriage("Com IA");
    }
  }, []);

  // Enviar paciente triado para a fila
  const handleSendToQueue = () => {
    if (!triageReport) return;
    const p = triageReport.paciente;
    const novo = {
      id: `PAC-${Math.floor(1000 + Math.random() * 9000)}`,
      nome: `Paciente (${p.tipo_ocorrencia})`,
      idade: p.idade,
      quadro: `${p.tipo_ocorrencia} • Sangramento ${p.existe_sangramento}`,
      fc: p.existe_sangramento === "Grave" ? 142 : 110,
      pa: p.existe_sangramento === "Grave" ? "75/45 mmHg" : "90/60 mmHg",
      spo2: p.respiracao.includes("comprometida") ? 82 : 89,
      volumeMl: triageReport.prescricao.volume_ml,
      solucao: "Sangue Sintético PFC/HBOC Universal",
      status: "AGUARDANDO INFUSÃO",
      admitidoEm: "Agora mesmo",
      prioridade: "EMERGÊNCIA VERMELHA"
    };

    setActiveQueue(prev => [novo, ...prev]);
    if (onAddPatientToQueue) onAddPatientToQueue(novo);

    setAlertSuccess(true);
    setTimeout(() => setAlertSuccess(false), 3500);
  };

  // Copiar Relatório Formatado
  const handleCopyReport = () => {
    if (!triageReport) return;
    navigator.clipboard.writeText(triageReport.texto_formatado);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* BANNER PRINCIPAL DO MOTOR DE TRIAGEM IA */}
      <div className="relative overflow-hidden rounded-2xl glass-panel border border-rose-500/40 bg-gradient-to-r from-rose-950/50 via-slate-950 to-fuchsia-950/40 p-6 shadow-[0_0_30px_rgba(255,42,66,0.25)]">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-8 w-64 h-64 bg-fuchsia-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-rose-500 animate-ping" />
              <span className="font-mono text-xs uppercase tracking-widest text-rose-400 font-bold flex items-center gap-1.5">
                <Brain className="h-4 w-4 text-rose-500" />
                MOTOR DE IA DE TRIAGEM DE EMERGÊNCIA & ANÁLISE SANGUÍNEA (FECART)
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-display">
              Simulação de Triagem: <span className="text-gradient-blood">Análise e Prescrição de Sangue Sintético</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              O motor de IA simula a triagem completa pré-hospitalar em 4 etapas estritas: 
              <strong> 1. Descrição do Problema</strong>, <strong>2. Explicação Fisiológica</strong>, 
              <strong> 3. Resolução com Foco Sanguíneo</strong> e <strong>4. Raciocínio Lógico da IA</strong>.
            </p>
          </div>

          {/* SELETOR DE MODO E BOTÃO DISPARADOR */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto bg-slate-900/80 p-2 rounded-xl border border-slate-800">
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
              className="gap-2 bg-gradient-to-r from-red-600 via-rose-600 to-fuchsia-600 hover:from-red-500 hover:to-fuchsia-500 text-white font-bold tracking-wide shadow-[0_0_20px_rgba(255,42,66,0.5)] border border-rose-400/40 px-5 py-5 text-xs rounded-xl"
            >
              <Zap className={`h-4 w-4 ${isGenerating ? "animate-spin" : "animate-bounce"}`} />
              {isGenerating ? "EXECUTANDO TRIAGEM..." : "SIMULAR TRIAGEM E RESOLVER"}
            </Button>
          </div>
        </div>
      </div>

      {/* FORMULÁRIO DE ENTRADA MANUAL (Exibido apenas no Modo Manual) */}
      {creationMode === "Manual" && (
        <div className="glass-panel rounded-2xl p-5 border-rose-500/30 bg-slate-950/90 space-y-4 animate-in slide-in-from-top duration-300">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="font-mono text-xs font-bold text-rose-400 flex items-center gap-2">
              <Edit3 className="h-4 w-4" />
              ENTRADA MANUAL DE DADOS DO PACIENTE (9 CAMPOS EXIGIDOS)
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              Caso inconsciente, o histórico relevante é opcional.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {/* 1. Tipo de Ocorrência */}
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

            {/* 2. Existe Sangramento? */}
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

            {/* 3. Tempo desde o Evento */}
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

            {/* 4. Respiração */}
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

            {/* 5. Estado de Consciência */}
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

            {/* 6. Lesões Aparentes */}
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

            {/* 7. Histórico Relevante */}
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

            {/* 8. Idade do Paciente */}
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

            {/* 9. Tipo Sanguíneo */}
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

      {/* NOTIFICAÇÃO DE SUCESSO DE ENVIO À FILA */}
      {alertSuccess && (
        <div className="p-4 rounded-xl border border-emerald-500/50 bg-emerald-950/50 text-emerald-300 flex items-center justify-between gap-4 shadow-[0_0_20px_rgba(0,229,163,0.25)] animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-emerald-400" />
            <div>
              <p className="font-bold text-white text-sm">
                PACIENTE TRIADO E ADMITIDO NA FILA DE TRIAGEM CRÍTICA!
              </p>
              <p className="text-xs text-emerald-400/90 font-mono">
                Prescrição de {triageReport?.prescricao?.volume_ml} mL enviada para infusão pré-hospitalar imediata.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/40">
            INFUSÃO AUTORIZADA
          </span>
        </div>
      )}

      {/* RENDERIZAÇÃO DA RESPOSTA ESTRUTURADA EM 4 ETAPAS OBRIGATÓRIAS */}
      {triageReport && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-emerald-400 animate-ping"></span>
              <h2 className="text-base font-bold text-white font-display">
                RESOLUÇÃO DA IA (ESTRUTURA EM 4 ETAPAS)
              </h2>
              <span className="text-xs font-mono bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded border border-rose-500/30">
                MODO: {triageReport.modo}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={handleCopyReport}
                variant="outline"
                size="sm"
                className="gap-2 text-xs border-slate-700 bg-slate-900 text-slate-200"
              >
                {copiedReport ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedReport ? "RELATÓRIO COPIADO!" : "COPIAR LAUDO COMPLETO"}
              </Button>

              <Button
                onClick={handleSendToQueue}
                size="sm"
                className="gap-2 text-xs bg-rose-600 hover:bg-rose-500 text-white font-bold"
              >
                <UserCheck className="h-3.5 w-3.5" />
                ADMITIR NA FILA CRÍTICA
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* ETAPA 1: DESCRIÇÃO DO PROBLEMA */}
            <div className="glass-panel rounded-2xl p-5 border-slate-800 bg-slate-950/80 space-y-3">
              <div className="flex items-center gap-2 text-rose-400 border-b border-slate-800 pb-2">
                <FileText className="h-4 w-4" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider">1. DESCRIÇÃO DO PROBLEMA</h3>
              </div>
              <div className="text-xs text-slate-300 leading-relaxed font-sans space-y-2 whitespace-pre-line">
                {triageReport.etapas["1_descricao_problema"]}
              </div>
            </div>

            {/* ETAPA 2: EXPLICAÇÃO DO PROBLEMA */}
            <div className="glass-panel rounded-2xl p-5 border-amber-500/30 bg-slate-950/80 space-y-3">
              <div className="flex items-center gap-2 text-amber-400 border-b border-slate-800 pb-2">
                <AlertTriangle className="h-4 w-4" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider">2. EXPLICAÇÃO DO PROBLEMA (IMPACTO FISIOLÓGICO)</h3>
              </div>
              <div className="text-xs text-slate-300 leading-relaxed font-sans space-y-2 whitespace-pre-line">
                {triageReport.etapas["2_explicacao_problema"]}
              </div>
            </div>

            {/* ETAPA 3: RESOLUÇÃO DO PROBLEMA (FOCO EM ANÁLISE SANGUÍNEA) */}
            <div className="glass-panel rounded-2xl p-5 border-cyan-500/30 bg-slate-950/80 space-y-3">
              <div className="flex items-center gap-2 text-cyan-400 border-b border-slate-800 pb-2">
                <Droplets className="h-4 w-4" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider">3. RESOLUÇÃO DO PROBLEMA (ANÁLISE SANGUÍNEA)</h3>
              </div>
              <div className="text-xs text-slate-300 leading-relaxed font-sans space-y-2 whitespace-pre-line">
                {triageReport.etapas["3_resolucao_problema"]}
              </div>
            </div>

            {/* ETAPA 4: EXPLICAÇÃO DE COMO FOI RESOLVIDO */}
            <div className="glass-panel rounded-2xl p-5 border-fuchsia-500/30 bg-slate-950/80 space-y-3">
              <div className="flex items-center gap-2 text-fuchsia-400 border-b border-slate-800 pb-2">
                <Sparkles className="h-4 w-4" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider">4. EXPLICAÇÃO DE COMO FOI RESOLVIDO (RACIOCÍNIO DA IA)</h3>
              </div>
              <div className="text-xs text-slate-300 leading-relaxed font-sans space-y-2 whitespace-pre-line">
                {triageReport.etapas["4_explicacao_como_resolvido"]}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FILA DE TRIAGEM CRÍTICA DE ATENDIMENTO */}
      <div className="glass-panel rounded-2xl p-6 border-slate-800 bg-slate-950/70">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
              <Activity className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
                Fila de Atendimento de Emergência & Triagem Crítica
                <span className="text-xs font-mono font-bold bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded-full border border-rose-500/30">
                  {activeQueue.length} Pacientes
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Pacientes triados com indicação ativa de infusão rápida de sangue artificial
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {activeQueue.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-sm">
              Nenhum paciente na fila de emergência no momento. Simule uma triagem acima para iniciar!
            </div>
          ) : (
            activeQueue.map((paciente) => (
              <div
                key={paciente.id}
                className="p-4 rounded-xl border border-slate-800/90 bg-slate-900/50 hover:border-slate-700 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
                      {paciente.id}
                    </span>
                    <span className="font-bold text-white text-sm">
                      {paciente.nome} ({paciente.idade})
                    </span>
                    <span className="text-[10px] font-mono font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                      {paciente.prioridade}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-sans">{paciente.quadro}</p>
                  <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-400 pt-1">
                    <span>FC: <strong className="text-rose-400">{paciente.fc} BPM</strong></span>
                    <span>PA: <strong className="text-amber-300">{paciente.pa}</strong></span>
                    <span>SpO2: <strong className="text-cyan-300">{paciente.spo2}%</strong></span>
                    <span>Prescrição: <strong className="text-white">{paciente.volumeMl} mL</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
                  <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg border ${
                    paciente.status.includes("ESTABILIZADO") 
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : paciente.status.includes("INFUSÃO")
                      ? "bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse"
                      : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                  }`}>
                    {paciente.status}
                  </span>

                  <button
                    onClick={() => setActiveQueue(prev => prev.filter(p => p.id !== paciente.id))}
                    className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors"
                    title="Remover paciente"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
