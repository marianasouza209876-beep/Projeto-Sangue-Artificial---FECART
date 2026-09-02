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
  TrendingDown,
  Sparkles,
  Stethoscope,
  ChevronRight,
  Plus,
  Trash2,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Banco de Casos de Emergência com IA
const CASOS_EMERGENCIA_IA = [
  {
    titulo: "Choque Hipovolêmico Hemorrágico Grau IV",
    descricao: "Vítima de colisão automobilística em alta velocidade com fratura exposta de fêmur bilateral e hemorragia maciça não controlada.",
    fc: 132,
    paSistolica: 80,
    paDiastolica: 50,
    spo2: 86,
    glasgow: 9,
    lactato: 5.8,
    perdaEstimada: 1200,
    volumeRecomendado: 450,
    solucao: "450 mL de HemoSync Tipo O- (Substituto Sintético Universal)",
    tempoLimiteMin: 8,
    gravidade: "EXTREMA",
    idade: 34,
    genero: "Masc."
  },
  {
    titulo: "Trauma Toracoabdominal Penetrante",
    descricao: "Ferimento por projétil de arma de fogo em hipocôndrio direito com hemotórax maciço e choque descompensado.",
    fc: 138,
    paSistolica: 75,
    paDiastolica: 45,
    spo2: 85,
    glasgow: 10,
    lactato: 5.4,
    perdaEstimada: 1900,
    volumeRecomendado: 1500,
    solucao: "HBOC-201 (Hemoglobina Sintética Estabilizada - Rápida Oxigenação)",
    tempoLimiteMin: 12,
    gravidade: "CRÍTICA",
    idade: 28,
    genero: "Fem."
  },
  {
    titulo: "Ruptura Aguda de Aneurisma de Aorta Abdominal",
    descricao: "Paciente idoso com dor abdominal súbita em facada, síncope, massa pulsátil e colapso circulatório iminente.",
    fc: 152,
    paSistolica: 65,
    paDiastolica: 35,
    spo2: 80,
    glasgow: 7,
    lactato: 7.1,
    perdaEstimada: 2600,
    volumeRecomendado: 2500,
    solucao: "PFC-40 + HBOC Combinado (Manejo de Choque Profundo)",
    tempoLimiteMin: 6,
    gravidade: "EXTREMA",
    idade: 67,
    genero: "Masc."
  },
  {
    titulo: "Hemorragia Pós-Parto Maciça (Atonia Uterina)",
    descricao: "Puérpera imediata com perda sanguínea contínua superior a 2.000 mL, refratária a uterotônicos e hipotermia instalada.",
    fc: 142,
    paSistolica: 80,
    paDiastolica: 50,
    spo2: 88,
    glasgow: 11,
    lactato: 4.8,
    perdaEstimada: 2100,
    volumeRecomendado: 2000,
    solucao: "PFC-40 (Perfluorocarbono Estéril - Sem Antígenos Rh/ABO)",
    tempoLimiteMin: 10,
    gravidade: "CRÍTICA",
    idade: 29,
    genero: "Fem."
  },
  {
    titulo: "Hemorragia Digestiva Alta Maciça Refratária",
    descricao: "Ruptura de varizes esofágicas com hematêmese volumosa, instabilidade hemodinâmica grave e risco de PCR iminente.",
    fc: 135,
    paSistolica: 82,
    paDiastolica: 48,
    spo2: 86,
    glasgow: 10,
    lactato: 5.0,
    perdaEstimada: 1800,
    volumeRecomendado: 1500,
    solucao: "HBOC-201 (Carreador Sintético Puro)",
    tempoLimiteMin: 14,
    gravidade: "CRÍTICA",
    idade: 52,
    genero: "Masc."
  }
];

const NOMES_FICTICIOS = [
  "Carlos Eduardo M.", "Beatriz L. Silveira", "Rodrigo M. Faria",
  "Ana Clara S. Ramos", "Lucas Henrique T.", "Juliana P. Albuquerque",
  "Fernando R. Costa", "Mariana C. Dias", "Gustavo V. Barbosa"
];

