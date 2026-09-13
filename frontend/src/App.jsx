import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import {
  Activity,
  Database,
  Cpu,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ChevronRight,
  TrendingUp,
  Droplets,
  ShieldCheck,
  FlaskConical,
  Waves,
  Thermometer,
  Layers,
  Clock,
  Plus,
  Zap,
  Maximize2,
  Minimize2,
  X,
  Contrast,
  MousePointer2,
  Accessibility,
  Wifi
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MetricCard } from '@/components/MetricCard';
import { DemandChart, getForecastScenario } from '@/components/DemandChart';
import { LandingPage } from '@/components/LandingPage';
import { QuickEntryModal } from '@/components/QuickEntryModal';
import { EmergencySimulator } from '@/components/EmergencySimulator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useArduinoData, getStatusBadge } from '@/hooks/useArduinoData';

const API_BASE = import.meta.env.VITE_API_URL || window.location.origin;

const QUICK_CHAT_ACTIONS = [
  'Qual o status atual do lote?',
  'O que é o Sangue Artificial (HBOC)?',
  'Por que o lote está em risco?',
  'Qual a recomendação da IA e o impacto no estoque?',
  'Qual a economia financeira e redução de perdas?',
  'Como o modelo preditivo calcula essa curva?',
];

const STRATEGIC_CHAT_ACTIONS = QUICK_CHAT_ACTIONS.slice(2);

const createChatResponseCard = (action, lot, telemetry) => {
  const parseTelemetryValue = (value, fallback) => {
    const parsed = Number.parseFloat(String(value).replace(',', '.'));
    return Number.isFinite(parsed) ? parsed : fallback;
  };
  const vazao = parseTelemetryValue(telemetry?.vazao_l_min ?? telemetry?.vazao, 4.8);
  const temperatura = parseTelemetryValue(telemetry?.temperatura_c ?? telemetry?.temperatura, 36.5);
  const oxigenacao = parseTelemetryValue(telemetry?.oxigenacao_pct ?? telemetry?.oxigenacao, 96);
  const estabilidade = telemetry?.status || lot?.status || 'ESTÁVEL';
  const finalidade = lot?.finalidade || lot?.destino || 'finalidade clínica não informada';
  const lotId = lot?.id || 'lote ativo';
  const vazaoForaDaFaixa = vazao < 4 || vazao > 6.5;
  const temperaturaForaDaFaixa = temperatura < 35 || temperatura > 37.5;
  const leiturasForaDaFaixa = [
    vazaoForaDaFaixa && `A vazão de ${vazao.toFixed(1)} L/min está fora da faixa ideal de 4,0 a 6,5 L/min.`,
    temperaturaForaDaFaixa && `A temperatura de ${temperatura.toFixed(1)}°C está fora da faixa segura de 35,0 a 37,5°C.`,
  ].filter(Boolean);
  const economia = estabilidade === 'CRÍTICO' ? 42500 : estabilidade === 'ALERTA' ? 28500 : 18000;
  const metrics = [
    { label: 'OXIGENAÇÃO', value: `${oxigenacao.toFixed(0)}%`, progress: Math.min(100, oxigenacao), color: 'bg-emerald-400', icon: Droplets, iconColor: 'text-emerald-300', iconBackground: 'bg-emerald-500/15 border-emerald-400/40', badgeClass: 'border-emerald-400/30 bg-emerald-500/5 text-emerald-200' },
    { label: 'VAZÃO', value: `${vazao.toFixed(1)} L/min`, progress: Math.min(100, (vazao / 6.5) * 100), color: 'bg-cyan-400', icon: Waves, iconColor: 'text-cyan-300', iconBackground: 'bg-cyan-500/15 border-cyan-400/40', badgeClass: 'border-cyan-400/30 bg-cyan-500/5 text-cyan-200' },
    { label: 'TEMPERATURA', value: `${temperatura.toFixed(1)}°C`, progress: Math.min(100, Math.max(0, ((temperatura - 30) / 10) * 100)), color: 'bg-amber-400', icon: Thermometer, iconColor: 'text-amber-300', iconBackground: 'bg-amber-500/15 border-amber-400/40', badgeClass: 'border-amber-400/30 bg-amber-500/5 text-amber-200' },
    { label: 'ESTABILIDADE', value: estabilidade, progress: estabilidade === 'ESTÁVEL' ? 100 : estabilidade === 'ALERTA' ? 65 : 35, color: 'bg-purple-400', icon: ShieldCheck, iconColor: 'text-purple-300', iconBackground: 'bg-purple-500/15 border-purple-400/40', badgeClass: 'border-purple-400/30 bg-purple-500/5 text-purple-200' },
  ];

  if (action === QUICK_CHAT_ACTIONS[0]) {
    return {
      eyebrow: 'Telemetria do Arduino',
      title: `Status do lote ${lotId}`,
      summary: telemetry?.alerta_mensagem || `As leituras de vazão e temperatura do lote ${lotId} estão sendo acompanhadas continuamente para ${finalidade}.`,
      metrics,
      icon: Activity,
    };
  }

  if (action === QUICK_CHAT_ACTIONS[1]) {
    return {
      eyebrow: 'Fundamentos do composto',
      title: 'O que é o Sangue Artificial (HBOC)?',
      summary: 'Conceitos essenciais sobre o composto biotecnológico monitorado pela Flow.',
      conceptual: true,
      conceptualBlocks: [
        {
          title: 'Composto Biotecnológico (HBOC)',
          text: 'Solução sintética baseada em carreadores de hemoglobina projetada para transporte temporário de oxigênio, eliminando a necessidade de tipagem sanguínea (A, B, AB, O / Rh).',
          icon: Droplets,
          accent: 'border-cyan-500/30 bg-cyan-500/5 text-cyan-300',
        },
        {
          title: 'Indicação e Suporte Emergencial',
          text: 'Desenvolvido para uso imediato em traumas graves, cirurgias complexas, missões remotas e períodos críticos de escassez em bancos de sangue.',
          icon: Activity,
          accent: 'border-violet-500/30 bg-violet-500/5 text-violet-300',
        },
        {
          title: 'Estabilidade e Monitoramento',
          text: 'Possui vida útil estendida e zero risco de contaminação viral/bacteriana. O sistema FLOWTIFICIAL supervisiona continuamente a integridade físico-química de cada lote.',
          icon: ShieldCheck,
          accent: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-300',
        },
      ],
      icon: Droplets,
    };
  }

  if (action === STRATEGIC_CHAT_ACTIONS[0]) {
    return {
      eyebrow: 'Diagnóstico do Arduino',
      title: 'Por que o lote está em risco?',
      summary: leiturasForaDaFaixa.length
        ? `${leiturasForaDaFaixa.join(' ')} Para a finalidade de ${finalidade}, essa condição pode acelerar a degradação do lote ${lotId}.`
        : `A leitura atual do lote ${lotId} está dentro das faixas operacionais para ${finalidade}. O monitoramento contínuo mantém a estabilidade sob observação.`,
      metrics,
      icon: AlertTriangle,
    };
  }

  if (action === STRATEGIC_CHAT_ACTIONS[1]) {
    return {
      eyebrow: 'Ação recomendada pela IA',
      title: 'Correção e impacto no estoque',
      summary: `Ajustar o circuito para estabilizar a temperatura em 36,5°C e manter a vazão entre 4,0 e 6,5 L/min. Para o lote ${lotId}, a IA recomenda reabastecimento preventivo antes do limite crítico, preservando a cobertura para ${finalidade}.`,
      metrics,
      icon: Zap,
    };
  }

  if (action === STRATEGIC_CHAT_ACTIONS[2]) {
    return {
      eyebrow: 'Impacto financeiro',
      title: 'Economia e redução de perdas',
      summary: `O monitoramento contínuo do lote ${lotId} previne o descarte prematuro das bolsas ativas. Com o estado ${estabilidade.toLowerCase()}, a economia estimada ao evitar perdas é de R$ ${economia.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}.`,
      metrics,
      icon: TrendingUp,
    };
  }

  return {
    eyebrow: 'Modelo preditivo explicável',
    title: 'Como a curva é calculada?',
    summary: `O modelo cruza as leituras do Arduino — vazão de ${vazao.toFixed(1)} L/min e temperatura de ${temperatura.toFixed(1)}°C — com o histórico de consumo clínico de ${finalidade}. As leituras são atualizadas continuamente para projetar a curva do lote ${lotId}.`,
    metrics,
    icon: Activity,
  };
};

