import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, 
  Database, 
  Cpu, 
  Terminal, 
  Send, 
  HelpCircle, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Play, 
  RefreshCw, 
  FileText,
  Copy,
  ChevronRight,
  TrendingUp,
  Droplets,
  ShieldCheck,
  FlaskConical,
  Waves,
  Thermometer,
  Layers,
  Clock,
  Sparkles,
  Info,
  Plus,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MetricCard } from '@/components/MetricCard';
import { DemandChart } from '@/components/DemandChart';
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
import { useArduinoData } from '@/hooks/useArduinoData';

const API_BASE = import.meta.env.VITE_API_URL || window.location.origin;

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
  // Navegação: 'landing' | 'dashboard' | 'forecast' | 'tecnico'
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
  const [selectedLot, setSelectedLot] = useState("SA-025");
  const [lots, setLots] = useState([
    {
      id: "SA-025",
      name: "Lote Teste Primário",
      createdAt: new Date().toLocaleString('pt-BR'),
      responsaveis: "Mariana Vicente, Julia Santana e Vitória Barreto",
      destino: "Simulação Fisiológica Humana",
      intervaloLeitura: "5s",
      protocolo: PROTOCOLOS_CLINICOS["Simulação Fisiológica Humana"]
    }
  ]);
  const [history, setHistory] = useState([]);
  const [audits, setAudits] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [packetCount, setPacketCount] = useState(1420);
  const [lastPacketTime, setLastPacketTime] = useState(null);
  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Olá! Sou o Tradutor Científico EcoSanguis / Flowtificial. Posso explicar o estado de qualquer lote de sangue artificial ou as decisões da IA. Escolha uma das perguntas rápidas abaixo ou digite sua dúvida!',
      explicabilidade: null
    }
  ]);

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

  // Carrega logs de auditoria
  const fetchAudits = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/audits`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setAudits(data);
        }
      }
    } catch (err) {
      console.log("Erro ao carregar auditoria:", err);
    }
  };

  useEffect(() => {
    fetchLots();
    fetchAudits();
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [selectedLot]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Estados do Modal de Criação de Novo Lote
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newLotName, setNewLotName] = useState("");
  const [newLotCode, setNewLotCode] = useState("");
  const [newLotCreatedAt, setNewLotCreatedAt] = useState("");
  const [newLotFinalidade, setNewLotFinalidade] = useState(FINALIDADES_OPCOES[0]);
  const [formError, setFormError] = useState("");

  // Função para abrir o modal de criação de lote com campos auto-preenchidos
  const openCreateLotModal = () => {
    const existingNumbers = lots.map(l => {
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

    const finalCode = newLotCode.trim() || `SA-${String(lots.length + 25).padStart(3, '0')}`;
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
    setLots(prev => prev.filter(lot => lot.id !== lotIdToDelete));
    if (selectedLot === lotIdToDelete && lots.length > 1) {
      setSelectedLot(lots[0].id);
    }
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
    if (!text || !text.trim()) return;

    // Resposta fixa: O que é sangue artificial
    if (text.toLowerCase().includes("o que é sangue artificial")) {
      const respostaPronta = `O sangue artificial (ou substituto sintético do sangue) é uma solução biotecnológica desenvolvida para desempenhar a função principal do sangue humano: o transporte de oxigênio e nutrientes para os tecidos do corpo.

Diferente do sangue doado tradicional, o sangue artificial:
• Não possui tipo sanguíneo (A, B, AB, O ou Rh): Pode ser usado em qualquer pessoa sem risco de rejeição imediata.
• Dura muito mais tempo: Pode ser armazenado por meses sem estragar.
• É livre de contaminações: Não transmite vírus ou bactérias.

Existem duas tecnologias principais: as baseadas em Hemoglobina (HBOCs) e os Perfluorocarbonos (PFCs), que são líquidos sintéticos capazes de carregar gases.

Aqui no FLOWTIFICIAL, nosso papel é monitorar os parâmetros desse sangue (como oxigenação, pH e temperatura) para garantir que ele esteja perfeito e seguro para uso!`;

      setMessages(prev => [
        ...prev, 
        { role: 'user', content: text },
        { role: 'assistant', content: respostaPronta }
      ]);
      setInputValue('');
      return;
    }

    // Resposta fixa: Condições do sangue / Status atual
    if (text.toLowerCase().includes("status atual") || text.toLowerCase().includes("condições do sangue")) {
      setMessages(prev => [...prev, 
        { role: 'user', content: text },
        { role: 'assistant', content: `Análise em tempo real do lote ${selectedLot}: Oxigenação está em ${(currentReading.oxigenacao_limpa * 100).toFixed(0)}% (ótimo), pH em ${currentReading.ph.toFixed(2)} (fisiológico) e Temperatura em ${currentReading.temperatura_c.toFixed(1)}°C. Todos os parâmetros clínicos estão dentro da normalidade operacional.` }
      ]);
      setInputValue('');
      return;
    }

    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pergunta: text })
      });
      
      if (res.ok) {
        const data = await res.json();
        setTimeout(() => {
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: data.resposta, 
            explicabilidade: data.explicabilidade 
          }]);
          setIsTyping(false);
          
          const match = text.toUpperCase().match(/SA-\d{3}/);
          if (match) {
            setSelectedLot(match[0]);
          }
        }, 800);
      } else {
        setIsTyping(false);
      }
    } catch (err) {
      console.log("Erro no chat:", err);
      setIsTyping(false);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: '⚠️ **[Erro de Conexão]**: Não foi possível contatar o Tradutor Científico FastAPI. Verifique se o backend está ativo.'
      }]);
    }
  };

  const activeLotObj = lots.find(l => l.id === selectedLot) || lots[0];
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
    currentReading = history.length > 0 ? history[history.length - 1] : {
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
  const arduinoData = useArduinoData(currentReading, history, lastPacketTime);

  const getSparkValues = (key) => {
    if (history.length === 0) return [currentReading[key] || 0, currentReading[key] || 0];
    return history.map(item => item[key]);
  };

  const pythonScript = `import time
import json
import random
import requests

API_URL = "${import.meta.env.VITE_API_URL || (window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port : ''))}/api/sensor-data"
LOTE_ID = "SA-025"