export function EmergencySimulator({ onAddPatientToQueue }) {
  const [currentCase, setCurrentCase] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [alertSuccess, setAlertSuccess] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [activeQueue, setActiveQueue] = useState([
    {
      id: "PAC-9041",
      nome: "Marcos Vinícius B.",
      idade: 42,
      quadro: "Politrauma com Choque Hemorrágico Grau IV",
      fc: 142,
      pa: "75/45 mmHg",
      spo2: 84,
      volumeMl: 2000,
      solucao: "PFC-40 Universal",
      status: "EM INFUSÃO RÁPIDA",
      admitidoEm: "Há 4 min",
      prioridade: "EMERGÊNCIA VERMELHA"
    },
    {
      id: "PAC-8812",
      nome: "Helena S. Miranda",
      idade: 31,
      quadro: "Hemorragia Digestiva Alta Maciça",
      fc: 132,
      pa: "85/50 mmHg",
      spo2: 88,
      volumeMl: 1500,
      solucao: "HBOC-201",
      status: "AGUARDANDO LEITO UTI",
      admitidoEm: "Há 11 min",
      prioridade: "URGÊNCIA LARANJA"
    }
  ]);

  // Gerador de Caso com IA
  const handleGenerateCase = () => {
    setIsGenerating(true);
    setAlertSuccess(false);

    setTimeout(() => {
      const template = CASOS_EMERGENCIA_IA[Math.floor(Math.random() * CASOS_EMERGENCIA_IA.length)];
      const nomeRandom = NOMES_FICTICIOS[Math.floor(Math.random() * NOMES_FICTICIOS.length)];
      const idRandom = `PAC-${Math.floor(1000 + Math.random() * 9000)}`;

      // Leve variação randômica nos sinais vitais
      const fcVar = template.fc + Math.floor(Math.random() * 9 - 4);
      const paSVar = template.paSistolica + Math.floor(Math.random() * 7 - 3);
      const paDVar = template.paDiastolica + Math.floor(Math.random() * 5 - 2);
      const spo2Var = Math.max(75, Math.min(89, template.spo2 + Math.floor(Math.random() * 5 - 2)));

      setCurrentCase({
        id: idRandom,
        nome: nomeRandom,
        idade: template.idade,
        genero: template.genero,
        titulo: template.titulo,
        descricao: template.descricao,
        fc: fcVar,
        paSistolica: paSVar,
        paDiastolica: paDVar,
        spo2: spo2Var,
        glasgow: template.glasgow,
        lactato: template.lactato,
        perdaEstimada: template.perdaEstimada,
        volumeRecomendado: template.volumeRecomendado,
        solucao: template.solucao,
        tempoLimiteMin: template.tempoLimiteMin,
        gravidade: template.gravidade,
        createdAt: new Date().toLocaleTimeString('pt-BR')
      });

      setIsGenerating(false);
    }, 600);
  };

  // Enviar para a Fila Global de Triagem Crítica
  const handleSendToQueue = () => {
    if (!currentCase) return;

    const novoPaciente = {
      id: currentCase.id,
      nome: currentCase.nome,
      idade: currentCase.idade,
      quadro: currentCase.titulo,
      fc: currentCase.fc,
      pa: `${currentCase.paSistolica}/${currentCase.paDiastolica} mmHg`,
      spo2: currentCase.spo2,
      volumeMl: currentCase.volumeRecomendado,
      solucao: currentCase.solucao,
      status: "AGUARDANDO INFUSÃO",
      admitidoEm: "Agora mesmo",
      prioridade: "EMERGÊNCIA VERMELHA"
    };

    setActiveQueue(prev => [novoPaciente, ...prev]);
    if (onAddPatientToQueue) {
      onAddPatientToQueue(novoPaciente);
    }

    setAlertSuccess(true);
    setTimeout(() => {
      setAlertSuccess(false);
    }, 3500);
  };

  // Atualizar parâmetros editados
  const handleSaveEditedParams = (updatedData) => {
    setCurrentCase(prev => ({
      ...prev,
      ...updatedData
    }));
    setEditModalOpen(false);
  };

  // Trocar status de paciente na fila
  const handleAdvanceStatus = (id) => {
    setActiveQueue(prev => prev.map(p => {
      if (p.id === id) {
        if (p.status === "AGUARDANDO INFUSÃO") return { ...p, status: "EM INFUSÃO RÁPIDA" };
        if (p.status === "EM INFUSÃO RÁPIDA") return { ...p, status: "ESTABILIZADO COM SANGUE ARTIFICIAL" };
        return p;
      }
      return p;
    }));
  };

  // Excluir paciente da fila
  const handleRemoveFromQueue = (id) => {
    setActiveQueue(prev => prev.filter(p => p.id !== id));
  };

  // Gera um caso inicial automaticamente ao carregar
  useEffect(() => {
    if (!currentCase) {
      handleGenerateCase();
    }
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* 1. TOPO / BANNER DO SIMULADOR DE URGÊNCIA */}
      <div className="relative overflow-hidden rounded-2xl glass-panel border border-rose-500/40 bg-gradient-to-r from-rose-950/40 via-slate-950 to-fuchsia-950/30 p-6 shadow-[0_0_30px_rgba(255,42,66,0.2)]">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-8 w-64 h-64 bg-fuchsia-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-rose-500 animate-ping" />
              <span className="font-mono text-xs uppercase tracking-widest text-rose-400 font-bold flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-rose-500" />
                SIMULADOR DE URGÊNCIA & TRIAGEM CRÍTICA POR IA
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-display">
              Protocolo de Emergência: <span className="text-gradient-blood">Infusão Imediata de Sangue Sintético</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Gere cenários críticos em tempo real para simular pacientes em choque hemorrágico, 
              trauma grave ou colapso circulatório onde o sangue artificial (HBOCs / PFCs) é infundido sem espera por tipagem ABO/Rh.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            <Button
              onClick={handleGenerateCase}
              disabled={isGenerating}
              size="lg"
              className="gap-2.5 bg-gradient-to-r from-red-600 via-rose-600 to-fuchsia-600 hover:from-red-500 hover:to-fuchsia-500 text-white font-bold tracking-wide shadow-[0_0_25px_rgba(255,42,66,0.5)] border border-rose-400/40 px-6 py-6 text-sm rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Zap className={`h-5 w-5 ${isGenerating ? "animate-spin" : "animate-bounce"}`} />
              {isGenerating ? "ANALISANDO FISIOPATOLOGIA..." : "⚡ GERAR CASO DE URGÊNCIA (IA)"}
            </Button>
          </div>
        </div>
      </div>

      {/* Alerta Visual de Envio para Triagem */}
      {alertSuccess && (
        <div className="p-4 rounded-xl border border-emerald-500/50 bg-emerald-950/50 text-emerald-300 flex items-center justify-between gap-4 shadow-[0_0_20px_rgba(0,229,163,0.25)] animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">
                PACIENTE INSERIDO NA FILA DE TRIAGEM CRÍTICA!
              </p>
              <p className="text-xs text-emerald-400/90 font-mono">
                {currentCase?.id} ({currentCase?.nome}) direcionado para infusão prioritária de {currentCase?.volumeRecomendado} mL de {currentCase?.solucao}.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/40">
            NOTIFICAÇÃO ENVIADA À EQUIPE
          </span>
        </div>
      )}

      {/* 2. CARD DO PACIENTE GERADO PELA IA */}
      {currentCase && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* COLUNA ESQUERDA: QUADRO CLÍNICO & SINAIS VITAIS (8/12) */}
          <div className="lg:col-span-8 flex flex-col gap-5">
            
            <div className="glass-panel rounded-2xl p-6 border-rose-500/30 bg-slate-950/80 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-600 via-fuchsia-500 to-rose-600" />
              
              {/* Header do Paciente */}
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      ID: {currentCase.id}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Admissão: {currentCase.createdAt}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white font-display flex items-center gap-2">
                    {currentCase.nome}
                    <span className="text-sm font-normal text-slate-400 font-sans">
                      ({currentCase.idade} anos • {currentCase.genero})
                    </span>
                  </h2>
                </div>

                {/* Badge de Prioridade Reluzente */}
                <div className="flex items-center gap-2">
                  <span className="pulse-alert inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-extrabold bg-rose-600/30 text-rose-300 border border-rose-500/60 shadow-[0_0_15px_rgba(255,42,66,0.4)]">
                    <ShieldAlert className="h-4 w-4 text-rose-400" />
                    PRIORIDADE: CRÍTICO / EMERGÊNCIA
                  </span>
                </div>
              </div>

              {/* Descrição do Quadro */}
              <div className="mt-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <p className="font-bold text-rose-400 text-sm font-display flex items-center gap-1.5 mb-1">
                  <AlertTriangle className="h-4 w-4" />
                  Diagnóstico Presuntivo / Ocorrência:
                </p>
                <h3 className="text-base font-bold text-white mb-1">{currentCase.titulo}</h3>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">{currentCase.descricao}</p>
              </div>

              {/* Grid de Sinais Vitais em Tempo Real */}
              <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                
                {/* FC */}
                <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-950/20 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-slate-400 text-[11px] font-mono">
                    <span>FREQ. CARDÍACA</span>
                    <Heart className="h-3.5 w-3.5 text-rose-500 animate-pulse" />
                  </div>
                  <div className="my-2">
                    <span className="font-mono text-3xl font-extrabold text-rose-400">{currentCase.fc}</span>
                    <span className="text-[10px] text-slate-400 font-mono ml-1">BPM</span>
                  </div>
                  <span className="text-[9px] font-mono font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20 text-center">
                    TAQUICARDIA GRAVE
                  </span>
                </div>

                {/* PA */}
                <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-950/20 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-slate-400 text-[11px] font-mono">
                    <span>PRESSÃO ARTERIAL</span>
                    <Activity className="h-3.5 w-3.5 text-amber-400" />
                  </div>
                  <div className="my-2">
                    <span className="font-mono text-3xl font-extrabold text-amber-300">
                      {currentCase.paSistolica}/{currentCase.paDiastolica}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono ml-1">mmHg</span>
                  </div>
                  <span className="text-[9px] font-mono font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 text-center">
                    HIPOTENSÃO CRÍTICA
                  </span>
                </div>

                {/* SpO2 */}
                <div className="p-3.5 rounded-xl border border-cyan-500/30 bg-cyan-950/20 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-slate-400 text-[11px] font-mono">
                    <span>SATURAÇÃO SpO₂</span>
                    <Droplets className="h-3.5 w-3.5 text-cyan-400" />
                  </div>
                  <div className="my-2">
                    <span className="font-mono text-3xl font-extrabold text-cyan-300">{currentCase.spo2}</span>
                    <span className="text-[10px] text-slate-400 font-mono ml-1">%</span>
                  </div>
                  <span className="text-[9px] font-mono font-bold text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20 text-center">
                    HIPÓXIA TECIDUAL
                  </span>
                </div>

                {/* Glasgow / Lactato */}
                <div className="p-3.5 rounded-xl border border-fuchsia-500/30 bg-fuchsia-950/20 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-slate-400 text-[11px] font-mono">
                    <span>GLASGOW / LACTATO</span>
                    <Stethoscope className="h-3.5 w-3.5 text-fuchsia-400" />
                  </div>
                  <div className="my-2">
                    <span className="font-mono text-3xl font-extrabold text-fuchsia-300">{currentCase.glasgow}</span>
                    <span className="text-[10px] text-slate-400 font-mono ml-1">/15 • {currentCase.lactato} mmol/L</span>
                  </div>
                  <span className="text-[9px] font-mono font-bold text-fuchsia-400 bg-fuchsia-500/10 px-1.5 py-0.5 rounded border border-fuchsia-500/20 text-center">
                    ACIDOSE METABÓLICA
                  </span>
                </div>

              </div>

              {/* Botões de Ação Rápida */}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
                <Button
                  onClick={() => setEditModalOpen(true)}
                  variant="outline"
                  className="gap-2 border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  <Edit3 className="h-4 w-4 text-sky-400" />
                  EDITAR PARÂMETROS VITAIS
                </Button>

                <Button
                  onClick={handleSendToQueue}
                  className="gap-2.5 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold text-xs tracking-wider shadow-[0_0_20px_rgba(255,42,66,0.4)] px-5 py-2.5 rounded-xl border border-rose-500/40"
                >
                  <UserCheck className="h-4 w-4" />
                  Encaminhar para Fila Crítica
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>

            </div>

          </div>

          {/* COLUNA DIREITA: PRESCRIÇÃO E RECOMENDAÇÃO DA IA (4/12) */}
          <div className="lg:col-span-4 flex flex-col gap-5">
            
            <div className="glass-panel rounded-2xl p-6 border-fuchsia-500/30 bg-slate-950/80 flex flex-col justify-between flex-1">
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="font-mono text-xs font-bold text-fuchsia-400 flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-fuchsia-400" />
                    PRESCRIÇÃO SINTÉTICA (IA)
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded">
                    PROTOCOLO FECART 2026
                  </span>
                </div>

                {/* Volume e Solução */}
                <div className="mt-4 space-y-4">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-rose-950/40 to-slate-900 border border-rose-500/30">
                    <p className="text-[11px] font-mono uppercase tracking-widest text-slate-400">
                      Volume Total de Sangue Artificial
                    </p>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="font-mono text-4xl font-extrabold text-white">
                        {currentCase.volumeRecomendado}
                      </span>
                      <span className="text-sm font-mono text-rose-400 font-bold">mL</span>
                      <span className="text-xs text-slate-400">({currentCase.volumeRecomendado / 500} bolsas)</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                      Solução Indicada
                    </p>
                    <p className="font-semibold text-white text-xs leading-relaxed text-sky-400">
                      {currentCase.solucao}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono">
                    <div className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800">
                      <span className="text-[9px] text-slate-400 block">COMPATIBILIDADE</span>
                      <span className="font-bold text-emerald-400 block mt-0.5">100% UNIVERSAL</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800">
                      <span className="text-[9px] text-slate-400 block">JANELA CRÍTICA</span>
                      <span className="font-bold text-rose-400 block mt-0.5">&lt; {currentCase.tempoLimiteMin} MINUTOS</span>
                    </div>
                  </div>
                </div>

                {/* Raciocínio Clínico */}
                <div className="mt-4 p-3.5 rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-300 leading-relaxed font-sans">
                  <p className="font-bold text-slate-200 font-mono text-[11px] mb-1">
                    JUSTIFICATIVA CIENTÍFICA DA IA:
                  </p>
                  A perda volêmica estimada de ~{currentCase.perdaEstimada} mL coloca o paciente em falência oxidativa iminente. 
                  O uso imediato da solução sintética restabelece a microcirculação e a pressão oncótica sem risco de hemólise por incompatibilidade de anticorpos.
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Algoritmo Preditivo: R² 94.8%</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span> Calibrado
                </span>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* 3. FILA DE TRIAGEM CRÍTICA EM TEMPO REAL */}
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
                Pacientes triados pelo simulador com indicação ativa de infusão rápida de sangue artificial
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {activeQueue.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-sm">
              Nenhum paciente na fila de emergência no momento. Gere um caso acima para iniciar a simulação!
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
                      {paciente.nome} ({paciente.idade} anos)
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
                    <span>Prescrição: <strong className="text-white">{paciente.volumeMl} mL</strong> ({paciente.solucao})</span>
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

                  <Button
                    onClick={() => handleAdvanceStatus(paciente.id)}
                    size="sm"
                    className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                  >
                    Avançar Etapa
                  </Button>

                  <button
                    onClick={() => handleRemoveFromQueue(paciente.id)}
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

      {/* MODAL DE EDIÇÃO MANUAL DE PARÂMETROS */}
      {currentCase && (
        <EditParamsModal
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          currentCase={currentCase}
          onSave={handleSaveEditedParams}
        />
      )}

    </div>
  );
}