// Sparkline SVG Component
const Sparkline = ({ data, color = "#00e5a3" }) => {
  if (!data || data.length < 2) return null;
  const width = 100;
  const height = 26;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min === 0 ? 1 : max - min;

  const points = data.map((val, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        points={points}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const AccessibilityToggle = ({ icon: Icon, title, description, enabled, onChange }) => (
  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 transition-colors hover:border-slate-700">
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-400">
      <Icon className="h-4 w-4" />
    </span>
    <span className="min-w-0 flex-1">
      <span className="block text-sm font-semibold text-slate-100">{title}</span>
      <span className="mt-0.5 block text-xs leading-5 text-slate-400">{description}</span>
    </span>
    <input
      type="checkbox"
      checked={enabled}
      onChange={onChange}
      className="h-4 w-4 shrink-0 accent-rose-500"
    />
  </label>
);

// Lista Oficial das 9 Finalidades Clínicas
const FINALIDADES_OPCOES = [
  "Atendimento Pré-Hospitalar de Emergência",
  "Trauma e Hemorragia Grave",
  "Cirurgia Cardíaca e Cardiovascular",
  "Tratamento de Anemias Graves",
  "Tratamento Oncológico",
  "Atendimento a Pacientes Politraumatizados",
  "Doação de Sangue",
  "Coleta e Reserva de Sangue",
  "Tipagem Sanguínea e Testes de Compatibilidade"
];

const LOTES_DEMONSTRACAO = [
  {
    id: "DEMO-EMERGENCIA",
    name: "Lote DEMO Emergência",
    finalidade: "Atendimento Pré-Hospitalar de Emergência",
    icon: "🚨",
    title: "Atendimento Pré-Hospitalar / Emergência",
    focus: "Foco em Oxigenação B1 e Hemodinâmica B2",
    accent: "border-rose-500/40 hover:border-rose-400 hover:bg-rose-500/10"
  },
  {
    id: "DEMO-CARDIO",
    name: "Lote DEMO Cardiovascular",
    finalidade: "Cirurgia Cardíaca e Cardiovascular",
    icon: "🫀",
    title: "Cirurgia Cardiovascular",
    focus: "Foco em perfusão, fluxo e estabilidade térmica",
    accent: "border-sky-500/40 hover:border-sky-400 hover:bg-sky-500/10"
  },
  {
    id: "DEMO-ONCO",
    name: "Lote DEMO Oncológico",
    finalidade: "Tratamento Oncológico",
    icon: "🧬",
    title: "Tratamento Oncológico / Anemia Crítica",
    focus: "Foco em compatibilidade e carga de O₂",
    accent: "border-fuchsia-500/40 hover:border-fuchsia-400 hover:bg-fuchsia-500/10"
  },
  {
    id: "DEMO-RESERVA",
    name: "Lote DEMO Reserva",
    finalidade: "Doação de Sangue",
    icon: "🩸",
    title: "Unidade de Doação e Reserva",
    focus: "Foco em conservação e estabilidade de estoque",
    accent: "border-emerald-500/40 hover:border-emerald-400 hover:bg-emerald-500/10"
  }
];

// Protocolos Clínicos Médicos
const PROTOCOLOS_CLINICOS = {
  "Simulação Fisiológica Humana": {
    o2: { normal: [95, 100], seguro: [93, 100], critico: 90 },
    temp: { normal: [36.5, 37.5], seguro: [36.0, 37.8], criticoMin: 35.0, criticoMax: 38.5 },
    ph: { normal: [7.35, 7.45], seguro: [7.31, 7.49], criticoMin: 7.35, criticoMax: 7.45 },
    viscosidade: { normal: [3.0, 4.5], seguro: [3.0, 5.0], criticoMin: 2.5, criticoMax: 5.5 },
    hematocrito: { normal: [38, 50], seguro: [36, 52], criticoMin: 30, criticoMax: 55 }
  },
  "Preservação de Órgãos para Transplante": {
    o2: { normal: [98, 100], seguro: [95, 100], critico: 95 },
    temp: { normal: [4.0, 10.0], seguro: [4.0, 37.5], criticoMin: 4.0, criticoMax: 37.5 },
    ph: { normal: [7.35, 7.45], seguro: [7.31, 7.49], criticoMin: 7.35, criticoMax: 7.45 },
    viscosidade: { normal: [2.5, 3.5], seguro: [2.0, 4.0], criticoMin: 2.0, criticoMax: 4.5 },
    hematocrito: { normal: [30, 40], seguro: [28, 42], criticoMin: 25, criticoMax: 45 }
  },
  "Transfusão de Emergência (Uso Universal)": {
    o2: { normal: [95, 100], seguro: [92, 100], critico: 90 },
    temp: { normal: [36.5, 37.5], seguro: [36.0, 37.8], criticoMin: 35.0, criticoMax: 38.5 },
    ph: { normal: [7.40, 7.40], seguro: [7.35, 7.45], criticoMin: 7.35, criticoMax: 7.45 },
    viscosidade: { normal: [3.0, 4.5], seguro: [3.0, 5.0], criticoMin: 2.5, criticoMax: 5.5 },
    hematocrito: { normal: [35, 45], seguro: [32, 48], criticoMin: 30, criticoMax: 50 }
  },
  "Teste de Segurança e Toxicidade Celular": {
    o2: { normal: [95, 100], seguro: [93, 100], critico: 90 },
    temp: { normal: [37.0, 37.0], seguro: [36.5, 37.5], criticoMin: 35.0, criticoMax: 38.0 },
    ph: { normal: [7.38, 7.42], seguro: [7.35, 7.45], criticoMin: 7.35, criticoMax: 7.45 },
    viscosidade: { normal: [3.0, 4.0], seguro: [2.8, 4.2], criticoMin: 2.5, criticoMax: 5.0 },
    hematocrito: { normal: [40, 40], seguro: [38, 42], criticoMin: 35, criticoMax: 45 }
  }
};

export default function App() {
  // Navegação: 'landing' | 'dashboard' | 'forecast' | 'emergency'
  const [activeTab, setActiveTab] = useState('landing');
  const [clock, setClock] = useState("--:--:--");

  // Relógio ao vivo
  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString('pt-BR'));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  // Estados da Aplicação
  const [selectedLot, setSelectedLot] = useState(null);
  const [lots, setLots] = useState([]);
  const [history, setHistory] = useState([]);
  const [typingLotId, setTypingLotId] = useState(null);
  const [packetCount, setPacketCount] = useState(1420);
  const [lastPacketTime] = useState(null);
  const [isChatFullscreen, setIsChatFullscreen] = useState(false);
  const [zoomedChatCard, setZoomedChatCard] = useState(null);
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState(false);
  const [accessibilityPreferences, setAccessibilityPreferences] = useState(() => {
    try {
      return {
        highContrast: localStorage.getItem('flow-accessibility-high-contrast') === 'true',
        hoverZoom: localStorage.getItem('flow-accessibility-hover-zoom') === 'true',
        reducedMotion: localStorage.getItem('flow-accessibility-reduced-motion') === 'true',
        fontSize: localStorage.getItem('flow-accessibility-font-size') || 'normal',
      };
    } catch {
      return { highContrast: false, hoverZoom: false, reducedMotion: false, fontSize: 'normal' };
    }
  });
  const chatMessagesRef = useRef(null);

  const [chatHistoryByLot, setChatHistoryByLot] = useState({});
  const messages = selectedLot ? chatHistoryByLot[selectedLot] || [] : [];
  const isTyping = typingLotId === selectedLot;

  const appendMessagesToLot = (lotId, newMessages) => {
    if (!lotId) return;

    setChatHistoryByLot((previousHistory) => ({
      ...previousHistory,
      [lotId]: [
        ...(previousHistory[lotId] || []),
        ...newMessages,
      ],
    }));
  };

  // Carrega lotes cadastrados
  const fetchLots = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/lots`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setLots(data);
        }
      }
    } catch (err) {
      console.log("Erro ao carregar lotes:", err);
    }
  };

  // Carrega histórico do lote selecionado
  const fetchHistory = async () => {
    if (!selectedLot) {
      setHistory([]);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/history/${selectedLot}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setHistory(data);
        }
      }
    } catch (err) {
      console.log("Erro ao carregar histórico:", err);
    }
  };

  useEffect(() => {
    fetchLots();
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [selectedLot]);

  useEffect(() => {
    if (!selectedLot) return;

    setChatHistoryByLot((previousHistory) => (
      previousHistory[selectedLot]
        ? previousHistory
        : { ...previousHistory, [selectedLot]: [] }
    ));
  }, [selectedLot]);

  const scrollToBottom = () => {
    const chatContainer = chatMessagesRef.current;
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  };

  useLayoutEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Fecha a sobreposição sem interferir no estado do dashboard.
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsChatFullscreen(false);
        setZoomedChatCard(null);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isChatFullscreen ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isChatFullscreen]);

  useEffect(() => {
    const root = document.documentElement;
    const preferences = [
      ['highContrast', 'high-contrast', 'flow-accessibility-high-contrast'],
      ['hoverZoom', 'enable-hover-zoom', 'flow-accessibility-hover-zoom'],
      ['reducedMotion', 'accessibility-reduced-motion', 'flow-accessibility-reduced-motion'],
    ];

    preferences.forEach(([key, className, storageKey]) => {
      root.classList.toggle(className, accessibilityPreferences[key]);
      try {
        localStorage.setItem(storageKey, String(accessibilityPreferences[key]));
      } catch {
        // Preferências continuam ativas nesta sessão caso o armazenamento esteja indisponível.
      }
    });

    const fontScales = { small: '0.9', normal: '1', large: '1.12' };
    root.style.setProperty('--accessibility-font-scale', fontScales[accessibilityPreferences.fontSize] || '1');
    try {
      localStorage.setItem('flow-accessibility-font-size', accessibilityPreferences.fontSize);
    } catch {
      // Preferências continuam ativas nesta sessão caso o armazenamento esteja indisponível.
    }
  }, [accessibilityPreferences]);

  useEffect(() => {
    const closeAccessibilityModal = (event) => {
      if (event.key === 'Escape') setIsAccessibilityOpen(false);
    };

    window.addEventListener('keydown', closeAccessibilityModal);
    return () => window.removeEventListener('keydown', closeAccessibilityModal);
  }, []);

  const toggleAccessibilityPreference = (preference) => {
    setAccessibilityPreferences((current) => ({
      ...current,
      [preference]: !current[preference],
    }));
  };

  // Estados do Modal de Criação de Novo Lote
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newLotName, setNewLotName] = useState("");
  const [newLotCode, setNewLotCode] = useState("");
  const [newLotCreatedAt, setNewLotCreatedAt] = useState("");
  const [newLotFinalidade, setNewLotFinalidade] = useState(FINALIDADES_OPCOES[0]);
  const [formError, setFormError] = useState("");

  // Função para abrir o modal de criação de lote com campos auto-preenchidos
  const openCreateLotModal = () => {
    const existingNumbers = (lots || []).map(l => {
      const match = String(l.id).match(/SA-(\d+)/i);
      return match ? parseInt(match[1], 10) : 0;
    });
    const maxNum = existingNumbers.length > 0 ? Math.max(...existingNumbers, 24) : 25;
    const nextNum = maxNum + 1;
    const autoCode = `SA-${String(nextNum).padStart(3, '0')}`;

    // Data e Hora do sistema em formato DD/MM/AAAA, HH:mm:ss
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const formattedDateTime = `${day}/${month}/${year}, ${hours}:${minutes}:${seconds}`;

    setNewLotCode(autoCode);
    setNewLotName(`Lote ${autoCode}`);
    setNewLotCreatedAt(formattedDateTime);
    setNewLotFinalidade(FINALIDADES_OPCOES[0]);
    setFormError("");
    setIsModalOpen(true);
  };

  // Função para confirmar e cadastrar o lote
  const handleConfirmCreateLot = async (e) => {
    if (e) e.preventDefault();

    if (!newLotName || !newLotName.trim()) {
      setFormError("Por favor, informe o Nome do Lote.");
      return;
    }

    if (!newLotFinalidade) {
      setFormError("Por favor, selecione a Finalidade Clínica.");
      return;
    }

    const finalCode = newLotCode.trim() || `SA-${String((lots?.length || 0) + 25).padStart(3, '0')}`;
    const finalName = newLotName.trim();
    const finalCreatedAt = newLotCreatedAt || new Date().toLocaleString('pt-BR');
    const finalFinalidade = newLotFinalidade;
    const finalProtocolo = PROTOCOLOS_CLINICOS[finalFinalidade] || PROTOCOLOS_CLINICOS["Simulação Fisiológica Humana"];

    const newLotObj = {
      id: finalCode,
      name: finalName,
      nome: finalName,
      createdAt: finalCreatedAt,
      data_criacao: finalCreatedAt,
      finalidade: finalFinalidade,
      destino: finalFinalidade,
      responsaveis: "Mariana Vicente, Julia Santana e Vitória Barreto",
      intervaloLeitura: "5s",
      protocolo: finalProtocolo,
      status: "ESTÁVEL"
    };

    setLots(prev => [...prev, newLotObj]);
    setSelectedLot(finalCode);
    setIsModalOpen(false);

    // Integrar com o backend FastAPI
    try {
      await fetch(`${API_BASE}/api/lots`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: finalCode,
          nome: finalName,
          data_criacao: new Date().toISOString(),
          finalidade: finalFinalidade,
          composicao: `Fórmula Biomédica para ${finalFinalidade}`,
          status_inicial: "ESTÁVEL"
        })
      });
      fetchLots();
    } catch (err) {
      console.log("Servidor offline: lote adicionado localmente no estado React.");
    }
  };

  // Deletar lote
  const handleDeleteLot = (lotIdToDelete) => {
    const remainingLots = (lots || []).filter(lot => lot?.id !== lotIdToDelete);
    setLots(remainingLots);
    if (selectedLot === lotIdToDelete) {
      setSelectedLot(remainingLots[0]?.id || null);
    }
  };

  const handleQuickStartLot = (demoLot) => {
    const createdAt = new Date().toLocaleString('pt-BR');
    const newLot = {
      id: demoLot.id,
      name: demoLot.name,
      nome: demoLot.name,
      createdAt,
      data_criacao: createdAt,
      finalidade: demoLot.finalidade,
      destino: demoLot.finalidade,
      responsaveis: "Demonstração Flowtificial",
      intervaloLeitura: "5s",
      protocolo: PROTOCOLOS_CLINICOS[demoLot.finalidade] || PROTOCOLOS_CLINICOS["Simulação Fisiológica Humana"],
      status: "ESTÁVEL"
    };

    setLots((previousLots) => {
      const currentLots = previousLots || [];
      return currentLots.some((lot) => lot?.id === demoLot.id)
        ? currentLots
        : [...currentLots, newLot];
    });
    setSelectedLot(demoLot.id);
    setActiveTab('dashboard');
  };

  // Injeção de leitura manual / QR Code
  const handleInjectReading = (reading) => {
    const oxVal = parseFloat(String(reading.oxigenacao).replace("%", "").replace(",", ".")) / 100;
    const tempVal = parseFloat(String(reading.temperatura).replace("C", "").replace(",", "."));
    const vazaoVal = parseFloat(String(reading.vazao).replace(",", "."));

    const newEntry = {
      oxigenacao_limpa: isNaN(oxVal) ? 0.95 : oxVal,
      temperatura_c: isNaN(tempVal) ? 36.8 : tempVal,
      vazao_l_min: isNaN(vazaoVal) ? 4.8 : vazaoVal,
      ph: 7.40,
      viscosidade_cp: 3.8,
      hematocrito_pct: 40.0,
      status: (oxVal < 0.90 || tempVal > 38.0) ? "CRÍTICO" : "ESTÁVEL",
      alerta_mensagem: (oxVal < 0.90 || tempVal > 38.0)
        ? "ALERTA: Parâmetros fora da faixa fisiológica ideal."
        : "Sistema operando dentro dos parâmetros de normalidade."
    };

    setHistory(prev => [...prev, newEntry]);
    setPacketCount(p => p + 1);
  };

  // Envio de pergunta e integração com chat
  const handleSendMessage = async (text) => {
    if (!text || !text.trim() || !selectedLot) return;
    const lotId = selectedLot;

    if (QUICK_CHAT_ACTIONS.includes(text)) {
      appendMessagesToLot(lotId, [
        { role: 'user', content: text },
        {
          role: 'assistant',
          content: '',
          responseCard: createChatResponseCard(text, activeLotObj, activeLotTelemetry),
        },
      ]);
      setInputValue('');
      return;
    }

    const userMsg = { role: 'user', content: text };
    appendMessagesToLot(lotId, [userMsg]);
    setInputValue('');
    setTypingLotId(lotId);

    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pergunta: text })
      });

      if (res.ok) {
        const data = await res.json();
        setTimeout(() => {
          appendMessagesToLot(lotId, [{
            role: 'assistant',
            content: data.resposta,
            explicabilidade: data.explicabilidade,
            showAnalysisCard: false
          }]);
          setTypingLotId((currentLotId) => currentLotId === lotId ? null : currentLotId);

          const match = text.toUpperCase().match(/SA-\d{3}/);
          if (match) {
            setSelectedLot(match[0]);
          }
        }, 800);
      } else {
        setTypingLotId((currentLotId) => currentLotId === lotId ? null : currentLotId);
      }
    } catch (err) {
      console.log("Erro no chat:", err);
      setTypingLotId((currentLotId) => currentLotId === lotId ? null : currentLotId);
      appendMessagesToLot(lotId, [{
        role: 'assistant',
        content: '⚠️ **[Erro de Conexão]**: Não foi possível contatar a assistente Flow. Verifique se o backend está ativo.'
      }]);
    }
  };

  const safeLots = lots || [];
  const safeHistory = history || [];
  const activeLotObj = safeLots.find(l => l?.id === selectedLot) || null;
  const forecastScenario = getForecastScenario(selectedLot, activeLotObj);
  const activeFinalidade = activeLotObj?.finalidade || activeLotObj?.destino || "";

  const isEmergenciaActive = activeFinalidade.includes("Pré-Hospitalar") || activeFinalidade.includes("Pre-Hospitalar") || selectedLot === "SA-023";
  const isTraumaActive = activeFinalidade.includes("Trauma") || activeFinalidade.includes("Hemorragia");
  const isCirurgiaCardiacaActive = activeFinalidade.includes("Cirurgia") || activeFinalidade.includes("Cardíaca") || activeFinalidade.includes("Cardiaca") || activeFinalidade.includes("Cardiovascular");
  const isAnemiaActive = activeFinalidade.includes("Anemias") || activeFinalidade.includes("Anemia");
  const isOncologicoActive = activeFinalidade.includes("Oncológico") || activeFinalidade.includes("Oncologico");
  const isPolitraumatizadosActive = activeFinalidade.includes("Politraumatizados") || activeFinalidade.includes("Politrauma");
  const isDoacaoActive = activeFinalidade.includes("Doação") || activeFinalidade.includes("Doacao");
  const isColetaReservaActive = activeFinalidade.includes("Coleta") || activeFinalidade.includes("Reserva");
  const isTipagemCompatibilidadeActive = activeFinalidade.includes("Tipagem") || activeFinalidade.includes("Compatibilidade");

  // Tratamento de exceção (try/catch) com fallback visual em caso de corrupção ou perda de sinal USB
  let currentReading;
  try {
    currentReading = safeHistory.length > 0 ? safeHistory[safeHistory.length - 1] : {
      oxigenacao_limpa: isEmergenciaActive ? 0.98 : isTraumaActive ? 0.99 : isCirurgiaCardiacaActive ? 0.985 : 0.95,
      temperatura_c: isEmergenciaActive ? 22.0 : isCirurgiaCardiacaActive ? 3.0 : 36.5,
      vazao_l_min: 4.8,
      ph: isTraumaActive ? 7.40 : isCirurgiaCardiacaActive ? 7.42 : 7.40,
      viscosidade_cp: isEmergenciaActive ? 2.3 : isCirurgiaCardiacaActive ? 1.8 : 3.8,
      meia_vida_h: isCirurgiaCardiacaActive ? 48.0 : 24.0,
      extracao_o2_pct: 42.0,
      pressao_osmotica_mmhg: 25.0,
      antioxidante_pct: 94.5,
      pco2_mmhg: 40.0,
      glicose_mgdl: 100.0,
      expansao_volemica_pct: 100.0,
      carga_o2_pct: 99.0,
      pressao_oncotica_mmhg: 25.0,
      permutabilidade_gasosa_pct: 95.0,
      resistencia_compressao_pct: 90.0,
      tamponamento_ph: 7.40,
      compatibilidade_cec_pct: 98.5,
      tensao_cisalhamento_cp: 1.8,
      meia_vida_extended_h: 48.0,
      tamponamento_lactato_ph: 7.42,
      viscosidade_hipotermia_cp: 3.0,
      tempo_reconstituicao_s: 0.0,
      coagulabilidade_pct: 0.0,
      pressao_perfusao_mmhg: 95.0,
      suporte_cec_pct: 100.0,
      resistencia_cisalhamento_pct: 99.8,
      preservacao_hemostasia_pct: 98.5,
      estabilidade_osmotica_cec_mmhg: 25.0,
      controle_acidose_lactica_ph: 7.40,
      liberacao_o2_pct: 45.0,
      resposta_imunologica_pct: 0.0,
      compatibilidade_serica_pct: 100.0,
      erosao_quimioterapica_pct: 99.9,
      biocompatibilidade_tecidual_pct: 100.0,
      ph_tumoral: 7.35,
      retencao_o2_celular_pct: 96.0,
      reposicao_volemica_ultra_pct: 100.0,
      prevencao_hipotermia_c: 37.0,
      perfusao_cerebral_pct: 98.0,
      capacidade_tampao_ph: 7.42,
      baixa_viscosidade_cp: 2.1,
      expressao_antigenica_pct: 0.0,
      reatividade_crossmatch_pct: 0.0,
      pureza_molecular_pct: 99.9,
      esterilidade_biologica_pct: 100.0,
      integralidade_conservacao_pct: 100.0,
      validade_estoque_meses: "24 Meses",
      tolerancia_congelamento_c: -80.0,
      estabilidade_suspensao_pct: 99.9,
      fator_compatibilidade_pct: 100.0,
      ausencia_antigenos_pct: 0.0,
      reacao_heterologa_pct: 0.0,
      seguranca_sensibilizados_pct: 100.0,
      hematocrito_pct: 40.0,
      status: "ESTÁVEL",
      alerta_mensagem: "Monitoramento em tempo real ativo. Leituras contínuas calibradas."
    };
  } catch (err) {
    console.error("Erro no processamento da leitura serial:", err);
    currentReading = {
      isCorrupted: true,
      status: "AGUARDANDO LEITURA SERIAL",
      alerta_mensagem: "[AGUARDANDO LEITURA SERIAL] Sinal USB desconectado ou corrompido."
    };
  }

  // Hook global de dados do Arduino (B1, B2, B3, B4, B5 e conectividade serial)
  const arduinoData = useArduinoData(currentReading || null, safeHistory, lastPacketTime);
  const activeLotTelemetry = activeLotObj?.telemetry || currentReading;

  // Leituras dinâmicas em tempo real dos sensores (gas_value, flow_value, temp_value) para Atendimento Pré-Hospitalar de Emergência
  const rawGas = arduinoData.gas_value || (currentReading?.oxigenacao_limpa ? currentReading.oxigenacao_limpa * 100 : 98.0);
  const rawFlow = arduinoData.flow_value || currentReading?.vazao_l_min || 4.8;
  const rawTemp = arduinoData.temp_value || currentReading?.temperatura_c || 22.0;

  // B1: Saturação de O₂ (usa diretamente gas_value)
  const b1_val = rawGas;
  const b1_pct = Math.min(100, Math.max(0, b1_val));
  const b1_status = getStatusBadge(b1_pct, arduinoData.isConnected);

  // B2: Resistência de Fluxo (usa diretamente flow_value)
  const b2_val = rawFlow;
  const b2_pct = rawFlow > 10 ? Math.min(100, Math.max(0, rawFlow)) : Math.min(100, Math.max(0, (rawFlow / 5) * 100));
  const b2_status = getStatusBadge(b2_pct, arduinoData.isConnected);

  // B3: Estabilidade Térmica (usa diretamente temp_value)
  const b3_val = rawTemp;
  const b3_pct = rawTemp > 10 ? (rawTemp <= 40 ? (rawTemp / 40) * 100 : Math.min(100, rawTemp)) : Math.min(100, (rawTemp / 40) * 100);
  const b3_status = getStatusBadge(b3_pct, arduinoData.isConnected);

  // B4: Tempo de Meia-Vida Circulatória = (gas_value * 0.6) + (temp_value * 0.4)
  const b4_val = (rawGas * 0.6) + (rawTemp * 0.4);
  const b4_pct = Math.min(100, Math.max(0, b4_val));
  const b4_status = getStatusBadge(b4_pct, arduinoData.isConnected);

  // B5: Taxa de Extração Tissular de O₂ = (gas_value * 0.5) + (flow_value * 0.5)
  const flow_pct_for_b5 = rawFlow > 10 ? rawFlow : (rawFlow / 5) * 100;
  const b5_val = (rawGas * 0.5) + (flow_pct_for_b5 * 0.5);
  const b5_pct = Math.min(100, Math.max(0, b5_val));
  const b5_status = getStatusBadge(b5_pct, arduinoData.isConnected);

  // Leituras dinâmicas em tempo real dos sensores para Trauma e Hemorragia Grave
  // B1: Capacidade de Carga de O₂ (usa diretamente gas_value) - Barra Neon Vermelha (#ff4d4d)
  const t_b1_val = rawGas;
  const t_b1_pct = Math.min(100, Math.max(0, t_b1_val));
  const t_b1_status = getStatusBadge(t_b1_pct, arduinoData.isConnected);

  // B2: Pressão Oncótica (usa diretamente flow_value) - Barra Neon Azul (#00d8ff)
  const t_b2_val = rawFlow;
  const t_b2_pct = rawFlow > 10 ? Math.min(100, Math.max(0, rawFlow)) : Math.min(100, Math.max(0, (rawFlow / 5) * 100));
  const t_b2_status = getStatusBadge(t_b2_pct, arduinoData.isConnected);

  // B3: Permutabilidade Gasosa (usa diretamente gas_value) - Barra Neon Verde (#00ff9d)
  const t_b3_val = rawGas;
  const t_b3_pct = Math.min(100, Math.max(0, t_b3_val));
  const t_b3_status = getStatusBadge(t_b3_pct, arduinoData.isConnected);

  // B4: Resistência à Compressão Mecânica (usa diretamente flow_value) - Barra Neon Roxa (#a855f7)
  const t_b4_val = rawFlow;
  const t_b4_pct = rawFlow > 10 ? Math.min(100, Math.max(0, rawFlow)) : Math.min(100, Math.max(0, (rawFlow / 5) * 100));
  const t_b4_status = getStatusBadge(t_b4_pct, arduinoData.isConnected);

  // B5: Tamponamento Ácido-Básico = (gas_value * 0.7) + (temp_value * 0.3) - Barra Neon Amarela (#ffb703)
  const t_b5_val = (rawGas * 0.7) + (rawTemp * 0.3);
  const t_b5_pct = Math.min(100, Math.max(0, t_b5_val));
  const t_b5_status = getStatusBadge(t_b5_pct, arduinoData.isConnected);

  // Leituras dinâmicas em tempo real dos sensores para Cirurgia Cardíaca e Cardiovascular
  const temp_pct_for_card = rawTemp > 10 ? (rawTemp <= 40 ? (rawTemp / 40) * 100 : Math.min(100, rawTemp)) : Math.min(100, (rawTemp / 40) * 100);

  // B1: Compatibilidade com Perfusão Mecânica - CEC = (flow_value * 0.6) + (gas_value * 0.4) - Barra Neon Ciano (#00d8ff)
  const c_b1_val = (flow_pct_for_b5 * 0.6) + (rawGas * 0.4);
  const c_b1_pct = Math.min(100, Math.max(0, c_b1_val));
  const c_b1_status = getStatusBadge(c_b1_pct, arduinoData.isConnected);

  // B2: Tensão de Cisalhamento (usa diretamente flow_value) - Barra Neon Roxa (#a855f7)
  const c_b2_val = rawFlow;
  const c_b2_pct = rawFlow > 10 ? Math.min(100, Math.max(0, rawFlow)) : Math.min(100, Math.max(0, (rawFlow / 5) * 100));
  const c_b2_status = getStatusBadge(c_b2_pct, arduinoData.isConnected);

  // B3: Tempo de Meia-Vida Extended = (gas_value * 0.5) + (temp_value * 0.5) - Barra Neon Verde (#00ff9d)
  const c_b3_val = (rawGas * 0.5) + (temp_pct_for_card * 0.5);
  const c_b3_pct = Math.min(100, Math.max(0, c_b3_val));
  const c_b3_status = getStatusBadge(c_b3_pct, arduinoData.isConnected);

  // B4: Tamponamento de Lactato (usa diretamente gas_value) - Barra Neon Amarela (#ffb703)
  const c_b4_val = rawGas;
  const c_b4_pct = Math.min(100, Math.max(0, c_b4_val));
  const c_b4_status = getStatusBadge(c_b4_pct, arduinoData.isConnected);

  // B5: Viscosidade em Hypothermia = (flow_value * 0.6) + (temp_value * 0.4) - Barra Neon Azul-Claro (#3a86ef)
  const c_b5_val = (flow_pct_for_b5 * 0.6) + (temp_pct_for_card * 0.4);
  const c_b5_pct = Math.min(100, Math.max(0, c_b5_val));
  const c_b5_status = getStatusBadge(c_b5_pct, arduinoData.isConnected);

  // Leituras dinâmicas em tempo real dos sensores para Tratamento de Anemias Graves
  // B1: Eficiência de Liberação de O₂ - P50 (usa diretamente gas_value) - Barra Neon Verde (#00ff9d)
  const a_b1_val = rawGas;
  const a_b1_pct = Math.min(100, Math.max(0, a_b1_val));
  const a_b1_status = getStatusBadge(a_b1_pct, arduinoData.isConnected);

  // B2: Ausência de Resposta Imunogênica = (gas_value * 0.5) + (flow_value * 0.5) - Barra Neon Verde-Água (#02c39a)
  const a_b2_val = (rawGas * 0.5) + (flow_pct_for_b5 * 0.5);
  const a_b2_pct = Math.min(100, Math.max(0, a_b2_val));
  const a_b2_status = getStatusBadge(a_b2_pct, arduinoData.isConnected);

  // B3: Estabilidade Plasmática (usa diretamente flow_value) - Barra Neon Azul (#00d8ff)
  const a_b3_val = rawFlow;
  const a_b3_pct = rawFlow > 10 ? Math.min(100, Math.max(0, rawFlow)) : Math.min(100, Math.max(0, (rawFlow / 5) * 100));
  const a_b3_status = getStatusBadge(a_b3_pct, arduinoData.isConnected);

  // B4: Tolerância a Infusão Lenta (usa diretamente flow_value) - Barra Neon Amarela (#ffb703)
  const a_b4_val = rawFlow;
  const a_b4_pct = rawFlow > 10 ? Math.min(100, Math.max(0, rawFlow)) : Math.min(100, Math.max(0, (rawFlow / 5) * 100));
  const a_b4_status = getStatusBadge(a_b4_pct, arduinoData.isConnected);

  // B5: Retenção Vascular = (flow_value * 0.6) + (temp_value * 0.4) - Barra Neon Roxa (#a855f7)
  const a_b5_val = (flow_pct_for_b5 * 0.6) + (temp_pct_for_card * 0.4);
  const a_b5_pct = Math.min(100, Math.max(0, a_b5_val));
  const a_b5_status = getStatusBadge(a_b5_pct, arduinoData.isConnected);

  // Leituras dinâmicas em tempo real dos sensores para Tratamento Oncológico
  // B1: Compatibilidade com Quimioterápicos (usa diretamente gas_value) - Barra Neon Verde-Água (#02c39a)
  const o_b1_val = rawGas;
  const o_b1_pct = Math.min(100, Math.max(0, o_b1_val));
  const o_b1_status = getStatusBadge(o_b1_pct, arduinoData.isConnected);

  // B2: Proteção contra Estresse Oxidativo (usa diretamente gas_value) - Barra Neon Verde (#00ff9d)
  const o_b2_val = rawGas;
  const o_b2_pct = Math.min(100, Math.max(0, o_b2_val));
  const o_b2_status = getStatusBadge(o_b2_pct, arduinoData.isConnected);

  // B3: Permeabilidade em Microcirculação (usa diretamente flow_value) - Barra Neon Ciano (#00d8ff)
  const o_b3_val = rawFlow;
  const o_b3_pct = rawFlow > 10 ? Math.min(100, Math.max(0, rawFlow)) : Math.min(100, Math.max(0, (rawFlow / 5) * 100));
  const o_b3_status = getStatusBadge(o_b3_pct, arduinoData.isConnected);

  // B4: Estabilidade em Neutropênicos = (temp_value * 0.5) + (flow_value * 0.5) - Barra Neon Roxa (#a855f7)
  const o_b4_val = (temp_pct_for_card * 0.5) + (flow_pct_for_b5 * 0.5);
  const o_b4_pct = Math.min(100, Math.max(0, o_b4_val));
  const o_b4_status = getStatusBadge(o_b4_pct, arduinoData.isConnected);

  // B5: Índice de Purificação Molecular = (gas_value * 0.5) + (flow_value * 0.5) - Barra Neon Amarela (#ffb703)
  const o_b5_val = (rawGas * 0.5) + (flow_pct_for_b5 * 0.5);
  const o_b5_pct = Math.min(100, Math.max(0, o_b5_val));
  const o_b5_status = getStatusBadge(o_b5_pct, arduinoData.isConnected);

  // Leituras dinâmicas em tempo real dos sensores para Atendimento a Pacientes Politraumatizados
  // B1: Suporte Multiorgânico de O₂ (usa diretamente gas_value) - Barra Neon Laranja (#ff9f1c)
  const p_b1_val = rawGas;
  const p_b1_pct = Math.min(100, Math.max(0, p_b1_val));
  const p_b1_status = getStatusBadge(p_b1_pct, arduinoData.isConnected);

  // B2: Resistência à Acidose Láctica (usa diretamente gas_value) - Barra Neon Verde (#00ff9d)
  const p_b2_val = rawGas;
  const p_b2_pct = Math.min(100, Math.max(0, p_b2_val));
  const p_b2_status = getStatusBadge(p_b2_pct, arduinoData.isConnected);

  // B3: Estabilidade em Infusão Pressurizada (usa diretamente flow_value) - Barra Neon Ciano (#00d8ff)
  const p_b3_val = rawFlow;
  const p_b3_pct = rawFlow > 10 ? Math.min(100, Math.max(0, rawFlow)) : Math.min(100, Math.max(0, (rawFlow / 5) * 100));
  const p_b3_status = getStatusBadge(p_b3_pct, arduinoData.isConnected);

  // B4: Capacidade Expansora de Plasma (usa diretamente flow_value) - Barra Neon Roxa (#a855f7)
  const p_b4_val = rawFlow;
  const p_b4_pct = rawFlow > 10 ? Math.min(100, Math.max(0, rawFlow)) : Math.min(100, Math.max(0, (rawFlow / 5) * 100));
  const p_b4_status = getStatusBadge(p_b4_pct, arduinoData.isConnected);

  // B5: Integridade em Variância Térmica (usa diretamente temp_value) - Barra Neon Amarela (#ffb703)
  const p_b5_val = rawTemp;
  const p_b5_pct = rawTemp > 10 ? (rawTemp <= 40 ? (rawTemp / 40) * 100 : Math.min(100, rawTemp)) : Math.min(100, (rawTemp / 40) * 100);
  const p_b5_status = getStatusBadge(p_b5_pct, arduinoData.isConnected);

  // Leituras dinâmicas em tempo real dos sensores para Doação de Sangue
  // B1: Isenção Antigênica (Universalidade) = (gas_value * 0.5) + (flow_value * 0.5) - Barra Neon Verde (#00ff9d)
  const d_b1_val = (rawGas * 0.5) + (flow_pct_for_b5 * 0.5);
  const d_b1_pct = Math.min(100, Math.max(0, d_b1_val));
  const d_b1_status = getStatusBadge(d_b1_pct, arduinoData.isConnected);

  // B2: Purificação Biológica (usa diretamente flow_value) - Barra Neon Ciano (#02c39a)
  const d_b2_val = rawFlow;
  const d_b2_pct = rawFlow > 10 ? Math.min(100, Math.max(0, rawFlow)) : Math.min(100, Math.max(0, (rawFlow / 5) * 100));
  const d_b2_status = getStatusBadge(d_b2_pct, arduinoData.isConnected);

  // B3: Conservabilidade em Estoque (usa diretamente temp_value) - Barra Neon Azul (#00d8ff)
  const d_b3_val = rawTemp;
  const d_b3_pct = rawTemp > 10 ? (rawTemp <= 40 ? (rawTemp / 40) * 100 : Math.min(100, rawTemp)) : Math.min(100, (rawTemp / 40) * 100);
  const d_b3_status = getStatusBadge(d_b3_pct, arduinoData.isConnected);

  // B4: Estabilidade Osmótica = (flow_value * 0.5) + (temp_value * 0.5) - Barra Neon Amarela (#ffb703)
  const d_b4_val = (flow_pct_for_b5 * 0.5) + (temp_pct_for_card * 0.5);
  const d_b4_pct = Math.min(100, Math.max(0, d_b4_val));
  const d_b4_status = getStatusBadge(d_b4_pct, arduinoData.isConnected);

  // B5: Fluidez de Fracionamento (usa diretamente flow_value) - Barra Neon Roxa (#a855f7)
  const d_b5_val = rawFlow;
  const d_b5_pct = rawFlow > 10 ? Math.min(100, Math.max(0, rawFlow)) : Math.min(100, Math.max(0, (rawFlow / 5) * 100));
  const d_b5_status = getStatusBadge(d_b5_pct, arduinoData.isConnected);

  // Leituras dinâmicas em tempo real dos sensores para Coleta e Reserva de Sangue
  // B1: Longevidade de Armazenamento = (temp_value * 0.6) + (gas_value * 0.4) - Barra Neon Azul-Escuro (#3a86ef)
  const cr_b1_val = (temp_pct_for_card * 0.6) + (rawGas * 0.4);
  const cr_b1_pct = Math.min(100, Math.max(0, cr_b1_val));
  const cr_b1_status = getStatusBadge(cr_b1_pct, arduinoData.isConnected);

  // B2: Resistência à Cristalização Térmica (usa diretamente temp_value) - Barra Neon Ciano (#00d8ff)
  const cr_b2_val = rawTemp;
  const cr_b2_pct = rawTemp > 10 ? (rawTemp <= 40 ? (rawTemp / 40) * 100 : Math.min(100, rawTemp)) : Math.min(100, (rawTemp / 40) * 100);
  const cr_b2_status = getStatusBadge(cr_b2_pct, arduinoData.isConnected);

  // B3: Manutenção de pH em Estocagem (usa diretamente gas_value) - Barra Neon Verde (#00ff9d)
  const cr_b3_val = rawGas;
  const cr_b3_pct = Math.min(100, Math.max(0, cr_b3_val));
  const cr_b3_status = getStatusBadge(cr_b3_pct, arduinoData.isConnected);

  // B4: Integridade da Membrana Sintética (usa diretamente flow_value) - Barra Neon Amarela (#ffb703)
  const cr_b4_val = rawFlow;
  const cr_b4_pct = rawFlow > 10 ? Math.min(100, Math.max(0, rawFlow)) : Math.min(100, Math.max(0, (rawFlow / 5) * 100));
  const cr_b4_status = getStatusBadge(cr_b4_pct, arduinoData.isConnected);

  // B5: Reatividade Pós-Descongelamento = (temp_value * 0.5) + (gas_value * 0.5) - Barra Neon Roxa (#a855f7)
  const cr_b5_val = (temp_pct_for_card * 0.5) + (rawGas * 0.5);
  const cr_b5_pct = Math.min(100, Math.max(0, cr_b5_val));
  const cr_b5_status = getStatusBadge(cr_b5_pct, arduinoData.isConnected);

  // Leituras dinâmicas em tempo real dos sensores para Tipagem Sanguínea e Testes de Compatibilidade
  // B1: Reatividade em Prova Cruzada (Crossmatch) (usa diretamente flow_value) - Barra Neon Verde (#00ff9d)
  const tc_b1_val = rawFlow;
  const tc_b1_pct = rawFlow > 10 ? Math.min(100, Math.max(0, rawFlow)) : Math.min(100, Math.max(0, (rawFlow / 5) * 100));
  const tc_b1_status = getStatusBadge(tc_b1_pct, arduinoData.isConnected);

  // B2: Neutralidade de Anticorpos Irregulares (usa diretamente gas_value) - Barra Neon Ciano (#02c39a)
  const tc_b2_val = rawGas;
  const tc_b2_pct = Math.min(100, Math.max(0, tc_b2_val));
  const tc_b2_status = getStatusBadge(tc_b2_pct, arduinoData.isConnected);

  // B3: Fidelidade de Padrão Molecular = (flow_value * 0.5) + (gas_value * 0.5) - Barra Neon Azul (#00d8ff)
  const tc_b3_val = (flow_pct_for_b5 * 0.5) + (rawGas * 0.5);
  const tc_b3_pct = Math.min(100, Math.max(0, tc_b3_val));
  const tc_b3_status = getStatusBadge(tc_b3_pct, arduinoData.isConnected);

  // B4: Estabilidade em Painel Imuno-Hematológico (usa diretamente flow_value) - Barra Neon Roxa (#a855f7)
  const tc_b4_val = rawFlow;
  const tc_b4_pct = rawFlow > 10 ? Math.min(100, Math.max(0, rawFlow)) : Math.min(100, Math.max(0, (rawFlow / 5) * 100));
  const tc_b4_status = getStatusBadge(tc_b4_pct, arduinoData.isConnected);

  // B5: Limpidez Espectrofotométrica (usa diretamente gas_value) - Barra Neon Amarela (#ffb703)
  const tc_b5_val = rawGas;
  const tc_b5_pct = Math.min(100, Math.max(0, tc_b5_val));
  const tc_b5_status = getStatusBadge(tc_b5_pct, arduinoData.isConnected);

  const getSparkValues = (key) => {
    if (safeHistory.length === 0) {
      return [currentReading?.[key] || 0, currentReading?.[key] || 0];
    }
    return safeHistory.map(item => item?.[key] || 0);
  };

  // Se a aba for Landing Page, renderiza a tela de apresentação
  if (activeTab === 'landing') {
    return (
      <LandingPage
        onNavigate={setActiveTab}
        onStartDemo={() => {
          setSelectedLot(null);
          setActiveTab('dashboard');
        }}
      />
    );
  }

  // Apenas o Dashboard depende de um lote ativo. Previsão e Simulação de
  // Emergência são ferramentas globais e continuam disponíveis sem lote.
  if (activeTab === 'dashboard' && (!selectedLot || !activeLotObj)) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100 flex items-center justify-center sm:px-6">
        <section className="w-full max-w-5xl rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl sm:p-9">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-500/40 bg-rose-500/10 shadow-[0_0_24px_rgba(244,63,94,0.2)]">
              <FlaskConical className="h-7 w-7 text-rose-400" />
            </div>
            <p className="font-mono text-[11px] font-bold tracking-[0.22em] text-rose-400">MODO DEMONSTRAÇÃO</p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Selecione uma Finalidade Clínica para Demonstração
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Inicie um lote de exemplo com parâmetros pré-configurados ou cadastre um lote personalizado.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                className="bg-gradient-to-r from-rose-600 to-red-500 px-5 text-white shadow-[0_0_24px_rgba(244,63,94,0.35)] hover:from-rose-500 hover:to-red-400"
                onClick={openCreateLotModal}
              >
                <Plus className="mr-1.5 h-4 w-4" />
                + Criar Lote Personalizado
              </Button>
              <Button
                type="button"
                variant="outline"
                className="border-sky-500/50 bg-sky-500/10 text-sky-300 shadow-[0_0_20px_rgba(56,189,248,0.15)] hover:border-sky-400 hover:bg-sky-500/20 hover:text-sky-100"
                onClick={() => setActiveTab('emergency')}
              >
                📈 Executar Simulação de Emergência
              </Button>
            </div>
          </div>

          <div className="mt-9 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {LOTES_DEMONSTRACAO.map((demoLot) => (
              <button
                key={demoLot.id}
                type="button"
                onClick={() => handleQuickStartLot(demoLot)}
                className={`group rounded-2xl border bg-slate-950/60 p-5 text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-xl ${demoLot.accent}`}
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-2xl transition-transform duration-200 group-hover:scale-110">
                  {demoLot.icon}
                </span>
                <h2 className="mt-4 text-sm font-bold leading-5 text-slate-100">{demoLot.title}</h2>
                <p className="mt-2 text-xs leading-5 text-slate-400">{demoLot.focus}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-300">
                  Iniciar demonstração <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </button>
            ))}
          </div>
        </section>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="glass-panel border-slate-700 bg-slate-950/95 text-slate-100 sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg font-bold text-white">
                <Plus className="h-5 w-5 text-rose-500" />
                Criar Lote Personalizado
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400">
                Cadastre os dados básicos para iniciar o monitoramento.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleConfirmCreateLot} className="grid gap-4">
              {formError && <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-2 text-xs text-rose-400">{formError}</p>}
              <input value={newLotCode} disabled className="h-9 rounded-lg border border-slate-800 bg-slate-900/60 px-3 text-xs font-mono text-slate-400" />
              <input value={newLotName} onChange={(event) => setNewLotName(event.target.value)} placeholder="Nome do lote" required className="h-10 rounded-lg border border-slate-700 bg-slate-900 px-3 text-sm text-slate-100 outline-none focus:border-rose-500" />
              <select value={newLotFinalidade} onChange={(event) => setNewLotFinalidade(event.target.value)} className="h-10 rounded-lg border border-slate-700 bg-slate-900 px-3 text-sm text-slate-100 outline-none focus:border-rose-500">
                {FINALIDADES_OPCOES.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                <Button type="submit" className="bg-rose-600 hover:bg-rose-500">Criar lote</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </main>
    );
  }

  return (
    <div className={`min-h-screen bg-slate-950 flex flex-col relative text-slate-100 selection:bg-rose-500 selection:text-white ${accessibilityPreferences.hoverZoom ? 'enable-hover-zoom' : ''}`}>
      {/* Background Decorativo */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-950/20 via-slate-950 to-slate-950 pointer-events-none z-0" />

      {/* HEADER PRINCIPAL */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Logo & Marca */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('landing')}>
          <div className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-rose-700 shadow-[0_0_12px_rgba(255,42,66,0.5)]">
            <Droplets className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2 font-display">
              FLOW<span className="text-rose-500">TIFICIAL</span>
              <span className="text-[10px] bg-rose-500/10 border border-rose-500/30 text-rose-400 px-1.5 py-0.5 rounded font-mono">
                FECART 2026
              </span>
            </h1>
            <p className="text-[10px] text-slate-400 font-mono tracking-tight hidden sm:block">
              SANGUE ARTIFICIAL • IA EXPLICÁVEL & TELEMETRIA IoT
            </p>
          </div>
        </div>

        {/* Navegação entre Abas */}
        <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-xl p-1 shadow-inner">
          <button
            onClick={() => setActiveTab('landing')}
            className="px-3 py-1.5 text-xs font-medium rounded-lg transition-all text-slate-400 hover:text-slate-200 flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Apresentação</span>
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'dashboard'
                ? 'bg-rose-600/20 border border-rose-500/40 text-rose-400 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-rose-500" />
            <span>Monitor Clínico</span>
          </button>
          <button
            onClick={() => setActiveTab('forecast')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'forecast'
                ? 'bg-sky-500/20 border border-sky-500/40 text-sky-400 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Previsão Demanda</span>
          </button>
          <button
            onClick={() => setActiveTab('emergency')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'emergency'
                ? 'bg-gradient-to-r from-red-600/30 to-fuchsia-600/30 border border-rose-500/60 text-rose-300 font-semibold shadow-[0_0_15px_rgba(255,42,66,0.35)]'
                : 'text-rose-400/90 hover:text-rose-300 hover:bg-rose-950/30'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
            <span>Simulador de Urgência</span>
            <span className="hidden md:inline-block text-[9px] bg-rose-500/20 text-rose-400 border border-rose-500/30 px-1 py-0.2 rounded font-mono font-bold">
              IA
            </span>
          </button>
        </div>

        {/* Status de Conexão & Ações */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2.5 bg-slate-900/60 border border-slate-800 px-3.5 py-1.5 rounded-xl font-mono text-xs text-slate-400">
            <Clock className="w-3.5 h-3.5 text-sky-400" />
            <span>{clock}</span>
          </div>

          <div className="flex items-center gap-2.5 bg-slate-900/60 border border-slate-800/80 px-3.5 py-1.5 rounded-xl">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 animate-pulse-green"></span>
            </span>
            <div className="text-right">
              <p className="text-[9px] text-slate-400 font-mono leading-none">HARDWARE ATIVO</p>
              <p className="text-xs text-emerald-400 font-bold font-mono leading-tight">Arduino Nano</p>
            </div>
          </div>

          <QuickEntryModal onInjectReading={handleInjectReading} apiBase={API_BASE} />
        </div>
      </header>

      {isAccessibilityOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsAccessibilityOpen(false)}
            aria-hidden="true"
          />
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="accessibility-modal-title"
            className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border border-slate-800 bg-[#0B0F19] p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <p className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-rose-400">Preferências</p>
                <h2 id="accessibility-modal-title" className="mt-1 text-lg font-bold text-white">
                  Acessibilidade e Visualização
                </h2>
                <p className="mt-1 text-xs leading-5 text-slate-400">
                  Ajustes locais que preservam a estrutura dos formulários e painéis.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAccessibilityOpen(false)}
                aria-label="Fechar Preferências de Acessibilidade e Visualização"
                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-100">Tamanho do texto</p>
                    <p className="mt-0.5 text-xs leading-5 text-slate-400">Ajuste proporcional para uma leitura confortável.</p>
                  </div>
                  <div className="flex shrink-0 items-center rounded-lg border border-slate-700 bg-slate-950 p-1">
                    {[
                      ['small', 'A-'],
                      ['normal', 'Normal'],
                      ['large', 'A+'],
                    ].map(([size, label]) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setAccessibilityPreferences((current) => ({ ...current, fontSize: size }))}
                        aria-pressed={accessibilityPreferences.fontSize === size}
                        className={`rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                          accessibilityPreferences.fontSize === size
                            ? 'bg-rose-600 text-white'
                            : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <AccessibilityToggle
                icon={Contrast}
                title="Alto Contraste"
                description="Eleva a distinção entre textos, fundos e bordas."
                enabled={accessibilityPreferences.highContrast}
                onChange={() => toggleAccessibilityPreference('highContrast')}
              />
              <AccessibilityToggle
                icon={MousePointer2}
                title="Zoom no Hover (Foco)"
                description="Destaca suavemente cards interativos ao passar o cursor."
                enabled={accessibilityPreferences.hoverZoom}
                onChange={() => toggleAccessibilityPreference('hoverZoom')}
              />
              <AccessibilityToggle
                icon={Activity}
                title="Animações Reduzidas"
                description="Remove movimentos e transições não essenciais."
                enabled={accessibilityPreferences.reducedMotion}
                onChange={() => toggleAccessibilityPreference('reducedMotion')}
              />
            </div>
          </section>
        </>
      )}

      {!isAccessibilityOpen && (
        <button
          type="button"
          onClick={() => setIsAccessibilityOpen(true)}
          title="Acessibilidade e leitura dinâmica"
          aria-label="Abrir Acessibilidade e leitura dinâmica"
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full border border-rose-400/50 bg-slate-900 text-rose-300 shadow-[0_0_24px_rgba(244,63,94,0.35)] transition-all hover:scale-105 hover:bg-rose-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-2 focus:ring-offset-slate-950"
        >
          <Accessibility className="h-6 w-6" />
        </button>
      )}

      {/* ABA 1: MONITOR CLÍNICO / DASHBOARD */}
      {activeTab === 'dashboard' && (
        <main className="flex-1 max-w-[1680px] w-full mx-auto p-4 sm:p-6 z-10 grid grid-cols-1 items-stretch lg:grid-cols-12 gap-6">

          {/* COLUNA ESQUERDA (MÉTRICAS & LOTES - 5/12) */}
          <section className="lg:col-span-5 flex h-full flex-col gap-4">

            {/* Seletor de Lotes */}
            <div className="glass-panel rounded-xl p-4 flex flex-col gap-3 border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h2 className="text-xs font-bold tracking-widest text-slate-400 flex items-center gap-2">
                  <Database className="w-3.5 h-3.5 text-rose-500" />
                  LOTES DE SANGUE EM MONITORAMENTO
                </h2>
                <button
                  onClick={openCreateLotModal}
                  className="text-[10px] text-rose-400 border border-rose-500/30 hover:border-rose-500 hover:bg-rose-500/10 px-2.5 py-1 rounded-lg transition-all font-mono font-bold flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  NOVO LOTE
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {safeLots.map(l => (
                  <div key={l.id} className="relative group">
                    <button
                      onClick={() => setSelectedLot(l.id)}
                      className={`w-full p-2.5 rounded-xl border text-center font-mono transition-all ${
                        selectedLot === l.id
                          ? 'bg-slate-800/90 border-rose-500 text-rose-400 font-bold shadow-lg shadow-rose-500/10 ring-1 ring-rose-500/30'
                          : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <span className="block text-xs font-bold">{l.id}</span>
                      <span className="block text-[9px] text-slate-500 truncate mt-0.5">{l.name || 'Lote Biológico'}</span>
                      <span className="block text-[8px] text-sky-400/80 truncate mt-0.5">{l.destino || 'Fisiológico'}</span>
                    </button>

                    {safeLots.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteLot(l.id);
                        }}
                        title="Excluir lote"
                        className="absolute -top-1.5 -right-1.5 bg-rose-950 text-rose-400 hover:bg-rose-600 hover:text-white border border-rose-800/50 w-5 h-5 rounded-full text-[10px] flex items-center justify-center transition-all opacity-80 hover:opacity-100 z-20"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Grid dos Novos MetricCards do Lovable */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {isEmergenciaActive ? (
                <>
                  {/* CARD B1: SATURAÇÃO DE O₂ */}
                  <MetricCard
                    title="B1 • SATURAÇÃO DE O₂ (OXIGENAÇÃO)"
                    subtitle="Usa diretamente gas_value"
                    value={b1_val.toFixed(1)}
                    unit="%"
                    percent={b1_pct}
                    level={b1_pct >= 90 ? "success" : b1_pct >= 70 ? "warning" : "error"}
                    badgeText={b1_status.badgeText}
                    detail="Garante aporte imediato de oxigênio em quadros de trauma e choque volumétrico."
                    icon={Waves}
                    accentColor="bg-[#00ff9d]"
                    sparkline={<Sparkline data={getSparkValues('oxigenacao_limpa')} color="#00ff9d" />}
                  />

                  {/* CARD B2: RESISTÊNCIA DE FLUXO */}
                  <MetricCard
                    title="B2 • RESISTÊNCIA DE FLUXO"
                    subtitle="Usa diretamente flow_value"
                    value={b2_val.toFixed(1)}
                    unit={rawFlow > 10 ? "%" : "cP"}
                    percent={b2_pct}
                    level={b2_pct >= 90 ? "success" : b2_pct >= 70 ? "warning" : "error"}
                    badgeText={b2_status.badgeText}
                    detail="Permite rápida infusão sob pressão em acessos venosos periféricos."
                    icon={Droplets}
                    accentColor="bg-[#a855f7]"
                    sparkline={<Sparkline data={getSparkValues('viscosidade_cp')} color="#a855f7" />}
                  />

                  {/* CARD B3: ESTABILIDADE TÉRMICA */}
                  <MetricCard
                    title="B3 • ESTABILIDADE TÉRMICA"
                    subtitle="Usa diretamente temp_value"
                    value={b3_val.toFixed(1)}
                    unit="°C"
                    percent={b3_pct}
                    level={b3_pct >= 90 ? "success" : b3_pct >= 70 ? "warning" : "error"}
                    badgeText={b3_status.badgeText}
                    detail="Conserva a integridade funcional fora de refrigeração, ideal para ambulâncias."
                    icon={Thermometer}
                    accentColor="bg-[#ffb703]"
                    sparkline={<Sparkline data={getSparkValues('temperatura_c')} color="#ffb703" />}
                  />

                  {/* CARD B4: TEMPO DE MEIA-VIDA CIRCULATÓRIA */}
                  <MetricCard
                    title="B4 • TEMPO DE MEIA-VIDA CIRCULATÓRIA"
                    subtitle="Calculado via (gas_value × 0.6) + (temp_value × 0.4)"
                    value={b4_val.toFixed(1)}
                    unit="h"
                    percent={b4_pct}
                    level={b4_pct >= 90 ? "success" : b4_pct >= 70 ? "warning" : "error"}
                    badgeText={b4_status.badgeText}
                    detail="Mantém a oxigenação até que o paciente chegue ao hospital."
                    icon={Clock}
                    accentColor="bg-[#00d8ff]"
                    sparkline={<Sparkline data={getSparkValues('meia_vida_h')} color="#00d8ff" />}
                  />

                  {/* CARD B5: TAXA DE EXTRAÇÃO TISSULAR DE O₂ */}
                  <MetricCard
                    title="B5 • TAXA DE EXTRAÇÃO TISSULAR DE O₂"
                    subtitle="Calculado via (gas_value × 0.5) + (flow_value × 0.5)"
                    value={b5_val.toFixed(1)}
                    unit="%"
                    percent={b5_pct}
                    level={b5_pct >= 90 ? "success" : b5_pct >= 70 ? "warning" : "error"}
                    badgeText={b5_status.badgeText}
                    detail="Facilidade com que o oxigênio se solta do composto para ir direto aos tecidos."
                    icon={FlaskConical}
                    accentColor="bg-[#02c39a]"
                    sparkline={<Sparkline data={getSparkValues('extracao_o2_pct')} color="#02c39a" />}
                  />
                </>
              ) : isTraumaActive ? (
                <>
                  {/* CARD B1: CAPACIDADE DE CARGA DE O₂ */}
                  <MetricCard
                    title="B1 • CAPACIDADE DE CARGA DE O₂"
                    subtitle="Usa diretamente gas_value"
                    value={t_b1_val.toFixed(1)}
                    unit="%"
                    percent={t_b1_pct}
                    level={t_b1_pct >= 90 ? "success" : t_b1_pct >= 70 ? "warning" : "error"}
                    badgeText={t_b1_status.badgeText}
                    detail="Compensa rapidamente a perda massiva de volemia e glóbulos vermelhos."
                    icon={ShieldCheck}
                    accentColor="bg-[#ff4d4d]"
                    sparkline={<Sparkline data={getSparkValues('carga_o2_pct')} color="#ff4d4d" />}
                  />

                  {/* CARD B2: PRESSÃO ONCÓTICA */}
                  <MetricCard
                    title="B2 • PRESSÃO ONCÓTICA"
                    subtitle="Usa diretamente flow_value"
                    value={t_b2_val.toFixed(1)}
                    unit={rawFlow > 10 ? "%" : "cP"}
                    percent={t_b2_pct}
                    level={t_b2_pct >= 90 ? "success" : t_b2_pct >= 70 ? "warning" : "error"}
                    badgeText={t_b2_status.badgeText}
                    detail="Evita extravasamento de plasma e mantém a pressão arterial estável."
                    icon={Waves}
                    accentColor="bg-[#00d8ff]"
                    sparkline={<Sparkline data={getSparkValues('pressao_oncotica_mmhg')} color="#00d8ff" />}
                  />

                  {/* CARD B3: PERMUTABILIDADE GASOSA */}
                  <MetricCard
                    title="B3 • PERMUTABILIDADE GASOSA"
                    subtitle="Usa diretamente gas_value ajustado à curva de desaturação"
                    value={t_b3_val.toFixed(1)}
                    unit="%"
                    percent={t_b3_pct}
                    level={t_b3_pct >= 90 ? "success" : t_b3_pct >= 70 ? "warning" : "error"}
                    badgeText={t_b3_status.badgeText}
                    detail="Assegura rápida troca de O₂ e CO₂ nos alvéolos pulmonares."
                    icon={FlaskConical}
                    accentColor="bg-[#00ff9d]"
                    sparkline={<Sparkline data={getSparkValues('permutabilidade_gasosa_pct')} color="#00ff9d" />}
                  />

                  {/* CARD B4: RESISTÊNCIA À COMPRESSÃO MECÂNICA */}
                  <MetricCard
                    title="B4 • RESISTÊNCIA À COMPRESSÃO MECÂNICA"
                    subtitle="Usa diretamente flow_value sob vazão máxima"
                    value={t_b4_val.toFixed(1)}
                    unit={rawFlow > 10 ? "%" : "cP"}
                    percent={t_b4_pct}
                    level={t_b4_pct >= 90 ? "success" : t_b4_pct >= 70 ? "warning" : "error"}
                    badgeText={t_b4_status.badgeText}
                    detail="Suporta bombas de infusão rápida em ressuscitação volêmica."
                    icon={Droplets}
                    accentColor="bg-[#a855f7]"
                    sparkline={<Sparkline data={getSparkValues('resistencia_compressao_pct')} color="#a855f7" />}
                  />

                  {/* CARD B5: TAMPONAMENTO ÁCIDO-BÁSICO */}
                  <MetricCard
                    title="B5 • TAMPONAMENTO ÁCIDO-BÁSICO"
                    subtitle="Calculado via (gas_value × 0.7) + (temp_value × 0.3)"
                    value={t_b5_val.toFixed(1)}
                    unit="%"
                    percent={t_b5_pct}
                    level={t_b5_pct >= 90 ? "success" : t_b5_pct >= 70 ? "warning" : "error"}
                    badgeText={t_b5_status.badgeText}
                    detail="Previne acidose metabólica decorrente da hipoperfusão tecidual."
                    icon={Thermometer}
                    accentColor="bg-[#ffb703]"
                    sparkline={<Sparkline data={getSparkValues('tamponamento_ph')} color="#ffb703" />}
                  />
                </>
              ) : isCirurgiaCardiacaActive ? (
                <>
                  {/* CARD B1: COMPATIBILIDADE COM PERFUSÃO MECÂNICA (CEC) */}
                  <MetricCard
                    title="B1 • COMPATIBILIDADE COM PERFUSÃO MECÂNICA (CEC)"
                    subtitle="Calculado via (flow_value × 0.6) + (gas_value × 0.4)"
                    value={c_b1_val.toFixed(1)}
                    unit="%"
                    percent={c_b1_pct}
                    level={c_b1_pct >= 90 ? "success" : c_b1_pct >= 70 ? "warning" : "error"}
                    badgeText={c_b1_status.badgeText}
                    detail="Mantém a estabilidade molecular em circuitos de circulação extracorpórea."
                    icon={Waves}
                    accentColor="bg-[#00d8ff]"
                    sparkline={<Sparkline data={getSparkValues('compatibilidade_cec_pct')} color="#00d8ff" />}
                  />

                  {/* CARD B2: TENSÃO DE CISAILHAMENTO */}
                  <MetricCard
                    title="B2 • TENSÃO DE CISAILHAMENTO"
                    subtitle="Usa diretamente flow_value"
                    value={c_b2_val.toFixed(1)}
                    unit={rawFlow > 10 ? "%" : "cP"}
                    percent={c_b2_pct}
                    level={c_b2_pct >= 90 ? "success" : c_b2_pct >= 70 ? "warning" : "error"}
                    badgeText={c_b2_status.badgeText}
                    detail="Previne degradação mecânica por bombas rotativas e oxigenadores."
                    icon={ShieldCheck}
                    accentColor="bg-[#a855f7]"
                    sparkline={<Sparkline data={getSparkValues('tensao_cisalhamento_cp')} color="#a855f7" />}
                  />

                  {/* CARD B3: TEMPO DE MEIA-VIDA EXTENDED */}
                  <MetricCard
                    title="B3 • TEMPO DE MEIA-VIDA EXTENDED"
                    subtitle="Calculado via (gas_value × 0.5) + (temp_value × 0.5)"
                    value={c_b3_val.toFixed(1)}
                    unit="h"
                    percent={c_b3_pct}
                    level={c_b3_pct >= 90 ? "success" : c_b3_pct >= 70 ? "warning" : "error"}
                    badgeText={c_b3_status.badgeText}
                    detail="Suporta procedimentos cirúrgicos de longa duração sem perda funcional."
                    icon={Clock}
                    accentColor="bg-[#00ff9d]"
                    sparkline={<Sparkline data={getSparkValues('meia_vida_extended_h')} color="#00ff9d" />}
                  />

                  {/* CARD B4: TAMPONAMENTO DE LACTATO */}
                  <MetricCard
                    title="B4 • TAMPONAMENTO DE LACTATO"
                    subtitle="Usa diretamente gas_value"
                    value={c_b4_val.toFixed(1)}
                    unit="%"
                    percent={c_b4_pct}
                    level={c_b4_pct >= 90 ? "success" : c_b4_pct >= 70 ? "warning" : "error"}
                    badgeText={c_b4_status.badgeText}
                    detail="Minimiza acúmulo de metabólitos ácidos durante o clampeamento vascular."
                    icon={Droplets}
                    accentColor="bg-[#ffb703]"
                    sparkline={<Sparkline data={getSparkValues('tamponamento_lactato_ph')} color="#ffb703" />}
                  />

                  {/* CARD B5: VISCOSIDADE EM HYPOTHERMIA */}
                  <MetricCard
                    title="B5 • VISCOSIDADE EM HYPOTHERMIA"
                    subtitle="Calculado via flow_value correlacionado com a queda em temp_value"
                    value={c_b5_val.toFixed(1)}
                    unit="%"
                    percent={c_b5_pct}
                    level={c_b5_pct >= 90 ? "success" : c_b5_pct >= 70 ? "warning" : "error"}
                    badgeText={c_b5_status.badgeText}
                    detail="Preserva a fluidez hemodinâmica sob hipotermia cirúrgica induzida."
                    icon={Thermometer}
                    accentColor="bg-[#3a86ef]"
                    sparkline={<Sparkline data={getSparkValues('viscosidade_hipotermia_cp')} color="#3a86ef" />}
                  />
                </>
              ) : isAnemiaActive ? (
                <>
                  {/* CARD B1: EFICIÊNCIA DE LIBERAÇÃO DE O₂ (P50) */}
                  <MetricCard
                    title="B1 • EFICIÊNCIA DE LIBERAÇÃO DE O₂ (P50)"
                    subtitle="Usa diretamente gas_value"
                    value={a_b1_val.toFixed(1)}
                    unit="%"
                    percent={a_b1_pct}
                    level={a_b1_pct >= 90 ? "success" : a_b1_pct >= 70 ? "warning" : "error"}
                    badgeText={a_b1_status.badgeText}
                    detail="Entrega oxigênio aos tecidos mesmo em baixas concentrações circulantes."
                    icon={Waves}
                    accentColor="bg-[#00ff9d]"
                    sparkline={<Sparkline data={getSparkValues('eficiencia_p50_mmhg')} color="#00ff9d" />}
                  />

                  {/* CARD B2: AUSÊNCIA DE RESPOSTA IMUNOGÊNICA */}
                  <MetricCard
                    title="B2 • AUSÊNCIA DE RESPOSTA IMUNOGÊNICA"
                    subtitle="Calculado via (gas_value × 0.5) + (flow_value × 0.5)"
                    value={a_b2_val.toFixed(1)}
                    unit="%"
                    percent={a_b2_pct}
                    level={a_b2_pct >= 90 ? "success" : a_b2_pct >= 70 ? "warning" : "error"}
                    badgeText={a_b2_status.badgeText}
                    detail="Reduz risco de reações alérgicas ou rejeição em transfusões crônicas."
                    icon={ShieldCheck}
                    accentColor="bg-[#02c39a]"
                    sparkline={<Sparkline data={getSparkValues('ausencia_imunogenica_pct')} color="#02c39a" />}
                  />

                  {/* CARD B3: ESTABILIDADE PLASMÁTICA */}
                  <MetricCard
                    title="B3 • ESTABILIDADE PLASMÁTICA"
                    subtitle="Usa diretamente flow_value"
                    value={a_b3_val.toFixed(1)}
                    unit={rawFlow > 10 ? "%" : "cP"}
                    percent={a_b3_pct}
                    level={a_b3_pct >= 90 ? "success" : a_b3_pct >= 70 ? "warning" : "error"}
                    badgeText={a_b3_status.badgeText}
                    detail="Evita flutuações na concentração de hemoglobina sintética."
                    icon={FlaskConical}
                    accentColor="bg-[#00d8ff]"
                    sparkline={<Sparkline data={getSparkValues('estabilidade_plasmatica_pct')} color="#00d8ff" />}
                  />

                  {/* CARD B4: TOLERÂNCIA A INFUSÃO LENTA */}
                  <MetricCard
                    title="B4 • TOLERÂNCIA A INFUSÃO LENTA"
                    subtitle="Usa diretamente flow_value em baixa rotação"
                    value={a_b4_val.toFixed(1)}
                    unit={rawFlow > 10 ? "%" : "cP"}
                    percent={a_b4_pct}
                    level={a_b4_pct >= 90 ? "success" : a_b4_pct >= 70 ? "warning" : "error"}
                    badgeText={a_b4_status.badgeText}
                    detail="Ideal para esquemas de administração gradual em pacientes debilitados."
                    icon={Clock}
                    accentColor="bg-[#ffb703]"
                    sparkline={<Sparkline data={getSparkValues('tolerancia_infusao_lenta_h')} color="#ffb703" />}
                  />

                  {/* CARD B5: RETENÇÃO VASCULAR */}
                  <MetricCard
                    title="B5 • RETENÇÃO VASCULAR"
                    subtitle="Calculado via (flow_value × 0.6) + (temp_value × 0.4)"
                    value={a_b5_val.toFixed(1)}
                    unit="%"
                    percent={a_b5_pct}
                    level={a_b5_pct >= 90 ? "success" : a_b5_pct >= 70 ? "warning" : "error"}
                    badgeText={a_b5_status.badgeText}
                    detail="Impede filtração glomerular precoce, prolongando o benefício terapêutico."
                    icon={Droplets}
                    accentColor="bg-[#a855f7]"
                    sparkline={<Sparkline data={getSparkValues('retencao_vascular_h')} color="#a855f7" />}
                  />
                </>
              ) : isOncologicoActive ? (
                <>
                  {/* CARD B1: COMPATIBILIDADE COM QUIMIOTERÁPICOS */}
                  <MetricCard
                    title="B1 • COMPATIBILIDADE COM QUIMIOTERÁPICOS"
                    subtitle="Usa diretamente gas_value"
                    value={o_b1_val.toFixed(1)}
                    unit="%"
                    percent={o_b1_pct}
                    level={o_b1_pct >= 90 ? "success" : o_b1_pct >= 70 ? "warning" : "error"}
                    badgeText={o_b1_status.badgeText}
                    detail="Não reage nem degrada compostos citostáticos na corrente sanguínea."
                    icon={ShieldCheck}
                    accentColor="bg-[#02c39a]"
                    sparkline={<Sparkline data={getSparkValues('compatibilidade_quimioterapicos_pct')} color="#02c39a" />}
                  />

                  {/* CARD B2: PROTEÇÃO CONTRA ESTRESSE OXIDATIVO */}
                  <MetricCard
                    title="B2 • PROTEÇÃO CONTRA ESTRESSE OXIDATIVO"
                    subtitle="Usa diretamente gas_value"
                    value={o_b2_val.toFixed(1)}
                    unit="%"
                    percent={o_b2_pct}
                    level={o_b2_pct >= 90 ? "success" : o_b2_pct >= 70 ? "warning" : "error"}
                    badgeText={o_b2_status.badgeText}
                    detail="Neutraliza radicais livres gerados por tratamentos radioterápicos."
                    icon={FlaskConical}
                    accentColor="bg-[#00ff9d]"
                    sparkline={<Sparkline data={getSparkValues('protecao_estresse_oxidativo_pct')} color="#00ff9d" />}
                  />

                  {/* CARD B3: PERMEABILIDADE EM MICROCIRCULAÇÃO */}
                  <MetricCard
                    title="B3 • PERMEABILIDADE EM MICROCIRCULAÇÃO"
                    subtitle="Usa diretamente flow_value"
                    value={o_b3_val.toFixed(1)}
                    unit={rawFlow > 10 ? "%" : "cP"}
                    percent={o_b3_pct}
                    level={o_b3_pct >= 90 ? "success" : o_b3_pct >= 70 ? "warning" : "error"}
                    badgeText={o_b3_status.badgeText}
                    detail="Penetra redes capilares comprimidas por massas tumorais."
                    icon={Waves}
                    accentColor="bg-[#00d8ff]"
                    sparkline={<Sparkline data={getSparkValues('permeabilidade_microcirculacao_cp')} color="#00d8ff" />}
                  />

                  {/* CARD B4: ESTABILIDADE EM NEUTROPÉNICOS */}
                  <MetricCard
                    title="B4 • ESTABILIDADE EM NEUTROPÉNICOS"
                    subtitle="Calculado via (temp_value × 0.5) + (flow_value × 0.5)"
                    value={o_b4_val.toFixed(1)}
                    unit="%"
                    percent={o_b4_pct}
                    level={o_b4_pct >= 90 ? "success" : o_b4_pct >= 70 ? "warning" : "error"}
                    badgeText={o_b4_status.badgeText}
                    detail="Formulação livre de contaminantes que possam ameaçar imunodeprimidos."
                    icon={Droplets}
                    accentColor="bg-[#a855f7]"
                    sparkline={<Sparkline data={getSparkValues('estabilidade_neutropenicos_pct')} color="#a855f7" />}
                  />

                  {/* CARD B5: ÍNDICE DE PURIFICAÇÃO MOLECULAR */}
                  <MetricCard
                    title="B5 • ÍNDICE DE PURIFICAÇÃO MOLECULAR"
                    subtitle="Calculado via (gas_value × 0.5) + (flow_value × 0.5)"
                    value={o_b5_val.toFixed(1)}
                    unit="%"
                    percent={o_b5_pct}
                    level={o_b5_pct >= 90 ? "success" : o_b5_pct >= 70 ? "warning" : "error"}
                    badgeText={o_b5_status.badgeText}
                    detail="Minimiza a carga metabólica sobre fígado e rins fragilizados."
                    icon={Thermometer}
                    accentColor="bg-[#ffb703]"
                    sparkline={<Sparkline data={getSparkValues('purificacao_molecular_pct')} color="#ffb703" />}
                  />
                </>
              ) : isPolitraumatizadosActive ? (
                <>
                  {/* CARD B1: SUPORTE MULTIORGÂNICO DE O₂ */}
                  <MetricCard
                    title="B1 • SUPORTE MULTIORGÂNICO DE O₂"
                    subtitle="Usa diretamente gas_value"
                    value={p_b1_val.toFixed(1)}
                    unit="%"
                    percent={p_b1_pct}
                    level={p_b1_pct >= 90 ? "success" : p_b1_pct >= 70 ? "warning" : "error"}
                    badgeText={p_b1_status.badgeText}
                    detail="Garante perfusão simultânea de órgãos vitais em falência iminente."
                    icon={Waves}
                    accentColor="bg-[#ff9f1c]"
                    sparkline={<Sparkline data={getSparkValues('suporte_multiorganico_o2_pct')} color="#ff9f1c" />}
                  />

                  {/* CARD B2: RESISTÊNCIA À ACIDOSE LÁCTICA */}
                  <MetricCard
                    title="B2 • RESISTÊNCIA À ACIDOSE LÁCTICA"
                    subtitle="Usa diretamente gas_value"
                    value={p_b2_val.toFixed(1)}
                    unit="%"
                    percent={p_b2_pct}
                    level={p_b2_pct >= 90 ? "success" : p_b2_pct >= 70 ? "warning" : "error"}
                    badgeText={p_b2_status.badgeText}
                    detail="Mantém a capacidade de transporte gasoso mesmo em pH sanguíneo reduzido."
                    icon={FlaskConical}
                    accentColor="bg-[#00ff9d]"
                    sparkline={<Sparkline data={getSparkValues('resistencia_acidose_lactica_ph')} color="#00ff9d" />}
                  />

                  {/* CARD B3: ESTABILIDADE EM INFUSÃO PRESSURIZADA */}
                  <MetricCard
                    title="B3 • ESTABILIDADE EM INFUSÃO PRESSURIZADA"
                    subtitle="Usa diretamente flow_value"
                    value={p_b3_val.toFixed(1)}
                    unit={rawFlow > 10 ? "%" : "L/min"}
                    percent={p_b3_pct}
                    level={p_b3_pct >= 90 ? "success" : p_b3_pct >= 70 ? "warning" : "error"}
                    badgeText={p_b3_status.badgeText}
                    detail="Não sofre hemólise sintética quando injetado sob alta velocidade."
                    icon={ShieldCheck}
                    accentColor="bg-[#00d8ff]"
                    sparkline={<Sparkline data={getSparkValues('estabilidade_infusao_pressurizada_pct')} color="#00d8ff" />}
                  />

                  {/* CARD B4: CAPACIDADE EXPANSORA DE PLASMA */}
                  <MetricCard
                    title="B4 • CAPACIDADE EXPANSORA DE PLASMA"
                    subtitle="Usa diretamente flow_value"
                    value={p_b4_val.toFixed(1)}
                    unit={rawFlow > 10 ? "%" : "L/min"}
                    percent={p_b4_pct}
                    level={p_b4_pct >= 90 ? "success" : p_b4_pct >= 70 ? "warning" : "error"}
                    badgeText={p_b4_status.badgeText}
                    detail="Restabelece a pressão arterial em quadros de choque múltiplo."
                    icon={Droplets}
                    accentColor="bg-[#a855f7]"
                    sparkline={<Sparkline data={getSparkValues('capacidade_expansora_plasma_mmhg')} color="#a855f7" />}
                  />

                  {/* CARD B5: INTEGRIDADE EM VARIÂNCIA TÉRMICA */}
                  <MetricCard
                    title="B5 • INTEGRIDADE EM VARIÂNCIA TÉRMICA"
                    subtitle="Usa diretamente temp_value"
                    value={p_b5_val.toFixed(1)}
                    unit={rawTemp > 10 ? "%" : "°C"}
                    percent={p_b5_pct}
                    level={p_b5_pct >= 90 ? "success" : p_b5_pct >= 70 ? "warning" : "error"}
                    badgeText={p_b5_status.badgeText}
                    detail="Funciona adequadamente em quadros de hipotermia por trauma."
                    icon={Thermometer}
                    accentColor="bg-[#ffb703]"
                    sparkline={<Sparkline data={getSparkValues('integridade_variancia_termica_c')} color="#ffb703" />}
                  />
                </>
              ) : isDoacaoActive ? (
                <>
                  {/* CARD B1: ISENÇÃO ANTIGÊNICA (UNIVERSALIDADE) */}
                  <MetricCard
                    title="B1 • ISENÇÃO ANTIGÊNICA (UNIVERSALIDADE)"
                    subtitle="Calculado via (gas_value × 0.5) + (flow_value × 0.5)"
                    value={d_b1_val.toFixed(1)}
                    unit="%"
                    percent={d_b1_pct}
                    level={d_b1_pct >= 90 ? "success" : d_b1_pct >= 70 ? "warning" : "error"}
                    badgeText={d_b1_status.badgeText}
                    detail="Ausência de antígenos A, B e Rh, permitindo transfusão sem reação hemolítica."
                    icon={Waves}
                    accentColor="bg-[#00ff9d]"
                    sparkline={<Sparkline data={getSparkValues('isencao_antigenica_pct')} color="#00ff9d" />}
                  />

                  {/* CARD B2: PURIFICAÇÃO BIOLÓGICA */}
                  <MetricCard
                    title="B2 • PURIFICAÇÃO BIOLÓGICA"
                    subtitle="Usa diretamente flow_value"
                    value={d_b2_val.toFixed(1)}
                    unit={rawFlow > 10 ? "%" : "L/min"}
                    percent={d_b2_pct}
                    level={d_b2_pct >= 90 ? "success" : d_b2_pct >= 70 ? "warning" : "error"}
                    badgeText={d_b2_status.badgeText}
                    detail="Totalmente livre de agentes patogênicos, vírus ou bactérias."
                    icon={ShieldCheck}
                    accentColor="bg-[#02c39a]"
                    sparkline={<Sparkline data={getSparkValues('purificacao_biologica_pct')} color="#02c39a" />}
                  />

                  {/* CARD B3: CONSERVABILIDADE EM ESTOQUE */}
                  <MetricCard
                    title="B3 • CONSERVABILIDADE EM ESTOQUE"
                    subtitle="Usa diretamente temp_value"
                    value={d_b3_val.toFixed(1)}
                    unit={rawTemp > 10 ? "%" : "°C"}
                    percent={d_b3_pct}
                    level={d_b3_pct >= 90 ? "success" : d_b3_pct >= 70 ? "warning" : "error"}
                    badgeText={d_b3_status.badgeText}
                    detail="Mantém propriedades funcionais por longos períodos sob refrigeração."
                    icon={Clock}
                    accentColor="bg-[#00d8ff]"
                    sparkline={<Sparkline data={getSparkValues('conservabilidade_estoque_dias')} color="#00d8ff" />}
                  />

                  {/* CARD B4: ESTABILIDADE OSMÓTICA */}
                  <MetricCard
                    title="B4 • ESTABILIDADE OSMÓTICA"
                    subtitle="Calculado via (flow_value × 0.5) + (temp_value × 0.5)"
                    value={d_b4_val.toFixed(1)}
                    unit="%"
                    percent={d_b4_pct}
                    level={d_b4_pct >= 90 ? "success" : d_b4_pct >= 70 ? "warning" : "error"}
                    badgeText={d_b4_status.badgeText}
                    detail="Mantém o volume e a estrutura molecular estáveis na bolsa de estocagem."
                    icon={FlaskConical}
                    accentColor="bg-[#ffb703]"
                    sparkline={<Sparkline data={getSparkValues('estabilidade_osmotica_mosm')} color="#ffb703" />}
                  />

                  {/* CARD B5: FLUIDEZ DE FRACIONAMENTO */}
                  <MetricCard
                    title="B5 • FLUIDEZ DE FRACIONAMENTO"
                    subtitle="Usa diretamente flow_value"
                    value={d_b5_val.toFixed(1)}
                    unit={rawFlow > 10 ? "%" : "L/min"}
                    percent={d_b5_pct}
                    level={d_b5_pct >= 90 ? "success" : d_b5_pct >= 70 ? "warning" : "error"}
                    badgeText={d_b5_status.badgeText}
                    detail="Facilita a mistura ou divisão em alíquotas para diferentes necessidades."
                    icon={Droplets}
                    accentColor="bg-[#a855f7]"
                    sparkline={<Sparkline data={getSparkValues('fluidez_fracionamento_cp')} color="#a855f7" />}
                  />
                </>
              ) : isColetaReservaActive ? (
                <>
                  {/* CARD B1: LONGEVIDADE DE ARMAZENAMENTO */}
                  <MetricCard
                    title="B1 • LONGEVIDADE DE ARMAZENAMENTO"
                    subtitle="Calculado via (temp_value × 0.6) + (gas_value × 0.4)"
                    value={cr_b1_val.toFixed(1)}
                    unit="%"
                    percent={cr_b1_pct}
                    level={cr_b1_pct >= 90 ? "success" : cr_b1_pct >= 70 ? "warning" : "error"}
                    badgeText={cr_b1_status.badgeText}
                    detail="Formulado para suportar longos períodos em bancos de reserva sem degradação."
                    icon={Clock}
                    accentColor="bg-[#3a86ef]"
                    sparkline={<Sparkline data={getSparkValues('longevidade_armazenamento_dias')} color="#3a86ef" />}
                  />

                  {/* CARD B2: RESISTÊNCIA À CRISTALIZAÇÃO TÉRMICA */}
                  <MetricCard
                    title="B2 • RESISTÊNCIA À CRISTALIZAÇÃO TÉRMICA"
                    subtitle="Usa diretamente temp_value"
                    value={cr_b2_val.toFixed(1)}
                    unit={rawTemp > 10 ? "%" : "°C"}
                    percent={cr_b2_pct}
                    level={cr_b2_pct >= 90 ? "success" : cr_b2_pct >= 70 ? "warning" : "error"}
                    badgeText={cr_b2_status.badgeText}
                    detail="Previne danos moleculares sob congelamento ou refrigeração profunda."
                    icon={Thermometer}
                    accentColor="bg-[#00d8ff]"
                    sparkline={<Sparkline data={getSparkValues('resistencia_cristalizacao_termica_c')} color="#00d8ff" />}
                  />

                  {/* CARD B3: MANUTENÇÃO DE pH EM ESTOCAGEM */}
                  <MetricCard
                    title="B3 • MANUTENÇÃO DE pH EM ESTOCAGEM"
                    subtitle="Usa diretamente gas_value"
                    value={cr_b3_val.toFixed(1)}
                    unit="%"
                    percent={cr_b3_pct}
                    level={cr_b3_pct >= 90 ? "success" : cr_b3_pct >= 70 ? "warning" : "error"}
                    badgeText={cr_b3_status.badgeText}
                    detail="Evita a acidificação da amostra durante o tempo de reserva."
                    icon={FlaskConical}
                    accentColor="bg-[#00ff9d]"
                    sparkline={<Sparkline data={getSparkValues('manutencao_ph_estocagem')} color="#00ff9d" />}
                  />

                  {/* CARD B4: INTEGRIDADE DA MEMBRANA SINTÉTICA */}
                  <MetricCard
                    title="B4 • INTEGRIDADE DA MEMBRANA SINTÉTICA"
                    subtitle="Usa diretamente flow_value"
                    value={cr_b4_val.toFixed(1)}
                    unit={rawFlow > 10 ? "%" : "L/min"}
                    percent={cr_b4_pct}
                    level={cr_b4_pct >= 90 ? "success" : cr_b4_pct >= 70 ? "warning" : "error"}
                    badgeText={cr_b4_status.badgeText}
                    detail="Mantém a estrutura das micropartículas sem agregação ou precipitação."
                    icon={ShieldCheck}
                    accentColor="bg-[#ffb703]"
                    sparkline={<Sparkline data={getSparkValues('integridade_membrana_sintetica_pct')} color="#ffb703" />}
                  />

                  {/* CARD B5: REATIVIDADE PÓS-DESCONGELAMENTO */}
                  <MetricCard
                    title="B5 • REATIVIDADE PÓS-DESCONGELAMENTO"
                    subtitle="Calculado via (temp_value × 0.5) + (gas_value × 0.5)"
                    value={cr_b5_val.toFixed(1)}
                    unit="%"
                    percent={cr_b5_pct}
                    level={cr_b5_pct >= 90 ? "success" : cr_b5_pct >= 70 ? "warning" : "error"}
                    badgeText={cr_b5_status.badgeText}
                    detail="Retoma a capacidade total de transporte de O₂ após o aquecimento."
                    icon={Waves}
                    accentColor="bg-[#a855f7]"
                    sparkline={<Sparkline data={getSparkValues('reatividade_pos_descongelamento_pct')} color="#a855f7" />}
                  />
                </>
              ) : isTipagemCompatibilidadeActive ? (
                <>
                  {/* CARD B1: REATIVIDADE EM PROVA CRUZADA (CROSSMATCH) */}
                  <MetricCard
                    title="B1 • REATIVIDADE EM PROVA CRUZADA (CROSSMATCH)"
                    subtitle="Usa diretamente flow_value"
                    value={tc_b1_val.toFixed(1)}
                    unit={rawFlow > 10 ? "%" : "L/min"}
                    percent={tc_b1_pct}
                    level={tc_b1_pct >= 90 ? "success" : tc_b1_pct >= 70 ? "warning" : "error"}
                    badgeText={tc_b1_status.badgeText}
                    detail="Zero aglutinação em contato com soro ou plasma de qualquer receptor."
                    icon={ShieldCheck}
                    accentColor="bg-[#00ff9d]"
                    sparkline={<Sparkline data={getSparkValues('reatividade_crossmatch_pct')} color="#00ff9d" />}
                  />

                  {/* CARD B2: NEUTRALIDADE DE ANTICORPOS IRREGULARES */}
                  <MetricCard
                    title="B2 • NEUTRALIDADE DE ANTICORPOS IRREGULARES"
                    subtitle="Usa diretamente gas_value"
                    value={tc_b2_val.toFixed(1)}
                    unit="%"
                    percent={tc_b2_pct}
                    level={tc_b2_pct >= 90 ? "success" : tc_b2_pct >= 70 ? "warning" : "error"}
                    badgeText={tc_b2_status.badgeText}
                    detail="Não induz resposta imune em receptores multitransfundidos ou sensibilizados."
                    icon={Waves}
                    accentColor="bg-[#02c39a]"
                    sparkline={<Sparkline data={getSparkValues('neutralidade_anticorpos_pct')} color="#02c39a" />}
                  />

                  {/* CARD B3: FIDELIDADE DE PADRÃO MOLECULAR */}
                  <MetricCard
                    title="B3 • FIDELIDADE DE PADRÃO MOLECULAR"
                    subtitle="Calculado via (flow_value × 0.5) + (gas_value × 0.5)"
                    value={tc_b3_val.toFixed(1)}
                    unit="%"
                    percent={tc_b3_pct}
                    level={tc_b3_pct >= 90 ? "success" : tc_b3_pct >= 70 ? "warning" : "error"}
                    badgeText={tc_b3_status.badgeText}
                    detail="Resposta uniforme e previsível em testes laboratoriais automatizados."
                    icon={FlaskConical}
                    accentColor="bg-[#00d8ff]"
                    sparkline={<Sparkline data={getSparkValues('fidelidade_padrao_molecular_pct')} color="#00d8ff" />}
                  />

                  {/* CARD B4: ESTABILIDADE EM PAINEL IMUNO-HEMATOLÓGICO */}
                  <MetricCard
                    title="B4 • ESTABILIDADE EM PAINEL IMUNO-HEMATOLÓGICO"
                    subtitle="Usa diretamente flow_value"
                    value={tc_b4_val.toFixed(1)}
                    unit={rawFlow > 10 ? "%" : "L/min"}
                    percent={tc_b4_pct}
                    level={tc_b4_pct >= 90 ? "success" : tc_b4_pct >= 70 ? "warning" : "error"}
                    badgeText={tc_b4_status.badgeText}
                    detail="Mantém o comportamento inerte mesmo na presença de anticorpos raros."
                    icon={Droplets}
                    accentColor="bg-[#a855f7]"
                    sparkline={<Sparkline data={getSparkValues('estabilidade_painel_pct')} color="#a855f7" />}
                  />

                  {/* CARD B5: LIMPIDEZ SPECTROFOTOMÉTRICA */}
                  <MetricCard
                    title="B5 • LIMPIDEZ ESPECTROFOTOMÉTRICA"
                    subtitle="Usa diretamente gas_value"
                    value={tc_b5_val.toFixed(1)}
                    unit="%"
                    percent={tc_b5_pct}
                    level={tc_b5_pct >= 90 ? "success" : tc_b5_pct >= 70 ? "warning" : "error"}
                    badgeText={tc_b5_status.badgeText}
                    detail="Permite leitura óptica precisa sem interferir nos reagentes de tipagem."
                    icon={Thermometer}
                    accentColor="bg-[#ffb703]"
                    sparkline={<Sparkline data={getSparkValues('limpidez_spectrofotometrica_pct')} color="#ffb703" />}
                  />
                </>
              ) : (
                <>
                  {/* CARD 1: OXIGENAÇÃO */}
                  <MetricCard
                    title="Saturação de O₂"
                    subtitle="Transporte de oxigênio do lote"
                    value={(currentReading.oxigenacao_limpa * 100).toFixed(1)}
                    unit="%"
                    percent={currentReading.oxigenacao_limpa * 100}
                    level={currentReading.oxigenacao_limpa < 0.90 ? 'critical' : 'success'}
                    detail={currentReading.oxigenacao_limpa < 0.90 ? 'SATURAÇÃO BAIXA' : 'SpO₂ Equivalente Ideal'}
                    icon={Waves}
                    sparkline={<Sparkline data={getSparkValues('oxigenacao_limpa')} color={currentReading.oxigenacao_limpa < 0.90 ? '#ff2a42' : '#00e5a3'} />}
                  />

                  {/* CARD 2: TEMPERATURA */}
                  <MetricCard
                    title="Estabilidade Térmica"
                    subtitle="Sensor DS18B20 em bancada"
                    value={currentReading.temperatura_c.toFixed(1)}
                    unit="°C"
                    percent={Math.min(100, (currentReading.temperatura_c / 42) * 100)}
                    level={currentReading.temperatura_c > 38.0 || currentReading.temperatura_c < 35.0 ? 'critical' : currentReading.temperatura_c > 37.5 ? 'warning' : 'success'}
                    detail={currentReading.temperatura_c > 38.0 ? 'HIPERTERMIA CRÍTICA' : currentReading.temperatura_c < 35.0 ? 'HIPOTERMIA' : 'Faixa Fisiológica'}
                    icon={Thermometer}
                    sparkline={<Sparkline data={getSparkValues('temperatura_c')} color={currentReading.temperatura_c > 38.0 ? '#ff2a42' : '#f59e0b'} />}
                  />

                  {/* CARD 3: pH */}
                  <MetricCard
                    title="Potencial pH"
                    subtitle="Equilíbrio ácido-base"
                    value={currentReading.ph.toFixed(2)}
                    unit="pH"
                    percent={Math.min(100, (currentReading.ph / 8.5) * 100)}
                    level={currentReading.ph < 7.35 || currentReading.ph > 7.45 ? 'warning' : 'success'}
                    detail={currentReading.ph < 7.35 ? 'Tendência à Acidose' : currentReading.ph > 7.45 ? 'Tendência à Alcalose' : 'pH 7.40 Fisiológico'}
                    icon={FlaskConical}
                    sparkline={<Sparkline data={getSparkValues('ph')} color="#38bdf8" />}
                  />

                  {/* CARD 4: VISCOSIDADE */}
                  <MetricCard
                    title="Viscosidade"
                    subtitle="Resistência ao fluxo"
                    value={currentReading.viscosidade_cp.toFixed(1)}
                    unit="cP"
                    percent={Math.min(100, (currentReading.viscosidade_cp / 6) * 100)}
                    level={currentReading.viscosidade_cp > 5.0 ? 'critical' : currentReading.viscosidade_cp < 3.2 ? 'warning' : 'success'}
                    detail={currentReading.viscosidade_cp > 4.5 ? 'Composto Espesso' : 'Fluidez Adequada'}
                    icon={Droplets}
                    sparkline={<Sparkline data={getSparkValues('viscosidade_cp')} color="#a855f7" />}
                  />
                </>
              )}
            </div>

            {/* Status do Hardware Arduino */}
            <div className="glass-panel rounded-xl p-3.5 flex items-center justify-between bg-slate-900/40 border-slate-800">
              <div className="flex items-center gap-2.5">
                <Cpu className="w-4 h-4 text-emerald-400" />
                <div>
                  <p className="text-[10px] text-slate-400 font-mono">CONEXÃO ARDUINO SERIAL</p>
                  <p className="text-xs font-mono font-bold text-slate-200">115200 baud • {packetCount} pacotes rx</p>
                </div>
              </div>
              <span className="text-[9px] bg-slate-800 border border-slate-700 text-emerald-400 font-mono px-2.5 py-1 rounded-md font-semibold">
                DRIVER: CH340G / COM3
              </span>
            </div>

          </section>

          {/* COLUNA DIREITA (VEREDITO GERAL & CHATBOT - 7/12) */}
          <section className="lg:col-span-7 flex h-full flex-col gap-4">

            {/* Veredito Geral Semáforo */}
            <div className={`glass-panel rounded-xl p-4 flex items-center justify-between border transition-all duration-300 ${
              currentReading.status === "CRÍTICO"
                ? 'bg-rose-950/30 border-rose-500/40'
                : currentReading.status === "ALERTA"
                ? 'bg-amber-950/30 border-amber-500/40'
                : 'bg-emerald-950/20 border-emerald-500/40'
            }`}>
              <div className="flex items-center gap-3.5">
                <div className={`p-3 rounded-xl border bg-slate-950/80 ${
                  currentReading.status === "CRÍTICO" ? 'text-rose-500 border-rose-500/40 glow-crimson' :
                  currentReading.status === "ALERTA" ? 'text-amber-400 border-amber-400/40' : 'text-emerald-400 border-emerald-500/40 glow-neon'
                }`}>
                  {currentReading.status === "CRÍTICO" ? <XCircle className="w-6 h-6" /> :
                   currentReading.status === "ALERTA" ? <AlertTriangle className="w-6 h-6" /> : <CheckCircle className="w-6 h-6" />}
                </div>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400">
                    VEREDITO DO SISTEMA • LOTE {selectedLot}
                  </p>
                  <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
                    STATUS: {currentReading.status}
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                    {currentReading.alerta_mensagem}
                  </p>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-2 pr-2">
                <Button
                  onClick={() => setActiveTab('forecast')}
                  size="sm"
                  variant="outline"
                  className="gap-1.5 border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-xs text-slate-200"
                >
                  <TrendingUp className="w-3.5 h-3.5 text-sky-400" />
                  Previsão
                </Button>
              </div>
            </div>

            {/* Chatbot Conversacional com IA Explicável */}
            {isChatFullscreen && (
              <div
                className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
                onClick={() => setIsChatFullscreen(false)}
                aria-hidden="true"
              />
            )}
            <div
              className={`flex flex-col overflow-hidden shadow-2xl transition-all duration-200 ${
                isChatFullscreen
                  ? 'fixed top-1/2 left-1/2 z-[100] h-[85vh] w-[90vw] max-w-5xl -translate-x-1/2 -translate-y-1/2 rounded-xl border border-slate-700 bg-[#0B0F19]'
                  : 'relative flex-1 min-h-0 flex flex-col overflow-hidden rounded-xl border border-slate-800 bg-[#0B0F19]'
              }`}
              role={isChatFullscreen ? 'dialog' : undefined}
              aria-modal={isChatFullscreen || undefined}
              aria-label={isChatFullscreen ? 'Chat da IA Flow expandido' : undefined}
            >

              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,_transparent_1px),_linear-gradient(90deg,_rgba(255,255,255,0.01)_1px,_transparent_1px)] bg-[size:20px_20px] pointer-events-none z-0" />

              {/* Header do Chat */}
              <div className="z-10 flex-none h-12 px-4 bg-slate-900/70 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-rose-500 animate-pulse" />
                  <span className="text-xs font-bold font-mono tracking-widest text-slate-300">
                    IA FLOW
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {arduinoData.isConnected ? (
                    <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono font-bold">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      ONLINE
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-[10px] text-amber-400 border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 rounded font-mono font-bold shadow-sm">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping"></span>
                      [AGUARDANDO LEITURA SERIAL]
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsChatFullscreen((isFullscreen) => !isFullscreen)}
                    title={isChatFullscreen ? 'Fechar Chat expandido' : 'Expandir Chat'}
                    aria-label={isChatFullscreen ? 'Fechar Chat expandido' : 'Expandir Chat'}
                    className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    {isChatFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="z-10 flex-none border-b border-slate-800 bg-slate-950/80 px-4 py-2.5">
                <p className="mx-auto w-fit rounded-full border border-slate-700/50 bg-slate-800/50 px-3 py-1 text-center text-xs text-slate-400">
                  Selecione uma opção rápida abaixo para iniciar a análise
                </p>
              </div>

              {/* Mensagens do Chat */}
              <div
                ref={chatMessagesRef}
                className={`flow-chat-messages scrollbar-thin scrollbar-track-transparent scrollbar-thumb-cyan-500/30 hover:scrollbar-thumb-cyan-400/50 scrollbar-thumb-rounded-full z-10 min-h-0 overflow-y-auto px-4 pb-4 pt-4 pr-2 flex flex-col space-y-4 ${isChatFullscreen ? 'flex-1 px-5 pb-6 pt-4 sm:px-10' : 'h-[600px] flex-none'}`}
              >
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      if (msg.role === 'assistant' && msg.showAnalysisCard) {
                        setZoomedChatCard({
                          eyebrow: 'Laudo clínico ampliado',
                          title: `Laudo Clínico do Lote ${selectedLot}`,
                          summary: currentReading?.alerta_mensagem || 'Leitura de telemetria ativa para o lote selecionado.',
                          metrics: [
                            { label: 'Oxigenação', value: `${b1_val.toFixed(0)}%`, progress: Math.min(100, b1_pct), color: 'bg-emerald-400', badgeClass: 'border-emerald-400/30 bg-emerald-500/5 text-emerald-200' },
                            { label: 'Vazão', value: `${rawFlow.toFixed(1)} L/min`, progress: Math.min(100, (rawFlow / 6.5) * 100), color: 'bg-cyan-400', badgeClass: 'border-cyan-400/30 bg-cyan-500/5 text-cyan-200' },
                            { label: 'Temperatura', value: `${rawTemp.toFixed(1)}°C`, progress: Math.min(100, Math.max(0, ((rawTemp - 30) / 10) * 100)), color: 'bg-amber-400', badgeClass: 'border-amber-400/30 bg-amber-500/5 text-amber-200' },
                            { label: 'Estabilidade', value: currentReading?.status || 'ESTÁVEL', progress: currentReading?.status === 'CRÍTICO' ? 35 : currentReading?.status === 'ALERTA' ? 65 : 100, color: 'bg-purple-400', badgeClass: 'border-purple-400/30 bg-purple-500/5 text-purple-200' },
                          ],
                        });
                      }
                    }}
                    className={`flex flex-col max-w-[88%] ${msg.role === 'user' ? 'self-end items-end' : 'self-start items-start'} ${msg.showAnalysisCard ? 'cursor-zoom-in' : ''}`}
                  >
                    {msg.content && (
                      <>
                        <div
                          onClick={() => {
                            if (msg.role === 'assistant') {
                              setZoomedChatCard({
                                eyebrow: 'Resposta da IA Flow',
                                title: 'Resposta ampliada',
                                summary: msg.content,
                                metrics: [],
                              });
                            }
                          }}
                          className={`accessibility-zoom-target p-3.5 rounded-2xl text-sm leading-relaxed ${
                            msg.role === 'user'
                              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-tr-none shadow-md'
                              : 'bg-slate-900/95 text-slate-200 border border-slate-800 rounded-tl-none glow-neon-border cursor-zoom-in relative pr-11'
                          }`}
                        >
                          {msg.role === 'assistant' && <Maximize2 className="absolute right-3 top-3 h-4 w-4 text-sky-400" />}
                          <div className="whitespace-pre-line font-sans">{msg.content}</div>
                        </div>

                        <span className="text-[9px] text-slate-500 font-mono mt-1 px-1">
                          {msg.role === 'user' ? 'Visitante' : 'Flow'}
                        </span>
                      </>
                    )}

                    {msg.role === 'assistant' && msg.responseCard && (
                      <article
                        onClick={() => setZoomedChatCard(msg.responseCard)}
                        className={`mt-2.5 w-full cursor-zoom-in rounded-xl border p-4 shadow-2xl transition-transform duration-200 hover:scale-[1.01] ${msg.responseCard.conceptual ? 'border-cyan-500/30 bg-[#0F172A]' : 'border-sky-500/30 bg-slate-950/95'}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-cyan-400/30 bg-gradient-to-br from-cyan-500/30 to-purple-500/20 text-cyan-200">
                              <msg.responseCard.icon className="h-4.5 w-4.5" />
                            </span>
                            <p className="pt-1 font-mono text-[10px] font-bold uppercase tracking-widest text-cyan-300">
                              {msg.responseCard.eyebrow}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="rounded border border-cyan-400/40 bg-cyan-500/10 px-1.5 py-0.5 font-mono text-[8px] font-bold text-cyan-200">{msg.responseCard.conceptual ? 'CONCEITO CIENTÍFICO' : 'SINAL SERIAL'}</span>
                            <Maximize2 className="h-4 w-4 text-sky-400" />
                          </div>
                        </div>
                        <h4 className="mt-2 text-sm font-bold text-white">{msg.responseCard.title}</h4>
                        {msg.responseCard.conceptual ? (
                          <div className="mt-3 space-y-2.5">
                            {msg.responseCard.conceptualBlocks.map((block) => {
                              const BlockIcon = block.icon;
                              return (
                                <section key={block.title} className={`flex gap-3 rounded-xl border p-3 ${block.accent}`}>
                                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-current/30 bg-slate-950/30">
                                    <BlockIcon className="h-4 w-4" />
                                  </span>
                                  <div>
                                    <h5 className="text-[11px] font-bold text-slate-100">{block.title}</h5>
                                    <p className="mt-1 text-[11px] leading-relaxed text-slate-300">{block.text}</p>
                                  </div>
                                </section>
                              );
                            })}
                          </div>
                        ) : <>
                        <p className="mt-2 text-xs leading-relaxed text-slate-300">{msg.responseCard.summary}</p>
                        <dl className="mt-3 grid grid-cols-2 gap-2">
                          {msg.responseCard.metrics.map((metric) => {
                            const MetricIcon = metric.icon;
                            return (
                            <div key={metric.label} className="rounded-lg border border-slate-700/80 bg-slate-900/70 px-2.5 py-2">
                              <div className="flex items-center justify-between gap-1.5">
                                <span className={`flex h-6 w-6 items-center justify-center rounded-full border ${metric.iconBackground} ${metric.iconColor}`}>
                                  <MetricIcon className="h-3.5 w-3.5" />
                                </span>
                                <span className={`inline-flex items-center gap-1 rounded border px-1 py-0.5 font-mono text-[7px] ${metric.badgeClass}`}><Wifi className="h-2.5 w-2.5" />TELEMETRIA ATIVA</span>
                              </div>
                              <dt className="mt-1.5 font-mono text-[9px] uppercase tracking-wider text-slate-500">{metric.label}</dt>
                              <dd className="mt-0.5 text-[11px] font-semibold text-slate-100">{metric.value}</dd>
                              <div className="mt-2 h-1 overflow-hidden rounded-full bg-slate-800">
                                <div className={`h-full rounded-full ${metric.color}`} style={{ width: `${metric.progress}%` }} />
                              </div>
                            </div>
                            );
                          })}
                        </dl>
                        </>}
                      </article>
                    )}

                    {/* Card Estilizado Neon para Atendimento Pré-Hospitalar de Emergência (apenas no Status atual) */}
                    {msg.role === 'assistant' && msg.showAnalysisCard && isEmergenciaActive && (
                      <div className="mt-2.5 w-full bg-slate-950/95 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-3 shadow-2xl glow-neon-border">
                        {/* Título do Laudo */}
                        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                          <h4 className="text-xs font-mono font-bold tracking-wider text-slate-100 flex items-center gap-1.5 uppercase">
                            <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                            LAUDO CLÍNICO: ATENDIMENTO PRÉ-HOSPITALAR
                          </h4>
                          <span className="text-[10px] font-mono font-bold bg-emerald-500/10 border border-emerald-500/30 text-[#00ff9d] px-2 py-0.5 rounded">
                            LOTE {selectedLot}
                          </span>
                        </div>

                        {/* 5 Parâmetros com Barras Neon */}
                        <div className="flex flex-col gap-2 mt-0.5">
                          {/* B1: Saturação de O₂ */}
                          <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800/60">
                            <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                              <span className="text-slate-300 font-semibold">B1 • Saturação de O₂</span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-white font-bold font-mono">{b1_val.toFixed(1)}%</span>
                                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${b1_status.bgColor} ${b1_status.borderColor} ${b1_status.textColor}`}>
                                  {b1_status.badgeText}
                                </span>
                              </div>
                            </div>
                            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                              <div
                                className="h-full rounded-full bg-emerald-400 shadow-[0_0_8px_#00FFA3] transition-all duration-500"
                                style={{ width: `${b1_pct}%` }}
                              />
                            </div>
                          </div>

                          {/* B2: Resistência de Fluxo */}
                          <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800/60">
                            <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                              <span className="text-slate-300 font-semibold">B2 • Resistência de Fluxo</span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-white font-bold font-mono">{b2_val.toFixed(1)} {rawFlow > 10 ? "%" : "cP"}</span>
                                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${b2_status.bgColor} ${b2_status.borderColor} ${b2_status.textColor}`}>
                                  {b2_status.badgeText}
                                </span>
                              </div>
                            </div>
                            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                              <div
                                className="h-full rounded-full bg-cyan-400 shadow-[0_0_8px_#00E5FF] transition-all duration-500"
                                style={{ width: `${b2_pct}%` }}
                              />
                            </div>
                          </div>

                          {/* B3: Estabilidade Térmica */}
                          <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800/60">
                            <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                              <span className="text-slate-300 font-semibold">B3 • Estabilidade Térmica</span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-white font-bold font-mono">{b3_val.toFixed(1)} °C</span>
                                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${b3_status.bgColor} ${b3_status.borderColor} ${b3_status.textColor}`}>
                                  {b3_status.badgeText}
                                </span>
                              </div>
                            </div>
                            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                              <div
                                className="h-full rounded-full bg-amber-400 shadow-[0_0_8px_#FFB800] transition-all duration-500"
                                style={{ width: `${b3_pct}%` }}
                              />
                            </div>
                          </div>

                          {/* B4: Tempo de Meia-Vida Circulatória */}
                          <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800/60">
                            <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                              <span className="text-slate-300 font-semibold">B4 • Tempo de Meia-Vida Circulatória</span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-white font-bold font-mono">{b4_val.toFixed(1)} h</span>
                                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${b4_status.bgColor} ${b4_status.borderColor} ${b4_status.textColor}`}>
                                  {b4_status.badgeText}
                                </span>
                              </div>
                            </div>
                            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                              <div
                                className="h-full rounded-full bg-purple-400 shadow-[0_0_8px_#A855F7] transition-all duration-500"
                                style={{ width: `${b4_pct}%` }}
                              />
                            </div>
                          </div>

                          {/* B5: Taxa de Extração Tissular de O₂ */}
                          <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800/60">
                            <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                              <span className="text-slate-300 font-semibold">B5 • Taxa de Extração Tissular de O₂</span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-white font-bold font-mono">{b5_val.toFixed(1)}%</span>
                                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${b5_status.bgColor} ${b5_status.borderColor} ${b5_status.textColor}`}>
                                  {b5_status.badgeText}
                                </span>
                              </div>
                            </div>
                            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                              <div
                                className="h-full rounded-full bg-[#02c39a] shadow-[0_0_8px_#02c39a] transition-all duration-500"
                                style={{ width: `${b5_pct}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Linha Final de Conclusão */}
                        <div className="mt-1 pt-2 border-t border-slate-800/80 text-[11px] font-mono font-bold text-emerald-400 bg-emerald-950/40 p-2 rounded-lg border border-emerald-500/30 flex items-center justify-between">
                          <span>🟢 VEREDITO: Lote aprovado para atendimento pré-hospitalar.</span>
                        </div>
                      </div>
                    )}

                    {/* Card Estilizado Neon para Trauma e Hemorragia Grave (apenas no Status atual) */}
                    {msg.role === 'assistant' && msg.showAnalysisCard && isTraumaActive && (
                      <div className="mt-2.5 w-full bg-slate-950/95 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-3 shadow-2xl glow-neon-border">
                        {/* Título do Laudo */}
                        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                          <h4 className="text-xs font-mono font-bold tracking-wider text-slate-100 flex items-center gap-1.5 uppercase">
                            <Activity className="w-3.5 h-3.5 text-[#ff0055] animate-pulse" />
                            LAUDO CLÍNICO: TRAUMA E HEMORRAGIA GRAVE
                          </h4>
                          <span className="text-[10px] font-mono font-bold bg-[#ff0055]/10 border border-[#ff0055]/30 text-[#ff0055] px-2 py-0.5 rounded">
                            LOTE {selectedLot}
                          </span>
                        </div>

                        {/* 5 Parâmetros com Barras Neon */}
                        <div className="flex flex-col gap-2 mt-0.5">
                          {/* B1: Capacidade de Carga de O₂ */}
                          <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800/60">
                            <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                              <span className="text-slate-300 font-semibold">B1 • Capacidade de Carga de O₂</span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-white font-bold font-mono">{t_b1_val.toFixed(1)}%</span>
                                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${t_b1_status.bgColor} ${t_b1_status.borderColor} ${t_b1_status.textColor}`}>
                                  {t_b1_status.badgeText}
                                </span>
                              </div>
                            </div>
                            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                              <div
                                className="h-full rounded-full bg-emerald-400 shadow-[0_0_8px_#00FFA3] transition-all duration-500"
                                style={{ width: `${t_b1_pct}%` }}
                              />
                            </div>
                          </div>

                          {/* B2: Pressão Oncótica */}
                          <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800/60">
                            <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                              <span className="text-slate-300 font-semibold">B2 • Pressão Oncótica</span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-white font-bold font-mono">{t_b2_val.toFixed(1)} {rawFlow > 10 ? "%" : "cP"}</span>
                                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${t_b2_status.bgColor} ${t_b2_status.borderColor} ${t_b2_status.textColor}`}>
                                  {t_b2_status.badgeText}
                                </span>
                              </div>
                            </div>
                            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                              <div
                                className="h-full rounded-full bg-cyan-400 shadow-[0_0_8px_#00E5FF] transition-all duration-500"
                                style={{ width: `${t_b2_pct}%` }}
                              />
                            </div>
                          </div>

                          {/* B3: Permutabilidade Gasosa */}
                          <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800/60">
                            <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                              <span className="text-slate-300 font-semibold">B3 • Permutabilidade Gasosa</span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-white font-bold font-mono">{t_b3_val.toFixed(1)}%</span>
                                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${t_b3_status.bgColor} ${t_b3_status.borderColor} ${t_b3_status.textColor}`}>
                                  {t_b3_status.badgeText}
                                </span>
                              </div>
                            </div>
                            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                              <div
                                className="h-full rounded-full bg-amber-400 shadow-[0_0_8px_#FFB800] transition-all duration-500"
                                style={{ width: `${t_b3_pct}%` }}
                              />
                            </div>
                          </div>

                          {/* B4: Resistência à Compressão Mecânica */}
                          <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800/60">
                            <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                              <span className="text-slate-300 font-semibold">B4 • Resistência à Compressão Mecânica</span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-white font-bold font-mono">{t_b4_val.toFixed(1)} {rawFlow > 10 ? "%" : "cP"}</span>
                                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${t_b4_status.bgColor} ${t_b4_status.borderColor} ${t_b4_status.textColor}`}>
                                  {t_b4_status.badgeText}
                                </span>
                              </div>
                            </div>
                            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                              <div
                                className="h-full rounded-full bg-purple-400 shadow-[0_0_8px_#A855F7] transition-all duration-500"
                                style={{ width: `${t_b4_pct}%` }}
                              />
                            </div>
                          </div>

                          {/* B5: Tamponamento Ácido-Básico */}
                          <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800/60">
                            <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                              <span className="text-slate-300 font-semibold">B5 • Tamponamento Ácido-Básico</span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-white font-bold font-mono">{t_b5_val.toFixed(1)}%</span>
                                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${t_b5_status.bgColor} ${t_b5_status.borderColor} ${t_b5_status.textColor}`}>
                                  {t_b5_status.badgeText}
                                </span>
                              </div>
                            </div>
                            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                              <div
                                className="h-full rounded-full bg-[#ffb703] shadow-[0_0_8px_#ffb703] transition-all duration-500"
                                style={{ width: `${t_b5_pct}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Linha Final de Conclusão */}
                        <div className="mt-1 pt-2 border-t border-slate-800/80 text-[11px] font-mono font-bold text-emerald-400 bg-emerald-950/40 p-2 rounded-lg border border-emerald-500/30 flex items-center justify-between">
                          <span>🟢 VEREDITO: Lote aprovado para ressuscitação volêmica e controle de trauma.</span>
                        </div>
                      </div>
                    )}

                    {/* Card Estilizado Neon para Cirurgia Cardíaca e Cardiovascular (apenas no Status atual) */}
                    {msg.role === 'assistant' && msg.showAnalysisCard && isCirurgiaCardiacaActive && (
                      <div className="mt-2.5 w-full bg-slate-950/95 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-3 shadow-2xl glow-neon-border">
                        {/* Título do Laudo */}
                        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                          <h4 className="text-xs font-mono font-bold tracking-wider text-slate-100 flex items-center gap-1.5 uppercase">
                            <Activity className="w-3.5 h-3.5 text-[#00d8ff] animate-pulse" />
                            LAUDO CLÍNICO: CIRURGIA CARDIOVASCULAR (CEC)
                          </h4>
                          <span className="text-[10px] font-mono font-bold bg-[#00d8ff]/10 border border-[#00d8ff]/30 text-[#00d8ff] px-2 py-0.5 rounded">
                            LOTE {selectedLot}
                          </span>
                        </div>

                        {/* 5 Parâmetros com Barras Neon */}
                        <div className="flex flex-col gap-2 mt-0.5">
                          {/* B1: Compatibilidade Perfusão CEC */}
                          <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800/60">
                            <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                              <span className="text-slate-300 font-semibold">B1 • Compatibilidade Perfusão CEC</span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-white font-bold font-mono">{c_b1_val.toFixed(1)}%</span>
                                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${c_b1_status.bgColor} ${c_b1_status.borderColor} ${c_b1_status.textColor}`}>
                                  {c_b1_status.badgeText}
                                </span>
                              </div>
                            </div>
                            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                              <div
                                className="h-full rounded-full bg-emerald-400 shadow-[0_0_8px_#00FFA3] transition-all duration-500"
                                style={{ width: `${c_b1_pct}%` }}
                              />
                            </div>
                          </div>

                          {/* B2: Tensión de Cisalhamento */}
                          <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800/60">
                            <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                              <span className="text-slate-300 font-semibold">B2 • Tensão de Cisalhamento</span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-white font-bold font-mono">{c_b2_val.toFixed(1)} {rawFlow > 10 ? "%" : "cP"}</span>
                                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${c_b2_status.bgColor} ${c_b2_status.borderColor} ${c_b2_status.textColor}`}>
                                  {c_b2_status.badgeText}
                                </span>
                              </div>
                            </div>
                            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                              <div
                                className="h-full rounded-full bg-cyan-400 shadow-[0_0_8px_#00E5FF] transition-all duration-500"
                                style={{ width: `${c_b2_pct}%` }}
                              />
                            </div>
                          </div>

                          {/* B3: Tempo de Meia-Vida Extended */}
                          <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800/60">
                            <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                              <span className="text-slate-300 font-semibold">B3 • Tempo de Meia-Vida Extended</span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-white font-bold font-mono">{c_b3_val.toFixed(1)} h</span>
                                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${c_b3_status.bgColor} ${c_b3_status.borderColor} ${c_b3_status.textColor}`}>
                                  {c_b3_status.badgeText}
                                </span>
                              </div>
                            </div>
                            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                              <div
                                className="h-full rounded-full bg-amber-400 shadow-[0_0_8px_#FFB800] transition-all duration-500"
                                style={{ width: `${c_b3_pct}%` }}
                              />
                            </div>
                          </div>

                          {/* B4: Tamponamento de Lactato */}
                          <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800/60">
                            <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                              <span className="text-slate-300 font-semibold">B4 • Tamponamento de Lactato</span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-white font-bold font-mono">{c_b4_val.toFixed(1)}%</span>
                                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${c_b4_status.bgColor} ${c_b4_status.borderColor} ${c_b4_status.textColor}`}>
                                  {c_b4_status.badgeText}
                                </span>
                              </div>
                            </div>
                            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                              <div
                                className="h-full rounded-full bg-purple-400 shadow-[0_0_8px_#A855F7] transition-all duration-500"
                                style={{ width: `${c_b4_pct}%` }}
                              />
                            </div>
                          </div>

                          {/* B5: Viscosidade em Hipotermia */}
                          <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800/60">
                            <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                              <span className="text-slate-300 font-semibold">B5 • Viscosidade em Hipotermia</span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-white font-bold font-mono">{c_b5_val.toFixed(1)}%</span>
                                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${c_b5_status.bgColor} ${c_b5_status.borderColor} ${c_b5_status.textColor}`}>
                                  {c_b5_status.badgeText}
                                </span>
                              </div>
                            </div>
                            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                              <div
                                className="h-full rounded-full bg-[#3a86ef] shadow-[0_0_8px_#3a86ef] transition-all duration-500"
                                style={{ width: `${c_b5_pct}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Linha Final de Conclusão */}
                        <div className="mt-1 pt-2 border-t border-slate-800/80 text-[11px] font-mono font-bold text-emerald-400 bg-emerald-950/40 p-2 rounded-lg border border-emerald-500/30 flex items-center justify-between">
                          <span>🟢 VEREDITO: Lote aprovado para procedimentos cirúrgicos extracorpóreos.</span>
                        </div>
                      </div>
                    )}

                    {/* Card Estilizado Neon para Tratamento de Anemias Graves (apenas no Status atual) */}
                    {msg.role === 'assistant' && msg.showAnalysisCard && isAnemiaActive && (
                      <div className="mt-2.5 w-full bg-slate-950/95 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-3 shadow-2xl glow-neon-border">
                        {/* Título do Laudo */}
                        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                          <h4 className="text-xs font-mono font-bold tracking-wider text-slate-100 flex items-center gap-1.5 uppercase">
                            <Activity className="w-3.5 h-3.5 text-[#ffd000] animate-pulse" />
                            LAUDO CLÍNICO: TRATAMENTO DE ANEMIAS GRAVES
                          </h4>
                          <span className="text-[10px] font-mono font-bold bg-[#ffd000]/10 border border-[#ffd000]/30 text-[#ffd000] px-2 py-0.5 rounded">
                            LOTE {selectedLot}
                          </span>
                        </div>

                        {/* 5 Parâmetros com Barras Neon */}
                        <div className="flex flex-col gap-2 mt-0.5">
                          {/* B1: Eficiência de Liberação O₂ (P50) */}
                          <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800/60">
                            <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                              <span className="text-slate-300 font-semibold">B1 • Eficiência de Liberação O₂ (P50)</span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-white font-bold font-mono">{a_b1_val.toFixed(1)}%</span>
                                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${a_b1_status.bgColor} ${a_b1_status.borderColor} ${a_b1_status.textColor}`}>
                                  {a_b1_status.badgeText}
                                </span>
                              </div>
                            </div>
                            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                              <div
                                className="h-full rounded-full bg-emerald-400 shadow-[0_0_8px_#00FFA3] transition-all duration-500"
                                style={{ width: `${a_b1_pct}%` }}
                              />
                            </div>
                          </div>

                          {/* B2: Ausência de Resposta Imunogênica */}
                          <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800/60">
                            <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                              <span className="text-slate-300 font-semibold">B2 • Ausência de Resposta Imunogênica</span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-white font-bold font-mono">{a_b2_val.toFixed(1)}%</span>
                                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${a_b2_status.bgColor} ${a_b2_status.borderColor} ${a_b2_status.textColor}`}>
                                  {a_b2_status.badgeText}
                                </span>
                              </div>
                            </div>
                            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                              <div
                                className="h-full rounded-full bg-cyan-400 shadow-[0_0_8px_#00E5FF] transition-all duration-500"
                                style={{ width: `${a_b2_pct}%` }}
                              />
                            </div>
                          </div>

                          {/* B3: Estabilidade Plasmática */}
                          <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800/60">
                            <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                              <span className="text-slate-300 font-semibold">B3 • Estabilidade Plasmática</span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-white font-bold font-mono">{a_b3_val.toFixed(1)} {rawFlow > 10 ? "%" : "cP"}</span>
                                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${a_b3_status.bgColor} ${a_b3_status.borderColor} ${a_b3_status.textColor}`}>
                                  {a_b3_status.badgeText}
                                </span>
                              </div>
                            </div>
                            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                              <div
                                className="h-full rounded-full bg-amber-400 shadow-[0_0_8px_#FFB800] transition-all duration-500"
                                style={{ width: `${a_b3_pct}%` }}
                              />
                            </div>
                          </div>

                          {/* B4: Tolerância a Infusão Lenta */}
                          <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800/60">
                            <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                              <span className="text-slate-300 font-semibold">B4 • Tolerância a Infusão Lenta</span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-white font-bold font-mono">{a_b4_val.toFixed(1)} {rawFlow > 10 ? "%" : "cP"}</span>
                                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${a_b4_status.bgColor} ${a_b4_status.borderColor} ${a_b4_status.textColor}`}>
                                  {a_b4_status.badgeText}
                                </span>
                              </div>
                            </div>
                            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                              <div
                                className="h-full rounded-full bg-purple-400 shadow-[0_0_8px_#A855F7] transition-all duration-500"
                                style={{ width: `${a_b4_pct}%` }}
                              />
                            </div>
                          </div>

                          {/* B5: Retenção Vascular */}
                          <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800/60">
                            <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                              <span className="text-slate-300 font-semibold">B5 • Retenção Vascular</span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-white font-bold font-mono">{a_b5_val.toFixed(1)}%</span>
                                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${a_b5_status.bgColor} ${a_b5_status.borderColor} ${a_b5_status.textColor}`}>
                                  {a_b5_status.badgeText}
                                </span>
                              </div>
                            </div>
                            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                              <div
                                className="h-full rounded-full bg-[#a855f7] shadow-[0_0_8px_#a855f7] transition-all duration-500"
                                style={{ width: `${a_b5_pct}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Linha Final de Conclusão */}
                        <div className="mt-1 pt-2 border-t border-slate-800/80 text-[11px] font-mono font-bold text-emerald-400 bg-emerald-950/40 p-2 rounded-lg border border-emerald-500/30 flex items-center justify-between">
                          <span>🟢 VEREDITO: Lote aprovado para suporte transfusional crônico e anemia severa.</span>
                        </div>
                      </div>
                    )}

                    {/* Card Estilizado Neon para Tratamento Oncológico (apenas no Status atual) */}
                    {msg.role === 'assistant' && msg.showAnalysisCard && isOncologicoActive && (
                      <div className="mt-2.5 w-full bg-slate-950/95 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-3 shadow-2xl glow-neon-border">
                        {/* Título do Laudo */}
                        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                          <h4 className="text-xs font-mono font-bold tracking-wider text-slate-100 flex items-center gap-1.5 uppercase">
                            <Activity className="w-3.5 h-3.5 text-[#c084fc] animate-pulse" />
                            LAUDO CLÍNICO: SUPORTE ONCOLÓGICO
                          </h4>
                          <span className="text-[10px] font-mono font-bold bg-[#c084fc]/10 border border-[#c084fc]/30 text-[#c084fc] px-2 py-0.5 rounded">
                            LOTE {selectedLot}
                          </span>
                        </div>

                        {/* 5 Parâmetros com Barras Neon */}
                        <div className="flex flex-col gap-2 mt-0.5">
                          {/* B1: Compatibilidade Quimioterápica */}
                          <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800/60">
                            <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                              <span className="text-slate-300 font-semibold">B1 • Compatibilidade Quimioterápica</span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-white font-bold font-mono">{o_b1_val.toFixed(1)}%</span>
                                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${o_b1_status.bgColor} ${o_b1_status.borderColor} ${o_b1_status.textColor}`}>
                                  {o_b1_status.badgeText}
                                </span>
                              </div>
                            </div>
                            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                              <div
                                className="h-full rounded-full bg-emerald-400 shadow-[0_0_8px_#00FFA3] transition-all duration-500"
                                style={{ width: `${o_b1_pct}%` }}
                              />
                            </div>
                          </div>

                          {/* B2: Proteção Estresse Oxidativo */}
                          <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800/60">
                            <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                              <span className="text-slate-300 font-semibold">B2 • Proteção Estresse Oxidativo</span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-white font-bold font-mono">{o_b2_val.toFixed(1)}%</span>
                                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${o_b2_status.bgColor} ${o_b2_status.borderColor} ${o_b2_status.textColor}`}>
                                  {o_b2_status.badgeText}
                                </span>
                              </div>
                            </div>
                            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                              <div
                                className="h-full rounded-full bg-cyan-400 shadow-[0_0_8px_#00E5FF] transition-all duration-500"
                                style={{ width: `${o_b2_pct}%` }}
                              />
                            </div>
                          </div>

                          {/* B3: Permeabilidade Microcirculação */}
                          <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800/60">
                            <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                              <span className="text-slate-300 font-semibold">B3 • Permeabilidade Microcirculação</span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-white font-bold font-mono">{o_b3_val.toFixed(1)} {rawFlow > 10 ? "%" : "cP"}</span>
                                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${o_b3_status.bgColor} ${o_b3_status.borderColor} ${o_b3_status.textColor}`}>
                                  {o_b3_status.badgeText}
                                </span>
                              </div>
                            </div>
                            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                              <div
                                className="h-full rounded-full bg-amber-400 shadow-[0_0_8px_#FFB800] transition-all duration-500"
                                style={{ width: `${o_b3_pct}%` }}
                              />
                            </div>
                          </div>

                          {/* B4: Estabilidade Neutropênica */}
                          <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800/60">
                            <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                              <span className="text-slate-300 font-semibold">B4 • Estabilidade Neutropênica</span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-white font-bold font-mono">{o_b4_val.toFixed(1)}%</span>
                                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${o_b4_status.bgColor} ${o_b4_status.borderColor} ${o_b4_status.textColor}`}>
                                  {o_b4_status.badgeText}
                                </span>
                              </div>
                            </div>
                            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                              <div
                                className="h-full rounded-full bg-purple-400 shadow-[0_0_8px_#A855F7] transition-all duration-500"
                                style={{ width: `${o_b4_pct}%` }}
                              />
                            </div>
                          </div>

                          {/* B5: Índice Purificação Molecular */}
                          <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800/60">
                            <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                              <span className="text-slate-300 font-semibold">B5 • Índice Purificação Molecular</span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-white font-bold font-mono">{o_b5_val.toFixed(1)}%</span>
                                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${o_b5_status.bgColor} ${o_b5_status.borderColor} ${o_b5_status.textColor}`}>
                                  {o_b5_status.badgeText}
                                </span>
                              </div>
                            </div>
                            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                              <div
                                className="h-full rounded-full bg-[#ffb703] shadow-[0_0_8px_#ffb703] transition-all duration-500"
                                style={{ width: `${o_b5_pct}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Linha Final de Conclusão */}
                        <div className="mt-1 pt-2 border-t border-slate-800/80 text-[11px] font-mono font-bold text-emerald-400 bg-emerald-950/40 p-2 rounded-lg border border-emerald-500/30 flex items-center justify-between">
                          <span>🟢 VEREDITO: Lote aprovado para administração concomitantemente a terapias oncológicas.</span>
                        </div>
                      </div>
                    )}

                    {/* Card Estilizado Neon para Atendimento a Pacientes Politraumatizados (apenas no Status atual) */}
                    {msg.role === 'assistant' && msg.showAnalysisCard && isPolitraumatizadosActive && (
                      <div className="mt-2.5 w-full bg-slate-950/95 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-3 shadow-2xl glow-neon-border">
                        {/* Título do Laudo */}
                        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                          <h4 className="text-xs font-mono font-bold tracking-wider text-slate-100 flex items-center gap-1.5 uppercase">
                            <Activity className="w-3.5 h-3.5 text-[#ff9f1c] animate-pulse" />
                            LAUDO CLÍNICO: PACIENTES POLITRAUMATIZADOS
                          </h4>
                          <span className="text-[10px] font-mono font-bold bg-[#ff9f1c]/10 border border-[#ff9f1c]/30 text-[#ff9f1c] px-2 py-0.5 rounded">
                            LOTE {selectedLot}
                          </span>
                        </div>

                        {/* 5 Parâmetros com Barras Neon */}
                        <div className="flex flex-col gap-2 mt-0.5">
                          {/* B1: Suporte Multiorgânico de O₂ */}
                          <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800/60">
                            <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                              <span className="text-slate-300 font-semibold">B1 • Suporte Multiorgânico de O₂</span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-white font-bold font-mono">{p_b1_val.toFixed(1)}%</span>
                                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${p_b1_status.bgColor} ${p_b1_status.borderColor} ${p_b1_status.textColor}`}>
                                  {p_b1_status.badgeText}
                                </span>
                              </div>
                            </div>
                            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                              <div
                                className="h-full rounded-full bg-emerald-400 shadow-[0_0_8px_#00FFA3] transition-all duration-500"
                                style={{ width: `${p_b1_pct}%` }}
                              />
                            </div>
                          </div>

                          {/* B2: Resistência à Acidose Láctica */}
                          <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800/60">
                            <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                              <span className="text-slate-300 font-semibold">B2 • Resistência à Acidose Láctica</span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-white font-bold font-mono">{p_b2_val.toFixed(1)}%</span>
                                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${p_b2_status.bgColor} ${p_b2_status.borderColor} ${p_b2_status.textColor}`}>
                                  {p_b2_status.badgeText}
                                </span>
                              </div>
                            </div>
                            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                              <div
                                className="h-full rounded-full bg-cyan-400 shadow-[0_0_8px_#00E5FF] transition-all duration-500"
                                style={{ width: `${p_b2_pct}%` }}
                              />
                            </div>
                          </div>

                          {/* B3: Estabilidade Infusão Pressurizada */}
                          <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800/60">
                            <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                              <span className="text-slate-300 font-semibold">B3 • Estabilidade Infusão Pressurizada</span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-white font-bold font-mono">{p_b3_val.toFixed(1)}%</span>
                                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${p_b3_status.bgColor} ${p_b3_status.borderColor} ${p_b3_status.textColor}`}>
                                  {p_b3_status.badgeText}
                                </span>
                              </div>
                            </div>
                            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                              <div
                                className="h-full rounded-full bg-amber-400 shadow-[0_0_8px_#FFB800] transition-all duration-500"
                                style={{ width: `${p_b3_pct}%` }}
                              />
                            </div>
                          </div>

                          {/* B4: Capacidade Expansora de Plasma */}
                          <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800/60">
                            <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                              <span className="text-slate-300 font-semibold">B4 • Capacidade Expansora de Plasma</span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-white font-bold font-mono">{p_b4_val.toFixed(1)}%</span>
                                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${p_b4_status.bgColor} ${p_b4_status.borderColor} ${p_b4_status.textColor}`}>
                                  {p_b4_status.badgeText}
                                </span>
                              </div>
                            </div>
                            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                              <div
                                className="h-full rounded-full bg-purple-400 shadow-[0_0_8px_#A855F7] transition-all duration-500"
                                style={{ width: `${p_b4_pct}%` }}
                              />
                            </div>
                          </div>

                          {/* B5: Integridade em Variância Térmica */}
                          <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800/60">
                            <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                              <span className="text-slate-300 font-semibold">B5 • Integridade em Variância Térmica</span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-white font-bold font-mono">{p_b5_val.toFixed(1)}%</span>
                                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${p_b5_status.bgColor} ${p_b5_status.borderColor} ${p_b5_status.textColor}`}>
                                  {p_b5_status.badgeText}
                                </span>
                              </div>
                            </div>
                            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                              <div
                                className="h-full rounded-full bg-[#ffb703] shadow-[0_0_8px_#ffb703] transition-all duration-500"
                                style={{ width: `${p_b5_pct}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Linha Final de Conclusão */}
                        <div className="mt-1 pt-2 border-t border-slate-800/80 text-[11px] font-mono font-bold text-emerald-400 bg-emerald-950/40 p-2 rounded-lg border border-emerald-500/30 flex items-center justify-between">
                          <span>🟢 VEREDITO: Lote aprovado para choque múltiplo e politrauma crítico.</span>
                        </div>
                      </div>
                    )}

                    {/* Card Estilizado Neon para Doação de Sangue (apenas no Status atual) */}
                    {msg.role === 'assistant' && msg.showAnalysisCard && isDoacaoActive && (
                      <div className="mt-2.5 w-full bg-slate-950/95 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-3 shadow-2xl glow-neon-border">
                        {/* Título do Laudo */}
                        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                          <h4 className="text-xs font-mono font-bold tracking-wider text-slate-100 flex items-center gap-1.5 uppercase">
                            <Activity className="w-3.5 h-3.5 text-[#00ff9d] animate-pulse" />
                            LAUDO CLÍNICO: DOAÇÃO E PROCESSAMENTO DE SANGUE
                          </h4>
                          <span className="text-[10px] font-mono font-bold bg-[#00ff9d]/10 border border-[#00ff9d]/30 text-[#00ff9d] px-2 py-0.5 rounded">
                            LOTE {selectedLot}
                          </span>
                        </div>

                        {/* 5 Parâmetros com Barras Neon */}
                        <div className="flex flex-col gap-2 mt-0.5">
                          {/* B1: Isenção Antigênica Universal */}
                          <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800/60">
                            <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                              <span className="text-slate-300 font-semibold">B1 • Isenção Antigênica (Universalidade)</span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-white font-bold font-mono">{d_b1_val.toFixed(1)}%</span>
                                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${d_b1_status.bgColor} ${d_b1_status.borderColor} ${d_b1_status.textColor}`}>
                                  {d_b1_status.badgeText}
                                </span>
                              </div>
                            </div>
                            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                              <div
                                className="h-full rounded-full bg-emerald-400 shadow-[0_0_8px_#00FFA3] transition-all duration-500"
                                style={{ width: `${d_b1_pct}%` }}
                              />
                            </div>
                          </div>

                          {/* B2: Purificação Biológica */}
                          <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800/60">
                            <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                              <span className="text-slate-300 font-semibold">B2 • Purificação Biológica</span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-white font-bold font-mono">{d_b2_val.toFixed(1)}%</span>
                                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${d_b2_status.bgColor} ${d_b2_status.borderColor} ${d_b2_status.textColor}`}>
                                  {d_b2_status.badgeText}
                                </span>
                              </div>
                            </div>
                            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                              <div
                                className="h-full rounded-full bg-cyan-400 shadow-[0_0_8px_#00E5FF] transition-all duration-500"
                                style={{ width: `${d_b2_pct}%` }}
                              />
                            </div>
                          </div>

                          {/* B3: Conservabilidade em Estoque */}
                          <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800/60">
                            <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                              <span className="text-slate-300 font-semibold">B3 • Conservabilidade em Estoque</span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-white font-bold font-mono">{d_b3_val.toFixed(1)}%</span>
                                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${d_b3_status.bgColor} ${d_b3_status.borderColor} ${d_b3_status.textColor}`}>
                                  {d_b3_status.badgeText}
                                </span>
                              </div>
                            </div>
                            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                              <div
                                className="h-full rounded-full bg-amber-400 shadow-[0_0_8px_#FFB800] transition-all duration-500"
                                style={{ width: `${d_b3_pct}%` }}
                              />
                            </div>
                          </div>

                          {/* B4: Estabilidade Osmótica */}
                          <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800/60">
                            <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                              <span className="text-slate-300 font-semibold">B4 • Estabilidade Osmótica</span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-white font-bold font-mono">{d_b4_val.toFixed(1)}%</span>
                                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${d_b4_status.bgColor} ${d_b4_status.borderColor} ${d_b4_status.textColor}`}>
                                  {d_b4_status.badgeText}
                                </span>
                              </div>
                            </div>
                            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                              <div
                                className="h-full rounded-full bg-purple-400 shadow-[0_0_8px_#A855F7] transition-all duration-500"
                                style={{ width: `${d_b4_pct}%` }}
                              />
                            </div>
                          </div>

                          {/* B5: Fluidez de Fracionamento */}
                          <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800/60">
                            <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                              <span className="text-slate-300 font-semibold">B5 • Fluidez de Fracionamento</span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-white font-bold font-mono">{d_b5_val.toFixed(1)}%</span>
                                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${d_b5_status.bgColor} ${d_b5_status.borderColor} ${d_b5_status.textColor}`}>
                                  {d_b5_status.badgeText}
                                </span>
                              </div>
                            </div>
                            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                              <div
                                className="h-full rounded-full bg-[#a855f7] shadow-[0_0_8px_#a855f7] transition-all duration-500"
                                style={{ width: `${d_b5_pct}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Linha Final de Conclusão */}
                        <div className="mt-1 pt-2 border-t border-slate-800/80 text-[11px] font-mono font-bold text-emerald-400 bg-emerald-950/40 p-2 rounded-lg border border-emerald-500/30 flex items-center justify-between">
                          <span>🟢 VEREDITO: Lote universalmente compatível e liberado para distribuição.</span>
                        </div>
                      </div>
                    )}

                    {/* Card Estilizado Neon para Coleta e Reserva de Sangue (apenas no Status atual) */}
                    {msg.role === 'assistant' && msg.showAnalysisCard && isColetaReservaActive && (
                      <div className="mt-2.5 w-full bg-slate-950/95 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-3 shadow-2xl glow-neon-border">
                        {/* Título do Laudo */}
                        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                          <h4 className="text-xs font-mono font-bold tracking-wider text-slate-100 flex items-center gap-1.5 uppercase">
                            <Activity className="w-3.5 h-3.5 text-[#3a86ef] animate-pulse" />
                            LAUDO CLÍNICO: BANCO DE RESERVA E ARMAZENAMENTO
                          </h4>
                          <span className="text-[10px] font-mono font-bold bg-[#3a86ef]/10 border border-[#3a86ef]/30 text-[#3a86ef] px-2 py-0.5 rounded">
                            LOTE {selectedLot}
                          </span>
                        </div>

                        {/* 5 Parâmetros com Barras Neon */}
                        <div className="flex flex-col gap-2 mt-0.5">
                          {/* B1: Longevidade de Armazenamento */}
                          <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800/60">
                            <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                              <span className="text-slate-300 font-semibold">B1 • Longevidade de Armazenamento</span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-white font-bold font-mono">{cr_b1_val.toFixed(1)}%</span>
                                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${cr_b1_status.bgColor} ${cr_b1_status.borderColor} ${cr_b1_status.textColor}`}>
                                  {cr_b1_status.badgeText}
                                </span>
                              </div>
                            </div>
                            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                              <div
                                className="h-full rounded-full bg-emerald-400 shadow-[0_0_8px_#00FFA3] transition-all duration-500"
                                style={{ width: `${cr_b1_pct}%` }}
                              />
                            </div>
                          </div>

                          {/* B2: Resistência à Cristalização Térmica */}
                          <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800/60">
                            <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                              <span className="text-slate-300 font-semibold">B2 • Resistência à Cristalização Térmica</span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-white font-bold font-mono">{cr_b2_val.toFixed(1)}%</span>
                                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${cr_b2_status.bgColor} ${cr_b2_status.borderColor} ${cr_b2_status.textColor}`}>
                                  {cr_b2_status.badgeText}
                                </span>
                              </div>
                            </div>
                            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                              <div
                                className="h-full rounded-full bg-cyan-400 shadow-[0_0_8px_#00E5FF] transition-all duration-500"
                                style={{ width: `${cr_b2_pct}%` }}
                              />
                            </div>
                          </div>

                          {/* B3: Manutenção de pH em Estocagem */}
                          <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800/60">
                            <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                              <span className="text-slate-300 font-semibold">B3 • Manutenção de pH em Estocagem</span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-white font-bold font-mono">{cr_b3_val.toFixed(1)}%</span>
                                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${cr_b3_status.bgColor} ${cr_b3_status.borderColor} ${cr_b3_status.textColor}`}>
                                  {cr_b3_status.badgeText}
                                </span>
                              </div>
                            </div>
                            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                              <div
                                className="h-full rounded-full bg-amber-400 shadow-[0_0_8px_#FFB800] transition-all duration-500"
                                style={{ width: `${cr_b3_pct}%` }}
                              />
                            </div>
                          </div>

                          {/* B4: Integridade da Membrana Sintética */}
                          <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800/60">
                            <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                              <span className="text-slate-300 font-semibold">B4 • Integridade da Membrana Sintética</span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-white font-bold font-mono">{cr_b4_val.toFixed(1)}%</span>
                                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${cr_b4_status.bgColor} ${cr_b4_status.borderColor} ${cr_b4_status.textColor}`}>
                                  {cr_b4_status.badgeText}
                                </span>
                              </div>
                            </div>
                            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                              <div
                                className="h-full rounded-full bg-purple-400 shadow-[0_0_8px_#A855F7] transition-all duration-500"
                                style={{ width: `${cr_b4_pct}%` }}
                              />
                            </div>
                          </div>

                          {/* B5: Reatividade Pós-Descongelamento */}
                          <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800/60">
                            <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                              <span className="text-slate-300 font-semibold">B5 • Reatividade Pós-Descongelamento</span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-white font-bold font-mono">{cr_b5_val.toFixed(1)}%</span>
                                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${cr_b5_status.bgColor} ${cr_b5_status.borderColor} ${cr_b5_status.textColor}`}>
                                  {cr_b5_status.badgeText}
                                </span>
                              </div>
                            </div>
                            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                              <div
                                className="h-full rounded-full bg-[#a855f7] shadow-[0_0_8px_#a855f7] transition-all duration-500"
                                style={{ width: `${cr_b5_pct}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Linha Final de Conclusão */}
                        <div className="mt-1 pt-2 border-t border-slate-800/80 text-[11px] font-mono font-bold text-emerald-400 bg-emerald-950/40 p-2 rounded-lg border border-emerald-500/30 flex items-center justify-between">
                          <span>🟢 VEREDITO: Lote apto para estocagem de longa duração em banco de sangue.</span>
                        </div>
                      </div>
                    )}

                    {/* Card Estilizado Neon para Tipagem Sanguínea e Testes de Compatibilidade (apenas no Status atual) */}
                    {msg.role === 'assistant' && msg.showAnalysisCard && isTipagemCompatibilidadeActive && (
                      <div className="mt-2.5 w-full bg-slate-950/95 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-3 shadow-2xl glow-neon-border">
                        {/* Título do Laudo */}
                        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                          <h4 className="text-xs font-mono font-bold tracking-wider text-slate-100 flex items-center gap-1.5 uppercase">
                            <Activity className="w-3.5 h-3.5 text-[#00ff9d] animate-pulse" />
                            LAUDO CLÍNICO: TIPAGEM E TESTES DE COMPATIBILIDADE
                          </h4>
                          <span className="text-[10px] font-mono font-bold bg-[#00ff9d]/10 border border-[#00ff9d]/30 text-[#00ff9d] px-2 py-0.5 rounded">
                            LOTE {selectedLot}
                          </span>
                        </div>

                        {/* 5 Parâmetros com Barras Neon */}
                        <div className="flex flex-col gap-2 mt-0.5">
                          {/* B1: Reatividade em Prova Cruzada (Crossmatch) */}
                          <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800/60">
                            <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                              <span className="text-slate-300 font-semibold">B1 • Reatividade em Prova Cruzada (Crossmatch)</span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-white font-bold font-mono">{tc_b1_val.toFixed(1)}%</span>
                                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${tc_b1_status.bgColor} ${tc_b1_status.borderColor} ${tc_b1_status.textColor}`}>
                                  {tc_b1_status.badgeText}
                                </span>
                              </div>
                            </div>
                            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                              <div
                                className="h-full rounded-full bg-emerald-400 shadow-[0_0_8px_#00FFA3] transition-all duration-500"
                                style={{ width: `${tc_b1_pct}%` }}
                              />
                            </div>
                          </div>

                          {/* B2: Neutralidade de Anticorpos Irregulares */}
                          <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800/60">
                            <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                              <span className="text-slate-300 font-semibold">B2 • Neutralidade de Anticorpos Irregulares</span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-white font-bold font-mono">{tc_b2_val.toFixed(1)}%</span>
                                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${tc_b2_status.bgColor} ${tc_b2_status.borderColor} ${tc_b2_status.textColor}`}>
                                  {tc_b2_status.badgeText}
                                </span>
                              </div>
                            </div>
                            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                              <div
                                className="h-full rounded-full bg-cyan-400 shadow-[0_0_8px_#00E5FF] transition-all duration-500"
                                style={{ width: `${tc_b2_pct}%` }}
                              />
                            </div>
                          </div>

                          {/* B3: Fidelidade de Padrão Molecular */}
                          <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800/60">
                            <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                              <span className="text-slate-300 font-semibold">B3 • Fidelidade de Padrão Molecular</span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-white font-bold font-mono">{tc_b3_val.toFixed(1)}%</span>
                                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${tc_b3_status.bgColor} ${tc_b3_status.borderColor} ${tc_b3_status.textColor}`}>
                                  {tc_b3_status.badgeText}
                                </span>
                              </div>
                            </div>
                            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                              <div
                                className="h-full rounded-full bg-amber-400 shadow-[0_0_8px_#FFB800] transition-all duration-500"
                                style={{ width: `${tc_b3_pct}%` }}
                              />
                            </div>
                          </div>

                          {/* B4: Estabilidade em Painel Imuno-Hematológico */}
                          <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800/60">
                            <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                              <span className="text-slate-300 font-semibold">B4 • Estabilidade em Painel Imuno-Hematológico</span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-white font-bold font-mono">{tc_b4_val.toFixed(1)}%</span>
                                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${tc_b4_status.bgColor} ${tc_b4_status.borderColor} ${tc_b4_status.textColor}`}>
                                  {tc_b4_status.badgeText}
                                </span>
                              </div>
                            </div>
                            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                              <div
                                className="h-full rounded-full bg-purple-400 shadow-[0_0_8px_#A855F7] transition-all duration-500"
                                style={{ width: `${tc_b4_pct}%` }}
                              />
                            </div>
                          </div>

                          {/* B5: Limpidez Espectrofotométrica */}
                          <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800/60">
                            <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                              <span className="text-slate-300 font-semibold">B5 • Limpidez Espectrofotométrica</span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-white font-bold font-mono">{tc_b5_val.toFixed(1)}%</span>
                                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${tc_b5_status.bgColor} ${tc_b5_status.borderColor} ${tc_b5_status.textColor}`}>
                                  {tc_b5_status.badgeText}
                                </span>
                              </div>
                            </div>
                            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                              <div
                                className="h-full rounded-full bg-[#ffb703] shadow-[0_0_8px_#ffb703] transition-all duration-500"
                                style={{ width: `${tc_b5_pct}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Linha Final de Conclusão */}
                        <div className="mt-1 pt-2 border-t border-slate-800/80 text-[11px] font-mono font-bold text-emerald-400 bg-emerald-950/40 p-2 rounded-lg border border-emerald-500/30 flex items-center justify-between">
                          <span>🟢 VEREDITO: Lote validado sem interferências imunológicas em testes de laboratório.</span>
                        </div>
                      </div>
                    )}

                    {/* Bloco de IA Explicável Integrado */}
                    {msg.role === 'assistant' && msg.showAnalysisCard && msg.explicabilidade && (!isEmergenciaActive && !isTraumaActive && !isCirurgiaCardiacaActive && !isAnemiaActive && !isOncologicoActive && !isPolitraumatizadosActive && !isDoacaoActive && !isColetaReservaActive && !isTipagemCompatibilidadeActive) && (
                      <div className="mt-2.5 w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-2.5">
                        <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                          <span className="text-[10px] font-mono font-bold tracking-wider text-slate-300 flex items-center gap-1.5">
                            <Cpu className="w-3.5 h-3.5 text-rose-500" />
                            DETALHAMENTO DA IA EXPLICÁVEL
                          </span>
                          <span className="text-xs font-mono font-bold text-rose-400">
                            RISCO: {msg.explicabilidade.risco_degradacao_pct}%
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                          <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-850">
                            <div className="flex justify-between text-[10px] font-mono mb-1">
                              <span className="text-slate-400">Oxigenação (&ge;90%)</span>
                              <span className="text-white font-bold">{(msg.explicabilidade.valores_sensores.oxigenacao*100).toFixed(0)}%</span>
                            </div>
                            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full bg-emerald-400"
                                style={{ width: `${msg.explicabilidade.valores_sensores.oxigenacao * 100}%` }}
                              />
                            </div>
                          </div>

                          <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-850">
                            <div className="flex justify-between text-[10px] font-mono mb-1">
                              <span className="text-slate-400">Temperatura (35.5-37.5°C)</span>
                              <span className="text-white font-bold">{msg.explicabilidade.valores_sensores.temperatura.toFixed(1)}°C</span>
                            </div>
                            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full bg-amber-400"
                                style={{ width: `${Math.min(100, (msg.explicabilidade.valores_sensores.temperatura / 45) * 100)}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="text-[10px] text-slate-400 leading-relaxed bg-slate-900/30 p-2 rounded-lg border border-slate-850">
                          <p className="font-bold text-slate-300 font-mono mb-1">PESOS DAS FEATURES:</p>
                          <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
                            <span>• Oxigenação: +{msg.explicabilidade.pesos_atribuicao.oxigenacao}%</span>
                            <span>• Temperatura: +{msg.explicabilidade.pesos_atribuicao.temperatura}%</span>
                            <span>• pH: +{msg.explicabilidade.pesos_atribuicao.ph}%</span>
                            <span>• Viscosidade: +{msg.explicabilidade.pesos_atribuicao.viscosidade}%</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Loading Heartbeat */}
                {isTyping && (
                  <div className="flex flex-col max-w-[85%] self-start items-start">
                    <div className="p-3.5 rounded-2xl bg-slate-900 text-slate-200 border border-slate-800 rounded-tl-none flex flex-col gap-2 min-w-[280px]">
                      <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                        <Activity className="w-3.5 h-3.5 text-rose-500 animate-heartbeat" />
                        <span>Analisando dados mais recentes do Arduino...</span>
                      </div>

                      <svg width="240" height="24" className="stroke-rose-500" fill="none">
                        <path
                          className="ecg-path"
                          strokeWidth="2"
                          d="M 0 12 L 40 12 L 50 12 L 55 2 L 60 22 L 65 12 L 70 12 L 110 12 L 120 12 L 125 2 L 130 22 L 135 12 L 140 12 L 180 12 L 190 12 L 195 2 L 200 22 L 205 12 L 240 12"
                        />
                      </svg>
                    </div>
                  </div>
                )}

              </div>

              {/* Rodapé fixo: ações rápidas */}
              <div className="z-10 flex-none mt-auto border-t border-slate-800 p-4 bg-[#0B0F19]">
                <div className="flex gap-2 overflow-x-auto px-3 pb-3">
                  {QUICK_CHAT_ACTIONS.map((action) => (
                    <button
                      key={action}
                      type="button"
                      onClick={() => handleSendMessage(action)}
                      className="cursor-pointer whitespace-nowrap rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-[11px] font-medium text-slate-300 transition-all duration-200 hover:border-cyan-400 hover:bg-slate-800 hover:text-cyan-300 hover:shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>

            </div>

          </section>
        </main>
      )}

      {/* ABA 2: PREVISÃO DE DEMANDA HOSPITALAR (LOVABLE RECHARTS) */}
      {activeTab === 'forecast' && (
        <main className="flex-1 max-w-[1480px] w-full mx-auto p-4 sm:p-6 z-10 space-y-6">

          <div className="glass-panel rounded-2xl p-6 border-slate-800">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="rounded-xl border border-sky-500/40 bg-sky-500/12 p-3 text-sky-400">
                  <TrendingUp className="h-6 w-6" />
                </span>
                <div>
                  <h2 className="font-display text-xl font-bold text-white">
                    Sistema de Apoio à Decisão: Previsão & Criação de Lotes
                  </h2>
                  <p className="text-xs text-slate-400">
                    Histórico real, projeção preditiva com incerteza e impacto preventivo das decisões da IA
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-slate-400 bg-slate-900/60 border border-slate-800 px-3.5 py-1.5 rounded-xl">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span>Modelo Autônomo Ativo • Lead Time 18h</span>
              </div>
            </div>

            <div className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/50 px-3.5 py-2.5">
              <label htmlFor="forecast-lot" className="font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Selecionar lote:
              </label>
              <select
                id="forecast-lot"
                value={selectedLot || ""}
                onChange={(event) => setSelectedLot(event.target.value)}
                className="min-w-44 rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 font-mono text-xs font-bold text-slate-100 outline-none focus:border-rose-500"
              >
                {safeLots.map((lot) => <option key={lot.id} value={lot.id}>{lot.id}{lot.name ? ` • ${lot.name}` : ""}</option>)}
              </select>
            </div>

            <DemandChart lotId={selectedLot} lot={activeLotObj} />

            <div className="mt-5 rounded-xl border border-sky-500/30 bg-gradient-to-r from-sky-950/40 via-slate-900/50 to-emerald-950/30 px-5 py-4 text-xs text-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 shrink-0">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-white text-xs">
                    DIAGNÓSTICO PREDITIVO: risco de ruptura em {forecastScenario.riscoDia} ({forecastScenario.critical.estoqueSemAcao} un &lt; {forecastScenario.minimo} un mínimo).
                  </p>
                  <p className="text-slate-400 text-[11px] font-mono mt-0.5">
                    Decisão IA recomendada para {selectedLot}: {forecastScenario.recomendacao}, garantindo {forecastScenario.protectedStock} un em estoque seguro.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="px-2.5 py-1 rounded-lg font-mono text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  IMPACTO: {forecastScenario.impacto.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="glass-panel rounded-xl p-5 border-slate-800">
              <p className="font-mono text-[11px] uppercase tracking-widest text-slate-400">
                Capacidade de Produção
              </p>
              <p className="mt-2 font-mono text-3xl font-bold text-sky-400">
                120 <span className="text-xs text-slate-400 font-sans">unid/dia</span>
              </p>
              <p className="mt-1 text-xs text-slate-400">Turno de esterilização e síntese de PFCs</p>
            </div>

            <div className="glass-panel rounded-xl p-5 border-slate-800">
              <p className="font-mono text-[11px] uppercase tracking-widest text-slate-400">
                Lead Time de Reposição
              </p>
              <p className="mt-2 font-mono text-3xl font-bold text-emerald-400">
                18 <span className="text-xs text-slate-400 font-sans">horas</span>
              </p>
              <p className="mt-1 text-xs text-slate-400">Tempo médio de validação biológica e entrega</p>
            </div>

            <div className="glass-panel rounded-xl p-5 border-slate-800">
              <p className="font-mono text-[11px] uppercase tracking-widest text-slate-400">
                Acurácia do Modelo
              </p>
              <p className="mt-2 font-mono text-3xl font-bold text-rose-400">
                94.8<span className="text-xs text-slate-400 font-sans">%</span>
              </p>
              <p className="mt-1 text-xs text-slate-400">Score R² com base em séries temporais</p>
            </div>
          </div>

        </main>
      )}



      {/* ABA 4: SIMULADOR DE URGÊNCIA COM IA */}
      {activeTab === 'emergency' && (
        <main className="flex-1 max-w-[1680px] w-full mx-auto p-4 sm:p-6 z-10">
          <EmergencySimulator />
        </main>
      )}

      {zoomedChatCard && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
          role="presentation"
          onClick={() => setZoomedChatCard(null)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="chat-card-modal-title"
            className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-sky-400/30 bg-slate-950 p-6 shadow-[0_0_50px_rgba(34,211,238,0.18)] sm:p-8"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setZoomedChatCard(null)}
              aria-label="Fechar resposta ampliada"
              className="absolute right-4 top-4 rounded-lg border border-slate-700 p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
            <p className="pr-12 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-400">
              {zoomedChatCard.eyebrow}
            </p>
            <h2 id="chat-card-modal-title" className="mt-2 pr-12 text-2xl font-bold text-white sm:text-3xl">
              {zoomedChatCard.title}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg">
              {zoomedChatCard.summary}
            </p>
            {zoomedChatCard.conceptualBlocks?.length > 0 && (
              <div className="mt-6 space-y-3">
                {zoomedChatCard.conceptualBlocks.map((block) => {
                  const BlockIcon = block.icon;
                  return (
                    <section key={block.title} className={`flex gap-4 rounded-xl border p-4 ${block.accent}`}>
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-current/30 bg-slate-950/30">
                        <BlockIcon className="h-5 w-5" />
                      </span>
                      <div>
                        <h3 className="font-semibold text-white">{block.title}</h3>
                        <p className="mt-1.5 text-sm leading-6 text-slate-300">{block.text}</p>
                      </div>
                    </section>
                  );
                })}
              </div>
            )}
            {zoomedChatCard.metrics?.length > 0 && (
              <dl className="mt-6 grid gap-3 sm:grid-cols-2">
                {zoomedChatCard.metrics.map((metric) => (
                  <div key={metric.label} className="rounded-xl border border-slate-700 bg-slate-900/80 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <dt className="font-mono text-[10px] uppercase tracking-widest text-slate-400">{metric.label}</dt>
                      <span className={`rounded border px-1.5 py-0.5 font-mono text-[8px] font-bold ${metric.badgeClass || 'border-cyan-400/30 bg-cyan-500/5 text-cyan-200'}`}>TELEMETRIA ATIVA</span>
                    </div>
                    <dd className="mt-2 text-lg font-semibold text-white">{metric.value}</dd>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
                      <div className={`h-full rounded-full transition-all duration-500 ${metric.color}`} style={{ width: `${metric.progress}%` }} />
                    </div>
                  </div>
                ))}
              </dl>
            )}
          </section>
        </div>
      )}

      {/* Modal de Criação de Novo Lote */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="glass-panel border-slate-700 sm:max-w-md bg-slate-950/95 text-slate-100">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-white">
              <Plus className="h-5 w-5 text-rose-500" />
              Criar Novo Lote de Sangue Artificial
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Preencha os dados do lote biomédico. O lote será vinculado às métricas e faixas ideais da finalidade selecionada.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleConfirmCreateLot} className="grid gap-4 mt-2">
            {formError && (
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono">
                ⚠️ {formError}
              </div>
            )}

            {/* ID do Lote (Fixo / Gerado Automático) */}
            <div className="grid gap-1.5 text-left">
              <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400 flex items-center justify-between">
                <span>ID do Lote (Gerado Automático)</span>
                <span className="text-rose-400 font-bold">SEQUENCIAL/ÚNICO</span>
              </span>
              <input
                type="text"
                value={newLotCode}
                disabled
                className="h-9 rounded-lg border border-slate-800 bg-slate-900/60 px-3 text-xs text-slate-400 font-mono font-bold cursor-not-allowed"
              />
            </div>

            {/* Nome do Lote (Obrigatório) */}
            <div className="grid gap-1.5 text-left">
              <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400">
                Nome do Lote *
              </span>
              <input
                type="text"
                value={newLotName}
                onChange={(e) => {
                  setNewLotName(e.target.value);
                  if (formError) setFormError("");
                }}
                placeholder="Ex: Lote Alfa Trauma"
                required
                className="h-9 rounded-lg border border-slate-700 bg-slate-900/80 px-3 text-xs text-slate-100 outline-none placeholder:text-slate-500 focus:border-rose-500/80 transition-colors"
              />
            </div>

            {/* Data e Hora de Criação (Fixa pelo sistema) */}
            <div className="grid gap-1.5 text-left">
              <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400">
                Data e Hora de Criação (Sistema)
              </span>
              <input
                type="text"
                value={newLotCreatedAt}
                disabled
                className="h-9 rounded-lg border border-slate-800 bg-slate-900/60 px-3 text-xs text-slate-400 font-mono cursor-not-allowed"
              />
            </div>

            {/* Finalidade Clínica (Dropdown Obrigatório com 7 opções) */}
            <div className="grid gap-1.5 text-left">
              <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400">
                Finalidade Clínica *
              </span>
              <select
                value={newLotFinalidade}
                onChange={(e) => {
                  setNewLotFinalidade(e.target.value);
                  if (formError) setFormError("");
                }}
                required
                className="h-9 rounded-lg border border-slate-700 bg-slate-900 px-3 text-xs text-slate-100 outline-none focus:border-rose-500/80 transition-colors cursor-pointer"
              >
                {FINALIDADES_OPCOES.map((opcao, idx) => (
                  <option key={idx} value={opcao} className="bg-slate-950 text-slate-100 py-1">
                    {opcao}
                  </option>
                ))}
              </select>
            </div>

            {/* Botões de Ação */}
            <div className="flex gap-2 justify-end mt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="border-slate-700 text-slate-300 hover:bg-slate-800 text-xs"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-medium text-xs gap-1.5 shadow-lg shadow-rose-500/20"
              >
                <Plus className="h-4 w-4" />
                Confirmar e Cadastrar Lote
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="z-10 py-3.5 border-t border-slate-900 bg-slate-950/80 px-6">
        <p className="text-[10px] text-slate-500 font-mono tracking-wider text-center">
          FLOWTIFICIAL • PROJETO FECART 2026 • ARQUITETURA INTELIGENTE PARA SANGUE ARTIFICIAL
        </p>
      </footer>
    </div>
  );
}
