import React, { useState, useEffect } from "react";
import {
  User,
  Package,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Zap,
  Activity,
  Droplets,
  Thermometer,
  Waves,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Stethoscope,
  Cpu,
  Layers,
  FlaskConical,
  Heart,
  Clock,
  Info,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Casos para a Geração Automática de Pacientes com IA
const PACIENTES_IA_SIMULADOS = [
  {
    id: "PAC-7721",
    nome: "Carlos Eduardo Silveira",
    idade: 38,
    genero: "Masculino",
    tipoSanguineo: "O Negativo (O-)",
    situacao: "Choque Hipovolêmico por Trauma Automobilístico com Hemorragia Aguda",
    urgencia: "EMERGÊNCIA CRÍTICA (NÍVEL 1)",
    urgenciaCor: "text-rose-400 bg-rose-500/10 border-rose-500/30",
    sinaisVitais: {
      fc: "142 BPM (Taquicardia)",
      pa: "75/45 mmHg (Hipotensão Severa)",
      spo2: "84% (Hipóxia Tecidual)",
      glasgow: "9 / 15"
    },
    demandaEstimadaMl: 2000,
    bolsasEstimadas: 4,
    solucaoRecomendada: "PFC-40 (Perfluorocarbono Sintético Universal de Alta Fluidez)",
    tempoCriticoMin: 10,
    justificativaIA: "A perda volêmica superior a 40% ameaça falência de múltiplos órgãos. Por se tratar de tipo O- com estoque hospitalar escasso, a IA indica infusão imediata de 2.000 mL de sangue sintético PFC-40 livre de antígenos ABO/Rh."
  },
  {
    id: "PAC-8840",
    nome: "Helena Beatriz Ramos",
    idade: 29,
    genero: "Feminino",
    tipoSanguineo: "Fenótipo Raro (Bombaim / Rh Nulo)",
    situacao: "Hemorragia Pós-Parto Maciça com Choque Refratário",
    urgencia: "EMERGÊNCIA CRÍTICA (NÍVEL 1)",
    urgenciaCor: "text-rose-400 bg-rose-500/10 border-rose-500/30",
    sinaisVitais: {
      fc: "138 BPM (Taquicardia)",
      pa: "80/50 mmHg (Instabilidade Hemodinâmica)",
      spo2: "87% (Hipóxia)",
      glasgow: "11 / 15"
    },
    demandaEstimadaMl: 1500,
    bolsasEstimadas: 3,
    solucaoRecomendada: "PFC-40 (Perfluorocarbono 100% Livre de Antígenos de Membrana)",
    tempoCriticoMin: 12,
    justificativaIA: "Paciente portadora de fenótipo sanguíneo ultrarraro incompatível com sangue convencional doado. O uso da solução artificial sintética elimina qualquer risco de reação hemolítica imune fatal."
  },
  {
    id: "PAC-4519",
    nome: "Rodrigo Mendes Faria",
    idade: 54,
    genero: "Masculino",
    tipoSanguineo: "A Positivo (A+)",
    situacao: "Cirurgia Cardíaca de Urgência com Coagulopatia e Perda Sanguínea",
    urgencia: "ALTA PRIORIDADE (NÍVEL 2)",
    urgenciaCor: "text-amber-400 bg-amber-500/10 border-amber-500/30",
    sinaisVitais: {
      fc: "120 BPM",
      pa: "90/60 mmHg",
      spo2: "91%",
      glasgow: "14 / 15"
    },
    demandaEstimadaMl: 1000,
    bolsasEstimadas: 2,
    solucaoRecomendada: "HBOC-201 (Hemoglobina Sintética Estabilizada - Liberação Rápida de O₂)",
    tempoCriticoMin: 20,
    justificativaIA: "Necessidade de suporte oxigenatório e expansão volêmica no pós-operatório imediato para manter a perfusão miocárdica sem sobrecarregar a reserva do banco de sangue."
  },
  {
    id: "PAC-9102",
    nome: "Mariana Costa Albuquerque",
    idade: 43,
    genero: "Feminino",
    tipoSanguineo: "B Negativo (B-)",
    situacao: "Politrauma com Esmagamento Pélvico e Hemorragia Oculta",
    urgencia: "EMERGÊNCIA CRÍTICA (NÍVEL 1)",
    urgenciaCor: "text-rose-400 bg-rose-500/10 border-rose-500/30",
    sinaisVitais: {
      fc: "146 BPM",
      pa: "70/40 mmHg",
      spo2: "83%",
      glasgow: "8 / 15"
    },
    demandaEstimadaMl: 2500,
    bolsasEstimadas: 5,
    solucaoRecomendada: "PFC-40 + HBOC Combinado (Manejo Intensivo de Choque Grau IV)",
    tempoCriticoMin: 8,
    justificativaIA: "Hipotensão profunda com acidose metabólica associada. A infusão rápida combinada recupera a pressão oncótica e o transporte molecular de oxigênio em menos de 8 minutos."
  }
];

export function InteractiveSimulation({ onNavigateToDashboard }) {
  // Modos: 'menu' (escolha) | 'patient' (entrada de paciente) | 'stock' (gerenciamento de estoque)
  const [currentMode, setCurrentMode] = useState("menu");

  // Sub-modo do Paciente: 'choose' | 'manual' | 'ai'
  const [patientSubMode, setPatientSubMode] = useState("choose");
  const [aiProcessing, setAiProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState("");
  const [patientResult, setPatientResult] = useState(null);

  // Formulário Manual de Paciente
  const [manualForm, setManualForm] = useState({
    nome: "Visitante FECART",
    idade: 25,
    genero: "Não especificado",
    diagnostico: "Choque Hipovolêmico Traumático",
    tipoSanguineo: "O- (Universal)",
    urgencia: "Emergência Crítica",
    pa: "80/50",
    fc: 135,
    spo2: 88,
    perdaEstimada: 1800
  });

  // Estado do Gerenciamento de Estoque Físico
  const [stockBags, setStockBags] = useState([
    {
      id: "BOLSA-01",
      lote: "SA-025",
      solucao: "PFC-40 Universal",
      volumeMax: 500,
      volumeAtual: 500,
      nivelPct: 100,
      status: "CHEIA (PRONTA)",
      statusCor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
      posicaoSuporte: "Suporte A1 (Bancada Principal)"
    },
    {
      id: "BOLSA-02",
      lote: "SA-025",
      solucao: "PFC-40 Universal",
      volumeMax: 500,
      volumeAtual: 350,
      nivelPct: 70,
      status: "EM INFUSÃO",
      statusCor: "text-sky-400 bg-sky-500/10 border-sky-500/30",
      posicaoSuporte: "Suporte A2 (Circuito YF-S201)"
    },
    {
      id: "BOLSA-03",
      lote: "SA-026",
      solucao: "HBOC-201",
      volumeMax: 500,
      volumeAtual: 120,
      nivelPct: 24,
      status: "NÍVEL BAIXO (REPOR)",
      statusCor: "text-rose-400 bg-rose-500/10 border-rose-500/30 animate-pulse",
      posicaoSuporte: "Suporte B1 (Reserva Secundária)"
    },
    {
      id: "BOLSA-04",
      lote: "SA-026",
      solucao: "HBOC-201",
      volumeMax: 500,
      volumeAtual: 500,
      nivelPct: 100,
      status: "CHEIA (PRONTA)",
      statusCor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
      posicaoSuporte: "Suporte B2 (Reserva Secundária)"
    }
  ]);

  const [replacingBagId, setReplacingBagId] = useState(null);
  const [bagReplacedToast, setBagReplacedToast] = useState(null);

  // Função para executar Simulação com IA (Manual ou Gerada)
  const runAiSimulation = (patientData) => {
    setAiProcessing(true);
    setPatientResult(null);

    const steps = [
      "1/4 • Escaneando parâmetros fisiológicos e volemia...",
      "2/4 • Analisando compatibilidade molecular com carreadores PFC / HBOC...",
      "3/4 • Calculando demanda volêmica e curva de oxigenação tecidual...",
      "4/4 • Consultando disponibilidade em tempo real no estoque hospitalar..."
    ];

    let currentStepIdx = 0;
    setProcessingStep(steps[0]);

    const interval = setInterval(() => {
      currentStepIdx++;
      if (currentStepIdx < steps.length) {
        setProcessingStep(steps[currentStepIdx]);
      } else {
        clearInterval(interval);
        setAiProcessing(false);

        // Gera o resultado
        const volumeMl = patientData.demandaEstimadaMl || (patientData.perdaEstimada ? Math.min(2500, Math.max(1000, Math.round(patientData.perdaEstimada * 1.1 / 500) * 500)) : 1500);
        const bolsas = Math.ceil(volumeMl / 500);

        setPatientResult({
          ...patientData,
          demandaEstimadaMl: volumeMl,
          bolsasEstimadas: bolsas,
          solucaoRecomendada: patientData.solucaoRecomendada || "PFC-40 (Perfluorocarbono Sintético Universal)",
          tempoCriticoMin: patientData.tempoCriticoMin || 12,
          justificativaIA: patientData.justificativaIA || `Com base na pressão arterial de ${patientData.pa || "80/50 mmHg"} e frequência cardíaca de ${patientData.fc || 135} BPM, a IA estimou necessidade imediata de ${volumeMl} mL (${bolsas} bolsas) de sangue artificial sintético para restabelecer a perfusão microvascular sem dependência de doadores.`
        });
      }
    }, 600);
  };

  // Gerar novo paciente aleatório com IA
  const handleGenerateAiPatient = () => {
    const randomTemplate = PACIENTES_IA_SIMULADOS[Math.floor(Math.random() * PACIENTES_IA_SIMULADOS.length)];
    runAiSimulation(randomTemplate);
  };

  // Submeter formulário manual
  const handleManualSubmit = (e) => {
    e.preventDefault();
    const customPatient = {
      id: `PAC-${Math.floor(1000 + Math.random() * 9000)}`,
      nome: manualForm.nome || "Visitante Simulado",
      idade: manualForm.idade || 25,
      genero: manualForm.genero,
      tipoSanguineo: manualForm.tipoSanguineo,
      situacao: manualForm.diagnostico,
      urgencia: manualForm.urgencia.toUpperCase(),
      urgenciaCor: manualForm.urgencia.includes("Crítica") ? "text-rose-400 bg-rose-500/10 border-rose-500/30" : "text-amber-400 bg-amber-500/10 border-amber-500/30",
      sinaisVitais: {
        fc: `${manualForm.fc} BPM`,
        pa: `${manualForm.pa} mmHg`,
        spo2: `${manualForm.spo2}%`,
        glasgow: "12 / 15"
      },
      perdaEstimada: manualForm.perdaEstimada
    };
    runAiSimulation(customPatient);
  };

  // Ação de Trocar/Repor Bolsa de Sangue Artificial
  const handleReplaceBag = (bagId) => {
    setReplacingBagId(bagId);

    setTimeout(() => {
      setStockBags(prev => prev.map(bag => {
        if (bag.id === bagId) {
          return {
            ...bag,
            volumeAtual: bag.volumeMax,
            nivelPct: 100,
            status: "CHEIA (PRONTA)",
            statusCor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
          };
        }
        return bag;
      }));

      setReplacingBagId(null);
      setBagReplacedToast(`Bolsa ${bagId} reposta com sucesso! Telemetria do circuito físico atualizada.`);

      setTimeout(() => {
        setBagReplacedToast(null);
      }, 4000);
    }, 1000);
  };

  // Totais de Estoque
  const totalVolumeAtual = stockBags.reduce((acc, b) => acc + b.volumeAtual, 0);
  const totalVolumeMax = stockBags.reduce((acc, b) => acc + b.volumeMax, 0);
  const percentualEstoqueGeral = Math.round((totalVolumeAtual / totalVolumeMax) * 100);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Disclaimer Educacional Fixo */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-2.5 flex items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-sky-400 shrink-0" />
          <span>
            <strong>Demonstração Científica & Educacional (FECART 2026):</strong> Esta simulação destina-se a fins didáticos e demonstração do protótipo IoT/IA, não constituindo análise médica ou diagnóstico clínico real.
          </span>
        </div>
        <span className="hidden sm:inline-block font-mono text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">
          PROTÓTIPO FECART
        </span>
      </div>

      {/* =========================================================
          TELA INICIAL DE ESCOLHA DE MODO
          ========================================================= */}
      {currentMode === "menu" && (
        <div className="space-y-8 py-4">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-4 py-1.5 font-mono text-xs uppercase tracking-widest text-rose-400">
              <Sparkles className="h-3.5 w-3.5 text-rose-400 animate-pulse" />
              EXPERIÊNCIA INTERATIVA DO VISITANTE
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white font-display">
              Como você deseja participar da <span className="text-gradient-blood">simulação?</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Escolha seu papel na demonstração do FLOWTIFICIAL. Experimente a jornada do paciente e a previsão de demanda por IA, ou assuma o controle técnico das bolsas e sensores do protótipo físico.
            </p>
          </div>

          {/* Os 2 Grandes Cards Interativos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto pt-2">
            
            {/* CARD 1: ENTRADA DE PACIENTE */}
            <div className="glass-panel rounded-2xl p-7 border-rose-500/40 bg-gradient-to-br from-rose-950/30 via-slate-950 to-slate-900 flex flex-col justify-between relative overflow-hidden group hover:border-rose-500/70 transition-all duration-300 hover:shadow-[0_0_35px_rgba(255,42,66,0.3)]">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-600 via-fuchsia-500 to-rose-600" />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-400 shadow-[0_0_15px_rgba(255,42,66,0.3)]">
                    <User className="h-8 w-8" />
                  </span>
                  <span className="font-mono text-[10px] font-bold bg-rose-500/20 text-rose-300 px-3 py-1 rounded-full border border-rose-500/40 uppercase tracking-wider">
                    FLUXO DO PACIENTE
                  </span>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-white font-display tracking-tight">
                    1. ENTRADA DE PACIENTE
                  </h2>
                  <p className="mt-2.5 text-sm text-slate-300 leading-relaxed">
                    “Simule a entrada de um paciente e descubra como o FLOWTIFICIAL analisa sua possível demanda por sangue artificial.”
                  </p>
                </div>

                <div className="space-y-2 pt-2 text-xs text-slate-400 font-mono">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-rose-500 shrink-0" />
                    <span>Opção A: Inserir dados fisiológicos manualmente</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-rose-500 shrink-0" />
                    <span>Opção B: Gerar paciente fictício com IA</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-rose-500 shrink-0" />
                    <span>Cálculo de demanda volêmica (mL) e compatibilidade</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-800">
                <Button
                  onClick={() => {
                    setCurrentMode("patient");
                    setPatientSubMode("choose");
                    setPatientResult(null);
                  }}
                  size="lg"
                  className="w-full gap-2.5 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold tracking-wide shadow-[0_0_20px_rgba(255,42,66,0.4)] text-sm h-12 rounded-xl"
                >
                  <User className="h-4 w-4" />
                  Iniciar simulação
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* CARD 2: GERENCIAMENTO DO ESTOQUE */}
            <div className="glass-panel rounded-2xl p-7 border-sky-500/40 bg-gradient-to-br from-sky-950/30 via-slate-950 to-slate-900 flex flex-col justify-between relative overflow-hidden group hover:border-sky-500/70 transition-all duration-300 hover:shadow-[0_0_35px_rgba(56,189,248,0.25)]">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-500 via-emerald-400 to-sky-500" />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="p-3.5 rounded-2xl bg-sky-500/15 border border-sky-500/40 text-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.3)]">
                    <Package className="h-8 w-8" />
                  </span>
                  <span className="font-mono text-[10px] font-bold bg-sky-500/20 text-sky-300 px-3 py-1 rounded-full border border-sky-500/40 uppercase tracking-wider">
                    PARTE FÍSICA & BANCADA
                  </span>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-white font-display tracking-tight">
                    2. GERENCIAMENTO DO ESTOQUE
                  </h2>
                  <p className="mt-2.5 text-sm text-slate-300 leading-relaxed">
                    “Assuma o controle do sistema e acompanhe o gerenciamento das bolsas de sangue artificial em tempo real.”
                  </p>
                </div>

                <div className="space-y-2 pt-2 text-xs text-slate-400 font-mono">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-sky-400 shrink-0" />
                    <span>Monitoramento de bolsas e níveis em tempo real</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-sky-400 shrink-0" />
                    <span>Leituras de sensores IoT (YF-S201, DS18B20)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-sky-400 shrink-0" />
                    <span>Ação de troca/reposição de bolsa com animação</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-800">
                <Button
                  onClick={() => setCurrentMode("stock")}
                  size="lg"
                  className="w-full gap-2.5 bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-500 hover:to-cyan-500 text-white font-bold tracking-wide shadow-[0_0_20px_rgba(56,189,248,0.35)] text-sm h-12 rounded-xl"
                >
                  <Package className="h-4 w-4" />
                  Gerenciar estoque
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

          </div>

          {/* Resumo do Fluxo Conceitual */}
          <div className="glass-panel rounded-xl p-5 max-w-5xl mx-auto border-slate-800 bg-slate-950/70">
            <p className="font-mono text-xs uppercase tracking-widest text-slate-400 font-bold mb-3 text-center sm:text-left">
              FLUXO CONCEITUAL INTEGRADO DA EXPERIÊNCIA:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-[11px] font-mono">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="block text-rose-400 font-bold">1. PACIENTE</span>
                <span className="text-[9px] text-slate-500">Entrada/Triagem</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="block text-fuchsia-400 font-bold">2. ANÁLISE</span>
                <span className="text-[9px] text-slate-500">Sinais vitais</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="block text-indigo-400 font-bold">3. IA DEMANDA</span>
                <span className="text-[9px] text-slate-500">Volume em mL</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="block text-sky-400 font-bold">4. ESTOQUE</span>
                <span className="text-[9px] text-slate-500">Verificação</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="block text-emerald-400 font-bold">5. BOLSAS</span>
                <span className="text-[9px] text-slate-500">Troca/Reposição</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="block text-cyan-400 font-bold">6. SENSORES</span>
                <span className="text-[9px] text-slate-500">Telemetria ao vivo</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* =========================================================
          ÁREA 1: ENTRADA DE PACIENTE
          ========================================================= */}
      {currentMode === "patient" && (
        <div className="space-y-6">
          
          {/* Barra de Retorno e Sub-navegação */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <button
              onClick={() => {
                setCurrentMode("menu");
                setPatientResult(null);
              }}
              className="flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar para Escolha de Modo
            </button>

            <div className="flex items-center bg-slate-900/80 border border-slate-800 rounded-xl p-1">
              <button
                onClick={() => {
                  setPatientSubMode("choose");
                  setPatientResult(null);
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  patientSubMode === "choose" ? "bg-rose-600/20 text-rose-300 font-bold border border-rose-500/30" : "text-slate-400 hover:text-white"
                }`}
              >
                Opções de Entrada
              </button>
              <button
                onClick={() => {
                  setPatientSubMode("manual");
                  setPatientResult(null);
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  patientSubMode === "manual" ? "bg-rose-600/20 text-rose-300 font-bold border border-rose-500/30" : "text-slate-400 hover:text-white"
                }`}
              >
                A) Inserir Dados
              </button>
              <button
                onClick={() => {
                  setPatientSubMode("ai");
                  handleGenerateAiPatient();
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  patientSubMode === "ai" ? "bg-rose-600/20 text-rose-300 font-bold border border-rose-500/30" : "text-slate-400 hover:text-white"
                }`}
              >
                B) Gerar com IA
              </button>
            </div>
          </div>

          {/* Sub-tela: Escolha entre A ou B */}
          {patientSubMode === "choose" && !patientResult && !aiProcessing && (
            <div className="max-w-4xl mx-auto py-6 space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl sm:text-3xl font-bold text-white font-display">
                  Como deseja criar o perfil do paciente?
                </h2>
                <p className="text-xs sm:text-sm text-slate-300">
                  Selecione se prefere preencher os dados manualmente para uma experiência personalizada ou deixar a IA gerar um caso clínico crítico automaticamente.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div 
                  onClick={() => setPatientSubMode("manual")}
                  className="glass-panel rounded-2xl p-6 border-slate-800 hover:border-rose-500/60 bg-slate-950/70 cursor-pointer transition-all hover:scale-[1.02] group space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="p-3 rounded-xl bg-slate-900 text-rose-400 border border-slate-800 group-hover:border-rose-500/40">
                      <Stethoscope className="h-6 w-6" />
                    </span>
                    <span className="text-[10px] font-mono text-rose-400 font-bold">OPÇÃO A</span>
                  </div>
                  <h3 className="text-lg font-bold text-white font-display">A) Inserir Dados</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Preencha informações (Nome, Idade, Tipo Sanguíneo, Pressão Arterial e Diagnóstico) e envie para a IA processar a demanda.
                  </p>
                  <Button className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs mt-2">
                    Preencher Formulário
                  </Button>
                </div>

                <div 
                  onClick={() => {
                    setPatientSubMode("ai");
                    handleGenerateAiPatient();
                  }}
                  className="glass-panel rounded-2xl p-6 border-rose-500/40 hover:border-rose-500 bg-gradient-to-br from-rose-950/20 to-slate-950 cursor-pointer transition-all hover:scale-[1.02] group space-y-3 shadow-[0_0_20px_rgba(255,42,66,0.2)]"
                >
                  <div className="flex items-center justify-between">
                    <span className="p-3 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40">
                      <Zap className="h-6 w-6 animate-pulse" />
                    </span>
                    <span className="text-[10px] font-mono text-rose-400 font-bold">OPÇÃO B</span>
                  </div>
                  <h3 className="text-lg font-bold text-white font-display">B) Gerar Paciente com IA</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    A IA cria instantaneamente um caso com sinais vitais, nível de urgência, tipo sanguíneo raro e volume estimado de sangue artificial.
                  </p>
                  <Button className="w-full bg-gradient-to-r from-red-600 to-rose-700 text-white text-xs font-bold mt-2 shadow-[0_0_15px_rgba(255,42,66,0.3)]">
                    Gerar Paciente com IA
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Sub-tela A: Formulário Manual */}
          {patientSubMode === "manual" && !patientResult && !aiProcessing && (
            <div className="max-w-3xl mx-auto glass-panel rounded-2xl p-6 sm:p-8 border-slate-800 bg-slate-950/80">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-5">
                <span className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30">
                  <Stethoscope className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-xl font-bold text-white font-display">
                    Opção A: Inserção de Dados do Paciente
                  </h2>
                  <p className="text-xs text-slate-400">
                    Insira os dados do perfil para que a IA estime a demanda por sangue artificial
                  </p>
                </div>
              </div>

              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1 text-left">
                    <label className="font-mono text-[10px] uppercase tracking-widest text-slate-400">Nome ou Identificação Fictícia</label>
                    <input
                      type="text"
                      value={manualForm.nome}
                      onChange={(e) => setManualForm({ ...manualForm, nome: e.target.value })}
                      placeholder="Ex: Visitante da Feira"
                      required
                      className="w-full h-10 rounded-lg border border-slate-700 bg-slate-900 px-3 text-xs text-white outline-none focus:border-rose-500"
                    />
                  </div>

                  <div className="space-y-1 text-left">
                    <label className="font-mono text-[10px] uppercase tracking-widest text-slate-400">Idade & Gênero</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        value={manualForm.idade}
                        onChange={(e) => setManualForm({ ...manualForm, idade: Number(e.target.value) })}
                        placeholder="Idade"
                        className="h-10 rounded-lg border border-slate-700 bg-slate-900 px-3 text-xs text-white outline-none focus:border-rose-500"
                      />
                      <select
                        value={manualForm.genero}
                        onChange={(e) => setManualForm({ ...manualForm, genero: e.target.value })}
                        className="h-10 rounded-lg border border-slate-700 bg-slate-900 px-2 text-xs text-white outline-none focus:border-rose-500"
                      >
                        <option value="Masculino">Masculino</option>
                        <option value="Feminino">Feminino</option>
                        <option value="Outro">Outro</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1 text-left">
                    <label className="font-mono text-[10px] uppercase tracking-widest text-slate-400">Situação Hospitalar Simulada</label>
                    <select
                      value={manualForm.diagnostico}
                      onChange={(e) => setManualForm({ ...manualForm, diagnostico: e.target.value })}
                      className="w-full h-10 rounded-lg border border-slate-700 bg-slate-900 px-3 text-xs text-white outline-none focus:border-rose-500"
                    >
                      <option value="Choque Hipovolêmico Traumático">Choque Hipovolêmico Traumático (Acidente)</option>
                      <option value="Hemorragia Aguda Cirúrgica">Hemorragia Aguda Cirúrgica</option>
                      <option value="Politrauma com Perda Sanguínea Maciça">Politrauma com Perda Sanguínea Maciça</option>
                      <option value="Queimaduras Graves de 3º Grau">Queimaduras Graves de 3º Grau</option>
                      <option value="Transplante / Preservação de Órgão">Transplante / Preservação de Órgão</option>
                    </select>
                  </div>

                  <div className="space-y-1 text-left">
                    <label className="font-mono text-[10px] uppercase tracking-widest text-slate-400">Tipo Sanguíneo do Paciente</label>
                    <select
                      value={manualForm.tipoSanguineo}
                      onChange={(e) => setManualForm({ ...manualForm, tipoSanguineo: e.target.value })}
                      className="w-full h-10 rounded-lg border border-slate-700 bg-slate-900 px-3 text-xs text-white outline-none focus:border-rose-500"
                    >
                      <option value="O- (Universal Convencional)">O Negativo (O-)</option>
                      <option value="A+ (Comum)">A Positivo (A+)</option>
                      <option value="B- (Raro)">B Negativo (B-)</option>
                      <option value="AB+ (Receptor Universal)">AB Positivo (AB+)</option>
                      <option value="Fenótipo Bombaim / Rh Nulo (Ultrarraro)">Fenótipo Raro (Bombaim / Rh Nulo)</option>
                    </select>
                  </div>
                </div>

                {/* Sinais Vitais */}
                <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-3">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                    Sinais Vitais de Entrada
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1 text-left">
                      <span className="text-[10px] font-mono text-slate-400">PA (mmHg)</span>
                      <input
                        type="text"
                        value={manualForm.pa}
                        onChange={(e) => setManualForm({ ...manualForm, pa: e.target.value })}
                        placeholder="80/50"
                        className="w-full h-9 rounded-lg border border-slate-700 bg-slate-900 px-2.5 text-xs text-white outline-none focus:border-rose-500"
                      />
                    </div>
                    <div className="space-y-1 text-left">
                      <span className="text-[10px] font-mono text-slate-400">FC (BPM)</span>
                      <input
                        type="number"
                        value={manualForm.fc}
                        onChange={(e) => setManualForm({ ...manualForm, fc: Number(e.target.value) })}
                        placeholder="135"
                        className="w-full h-9 rounded-lg border border-slate-700 bg-slate-900 px-2.5 text-xs text-white outline-none focus:border-rose-500"
                      />
                    </div>
                    <div className="space-y-1 text-left">
                      <span className="text-[10px] font-mono text-slate-400">SpO2 (%)</span>
                      <input
                        type="number"
                        value={manualForm.spo2}
                        onChange={(e) => setManualForm({ ...manualForm, spo2: Number(e.target.value) })}
                        placeholder="88"
                        className="w-full h-9 rounded-lg border border-slate-700 bg-slate-900 px-2.5 text-xs text-white outline-none focus:border-rose-500"
                      />
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full gap-2 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold h-12 shadow-[0_0_20px_rgba(255,42,66,0.35)]"
                >
                  <Sparkles className="h-4 w-4" />
                  Processar com IA do FLOWTIFICIAL
                </Button>
              </form>
            </div>
          )}

          {/* Animação de Processamento da IA */}
          {aiProcessing && (
            <div className="max-w-xl mx-auto glass-panel rounded-2xl p-8 border-rose-500/40 text-center space-y-6 animate-in zoom-in duration-300">
              <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-rose-500/20 border-t-rose-500 animate-spin" />
                <Sparkles className="h-8 w-8 text-rose-400 animate-pulse" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white font-display">
                  Processamento Preditivo por IA
                </h3>
                <p className="text-xs font-mono text-rose-400 animate-pulse">
                  {processingStep}
                </p>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-rose-500 via-fuchsia-500 to-sky-400 animate-pulse w-full" />
              </div>
            </div>
          )}

          {/* Resultado da Simulação do Paciente */}
          {patientResult && !aiProcessing && (
            <div className="max-w-4xl mx-auto space-y-5 animate-in slide-in-from-bottom duration-300">
              
              <div className="glass-panel rounded-2xl p-6 sm:p-7 border-rose-500/40 bg-slate-950/90 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-600 via-fuchsia-500 to-rose-600" />
                
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        {patientResult.id}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {patientResult.idade} anos • {patientResult.genero}
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold text-white font-display">
                      {patientResult.nome}
                    </h2>
                    <p className="text-xs text-slate-300 mt-0.5 font-sans">
                      Tipo Sanguíneo: <strong>{patientResult.tipoSanguineo}</strong>
                    </p>
                  </div>

                  <span className={`text-xs font-mono font-bold px-3 py-1.5 rounded-xl border ${patientResult.urgenciaCor || "text-rose-400 bg-rose-500/10 border-rose-500/30"}`}>
                    {patientResult.urgencia || "EMERGÊNCIA CRÍTICA"}
                  </span>
                </div>

                {/* Situação e Sinais */}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">
                      Situação Hospitalar
                    </p>
                    <p className="text-sm font-semibold text-white">
                      {patientResult.situacao}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">
                      Sinais Vitais Analisados
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-300">
                      <span>FC: <strong>{patientResult.sinaisVitais?.fc || "140 BPM"}</strong></span>
                      <span>PA: <strong>{patientResult.sinaisVitais?.pa || "75/45"}</strong></span>
                      <span>SpO2: <strong>{patientResult.sinaisVitais?.spo2 || "85%"}</strong></span>
                      <span>Glasgow: <strong>{patientResult.sinaisVitais?.glasgow || "10/15"}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Estimativa de Demanda por IA */}
                <div className="mt-5 p-5 rounded-xl bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-900 border border-rose-500/40 space-y-3">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <div>
                      <p className="font-mono text-[11px] uppercase tracking-widest text-rose-400 font-bold">
                        DEMANDA ESTIMADA DE SANGUE ARTIFICIAL (IA)
                      </p>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="font-mono text-4xl font-extrabold text-white">
                          {patientResult.demandaEstimadaMl}
                        </span>
                        <span className="font-mono text-sm text-rose-400 font-bold">mL</span>
                        <span className="text-xs text-slate-400">
                          ({patientResult.bolsasEstimadas} bolsas de 500 mL)
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-mono text-slate-400 block">JANELA DE INFUSÃO</span>
                      <span className="text-sm font-mono font-bold text-rose-400">
                        &lt; {patientResult.tempoCriticoMin} MINUTOS
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 text-xs text-slate-300 leading-relaxed font-sans">
                    <p className="font-bold text-slate-200 font-mono text-[11px] mb-1">
                      LAUDO & JUSTIFICATIVA CLÍNICA DA IA:
                    </p>
                    {patientResult.justificativaIA}
                  </div>
                </div>

                {/* Ações pós-resultado */}
                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
                  <Button
                    onClick={() => {
                      if (patientSubMode === "ai") {
                        handleGenerateAiPatient();
                      } else {
                        setPatientSubMode("manual");
                        setPatientResult(null);
                      }
                    }}
                    variant="outline"
                    className="gap-2 border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs"
                  >
                    <RefreshCw className="h-4 w-4 text-sky-400" />
                    {patientSubMode === "ai" ? "Gerar novo paciente com IA" : "Alterar dados e reprocessar"}
                  </Button>

                  <Button
                    onClick={() => setCurrentMode("stock")}
                    className="gap-2 bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-500 hover:to-cyan-500 text-white font-bold text-xs px-5 shadow-[0_0_15px_rgba(56,189,248,0.3)]"
                  >
                    <Package className="h-4 w-4" />
                    Verificar Estoque & Bolsas Físicas
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>

              </div>

            </div>
          )}

        </div>
      )}

      {/* =========================================================
          ÁREA 2: GERENCIAMENTO DO ESTOQUE & SENSORES FÍSICOS
          ========================================================= */}
      {currentMode === "stock" && (
        <div className="space-y-6">
          
          {/* Barra de Retorno */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <button
              onClick={() => setCurrentMode("menu")}
              className="flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar para Escolha de Modo
            </button>

            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-xs text-emerald-400 font-bold">
                TELEMETRIA FÍSICA ATIVA (ARDUINO NANO • COM3)
              </span>
            </div>
          </div>

          {/* Toast de Confirmação de Troca de Bolsa */}
          {bagReplacedToast && (
            <div className="p-4 rounded-xl border border-emerald-500/50 bg-emerald-950/60 text-emerald-300 flex items-center justify-between gap-3 shadow-[0_0_20px_rgba(0,229,163,0.25)] animate-in slide-in-from-top duration-300">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                <span className="text-xs font-mono font-semibold">{bagReplacedToast}</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded">
                REPOSIÇÃO AUDITADA
              </span>
            </div>
          )}

          {/* Painel Geral da Bancada de Estoque */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* COLUNA ESQUERDA: VISUALIZAÇÃO DAS BOLSAS NO SUPORTE (7/12) */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              
              <div className="glass-panel rounded-2xl p-6 border-slate-800 bg-slate-950/80 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
                      <Droplets className="h-5 w-5 text-rose-500" />
                      Bolsas de Sangue Artificial no Suporte Físico
                    </h2>
                    <p className="text-xs text-slate-400">
                      Representação interativa das bolsas acopladas na bancada de demonstração
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-slate-400 block">RESERVA TOTAL</span>
                    <span className="font-mono text-base font-bold text-emerald-400">
                      {totalVolumeAtual} / {totalVolumeMax} mL ({percentualEstoqueGeral}%)
                    </span>
                  </div>
                </div>

                {/* Grid das 4 Bolsas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {stockBags.map((bag) => (
                    <div
                      key={bag.id}
                      className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-slate-700 transition-all flex flex-col justify-between relative overflow-hidden"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-mono text-[10px] text-slate-400 font-bold block">
                            {bag.id} • {bag.lote}
                          </span>
                          <h3 className="font-bold text-white text-sm mt-0.5">{bag.solucao}</h3>
                          <span className="text-[10px] text-slate-500 font-mono">{bag.posicaoSuporte}</span>
                        </div>
                        <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border shrink-0 ${bag.statusCor}`}>
                          {bag.status}
                        </span>
                      </div>

                      {/* Visual da Bolsa com Nível de Líquido */}
                      <div className="my-3 space-y-1.5">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-slate-400">Volume Atual:</span>
                          <span className="text-white font-bold">{bag.volumeAtual} mL / {bag.volumeMax} mL</span>
                        </div>
                        <div className="h-3 w-full rounded-full bg-slate-800 overflow-hidden p-0.5 border border-slate-700">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${
                              bag.nivelPct < 30 ? "bg-rose-500 animate-pulse" : "bg-gradient-to-r from-red-600 to-rose-500"
                            }`}
                            style={{ width: `${bag.nivelPct}%` }}
                          />
                        </div>
                      </div>

                      {/* Botão de Reposição / Troca */}
                      <Button
                        onClick={() => handleReplaceBag(bag.id)}
                        disabled={replacingBagId === bag.id || bag.nivelPct === 100}
                        size="sm"
                        className={`w-full text-xs font-bold gap-1.5 transition-all ${
                          bag.nivelPct < 50 
                            ? "bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_12px_rgba(255,42,66,0.4)]"
                            : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                        }`}
                      >
                        <RefreshCw className={`h-3.5 w-3.5 ${replacingBagId === bag.id ? "animate-spin" : ""}`} />
                        {replacingBagId === bag.id ? "Substituindo Bolsa..." : bag.nivelPct === 100 ? "Bolsa Completa (100%)" : "🔄 Trocar / Repor Bolsa"}
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
                  <Info className="h-4 w-4 text-sky-400 shrink-0" />
                  <span>
                    Ao trocar a bolsa fisicamente no suporte do estande, o operador aciona a reposição na interface para sincronizar os sensores de vazão do Arduino.
                  </span>
                </div>
              </div>

            </div>

            {/* COLUNA DIREITA: SENSORES IoT & TELEMETRIA AO VIVO (5/12) */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              
              <div className="glass-panel rounded-2xl p-6 border-slate-800 bg-slate-950/80 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
                    <Activity className="h-5 w-5 text-emerald-400" />
                    Telemetria dos Sensores
                  </h2>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                    BANCADA ON-LINE
                  </span>
                </div>

                {/* Cards de Sensores Físicos */}
                <div className="space-y-3">
                  
                  {/* Fluxo YF-S201 */}
                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/30">
                        <Waves className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-[10px] font-mono text-slate-400 uppercase">Sensor de Fluxo (YF-S201)</p>
                        <p className="text-base font-bold text-white font-mono">4,8 L/min (12 mL/s)</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                      CONTÍNUO
                    </span>
                  </div>

                  {/* Temperatura DS18B20 */}
                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
                        <Thermometer className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-[10px] font-mono text-slate-400 uppercase">Sensor Térmico (DS18B20)</p>
                        <p className="text-base font-bold text-white font-mono">36,5 °C (Estável)</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                      FISIOLÓGICA
                    </span>
                  </div>

                  {/* Estabilidade Química & pH */}
                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="p-2 rounded-lg bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/30">
                        <FlaskConical className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-[10px] font-mono text-slate-400 uppercase">Equilíbrio Químico & pH</p>
                        <p className="text-base font-bold text-white font-mono">7.40 pH • 3.8 cP</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                      OTIMIZADO
                    </span>
                  </div>

                </div>

                {/* Projeção de Estoque e Demanda */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-slate-400">Demanda Prevista para Hoje:</span>
                    <span className="text-white font-bold">72 unidades</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-slate-400">Tempo de Cobertura Estimado:</span>
                    <span className="text-emerald-400 font-bold">48 horas de autonomia</span>
                  </div>
                </div>

                <Button
                  onClick={onNavigateToDashboard}
                  variant="outline"
                  className="w-full gap-2 border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs"
                >
                  <Activity className="h-4 w-4 text-rose-500" />
                  Abrir Monitor Clínico Completo
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