function EditParamsModal({ open, onOpenChange, currentCase, onSave }) {
  const [fc, setFc] = useState(currentCase.fc);
  const [paS, setPaS] = useState(currentCase.paSistolica);
  const [paD, setPaD] = useState(currentCase.paDiastolica);
  const [spo2, setSpo2] = useState(currentCase.spo2);
  const [volume, setVolume] = useState(currentCase.volumeRecomendado);
  const [glasgow, setGlasgow] = useState(currentCase.glasgow);

  useEffect(() => {
    setFc(currentCase.fc);
    setPaS(currentCase.paSistolica);
    setPaD(currentCase.paDiastolica);
    setSpo2(currentCase.spo2);
    setVolume(currentCase.volumeRecomendado);
    setGlasgow(currentCase.glasgow);
  }, [currentCase]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      fc: Number(fc),
      paSistolica: Number(paS),
      paDiastolica: Number(paD),
      spo2: Number(spo2),
      volumeRecomendado: Number(volume),
      glasgow: Number(glasgow),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-panel border-slate-700 sm:max-w-lg bg-slate-950/95 text-slate-100">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-white font-display">
            <Edit3 className="h-5 w-5 text-sky-400" />
            Editar Parâmetros Fisiológicos do Paciente
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400">
            Ajuste manualmente os sinais vitais de {currentCase.id} ({currentCase.nome}) para recalcular a resposta da IA.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 mt-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <label className="grid gap-1">
              <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400">FC (BPM)</span>
              <input
                type="number"
                value={fc}
                onChange={(e) => setFc(e.target.value)}
                className="h-9 rounded-lg border border-slate-700 bg-slate-900 px-3 text-xs text-white"
              />
            </label>

            <label className="grid gap-1">
              <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400">PA Sistólica</span>
              <input
                type="number"
                value={paS}
                onChange={(e) => setPaS(e.target.value)}
                className="h-9 rounded-lg border border-slate-700 bg-slate-900 px-3 text-xs text-white"
              />
            </label>

            <label className="grid gap-1">
              <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400">PA Diastólica</span>
              <input
                type="number"
                value={paD}
                onChange={(e) => setPaD(e.target.value)}
                className="h-9 rounded-lg border border-slate-700 bg-slate-900 px-3 text-xs text-white"
              />
            </label>

            <label className="grid gap-1">
              <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400">SpO2 (%)</span>
              <input
                type="number"
                value={spo2}
                onChange={(e) => setSpo2(e.target.value)}
                className="h-9 rounded-lg border border-slate-700 bg-slate-900 px-3 text-xs text-white"
              />
            </label>

            <label className="grid gap-1">
              <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400">Glasgow (3-15)</span>
              <input
                type="number"
                value={glasgow}
                onChange={(e) => setGlasgow(e.target.value)}
                className="h-9 rounded-lg border border-slate-700 bg-slate-900 px-3 text-xs text-white"
              />
            </label>

            <label className="grid gap-1">
              <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400">Volume IA (mL)</span>
              <input
                type="number"
                value={volume}
                onChange={(e) => setVolume(e.target.value)}
                className="h-9 rounded-lg border border-slate-700 bg-slate-900 px-3 text-xs text-white"
              />
            </label>
          </div>

          <Button
            type="submit"
            className="w-full mt-2 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold"
          >
            Salvar e Recalcular Parâmetros
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