print("Ponte de Dados Iniciada. Enviando para:", API_URL)
t = 0
while True:
    # Leitura ou simulação de sensores físicos
    ox = 95.0 + random.uniform(-1.0, 1.0)
    temp = 36.5 + random.uniform(-0.3, 0.3)
    vaz = 4.8 + random.uniform(-0.1, 0.1)
    
    payload = {
        "lote_id": LOTE_ID,
        "oxigenacao": f"{ox:.1f}%",
        "temperatura": f"{temp:.1f}C",
        "vazao": f"{vaz:.1f}"
    }
    try:
        r = requests.post(API_URL, json=payload, timeout=2.0)
        print(f"POST {r.status_code} | Lote {LOTE_ID} | Ox: {ox:.1f}% | Temp: {temp:.1f}°C")
    except Exception as e:
        print("Erro ao enviar telemetria:", e)
    
    time.sleep(2.0)
    t += 2`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(pythonScript);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  // Se a aba for Landing Page, renderiza a tela de apresentação
  if (activeTab === 'landing') {
    return (
      <LandingPage
        onNavigate={setActiveTab}
        onInjectReading={handleInjectReading}
        apiBase={API_BASE}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col relative text-slate-100 selection:bg-rose-500 selection:text-white">
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
          <button 
            onClick={() => setActiveTab('tecnico')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'tecnico' 
                ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-semibold shadow-sm' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Console Técnico</span>
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

      {/* ABA 1: MONITOR CLÍNICO / DASHBOARD */}
      {activeTab === 'dashboard' && (
        <main className="flex-1 max-w-[1680px] w-full mx-auto p-4 sm:p-6 z-10 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* COLUNA ESQUERDA (MÉTRICAS & LOTES - 5/12) */}
          <section className="lg:col-span-5 flex flex-col gap-4">
            
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
                {lots.map(l => (
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

                    {lots.length > 1 && (
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
                    subtitle="Transporte imediato de oxigênio do lote"
                    value={((currentReading.oxigenacao_limpa || 0.98) * 100).toFixed(1)}
                    unit="%"
                    percent={(currentReading.oxigenacao_limpa || 0.98) * 100}
                    level="success"
                    badgeText="ÓTIMO"
                    detail="Garante aporte imediato de oxigênio em quadros de trauma e choque volumétrico."
                    icon={Waves}
                    accentColor="bg-[#00ff9d]"
                    sparkline={<Sparkline data={getSparkValues('oxigenacao_limpa')} color="#00ff9d" />}
                  />

                  {/* CARD B2: RESISTÊNCIA DE FLUXO (VISCOSIDADE) */}
                  <MetricCard
                    title="B2 • RESISTÊNCIA DE FLUXO (VISCOSIDADE)"
                    subtitle="Viscosidade e rápida infusão sob pressão"
                    value={(currentReading.viscosidade_cp || 2.3).toFixed(1)}
                    unit="cP"
                    percent={Math.min(100, ((currentReading.viscosidade_cp || 2.3) / 5) * 100)}
                    level="success"
                    badgeText="FLUIDO"
                    detail="Permite rápida infusão sob pressão em acessos venosos periféricos."
                    icon={Droplets}
                    accentColor="bg-[#a855f7]"
                    sparkline={<Sparkline data={getSparkValues('viscosidade_cp')} color="#a855f7" />}
                  />

                  {/* CARD B3: ESTABILIDADE TÉRMICA */}
                  <MetricCard
                    title="B3 • ESTABILIDADE TÉRMICA (ARMAZENAMENTO)"
                    subtitle="Armazenamento fora de refrigeração"
                    value={(currentReading.temperatura_c || 22.0).toFixed(1)}
                    unit="°C"
                    percent={Math.min(100, ((currentReading.temperatura_c || 22.0) / 40) * 100)}
                    level="success"
                    badgeText="ESTÁVEL"
                    detail="Conserva a integridade funcional fora de refrigeração, ideal para ambulâncias."
                    icon={Thermometer}
                    accentColor="bg-[#ffb703]"
                    sparkline={<Sparkline data={getSparkValues('temperatura_c')} color="#ffb703" />}
                  />

                  {/* CARD B4: TEMPO DE MEIA-VIDA CIRCULATÓRIA */}
                  <MetricCard
                    title="B4 • TEMPO DE MEIA-VIDA CIRCULATÓRIA"
                    subtitle="Duração na circulação sanguínea"
                    value={(currentReading.meia_vida_h || 24.0).toFixed(1)}
                    unit="h"
                    percent={Math.min(100, ((currentReading.meia_vida_h || 24.0) / 48) * 100)}
                    level="success"
                    badgeText="SUFICIENTE"
                    detail="Mantém a oxigenação até que o paciente chegue ao hospital."
                    icon={Clock}
                    accentColor="bg-[#00d8ff]"
                    sparkline={<Sparkline data={getSparkValues('meia_vida_h')} color="#00d8ff" />}
                  />

                  {/* CARD B5: ÍNDICE DE EXTRAÇÃO DE O₂ (TISULAR) */}
                  <MetricCard
                    title="B5 • ÍNDICE DE EXTRAÇÃO DE O₂ (TISULAR)"
                    subtitle="Liberação direta de O₂ para tecidos"
                    value={(currentReading.extracao_o2_pct || 42.0).toFixed(1)}
                    unit="%"
                    percent={currentReading.extracao_o2_pct || 42.0}
                    level="success"
                    badgeText="ALTO"
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
                    subtitle="Compensação volêmica e de hemácias"
                    value={(currentReading.carga_o2_pct || 99.0).toFixed(1)}
                    unit="%"
                    percent={currentReading.carga_o2_pct || 99.0}
                    level="success"
                    badgeText="MÁXIMA"
                    detail="Compensa rapidamente a perda massiva de volemia e glóbulos vermelhos."
                    icon={ShieldCheck}
                    accentColor="bg-[#ff9f1c]"
                    sparkline={<Sparkline data={getSparkValues('carga_o2_pct')} color="#ff9f1c" />}
                  />

                  {/* CARD B2: PRESSÃO ONCÓTICA (EXPANSÃO) */}
                  <MetricCard
                    title="B2 • PRESSÃO ONCÓTICA (EXPANSÃO)"
                    subtitle="Estabilidade da pressão arterial"
                    value={(currentReading.pressao_oncotica_mmhg || 25.0).toFixed(1)}
                    unit="mmHg"
                    percent={Math.min(100, ((currentReading.pressao_oncotica_mmhg || 25.0) / 30) * 100)}
                    level="success"
                    badgeText="FISIOLÓGICA"
                    detail="Evita extravasamento de plasma e mantém a pressão arterial estável."
                    icon={Waves}
                    accentColor="bg-[#00ff9d]"
                    sparkline={<Sparkline data={getSparkValues('pressao_oncotica_mmhg')} color="#00ff9d" />}
                  />

                  {/* CARD B3: PERMUTABILIDADE GASOSA */}
                  <MetricCard
                    title="B3 • PERMUTABILIDADE GASOSA"
                    subtitle="Troca de O₂ e CO₂ alveolar"
                    value={(currentReading.permutabilidade_gasosa_pct || 95.0).toFixed(1)}
                    unit="%"
                    percent={currentReading.permutabilidade_gasosa_pct || 95.0}
                    level="success"
                    badgeText="EFICIENTE"
                    detail="Assegura rápida troca de O₂ e CO₂ nos alvéolos pulmonares."
                    icon={FlaskConical}
                    accentColor="bg-[#00d8ff]"
                    sparkline={<Sparkline data={getSparkValues('permutabilidade_gasosa_pct')} color="#00d8ff" />}
                  />

                  {/* CARD B4: RESISTÊNCIA À COMPRESSÃO MECÂNICA */}
                  <MetricCard
                    title="B4 • RESISTÊNCIA À COMPRESSÃO MECÂNICA"
                    subtitle="Suporte a bombas de infusão rápida"
                    value={(currentReading.resistencia_compressao_pct || 90.0).toFixed(1)}
                    unit="%"
                    percent={currentReading.resistencia_compressao_pct || 90.0}
                    level="success"
                    badgeText="ALTA"
                    detail="Suporta bombas de infusão rápida em ressuscitação volêmica."
                    icon={Droplets}
                    accentColor="bg-[#a855f7]"
                    sparkline={<Sparkline data={getSparkValues('resistencia_compressao_pct')} color="#a855f7" />}
                  />

                  {/* CARD B5: TAMPONAMENTO ÁCIDO-BÁSICO */}
                  <MetricCard
                    title="B5 • TAMPONAMENTO ÁCIDO-BÁSICO"
                    subtitle="Prevenção da acidose por hipoperfusão"
                    value={(currentReading.tamponamento_ph || 7.40).toFixed(2)}
                    unit="pH"
                    percent={Math.min(100, ((currentReading.tamponamento_ph || 7.40) / 8.5) * 100)}
                    level="success"
                    badgeText="NEUTRO"
                    detail="Previne acidose metabólica decorrente da hipoperfusão tecidual."
                    icon={Thermometer}
                    accentColor="bg-[#02c39a]"
                    sparkline={<Sparkline data={getSparkValues('tamponamento_ph')} color="#02c39a" />}
                  />
                </>
              ) : isCirurgiaCardiacaActive ? (
                <>
                  {/* CARD B1: COMPATIBILIDADE COM PERFUSÃO MECÂNICA (CEC) */}
                  <MetricCard
                    title="B1 • COMPATIBILIDADE COM PERFUSÃO MECÂNICA (CEC)"
                    subtitle="Estabilidade em circuitos de circulação extracorpórea"
                    value={(currentReading.compatibilidade_cec_pct || 98.5).toFixed(1)}
                    unit="%"
                    percent={currentReading.compatibilidade_cec_pct || 98.5}
                    level="success"
                    badgeText="EXCELENTE"
                    detail="Mantém a estabilidade molecular em circuitos de circulação extracorpórea."
                    icon={Waves}
                    accentColor="bg-[#00d8ff]"
                    sparkline={<Sparkline data={getSparkValues('compatibilidade_cec_pct')} color="#00d8ff" />}
                  />

                  {/* CARD B2: TENSÃO DE CISAILHAMENTO (SHEAR STRESS) */}
                  <MetricCard
                    title="B2 • TENSÃO DE CISAILHAMENTO (SHEAR STRESS)"
                    subtitle="Tolerância à fricção mecânica das bombas"
                    value={(currentReading.tensao_cisalhamento_cp || 1.8).toFixed(1)}
                    unit="cP"
                    percent={Math.min(100, ((currentReading.tensao_cisalhamento_cp || 1.8) / 5) * 100)}
                    level="success"
                    badgeText="TOLERANTE"
                    detail="Previne degradação mecânica por bombas rotativas e oxigenadores."
                    icon={ShieldCheck}
                    accentColor="bg-[#00ff9d]"
                    sparkline={<Sparkline data={getSparkValues('tensao_cisalhamento_cp')} color="#00ff9d" />}
                  />

                  {/* CARD B3: TEMPO DE MEIA-VIDA EXTENDED */}
                  <MetricCard
                    title="B3 • TEMPO DE MEIA-VIDA EXTENDED"
                    subtitle="Cirurgias de longa duração"
                    value={(currentReading.meia_vida_extended_h || 48.0).toFixed(1)}
                    unit="h"
                    percent={Math.min(100, ((currentReading.meia_vida_extended_h || 48.0) / 72) * 100)}
                    level="success"
                    badgeText="PROLONGADO"
                    detail="Suporta procedimentos cirúrgicos de longa duração sem perda funcional."
                    icon={Clock}
                    accentColor="bg-[#02c39a]"
                    sparkline={<Sparkline data={getSparkValues('meia_vida_extended_h')} color="#02c39a" />}
                  />

                  {/* CARD B4: TAMPONAMENTO DE LACTATO */}
                  <MetricCard
                    title="B4 • TAMPONAMENTO DE LACTATO"
                    subtitle="Redução de metabólitos ácidos em clampeamento"
                    value={(currentReading.tamponamento_lactato_ph || 7.42).toFixed(2)}
                    unit="pH"
                    percent={Math.min(100, ((currentReading.tamponamento_lactato_ph || 7.42) / 8.5) * 100)}
                    level="success"
                    badgeText="ATIVO"
                    detail="Minimiza acúmulo de metabólitos ácidos durante o clampeamento vascular."
                    icon={Droplets}
                    accentColor="bg-[#a855f7]"
                    sparkline={<Sparkline data={getSparkValues('tamponamento_lactato_ph')} color="#a855f7" />}
                  />

                  {/* CARD B5: VISCOSIDADE EM HYPOTHERMIA */}
                  <MetricCard
                    title="B5 • VISCOSIDADE EM HYPOTHERMIA"
                    subtitle="Fluidez em hipotermia cirúrgica induzida"
                    value={(currentReading.viscosidade_hipotermia_cp || 3.0).toFixed(1)}
                    unit="cP"
                    percent={Math.min(100, ((currentReading.viscosidade_hipotermia_cp || 3.0) / 6) * 100)}
                    level="success"
                    badgeText="CONTROLADA"
                    detail="Preserva a fluidez hemodinâmica sob hipotermia cirúrgica induzida."
                    icon={Thermometer}
                    accentColor="bg-[#ffb703]"
                    sparkline={<Sparkline data={getSparkValues('viscosidade_hipotermia_cp')} color="#ffb703" />}
                  />
                </>
              ) : isAnemiaActive ? (
                <>
                  {/* CARD B1: EFICIÊNCIA DE LIBERAÇÃO DE O₂ (P50) */}
                  <MetricCard
                    title="B1 • EFICIÊNCIA DE LIBERAÇÃO DE O₂ (P50)"
                    subtitle="Entrega de O₂ em baixas concentrações"
                    value={(currentReading.eficiencia_p50_mmhg || 28.0).toFixed(1)}
                    unit="mmHg"
                    percent={Math.min(100, ((currentReading.eficiencia_p50_mmhg || 28.0) / 40) * 100)}
                    level="success"
                    badgeText="OTIMIZADA"
                    detail="Entrega oxigênio aos tecidos mesmo em baixas concentrações circulantes."
                    icon={Waves}
                    accentColor="bg-[#00ff9d]"
                    sparkline={<Sparkline data={getSparkValues('eficiencia_p50_mmhg')} color="#00ff9d" />}
                  />

                  {/* CARD B2: AUSÊNCIA DE RESPOSTA IMUNOGÊNICA */}
                  <MetricCard
                    title="B2 • AUSÊNCIA DE RESPOSTA IMUNOGÊNICA"
                    subtitle="Isenção de reações em transfusões crônicas"
                    value={(currentReading.ausencia_imunogenica_pct || 100.0).toFixed(1)}
                    unit="%"
                    percent={currentReading.ausencia_imunogenica_pct || 100.0}
                    level="success"
                    badgeText="ISENTO"
                    detail="Reduz risco de reações alérgicas ou rejeição em transfusões crônicas."
                    icon={ShieldCheck}
                    accentColor="bg-[#02c39a]"
                    sparkline={<Sparkline data={getSparkValues('ausencia_imunogenica_pct')} color="#02c39a" />}
                  />

                  {/* CARD B3: ESTABILIDADE PLASMÁTICA */}
                  <MetricCard
                    title="B3 • ESTABILIDADE PLASMÁTICA"
                    subtitle="Prevenção de flutuações de hemoglobina"
                    value={(currentReading.estabilidade_plasmatica_pct || 96.0).toFixed(1)}
                    unit="%"
                    percent={currentReading.estabilidade_plasmatica_pct || 96.0}
                    level="success"
                    badgeText="ALTA"
                    detail="Evita flutuações na concentração de hemoglobina sintética."
                    icon={FlaskConical}
                    accentColor="bg-[#00d8ff]"
                    sparkline={<Sparkline data={getSparkValues('estabilidade_plasmatica_pct')} color="#00d8ff" />}
                  />

                  {/* CARD B4: TOLERÂNCIA A INFUSÃO LENTA */}
                  <MetricCard
                    title="B4 • TOLERÂNCIA A INFUSÃO LENTA"
                    subtitle="Administração gradual em pacientes debilitados"
                    value={(currentReading.tolerancia_infusao_lenta_h || 36.0).toFixed(1)}
                    unit="h"
                    percent={Math.min(100, ((currentReading.tolerancia_infusao_lenta_h || 36.0) / 48) * 100)}
                    level="success"
                    badgeText="ADAPTADO"
                    detail="Ideal para esquemas de administração gradual em pacientes debilitados."
                    icon={Clock}
                    accentColor="bg-[#a855f7]"
                    sparkline={<Sparkline data={getSparkValues('tolerancia_infusao_lenta_h')} color="#a855f7" />}
                  />

                  {/* CARD B5: RETENÇÃO VASCULAR */}
                  <MetricCard
                    title="B5 • RETENÇÃO VASCULAR"
                    subtitle="Duração estendida no leito vascular"
                    value={(currentReading.retencao_vascular_h || 30.0).toFixed(1)}
                    unit="h"
                    percent={Math.min(100, ((currentReading.retencao_vascular_h || 30.0) / 48) * 100)}
                    level="success"
                    badgeText="ESTÁVEL"
                    detail="Impede filtração glomerular precoce, prolongando o benefício terapêutico."
                    icon={Droplets}
                    accentColor="bg-[#ffb703]"
                    sparkline={<Sparkline data={getSparkValues('retencao_vascular_h')} color="#ffb703" />}
                  />
                </>
              ) : isOncologicoActive ? (
                <>
                  {/* CARD B1: RESISTÊNCIA A EROSÃO QUIMIOTERÁPICA */}
                  <MetricCard
                    title="B1 • RESISTÊNCIA A EROSÃO QUIMIOTERÁPICA"
                    subtitle="Estabilidade diante de agentes citotóxicos"
                    value={(currentReading.erosao_quimioterapica_pct || 99.9).toFixed(1)}
                    unit="%"
                    percent={currentReading.erosao_quimioterapica_pct || 99.9}
                    level="success"
                    badgeText="INVIOLÁVEL"
                    detail="Não sofre degradação ou hemólise quando em contato com quimioterápicos."
                    icon={ShieldCheck}
                    accentColor="bg-[#a855f7]"
                    sparkline={<Sparkline data={getSparkValues('erosao_quimioterapica_pct')} color="#a855f7" />}
                  />

                  {/* CARD B2: BIOPATIBILIDADE TECIDUAL */}
                  <MetricCard
                    title="B2 • BIOPATIBILIDADE TECIDUAL"
                    subtitle="Ausência de toxicidade renal ou hepática"
                    value={(currentReading.biocompatibilidade_tecidual_pct || 100.0).toFixed(1)}
                    unit="%"
                    percent={currentReading.biocompatibilidade_tecidual_pct || 100.0}
                    level="success"
                    badgeText="NÃO TÓXICO"
                    detail="Não sobrecarrega o sistema de filtração hepático ou renal do paciente oncológico."
                    icon={FlaskConical}
                    accentColor="bg-[#00ff9d]"
                    sparkline={<Sparkline data={getSparkValues('biocompatibilidade_tecidual_pct')} color="#00ff9d" />}
                  />

                  {/* CARD B3: ESTABILIDADE pH EM AMBIENTE TUMORAL */}
                  <MetricCard
                    title="B3 • ESTABILIDADE pH EM AMBIENTE TUMORAL"
                    subtitle="Manutenção de transporte em meio ácido"
                    value={(currentReading.ph_tumoral || 7.35).toFixed(2)}
                    unit="pH"
                    percent={Math.min(100, ((currentReading.ph_tumoral || 7.35) / 8.5) * 100)}
                    level="success"
                    badgeText="TOLERANTE"
                    detail="Preserva a afinidade de ligação com o oxigênio mesmo no microambiente ácido ao redor do tumor."
                    icon={Thermometer}
                    accentColor="bg-[#02c39a]"
                    sparkline={<Sparkline data={getSparkValues('ph_tumoral')} color="#02c39a" />}
                  />

                  {/* CARD B4: RETENÇÃO DE OXIGENAÇÃO CELULAR */}
                  <MetricCard
                    title="B4 • RETENÇÃO DE OXIGENAÇÃO CELULAR"
                    subtitle="Aporte contínuo de gases aos tecidos saudáveis"
                    value={(currentReading.retencao_o2_celular_pct || 96.0).toFixed(1)}
                    unit="%"
                    percent={currentReading.retencao_o2_celular_pct || 96.0}
                    level="success"
                    badgeText="CONSTANTE"
                    detail="Protege a oxigenação de tecidos sadios reduzindo a fadiga decorrente do tratamento."
                    icon={Waves}
                    accentColor="bg-[#00d8ff]"
                    sparkline={<Sparkline data={getSparkValues('retencao_o2_celular_pct')} color="#00d8ff" />}
                  />
                </>
              ) : isPolitraumatizadosActive ? (
                <>
                  {/* CARD B1: REPOSIÇÃO VOLEMICA ULTRA-RÁPIDA */}
                  <MetricCard
                    title="B1 • REPOSIÇÃO VOLEMICA ULTRA-RÁPIDA"
                    subtitle="Expansão imediata do leito intravascular"
                    value={(currentReading.reposicao_volemica_ultra_pct || 100.0).toFixed(1)}
                    unit="%"
                    percent={currentReading.reposicao_volemica_ultra_pct || 100.0}
                    level="warning"
                    badgeText="CRÍTICA"
                    detail="Reverte o colapso circulatório grave em vítimas de politraumatismos."
                    icon={Waves}
                    accentColor="bg-[#ff4d4d]"
                    sparkline={<Sparkline data={getSparkValues('reposicao_volemica_ultra_pct')} color="#ff4d4d" />}
                  />

                  {/* CARD B2: PREVENÇÃO DE HIPOTERMIA SEVERA */}
                  <MetricCard
                    title="B2 • PREVENÇÃO DE HIPOTERMIA SEVERA"
                    subtitle="Estabilidade térmica da solução infundida"
                    value={(currentReading.prevencao_hipotermia_c || 37.0).toFixed(1)}
                    unit="°C"
                    percent={Math.min(100, ((currentReading.prevencao_hipotermia_c || 37.0) / 40) * 100)}
                    level="success"
                    badgeText="TÉRMICO"
                    detail="Evita o congelamento e a tríade da morte em politraumas."
                    icon={Thermometer}
                    accentColor="bg-[#ffb703]"
                    sparkline={<Sparkline data={getSparkValues('prevencao_hipotermia_c')} color="#ffb703" />}
                  />

                  {/* CARD B3: MANUTENÇÃO DA PERFUSÃO CEREBRAL */}
                  <MetricCard
                    title="B3 • MANUTENÇÃO DA PERFUSÃO CEREBRAL"
                    subtitle="Aporte de O₂ ao sistema nervoso central"
                    value={(currentReading.perfusao_cerebral_pct || 98.0).toFixed(1)}
                    unit="%"
                    percent={currentReading.perfusao_cerebral_pct || 98.0}
                    level="success"
                    badgeText="ÓTIMA"
                    detail="Protege o tecido cerebral contra isquemia e hipóxia pós-traumática."
                    icon={ShieldCheck}
                    accentColor="bg-[#00ff9d]"
                    sparkline={<Sparkline data={getSparkValues('perfusao_cerebral_pct')} color="#00ff9d" />}
                  />

                  {/* CARD B4: CAPACIDADE TAMPÃO ÁCIDO-BASE */}
                  <MetricCard
                    title="B4 • CAPACIDADE TAMPÃO ÁCIDO-BASE"
                    subtitle="Neutralização de acidose metabólica severa"
                    value={(currentReading.capacidade_tampao_ph || 7.42).toFixed(2)}
                    unit="pH"
                    percent={Math.min(100, ((currentReading.capacidade_tampao_ph || 7.42) / 8.5) * 100)}
                    level="success"
                    badgeText="ESTÁVEL"
                    detail="Restaura o pH fisiológico perante choques hemorrágicos graves."
                    icon={FlaskConical}
                    accentColor="bg-[#00d8ff]"
                    sparkline={<Sparkline data={getSparkValues('capacidade_tampao_ph')} color="#00d8ff" />}
                  />

                  {/* CARD B5: BAIXA VISCOSIDADE DE INFUSÃO */}
                  <MetricCard
                    title="B5 • BAIXA VISCOSIDADE DE INFUSÃO"
                    subtitle="Fluidez em acessos venosos periféricos"
                    value={(currentReading.baixa_viscosidade_cp || 2.1).toFixed(1)}
                    unit="cP"
                    percent={Math.min(100, ((currentReading.baixa_viscosidade_cp || 2.1) / 5) * 100)}
                    level="success"
                    badgeText="FLUIDO"
                    detail="Permite infusões sob alta pressão sem resistência de fluxo."
                    icon={Droplets}
                    accentColor="bg-[#a855f7]"
                    sparkline={<Sparkline data={getSparkValues('baixa_viscosidade_cp')} color="#a855f7" />}
                  />
                </>
              ) : isDoacaoActive ? (
                <>
                  {/* CARD B1: EXPRESSÃO ANTIGÊNICA (ABO/Rh) */}
                  <MetricCard
                    title="B1 • EXPRESSÃO ANTIGÊNICA (ABO/Rh)"
                    subtitle="Lote totalmente universal sem reação"
                    value={(currentReading.expressao_antigenica_pct !== undefined ? currentReading.expressao_antigenica_pct : 0.0).toFixed(1)}
                    unit="%"
                    percent={100}
                    level="success"
                    badgeText="ISENTO"
                    detail="Lote totalmente universal, sem risco de reação transfusional."
                    icon={Waves}
                    accentColor="bg-[#00ff9d]"
                    sparkline={<Sparkline data={getSparkValues('expressao_antigenica_pct')} color="#00ff9d" />}
                  />

                  {/* CARD B2: REATIVIDADE EM CROSSMATCH */}
                  <MetricCard
                    title="B2 • REATIVIDADE EM CROSSMATCH (PROVA CRUZADA)"
                    subtitle="Dispensa teste de cruzamento prévio"
                    value={(currentReading.reatividade_crossmatch_pct !== undefined ? currentReading.reatividade_crossmatch_pct : 0.0).toFixed(1)}
                    unit="%"
                    percent={100}
                    level="success"
                    badgeText="NULA"
                    detail="Dispensa a necessidade de teste de cruzamento prévio."
                    icon={ShieldCheck}
                    accentColor="bg-[#02c39a]"
                    sparkline={<Sparkline data={getSparkValues('reatividade_crossmatch_pct')} color="#02c39a" />}
                  />

                  {/* CARD B3: PUREZA MOLECULAR */}
                  <MetricCard
                    title="B3 • PUREZA MOLECULAR"
                    subtitle="Ausência de impurezas e membranas"
                    value={(currentReading.pureza_molecular_pct || 99.9).toFixed(1)}
                    unit="%"
                    percent={currentReading.pureza_molecular_pct || 99.9}
                    level="success"
                    badgeText="EXCELENTE"
                    detail="Garante a ausência de fragmentos de membranas e impurezas."
                    icon={FlaskConical}
                    accentColor="bg-[#00d8ff]"
                    sparkline={<Sparkline data={getSparkValues('pureza_molecular_pct')} color="#00d8ff" />}
                  />

                  {/* CARD B4: ESTERILIDADE BIOLÓGICA */}
                  <MetricCard
                    title="B4 • ESTERILIDADE BIOLÓGICA"
                    subtitle="Garantia contra vírus ou bactérias"
                    value={(currentReading.esterilidade_biologica_pct || 100.0).toFixed(1)}
                    unit="%"
                    percent={currentReading.esterilidade_biologica_pct || 100.0}
                    level="success"
                    badgeText="LIVRE"
                    detail="Garantia absoluta contra a transmissão de vírus ou bactérias."
                    icon={Droplets}
                    accentColor="bg-[#39ff14]"
                    sparkline={<Sparkline data={getSparkValues('esterilidade_biologica_pct')} color="#39ff14" />}
                  />
                </>
              ) : isColetaReservaActive ? (
                <>
                  {/* CARD B1: INTEGRALIDADE DE CONSERVAÇÃO */}
                  <MetricCard
                    title="B1 • INTEGRALIDADE DE CONSERVAÇÃO"
                    subtitle="Preservação da estrutura molecular em estoque"
                    value={(currentReading.integralidade_conservacao_pct || 100.0).toFixed(1)}
                    unit="%"
                    percent={currentReading.integralidade_conservacao_pct || 100.0}
                    level="success"
                    badgeText="PRESERVADA"
                    detail="Conserva a integridade funcional do composto por longos períodos."
                    icon={ShieldCheck}
                    accentColor="bg-[#00ff9d]"
                    sparkline={<Sparkline data={getSparkValues('integralidade_conservacao_pct')} color="#00ff9d" />}
                  />

                  {/* CARD B2: PRAZO DE VALIDADE EM ESTOQUE */}
                  <MetricCard
                    title="B2 • PRAZO DE VALIDADE EM ESTOQUE"
                    subtitle="Estabilidade prolongada fora da refrigeração"
                    value={currentReading.validade_estoque_meses || "24 Meses"}
                    unit=""
                    percent={100}
                    level="success"
                    badgeText="ESTÁVEL"
                    detail="Permite estocagem prolongada em bancos de sangue hospitalares e militares."
                    icon={Clock}
                    accentColor="bg-[#00d8ff]"
                    sparkline={<Sparkline data={getSparkValues('integralidade_conservacao_pct')} color="#00d8ff" />}
                  />

                  {/* CARD B3: TOLERÂNCIA A CONGELAMENTO */}
                  <MetricCard
                    title="B3 • TOLERÂNCIA A CONGELAMENTO"
                    subtitle="Resistência ao armazenamento criogênico"
                    value={(currentReading.tolerancia_congelamento_c || -80.0).toFixed(1)}
                    unit="°C"
                    percent={100}
                    level="success"
                    badgeText="CRIO-PROTEGIDO"
                    detail="Permite criopreservação em temperaturas extremamente baixas sem precipitação."
                    icon={Thermometer}
                    accentColor="bg-[#a855f7]"
                    sparkline={<Sparkline data={getSparkValues('tolerancia_congelamento_c')} color="#a855f7" />}
                  />

                  {/* CARD B4: ESTABILIDADE DE SUSPENSÃO */}
                  <MetricCard
                    title="B4 • ESTABILIDADE DE SUSPENSÃO"
                    subtitle="Distribuição homogênea das moléculas carreadoras"
                    value={(currentReading.estabilidade_suspensao_pct || 99.9).toFixed(1)}
                    unit="%"
                    percent={currentReading.estabilidade_suspensao_pct || 99.9}
                    level="success"
                    badgeText="HOMOGÊNEA"
                    detail="Evita decantação ou separação de fases durante a estocagem."
                    icon={FlaskConical}
                    accentColor="bg-[#02c39a]"
                    sparkline={<Sparkline data={getSparkValues('estabilidade_suspensao_pct')} color="#02c39a" />}
                  />
                </>
              ) : isTipagemCompatibilidadeActive ? (
                <>
                  {/* CARD B1: FATOR DE COMPATIBILIDADE UNIVERSAL */}
                  <MetricCard
                    title="B1 • FATOR DE COMPATIBILIDADE UNIVERSAL"
                    subtitle="Isenção total de rejeição transfusional"
                    value={(currentReading.fator_compatibilidade_pct || 100.0).toFixed(1)}
                    unit="%"
                    percent={currentReading.fator_compatibilidade_pct || 100.0}
                    level="success"
                    badgeText="UNIVERSAL"
                    detail="Compatível com qualquer tipo sanguíneo humano (A, B, AB, O, Rh+ ou Rh-)."
                    icon={Waves}
                    accentColor="bg-[#39ff14]"
                    sparkline={<Sparkline data={getSparkValues('fator_compatibilidade_pct')} color="#39ff14" />}
                  />

                  {/* CARD B2: AUSÊNCIA DE ANTÍGENOS ABO/Rh */}
                  <MetricCard
                    title="B2 • AUSÊNCIA DE ANTÍGENOS ABO/Rh"
                    subtitle="Inexistência de marcadores de membrana"
                    value={(currentReading.ausencia_antigenos_pct !== undefined ? currentReading.ausencia_antigenos_pct : 0.0).toFixed(1)}
                    unit="%"
                    percent={100}
                    level="success"
                    badgeText="NEGATIVO"
                    detail="Ausência completa de aglutinogênios A, B e Fator Rh."
                    icon={ShieldCheck}
                    accentColor="bg-[#00ff9d]"
                    sparkline={<Sparkline data={getSparkValues('ausencia_antigenos_pct')} color="#00ff9d" />}
                  />

                  {/* CARD B3: REAÇÃO HETERÓLOGA */}
                  <MetricCard
                    title="B3 • REAÇÃO HETERÓLOGA"
                    subtitle="Isenção de reatividade plasmática"
                    value={(currentReading.reacao_heterologa_pct !== undefined ? currentReading.reacao_heterologa_pct : 0.0).toFixed(1)}
                    unit="%"
                    percent={100}
                    level="success"
                    badgeText="INEXISTENTE"
                    detail="Não reage com anticorpos anti-A ou anti-B do plasma receptor."
                    icon={FlaskConical}
                    accentColor="bg-[#02c39a]"
                    sparkline={<Sparkline data={getSparkValues('reacao_heterologa_pct')} color="#02c39a" />}
                  />

                  {/* CARD B4: SEGURANÇA EM RECEPTORES SENSIBILIZADOS */}
                  <MetricCard
                    title="B4 • SEGURANÇA EM RECEPTORES SENSIBILIZADOS"
                    subtitle="Segurança em pacientes com múltiplos anticorpos"
                    value={(currentReading.seguranca_sensibilizados_pct || 100.0).toFixed(1)}
                    unit="%"
                    percent={currentReading.seguranca_sensibilizados_pct || 100.0}
                    level="success"
                    badgeText="SEGURO"
                    detail="Pode ser infundido com segurança total em pacientes poli-transfundidos."
                    icon={Droplets}
                    accentColor="bg-[#00d8ff]"
                    sparkline={<Sparkline data={getSparkValues('seguranca_sensibilizados_pct')} color="#00d8ff" />}
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
          <section className="lg:col-span-7 flex flex-col gap-4">
            
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
            <div className="flex-1 glass-panel rounded-xl flex flex-col overflow-hidden relative shadow-2xl border-slate-800 min-h-[500px]">
              
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,_transparent_1px),_linear-gradient(90deg,_rgba(255,255,255,0.01)_1px,_transparent_1px)] bg-[size:20px_20px] pointer-events-none z-0" />
              
              {/* Header do Chat */}
              <div className="z-10 bg-slate-900/70 border-b border-slate-800/80 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-rose-500 animate-pulse" />
                  <span className="text-xs font-bold font-mono tracking-widest text-slate-300">
                    CAMADA 4: TRADUTOR CIENTÍFICO CONVERSACIONAL
                  </span>
                </div>
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
              </div>

              {/* Mensagens do Chat */}
              <div className="z-10 flex-1 max-h-[380px] overflow-y-auto scroll-smooth p-4 flex flex-col gap-3.5">
                {messages.map((msg, index) => (
                  <div 
                    key={index}
                    className={`flex flex-col max-w-[88%] ${msg.role === 'user' ? 'self-end items-end' : 'self-start items-start'}`}
                  >
                    <div 
                      className={`p-3.5 rounded-2xl text-sm leading-relaxed ${
                        msg.role === 'user' 
                          ? 'bg-slate-800 text-slate-100 rounded-tr-none border border-slate-700/60' 
                          : 'bg-slate-900/95 text-slate-200 border border-slate-800 rounded-tl-none glow-neon-border'
                      }`}
                    >
                      <div className="whitespace-pre-line font-sans">{msg.content}</div>
                    </div>
                    
                    <span className="text-[9px] text-slate-500 font-mono mt-1 px-1">
                      {msg.role === 'user' ? 'Visitante' : 'Tradutor Clínico EcoSanguis'}
                    </span>

                    {/* Bloco de IA Explicável Integrado */}
                    {msg.role === 'assistant' && msg.explicabilidade && (
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
                                className={`h-full rounded-full ${msg.explicabilidade.valores_sensores.oxigenacao < 0.90 ? 'bg-rose-500 animate-pulse' : 'bg-emerald-400'}`}
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
                                className={`h-full rounded-full ${msg.explicabilidade.valores_sensores.temperatura > 38.0 ? 'bg-rose-500 animate-pulse' : 'bg-emerald-400'}`}
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
                
                <div ref={messagesEndRef} />
              </div>

              {/* Botões de Ações Rápidas (Pills) */}
              <div className="z-10 px-4 py-2 border-t border-slate-900 flex gap-2 overflow-x-auto bg-slate-950/40">
                <button
                  type="button"
                  onClick={() => handleSendMessage('Qual o status atual do lote?')}
                  className="whitespace-nowrap text-[11px] text-emerald-400 border border-emerald-500/30 bg-emerald-500/5 px-3 py-1 rounded-full hover:bg-emerald-500/10 transition-colors font-medium"
                >
                  Status atual
                </button>
                <button
                  type="button"
                  onClick={() => handleSendMessage('O que é sangue artificial?')}
                  className="whitespace-nowrap text-[11px] text-rose-400 border border-rose-500/30 bg-rose-500/5 px-3 py-1 rounded-full hover:bg-rose-500/10 transition-colors font-medium"
                >
                  O que é sangue artificial?
                </button>
                <button
                  type="button"
                  onClick={() => handleSendMessage('Por que o lote está em risco?')}
                  className="whitespace-nowrap text-[11px] text-sky-400 border border-sky-500/30 bg-sky-500/5 px-3 py-1 rounded-full hover:bg-sky-500/10 transition-colors font-medium"
                >
                  Por que o lote está em risco?
                </button>
                <button
                  type="button"
                  onClick={() => handleSendMessage('Como funciona a limpeza de ruído e pH?')}
                  className="whitespace-nowrap text-[11px] text-slate-400 border border-slate-700 bg-slate-800/40 px-3 py-1 rounded-full hover:bg-slate-800 transition-colors font-medium"
                >
                  Limpeza de Ruído & pH
                </button>
              </div>

              {/* Caixa de Entrada de Texto */}
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputValue); }}
                className="z-10 bg-slate-900/80 border-t border-slate-800 px-4 py-3 flex gap-2 items-center"
              >
                <input 
                  type="text" 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Pergunte sobre os lotes, sensores ou previsões..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs sm:text-sm focus:outline-none focus:border-rose-500/70 text-slate-100 placeholder-slate-500 transition-all font-sans"
                />
                <Button 
                  type="submit"
                  className="bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white p-2.5 rounded-xl h-10 w-10 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(225,29,72,0.3)]"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>

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
                    Previsão de Demanda Hospitalar por IA
                  </h2>
                  <p className="text-xs text-slate-400">
                    Histórico de 7 dias e projeção preditiva da IA para os próximos 4 dias
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 font-mono text-[10px] uppercase tracking-widest text-slate-400 bg-slate-900/60 border border-slate-800 px-4 py-2 rounded-xl">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-4 rounded-full bg-sky-400" /> Demanda Histórica
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-2 w-4 rounded-full bg-rose-500" /> Previsão IA
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-2 w-4 rounded-full bg-emerald-400" /> Estoque Projetado
                </span>
              </div>
            </div>

            <DemandChart />

            <div className="mt-5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 text-xs text-amber-300 flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0" />
              <span>
                <strong>Alerta Clínico Preditivo:</strong> A IA estima 92 unidades de demanda em D+3, enquanto o estoque projetado cai para 43 unidades — reposição recomendada em até 48h para evitar desabastecimento crítico no pronto-socorro.
              </span>
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

      {/* ABA 3: CONSOLE TÉCNICO & AUDITORIA */}
      {activeTab === 'tecnico' && (
        <main className="flex-1 max-w-[1680px] w-full mx-auto p-4 sm:p-6 z-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* COLUNA ESQUERDA: SCRIPT PYTHON E ENDPOINT */}
          <section className="flex flex-col gap-4">
            <div className="glass-panel rounded-xl p-5 flex flex-col gap-3 flex-1 border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h2 className="text-xs font-bold tracking-widest text-slate-400 flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  SCRIPT DE SUPORTE: PONTE PYTHON (ARDUINO PARA API)
                </h2>
                <button 
                  onClick={copyToClipboard}
                  className="text-[10px] text-emerald-400 border border-emerald-500/30 hover:border-emerald-500 hover:bg-emerald-500/10 px-2.5 py-1.5 rounded-lg transition-all font-mono flex items-center gap-1.5"
                >
                  <Copy className="w-3 h-3" />
                  {copiedScript ? "COPIADO!" : "COPIAR SCRIPT"}
                </button>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                Rode este script Python no computador do estande conectado ao Arduino. O script lê as leituras da porta serial e faz requisições HTTP POST para a API do site, alimentando o painel em tempo real.
              </p>
              
              <div className="flex-1 bg-slate-950 border border-slate-900 rounded-xl p-3.5 overflow-auto max-h-[320px]">
                <pre className="text-[11px] text-slate-300 font-mono select-text">{pythonScript}</pre>
              </div>
            </div>

            <div className="glass-panel rounded-xl p-5 flex flex-col gap-3 border-slate-800">
              <h2 className="text-xs font-bold tracking-widest text-slate-400 border-b border-slate-800 pb-2 flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-rose-500" />
                DOCUMENTAÇÃO DO ENDPOINT DE TELEMETRIA
              </h2>
              
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded font-mono font-bold">POST</span>
                  <span className="text-xs font-mono text-white">/api/sensor-data</span>
                </div>
                <p className="text-xs text-slate-400 font-sans leading-relaxed">
                  O Arduino ou ponte envia leituras brutas em JSON. O backend limpa erros de digitação e calcula as variáveis secundárias.
                </p>
                <div className="bg-slate-950 border border-slate-900 rounded-xl p-3 mt-1">
                  <p className="text-[9px] text-slate-500 font-mono mb-1">PAYLOAD DE ENTRADA EXIGIDO:</p>
                  <pre className="text-[10px] text-slate-400 font-mono select-text">{JSON.stringify({
                    "lote_id": "SA-025",
                    "oxigenacao": "95%",
                    "temperatura": "36.8C",
                    "vazao": "4.8"
                  }, null, 2)}</pre>
                </div>
              </div>
            </div>
          </section>

          {/* COLUNA DIREITA: ARQUITETURA E AUDITORIA */}
          <section className="flex flex-col gap-4">
            <div className="glass-panel rounded-xl p-5 flex flex-col gap-3 border-slate-800">
              <h2 className="text-xs font-bold tracking-widest text-slate-400 border-b border-slate-800 pb-2 flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-sky-400" />
                FLUXO OPERACIONAL DE 4 CAMADAS
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[10px] font-mono mt-1">
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <span className="block font-bold text-emerald-400">1. DADOS</span>
                  <span className="text-[9px] text-slate-400 block mt-1">Coleta e armazena</span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <span className="block font-bold text-sky-400">2. PROCESS.</span>
                  <span className="text-[9px] text-slate-400 block mt-1">Limpa e normaliza</span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <span className="block font-bold text-amber-400">3. IA EXPL.</span>
                  <span className="text-[9px] text-slate-400 block mt-1">Inferência de risco</span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <span className="block font-bold text-rose-500">4. INTERM.</span>
                  <span className="text-[9px] text-slate-400 block mt-1">Chat de conversa</span>
                </div>
              </div>
            </div>

            {/* Trilha de Auditoria */}
            <div className="glass-panel rounded-xl p-5 flex flex-col gap-3 border-slate-800 flex-1">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h2 className="text-xs font-bold tracking-widest text-slate-400 flex items-center gap-2 uppercase">
                  <Database className="w-3.5 h-3.5 text-rose-500" />
                  CAMADA 1: LOGS DE AUDITORIA E RASTREABILIDADE
                </h2>
                <RefreshCw className="w-3.5 h-3.5 text-slate-400 cursor-pointer hover:text-white transition-colors" onClick={fetchAudits} />
              </div>

              <div className="flex-1 overflow-y-auto flex flex-col gap-2 max-h-[380px]">
                {audits.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-500">
                    Nenhum log de auditoria pendente no banco local.
                  </div>
                ) : (
                  audits.map((a, index) => (
                    <div
                      key={a.id || index}
                      className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs flex flex-col gap-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300 font-bold font-mono">[{a.action}]</span>
                        <span className="text-slate-500 font-mono text-[10px]">
                          {a.timestamp ? new Date(a.timestamp).toLocaleTimeString() : "--:--"}
                        </span>
                      </div>
                      <p className="text-slate-300 text-xs font-sans">{a.details}</p>
                      <div className="flex items-center gap-1 text-[9px] text-slate-500 font-mono">
                        <span>Operador:</span>
                        <span className="text-slate-400 font-bold">{a.operator || "SISTEMA"}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        </main>
      )}

      {/* ABA 4: SIMULADOR DE URGÊNCIA COM IA */}
      {activeTab === 'emergency' && (
        <main className="flex-1 max-w-[1680px] w-full mx-auto p-4 sm:p-6 z-10">
          <EmergencySimulator />
        </main>
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
