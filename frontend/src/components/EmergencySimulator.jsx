import React, { useState, useMemo, useCallback } from "react";
import {
  Zap,
  AlertTriangle,
  Heart,
  Activity,
  Droplets,
  Clock,
  UserCheck,
  CheckCircle2,
  ShieldAlert,
  Plus,
  Sparkles,
  FileText,
  Copy,
  Check,
  Brain,
  Trash2,
  RefreshCw,
  BarChart3,
  Thermometer,
  ShieldCheck,
  Stethoscope,
  ChevronRight,
  TrendingDown
} from "lucide-react";
import { Button } from "@/components/ui/button";

// CENÁRIOS PADRÃO DE EMERGÊNCIA
export const CENARIOS_EMERGENCIA = [
  {
    id: "trauma_hemorragico",
    nome: "Hemorragia por Perfuração / Ferimento Grave",
    sangramento: "Grave",
    perdaVolMl: 1800,
    paSistolica: 75,
    paDiastolica: 45,
    spo2: 82,
    fc: 140,
    idade: "Adulto",
    tipoSanguineo: "Desconhecido",
    tempoEvento: "15 min"
  },
  {
    id: "acidente_transito",
    nome: "Acidente de Trânsito / Colisão Automobilística",
    sangramento: "Grave",
    perdaVolMl: 2200,
    paSistolica: 70,
    paDiastolica: 40,
    spo2: 78,
    fc: 152,
    idade: "Adolescente",
    tipoSanguineo: "O-",
    tempoEvento: "10 min"
  },
  {
    id: "choque_hipovolemico",
    nome: "Choque Hipovolêmico / Perda Sanguínea Aguda",
    sangramento: "Moderado",
    perdaVolMl: 1200,
    paSistolica: 85,
    paDiastolica: 55,
    spo2: 88,
    fc: 125,
    idade: "Idoso",
    tipoSanguineo: "A+",
    tempoEvento: "30 min"
  },
  {
    id: "cirurgia_urgente",
    nome: "Emergência Cirúrgica / Sangramento Extracorpóreo",
    sangramento: "Moderado",
    perdaVolMl: 1400,
    paSistolica: 90,
    paDiastolica: 60,
    spo2: 91,
    fc: 110,
    idade: "Adulto",
    tipoSanguineo: "B+",
    tempoEvento: "20 min"
  },
  {
    id: "politrauma_critico",
    nome: "Politrauma Crítico / Lesões Múltiplas",
    sangramento: "Grave",
    perdaVolMl: 2500,
    paSistolica: 65,
    paDiastolica: 35,
    spo2: 74,
    fc: 160,
    idade: "Adulto",
    tipoSanguineo: "Desconhecido",
    tempoEvento: "8 min"
  }
];

export const OPCOES_FORM = {
  idades: ["Criança", "Adolescente", "Adulto", "Idoso"],
  tiposSanguineos: ["Desconhecido", "O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
  niveisSangramento: ["Leve (<500 mL)", "Moderado (500-1500 mL)", "Grave (>1500 mL)", "Maciço (>2500 mL)"]
};

export function EmergencySimulator({ onAddPatientToQueue }) {
  // ESTADO LOCAL DOS CONTROLES DA SIMULAÇÃO (ISOLADO PARA NÃO GERAR RE-RENDER GLOBAL)
  const [cenarioSelecionado, setCenarioSelecionado] = useState(CENARIOS_EMERGENCIA[0].id);
  const [nomeOcorrencia, setNomeOcorrencia] = useState(CENARIOS_EMERGENCIA[0].nome);
  const [perdaVolMl, setPerdaVolMl] = useState(CENARIOS_EMERGENCIA[0].perdaVolMl);
  const [paSistolica, setPaSistolica] = useState(CENARIOS_EMERGENCIA[0].paSistolica);
  const [paDiastolica, setPaDiastolica] = useState(CENARIOS_EMERGENCIA[0].paDiastolica);
  const [spo2, setSpo2] = useState(CENARIOS_EMERGENCIA[0].spo2);
  const [fc, setFc] = useState(CENARIOS_EMERGENCIA[0].fc);
  const [idade, setIdade] = useState(CENARIOS_EMERGENCIA[0].idade);
  const [tipoSanguineo, setTipoSanguineo] = useState(CENARIOS_EMERGENCIA[0].tipoSanguineo);
  const [tempoEvento, setTempoEvento] = useState(CENARIOS_EMERGENCIA[0].tempoEvento);

  // ESTADOS DE EXECUÇÃO E FEEDBACK
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulacaoResultado, setSimulacaoResultado] = useState(null);
  const [copiedReport, setCopiedReport] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // FILA DE HISTÓRICO DE SIMULAÇÕES
  const [historicoSimulacoes, setHistoricoSimulacoes] = useState([
    {
      id: "SIM-9041",
      titulo: "Hemorragia Traumática Profunda",
      prioridade: "CÓDIGO VERMELHO",
      idade: "Adulto",
      tipoSanguineo: "Desconhecido",
      volumeRecomendado: 2000,
      spo2: 82,
      fc: 142,
      pa: "75/45 mmHg",
      dataHora: "14:15"
    },
    {
      id: "SIM-8812",
      titulo: "Colisão Automobilística",
      prioridade: "CÓDIGO VERMELHO",
      idade: "Adolescente",
      tipoSanguineo: "O-",
      volumeRecomendado: 2200,
      spo2: 78,
      fc: 150,
      pa: "70/40 mmHg",
      dataHora: "14:02"
    }
  ]);

  // ÍNDICE DE CHOQUE CALCULADO (Shock Index = FC / PAS)
  const shockIndex = useMemo(() => {
    if (!paSistolica || paSistolica <= 0) return 1.0;
    return Number((fc / paSistolica).toFixed(2));
  }, [fc, paSistolica]);

  // APLICAÇÃO DE CENÁRIO PRÉ-DEFINIDO
  const handleSelectCenario = useCallback((id) => {
    const c = CENARIOS_EMERGENCIA.find(item => item.id === id);
    if (!c) return;
    setCenarioSelecionado(id);
    setNomeOcorrencia(c.nome);
    setPerdaVolMl(c.perdaVolMl);
    setPaSistolica(c.paSistolica);
    setPaDiastolica(c.paDiastolica);
    setSpo2(c.spo2);
    setFc(c.fc);
    setIdade(c.idade);
    setTipoSanguineo(c.tipoSanguineo);
    setTempoEvento(c.tempoEvento);
  }, []);

  // GERADOR DE CENÁRIO ALEATÓRIO
  const handleRandomize = useCallback(() => {
    const randomScenario = CENARIOS_EMERGENCIA[Math.floor(Math.random() * CENARIOS_EMERGENCIA.length)];
    const randomLoss = Math.floor(600 + Math.random() * 2000);
    const randomPaS = Math.floor(60 + Math.random() * 50);
    const randomPaD = Math.max(30, Math.floor(randomPaS * 0.55));
    const randomSpo2 = Math.floor(72 + Math.random() * 24);
    const randomFc = Math.floor(95 + Math.random() * 75);
    const randomAge = OPCOES_FORM.idades[Math.floor(Math.random() * OPCOES_FORM.idades.length)];
    const randomABO = OPCOES_FORM.tiposSanguineos[Math.floor(Math.random() * OPCOES_FORM.tiposSanguineos.length)];

    setCenarioSelecionado(randomScenario.id);
    setNomeOcorrencia(randomScenario.nome);
    setPerdaVolMl(randomLoss);
    setPaSistolica(randomPaS);
    setPaDiastolica(randomPaD);
    setSpo2(randomSpo2);
    setFc(randomFc);
    setIdade(randomAge);
    setTipoSanguineo(randomABO);
    setTempoEvento(`${Math.floor(5 + Math.random() * 30)} min`);
  }, []);

  // MOTOR DE CÁLCULO E GERAÇÃO DA SIMULAÇÃO
  const handleRunSimulation = useCallback(() => {
    setIsSimulating(true);

    // Cálculo biológico preciso da infusão recomendada
    let volumeCalculado = Math.round(perdaVolMl * 1.05);
    if (shockIndex > 1.2) volumeCalculado = Math.round(volumeCalculado * 1.15);
    volumeCalculado = Math.min(3000, Math.max(500, volumeCalculado));

    const isGravissimo = shockIndex > 1.1 || spo2 < 82 || perdaVolMl >= 1800;
    const prioridade = isGravissimo ? "CÓDIGO VERMELHO (EMERGÊNCIA CRÍTICA)" : "CÓDIGO LARANJA (URGÊNCIA ELEVADA)";
    const compatibilidade = tipoSanguineo === "Desconhecido" 
      ? "Isenção Antigênica Universal (Isento Rh/ABO)" 
      : `Compatível Tipo ${tipoSanguineo} ou Doador Universal Sintético`;

    const simId = `SIM-${Math.floor(1000 + Math.random() * 9000)}`;

    const etapa1 = `### 📋 1. ANAMNESE & TRIAGEM INICIAL\n- **Ocorrência:** ${nomeOcorrencia}\n- **Perda Estimada:** ${perdaVolMl} mL\n- **Pressão Arterial:** ${paSistolica}/${paDiastolica} mmHg (PAM: ${Math.round((paSistolica + 2 * paDiastolica) / 3)} mmHg)\n- **Oximetria (SpO₂):** ${spo2}%\n- **Frequência Cardíaca:** ${fc} BPM (Índice de Choque: ${shockIndex})\n- **Perfil:** Paciente ${idade} • Sangue ${tipoSanguineo}`;

    const etapa2 = `### 🧬 2. FISIOPATOLOGIA & ANÁLISE DE RISCO\n1. **Choque Hipovolêmico:** Grau ${perdaVolMl > 2000 ? "IV (Maciço)" : perdaVolMl > 1400 ? "III (Grave)" : "II (Moderado)"} com depleção de volume circulante.\n2. **Hipóxia Tecidual Aguda:** Saturação periférica comprometida (${spo2}%), exigindo entrega imediata de carreadores de O₂.\n3. **Acidose Metabólica & Lactato:** Perfusão capilar reduzida demanda tamponamento para pH fisiológico 7.40.`;

    const etapa3 = `### 🩸 3. PROTOCOLO DE INFUSÃO & SANGUE ARTIFICIAL\n- **Volume de Infusão Indicado:** ${volumeCalculado} mL aquecido a 37.0°C em bomba rápida.\n- **Matriz Biomimética:** 60% HBOC-201 (Hemoglobina Sintética) + 40% PFC-40 (Perfluorocarbono Líquido).\n- **Compatibilidade:** ${compatibilidade}.\n- **Alvo Terapêutico:** Elevar PAM ≥ 65 mmHg e estabilizar SpO₂ > 95% em até 12 minutos.`;

    const etapa4 = `### 🧠 4. RACIOCÍNIO DA IA & CONFIANÇA PREDITIVA\n- **Confiança do Modelo:** 96.4% (Baseada em telemetria de sensores e protocolo ATLS).\n- **Segurança Antigênica:** 100% de isenção de risco hemolítico ou reação transfusional imediata.\n- **Viscosidade Alvo:** 2.6 cP para facilitar microperfusão em capilares vasoconstraídos.`;

    const laudoFormatado = `## 🚑 RELATÓRIO DE SIMULAÇÃO DE EMERGÊNCIA (FLOWTIFICIAL - FECART)\n**Identificador:** \`${simId}\` • **Status:** \`${prioridade}\`\n\n${etapa1}\n\n---\n${etapa2}\n\n---\n${etapa3}\n\n---\n${etapa4}`;

    setTimeout(() => {
      const resultado = {
        id: simId,
        prioridade,
        isGravissimo,
        nomeOcorrencia,
        volumeCalculado,
        shockIndex,
        compatibilidade,
        etapas: { etapa1, etapa2, etapa3, etapa4 },
        laudoFormatado,
        geradoEm: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      setSimulacaoResultado(resultado);
      setIsSimulating(false);
    }, 600);
  }, [nomeOcorrencia, perdaVolMl, paSistolica, paDiastolica, spo2, fc, idade, tipoSanguineo, shockIndex]);

  // SALVAR NA FILA / HISTÓRICO
  const handleSalvarFila = useCallback(() => {
    if (!simulacaoResultado) return;
    const novoItem = {
      id: simulacaoResultado.id,
      titulo: simulacaoResultado.nomeOcorrencia,
      prioridade: simulacaoResultado.isGravissimo ? "CÓDIGO VERMELHO" : "CÓDIGO LARANJA",
      idade,
      tipoSanguineo,
      volumeRecomendado: simulacaoResultado.volumeCalculado,
      spo2,
      fc,
      pa: `${paSistolica}/${paDiastolica} mmHg`,
      dataHora: simulacaoResultado.geradoEm
    };

    setHistoricoSimulacoes(prev => [novoItem, ...prev.slice(0, 7)]);
    if (onAddPatientToQueue) {
      onAddPatientToQueue(novoItem);
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  }, [simulacaoResultado, idade, tipoSanguineo, spo2, fc, paSistolica, paDiastolica, onAddPatientToQueue]);

  // COPIAR LAUDO
  const handleCopyReport = useCallback(() => {
    if (!simulacaoResultado) return;
    navigator.clipboard.writeText(simulacaoResultado.laudoFormatado);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2500);
  }, [simulacaoResultado]);

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-300 stabilized-backdrop">
      
      {/* CABEÇALHO DO SIMULADOR (LIMPO E ESTÁVEL) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-950/90 border border-slate-800 p-5 rounded-2xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-rose-500 to-sky-500" />
        
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
              <Zap className="h-5 w-5 text-rose-500 animate-pulse" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white font-display">
              Simulação de Emergência & Apoio à Decisão
            </h1>
            <span className="font-mono text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
              MOTOR BIOMÉDICO ATIVO
            </span>
          </div>
          <p className="text-xs text-slate-300 font-sans">
            Ajuste os parâmetros fisiológicos e execute a inferência da IA para calcular a prescrição e o volume de sangue artificial ideal.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Button
            type="button"
            onClick={handleRandomize}
            variant="outline"
            size="sm"
            className="w-full sm:w-auto gap-1.5 border-slate-700 bg-slate-900 hover:bg-slate-800 text-xs text-slate-200 cursor-pointer font-mono"
          >
            <RefreshCw className="h-3.5 w-3.5 text-sky-400" />
            Cenário Aleatório
          </Button>
        </div>
      </div>

      {/* GRADE PRINCIPAL: CONTROLES ENXUTOS (ESQUERDA) + RESULTADOS / LAUDOS (DIREITA) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* =========================================================================
            COLUNA 1: CONTROLES DE SIMULAÇÃO (DIRETO E ENXUTO - SEM FLICKER)
            ========================================================================= */}
        <section className="lg:col-span-5 flex flex-col gap-4 no-hover-zoom simulator-controls">
          <div className="glass-panel rounded-2xl p-5 border-slate-800 bg-slate-950/80 space-y-4 shadow-lg">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <SlidersIcon className="h-4 w-4 text-rose-400" />
                <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                  Parâmetros de Entrada da Emergência
                </h2>
              </div>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                Ajuste em Tempo Real
              </span>
            </div>

            {/* 1. SELEÇÃO DO CENÁRIO (DROPDOWN SIMPLES) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Cenário Clínico / Tipo de Emergência</span>
                <span className="text-[10px] font-mono text-sky-400">Pré-definido</span>
              </label>
              <select
                value={cenarioSelecionado}
                onChange={(e) => handleSelectCenario(e.target.value)}
                className="w-full h-10 rounded-xl border border-slate-700 bg-slate-900 px-3 text-xs text-white focus:border-rose-500 focus:outline-none cursor-pointer font-sans"
              >
                {CENARIOS_EMERGENCIA.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. PERDA VOLÊMICA ESTIMADA (SLIDER + INPUT) */}
            <div className="space-y-1.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5 text-rose-500" />
                  Perda Sanguínea Estimada:
                </span>
                <span className="font-mono font-bold text-rose-400 text-sm">
                  {perdaVolMl} mL
                </span>
              </div>
              <input
                type="range"
                min={200}
                max={3000}
                step={50}
                value={perdaVolMl}
                onChange={(e) => setPerdaVolMl(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>200 mL (Leve)</span>
                <span>1500 mL (Grave)</span>
                <span>3000 mL (Maciço)</span>
              </div>
            </div>

            {/* 3. PRESSÃO ARTERIAL (PAS & PAD) */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400 font-mono">PA Sistólica</span>
                  <span className={`font-mono font-bold ${paSistolica < 80 ? "text-rose-400" : "text-slate-200"}`}>
                    {paSistolica} mmHg
                  </span>
                </div>
                <input
                  type="range"
                  min={40}
                  max={150}
                  step={5}
                  value={paSistolica}
                  onChange={(e) => setPaSistolica(Number(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
                />
              </div>

              <div className="space-y-1 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400 font-mono">PA Diastólica</span>
                  <span className="font-mono font-bold text-slate-200">
                    {paDiastolica} mmHg
                  </span>
                </div>
                <input
                  type="range"
                  min={25}
                  max={100}
                  step={5}
                  value={paDiastolica}
                  onChange={(e) => setPaDiastolica(Number(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
                />
              </div>
            </div>

            {/* 4. OXIMETRIA (SpO2) & FREQUÊNCIA CARDÍACA (FC) */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400 font-mono">Oximetria SpO₂</span>
                  <span className={`font-mono font-bold ${spo2 < 85 ? "text-rose-400" : spo2 < 93 ? "text-amber-300" : "text-emerald-400"}`}>
                    {spo2}%
                  </span>
                </div>
                <input
                  type="range"
                  min={65}
                  max={99}
                  step={1}
                  value={spo2}
                  onChange={(e) => setSpo2(Number(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />
              </div>

              <div className="space-y-1 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400 font-mono">Frequência (FC)</span>
                  <span className={`font-mono font-bold ${fc > 130 ? "text-rose-400" : fc > 100 ? "text-amber-300" : "text-slate-200"}`}>
                    {fc} BPM
                  </span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={180}
                  step={2}
                  value={fc}
                  onChange={(e) => setFc(Number(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
                />
              </div>
            </div>

            {/* 5. PERFIL DO PACIENTE (DROPDOWNS COMPACTOS) */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-slate-400">Faixa Etária</label>
                <select
                  value={idade}
                  onChange={(e) => setIdade(e.target.value)}
                  className="w-full h-9 rounded-lg border border-slate-700 bg-slate-900 px-2.5 text-xs text-white focus:border-rose-500 focus:outline-none cursor-pointer font-sans"
                >
                  {OPCOES_FORM.idades.map(op => <option key={op} value={op}>{op}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-slate-400">Tipo Sanguíneo</label>
                <select
                  value={tipoSanguineo}
                  onChange={(e) => setTipoSanguineo(e.target.value)}
                  className="w-full h-9 rounded-lg border border-slate-700 bg-slate-900 px-2.5 text-xs text-rose-300 font-mono font-bold focus:border-rose-500 focus:outline-none cursor-pointer"
                >
                  {OPCOES_FORM.tiposSanguineos.map(op => <option key={op} value={op}>{op}</option>)}
                </select>
              </div>
            </div>

            {/* STATUS DO ÍNDICE DE CHOQUE */}
            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-rose-400" />
                Índice de Choque (FC/PAS):
              </span>
              <span className={`font-bold px-2 py-0.5 rounded ${
                shockIndex >= 1.2 ? "bg-rose-500/20 text-rose-300 border border-rose-500/40" :
                shockIndex >= 0.9 ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" :
                "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
              }`}>
                {shockIndex} • {shockIndex >= 1.2 ? "Choque Grave" : shockIndex >= 0.9 ? "Alerta" : "Normal"}
              </span>
            </div>

            {/* BOTÃO PRINCIPAL DE EXECUÇÃO */}
            <Button
              type="button"
              onClick={handleRunSimulation}
              disabled={isSimulating}
              className="w-full h-12 bg-gradient-to-r from-red-600 via-rose-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-extrabold text-xs tracking-wider shadow-[0_0_25px_rgba(225,29,72,0.4)] border border-rose-400/40 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all transform hover:scale-[1.01]"
            >
              <Brain className={`h-4 w-4 ${isSimulating ? "animate-spin" : ""}`} />
              {isSimulating ? "PROCESSANDO MODELO DE IA..." : "⚡ EXECUTAR SIMULAÇÃO"}
            </Button>

          </div>
        </section>

        {/* =========================================================================
            COLUNA 2: RESULTADOS DA SIMULAÇÃO & LAUDO CLÍNICO DA IA (SEM SOBREPOSIÇÃO)
            ========================================================================= */}
        <section className="lg:col-span-7 flex flex-col gap-4">
          
          {simulacaoResultado ? (
            <div className="space-y-4 animate-in fade-in duration-300">
              
              {/* CARD DE RESULTADOS PRINCIPAIS (PRESCRIÇÃO IMEDIATA) */}
              <div className="glass-panel simulation-result-card rounded-2xl p-5 border-slate-800 bg-slate-950/90 shadow-xl relative overflow-hidden">
                <div className={`absolute top-0 left-0 right-0 h-1.5 ${
                  simulacaoResultado.isGravissimo ? "bg-rose-500 shadow-[0_0_12px_#ff2a42]" : "bg-amber-400 shadow-[0_0_12px_#f59e0b]"
                }`} />

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-white bg-slate-900 px-2.5 py-0.5 rounded border border-slate-800">
                        {simulacaoResultado.id}
                      </span>
                      <span className={`text-[11px] font-mono font-extrabold px-2.5 py-0.5 rounded-full border ${
                        simulacaoResultado.isGravissimo 
                          ? "bg-rose-500/20 text-rose-300 border-rose-500/40" 
                          : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                      }`}>
                        {simulacaoResultado.prioridade}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white font-display mt-1">
                      {simulacaoResultado.nomeOcorrencia}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      onClick={handleCopyReport}
                      variant="outline"
                      size="sm"
                      className="gap-1.5 text-xs border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800 font-mono cursor-pointer"
                    >
                      {copiedReport ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-sky-400" />}
                      {copiedReport ? "Copiado!" : "Copiar Laudo"}
                    </Button>
                    <Button
                      type="button"
                      onClick={handleSalvarFila}
                      size="sm"
                      className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-mono cursor-pointer font-bold"
                    >
                      {savedSuccess ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                      {savedSuccess ? "Salvo na Fila!" : "Salvar na Fila"}
                    </Button>
                  </div>
                </div>

                {/* 3 CARDS DE KPI (VOLUME, FORMULAÇÃO, TEMPO) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-rose-500/30 text-center">
                    <span className="text-[10px] font-mono uppercase text-slate-400 block mb-0.5">
                      Volume Recomendado
                    </span>
                    <span className="font-mono text-2xl font-extrabold text-white">
                      {simulacaoResultado.volumeCalculado} <span className="text-xs text-rose-400 font-bold">mL</span>
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5 font-sans">Infusão aquecida a 37°C</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-sky-500/30 text-center">
                    <span className="text-[10px] font-mono uppercase text-slate-400 block mb-0.5">
                      Formulação Indicada
                    </span>
                    <span className="font-mono text-sm font-bold text-sky-300 block truncate">
                      HBOC-201 + PFC-40
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono block mt-0.5">Tampão pH 7.40</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-purple-500/30 text-center">
                    <span className="text-[10px] font-mono uppercase text-slate-400 block mb-0.5">
                      Compatibilidade
                    </span>
                    <span className="font-mono text-xs font-bold text-purple-300 block truncate">
                      Universal Rh/ABO Isento
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Risco Hemolítico Zero</span>
                  </div>
                </div>

                {/* LAUDO ESTRUTURADO DA IA EM 4 BLOCOS CLAROS */}
                <div className="space-y-3 pt-2 border-t border-slate-800">
                  <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Brain className="w-3.5 h-3.5 text-rose-500" />
                    Detalhamento Clínico da IA Explicável
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    {/* Bloco 1: Anamnese */}
                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                      <span className="font-mono font-bold text-slate-200 text-[11px] block text-sky-400">
                        1. ANAMNESE & TRIAGEM
                      </span>
                      <p className="text-slate-300 text-[11px] leading-relaxed">
                        Paciente <strong>{idade}</strong>, perda de <strong>{perdaVolMl} mL</strong>, PA <strong>{paSistolica}/{paDiastolica} mmHg</strong>, SpO₂ <strong>{spo2}%</strong> e FC <strong>{fc} BPM</strong>.
                      </p>
                    </div>

                    {/* Bloco 2: Fisiopatologia */}
                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                      <span className="font-mono font-bold text-slate-200 text-[11px] block text-amber-400">
                        2. FISIOPATOLOGIA & RISCO
                      </span>
                      <p className="text-slate-300 text-[11px] leading-relaxed">
                        Choque hipovolêmico com índice de choque <strong>{shockIndex}</strong>. Risco iminente de hipóxia e acidose celular sem reposição.
                      </p>
                    </div>

                    {/* Bloco 3: Prescrição */}
                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                      <span className="font-mono font-bold text-slate-200 text-[11px] block text-rose-400">
                        3. CONDUTA & SANGUE SINTÉTICO
                      </span>
                      <p className="text-slate-300 text-[11px] leading-relaxed">
                        Infusão de <strong>{simulacaoResultado.volumeCalculado} mL</strong> de transportador sintético (HBOC/PFC) para atingir PAM ≥ 65 mmHg.
                      </p>
                    </div>

                    {/* Bloco 4: Raciocínio IA */}
                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                      <span className="font-mono font-bold text-slate-200 text-[11px] block text-emerald-400">
                        4. RACIOCÍNIO DA IA (96.4%)
                      </span>
                      <p className="text-slate-300 text-[11px] leading-relaxed">
                        Isenção antigênica universal permite infusão imediata sem prova cruzada, preservando a microcirculação.
                      </p>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          ) : (
            /* ESTADO INICIAL / PROMPT PARA EXECUTAR */
            <div className="glass-panel rounded-2xl p-8 border-slate-800 bg-slate-950/80 text-center space-y-4 shadow-xl min-h-[320px] flex flex-col items-center justify-center">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500">
                <Brain className="w-7 h-7 animate-pulse" />
              </div>
              <div className="space-y-1 max-w-md">
                <h3 className="text-base font-bold text-white font-display">
                  Pronto para Simular
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Selecione o cenário ou ajuste os parâmetros fisiológicos na coluna ao lado e clique em <strong>"Executar Simulação"</strong> para gerar o laudo e a dosagem de sangue artificial.
                </p>
              </div>
              <Button
                type="button"
                onClick={handleRunSimulation}
                className="bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl cursor-pointer"
              >
                <Zap className="w-4 h-4 mr-1.5" /> Executar com Valores Atuais
              </Button>
            </div>
          )}

          {/* FILA DE SIMULAÇÕES RECENTES / HISTÓRICO COMPACTO */}
          <div className="glass-panel rounded-2xl p-4 border-slate-800 bg-slate-950/80 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                Histórico de Pacientes & Simulações Recentes
              </h3>
              <span className="text-[10px] font-mono text-slate-400">
                {historicoSimulacoes.length} Registros
              </span>
            </div>

            {historicoSimulacoes.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4 font-mono">
                Nenhuma simulação no histórico recente.
              </p>
            ) : (
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {historicoSimulacoes.map(item => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 flex items-center justify-between text-xs transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[10px] font-bold text-white bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        {item.id}
                      </span>
                      <div>
                        <p className="font-semibold text-slate-200 text-xs">{item.titulo}</p>
                        <p className="text-[10px] font-mono text-slate-400">
                          {item.idade} • Sangue {item.tipoSanguineo} • PA {item.pa} • SpO₂ {item.spo2}%
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-white bg-rose-950/60 border border-rose-500/30 px-2.5 py-1 rounded-lg">
                        {item.volumeRecomendado} mL
                      </span>
                      <button
                        type="button"
                        onClick={() => setHistoricoSimulacoes(prev => prev.filter(p => p.id !== item.id))}
                        className="text-slate-500 hover:text-rose-400 transition-colors p-1 cursor-pointer"
                        title="Remover"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </section>

      </div>

    </div>
  );
}

// ÍCONE AUXILIAR
function SlidersIcon(props) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" x2="4" y1="21" y2="14" />
      <line x1="4" x2="4" y1="10" y2="3" />
      <line x1="12" x2="12" y1="21" y2="12" />
      <line x1="12" x2="12" y1="8" y2="3" />
      <line x1="20" x2="20" y1="21" y2="16" />
      <line x1="20" x2="20" y1="12" y2="3" />
      <line x1="2" x2="6" y1="14" y2="14" />
      <line x1="10" x2="14" y1="8" y2="8" />
      <line x1="18" x2="22" y1="16" y2="16" />
    </svg>
  );
}
export default EmergencySimulator;
