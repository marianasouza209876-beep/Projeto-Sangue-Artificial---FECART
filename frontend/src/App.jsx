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
  Plus,
  X,
  Clock,
  Tag,
  Target
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || window.location.origin;

// Lista Oficial de Finalidades Clínicas
const FINALIDADES_OPCOES = [
  "Atendimento Pré-Hospitalar de Emergência (Trauma e Hemorragia Massiva)",
  "Preservação Avançada de Órgãos para Transplante",
  "Resgate e Cirurgia em Altas Altitudes",
  "Vítimas de Envenenamento por Monóxido de Carbono",
  "Tratamento de Queimaduras Graves e Choque Séptico",
  "Doação de sangue",
  "Manejo Clínico de Pacientes com Raros Fenótipos Sanguíneos"
];

// Componente para desenhar o Sparkline em SVG
const Sparkline = ({ data, color }) => {
  if (!data || data.length < 2) return null;
  const width = 120;
  const height = 30;
  
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
        className="filter drop-shadow-[0_0_3px_rgba(0,229,163,0.5)]"
      />
    </svg>
  );
};

// Objeto com os Limites e Protocolos Clínicos Médicos Mapeados
const PROTOCOLOS_CLINICOS = {
  "Atendimento Pré-Hospitalar de Emergência (Trauma e Hemorragia Massiva)": {
    o2: { normal: [95, 100], seguro: [92, 100], critico: 90 },
    temp: { normal: [36.5, 37.5], seguro: [36.0, 37.8], criticoMin: 35.0, criticoMax: 38.5 },
    ph: { normal: [7.35, 7.45], seguro: [7.30, 7.50], criticoMin: 7.25, criticoMax: 7.55 },
    viscosidade: { normal: [3.0, 4.5], seguro: [3.0, 5.0], criticoMin: 2.5, criticoMax: 5.5 },
    hematocrito: { normal: [35, 45], seguro: [32, 48], criticoMin: 30, criticoMax: 50 }
  },
  "Preservação Avançada de Órgãos para Transplante": {
    o2: { normal: [98, 100], seguro: [95, 100], critico: 95 },
    temp: { normal: [4.0, 10.0], seguro: [4.0, 37.5], criticoMin: 4.0, criticoMax: 37.5 },
    ph: { normal: [7.35, 7.45], seguro: [7.31, 7.49], criticoMin: 7.35, criticoMax: 7.45 },
    viscosidade: { normal: [2.5, 3.5], seguro: [2.0, 4.0], criticoMin: 2.0, criticoMax: 4.5 },
    hematocrito: { normal: [30, 40], seguro: [28, 42], criticoMin: 25, criticoMax: 45 }
  },
  "Resgate e Cirurgia em Altas Altitudes": {
    o2: { normal: [90, 98], seguro: [88, 100], critico: 85 },
    temp: { normal: [36.0, 37.2], seguro: [35.5, 37.5], criticoMin: 34.5, criticoMax: 38.0 },
    ph: { normal: [7.38, 7.48], seguro: [7.33, 7.52], criticoMin: 7.30, criticoMax: 7.55 },
    viscosidade: { normal: [3.2, 4.8], seguro: [3.0, 5.2], criticoMin: 2.8, criticoMax: 5.8 },
    hematocrito: { normal: [40, 52], seguro: [38, 55], criticoMin: 35, criticoMax: 58 }
  },
  "Vítimas de Envenenamento por Monóxido de Carbono": {
    o2: { normal: [98, 100], seguro: [96, 100], critico: 94 },
    temp: { normal: [36.5, 37.5], seguro: [36.0, 37.8], criticoMin: 35.0, criticoMax: 38.5 },
    ph: { normal: [7.35, 7.45], seguro: [7.31, 7.49], criticoMin: 7.28, criticoMax: 7.50 },
    viscosidade: { normal: [3.0, 4.2], seguro: [2.8, 4.5], criticoMin: 2.5, criticoMax: 5.0 },
    hematocrito: { normal: [36, 46], seguro: [33, 49], criticoMin: 30, criticoMax: 52 }
  },
  "Tratamento de Queimaduras Graves e Choque Séptico": {
    o2: { normal: [94, 100], seguro: [91, 100], critico: 89 },
    temp: { normal: [36.5, 38.0], seguro: [36.0, 38.5], criticoMin: 35.0, criticoMax: 39.0 },
    ph: { normal: [7.32, 7.45], seguro: [7.28, 7.48], criticoMin: 7.20, criticoMax: 7.52 },
    viscosidade: { normal: [2.8, 4.0], seguro: [2.5, 4.5], criticoMin: 2.2, criticoMax: 5.0 },
    hematocrito: { normal: [32, 42], seguro: [30, 45], criticoMin: 28, criticoMax: 48 }
  },
  "Doação de sangue": {
    o2: { normal: [95, 100], seguro: [93, 100], critico: 90 },
    temp: { normal: [36.5, 37.5], seguro: [36.0, 37.8], criticoMin: 35.0, criticoMax: 38.5 },
    ph: { normal: [7.35, 7.45], seguro: [7.31, 7.49], criticoMin: 7.30, criticoMax: 7.50 },
    viscosidade: { normal: [3.0, 4.5], seguro: [3.0, 5.0], criticoMin: 2.5, criticoMax: 5.5 },
    hematocrito: { normal: [38, 50], seguro: [36, 52], criticoMin: 30, criticoMax: 55 }
  },
  "Manejo Clínico de Pacientes com Raros Fenótipos Sanguíneos": {
    o2: { normal: [95, 100], seguro: [93, 100], critico: 90 },
    temp: { normal: [36.5, 37.5], seguro: [36.0, 37.8], criticoMin: 35.0, criticoMax: 38.5 },
    ph: { normal: [7.35, 7.45], seguro: [7.31, 7.49], criticoMin: 7.30, criticoMax: 7.50 },
    viscosidade: { normal: [3.0, 4.5], seguro: [3.0, 5.0], criticoMin: 2.5, criticoMax: 5.5 },
    hematocrito: { normal: [38, 48], seguro: [35, 50], criticoMin: 32, criticoMax: 53 }
  },
  "Simulação Fisiológica Humana": {
    o2: { normal: [95, 100], seguro: [93, 100], critico: 90 },
    temp: { normal: [36.5, 37.5], seguro: [36.0, 37.8], criticoMin: 35.0, criticoMax: 38.5 },
    ph: { normal: [7.35, 7.45], seguro: [7.31, 7.49], criticoMin: 7.35, criticoMax: 7.45 },
    viscosidade: { normal: [3.0, 4.5], seguro: [3.0, 5.0], criticoMin: 2.5, criticoMax: 5.5 },
    hematocrito: { normal: [38, 50], seguro: [36, 52], criticoMin: 30, criticoMax: 55 }
  }
};

export default function App() {
  // Estados da Aplicação
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedLot, setSelectedLot] = useState("SA-025");
  const [lots, setLots] = useState([
    {
      id: "SA-023",
      name: "Lote Alfa Trauma",
      nome: "Lote Alfa Trauma",
      createdAt: new Date().toLocaleString('pt-BR'),
      data_criacao: new Date().toLocaleString('pt-BR'),
      finalidade: FINALIDADES_OPCOES[0],
      destino: FINALIDADES_OPCOES[0],
      responsaveis: "Mariana Vicente, Julia Santana e Vitória Barreto",
      intervaloLeitura: "5s",
      protocolo: PROTOCOLOS_CLINICOS[FINALIDADES_OPCOES[0]]
    },
    {
      id: "SA-024",
      name: "Lote Beta Transplante",
      nome: "Lote Beta Transplante",
      createdAt: new Date().toLocaleString('pt-BR'),
      data_criacao: new Date().toLocaleString('pt-BR'),
      finalidade: FINALIDADES_OPCOES[1],
      destino: FINALIDADES_OPCOES[1],
      responsaveis: "Mariana Vicente, Julia Santana e Vitória Barreto",
      intervaloLeitura: "5s",
      protocolo: PROTOCOLOS_CLINICOS[FINALIDADES_OPCOES[1]]
    },
    {
      id: "SA-025",
      name: "Lote Gama Altitude",
      nome: "Lote Gama Altitude",
      createdAt: new Date().toLocaleString('pt-BR'),
      data_criacao: new Date().toLocaleString('pt-BR'),
      finalidade: FINALIDADES_OPCOES[2],
      destino: FINALIDADES_OPCOES[2],
      responsaveis: "Mariana Vicente, Julia Santana e Vitória Barreto",
      intervaloLeitura: "5s",
      protocolo: PROTOCOLOS_CLINICOS[FINALIDADES_OPCOES[2]]
    }
  ]);
  const [history, setHistory] = useState([]);
  const [audits, setAudits] = useState([]);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Olá! Sou o assistente clínico EcoSanguis. Pergunte-me sobre o estado de qualquer lote ou escolha uma das perguntas rápidas abaixo!',
      explicabilidade: null
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [packetCount, setPacketCount] = useState(142);
  const messagesEndRef = useRef(null);

  // Estados do Modal de Criação de Novo Lote
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newLotName, setNewLotName] = useState("");
  const [newLotCode, setNewLotCode] = useState("");
  const [newLotCreatedAt, setNewLotCreatedAt] = useState("");
  const [newLotFinalidade, setNewLotFinalidade] = useState(FINALIDADES_OPCOES[0]);

  // Função para abrir o modal de criação de lote com campos auto-preenchidos
  const openCreateLotModal = () => {
    const existingNumbers = lots.map(l => {
      const match = String(l.id).match(/SA-(\d+)/i);
      return match ? parseInt(match[1], 10) : 0;
    });
    const maxNum = existingNumbers.length > 0 ? Math.max(...existingNumbers, 24) : 25;
    const nextNum = maxNum + 1;
    const autoCode = `SA-${String(nextNum).padStart(3, '0')}`;
    
    // Obter data e hora do sistema do computador
    const now = new Date();
    const fullDateTime = now.toLocaleString('pt-BR');

    setNewLotCode(autoCode);
    setNewLotName(`Lote ${autoCode}`);
    setNewLotCreatedAt(fullDateTime);
    setNewLotFinalidade(FINALIDADES_OPCOES[0]);
    setIsModalOpen(true);
  };

  // Função para confirmar e cadastrar o lote
  const handleConfirmCreateLot = async (e) => {
    if (e) e.preventDefault();

    const finalCode = newLotCode.trim() || `SA-${String(lots.length + 25).padStart(3, '0')}`;
    const finalName = newLotName.trim() || `Lote ${finalCode}`;
    const finalCreatedAt = newLotCreatedAt || new Date().toLocaleString('pt-BR');
    const finalFinalidade = newLotFinalidade || FINALIDADES_OPCOES[0];
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

    // Integrar com o backend FastAPI se disponível
    try {
      const res = await fetch(`${API_BASE}/api/lots`, {
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
      if (res.ok) {
        fetchLots();
      }
    } catch (err) {
      console.log("Servidor offline: lote adicionado localmente no estado React.");
    }
  };

  // Função para apagar/deletar lote
  const handleDeleteLot = (lotIdToDelete) => {
    setLots(prev => prev.filter(lot => lot.id !== lotIdToDelete));
    if (selectedLot === lotIdToDelete && lots.length > 1) {
      setSelectedLot(lots[0].id);
    }
  };

  // Carrega lotes cadastrados do backend
  const fetchLots = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/lots`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const mappedLots = data.map(item => ({
            id: item.id,
            name: item.nome || item.name || `Lote ${item.id}`,
            nome: item.nome || item.name || `Lote ${item.id}`,
            createdAt: item.data_criacao || item.createdAt || new Date().toLocaleString('pt-BR'),
            data_criacao: item.data_criacao || item.createdAt || new Date().toLocaleString('pt-BR'),
            finalidade: item.finalidade || item.destino || FINALIDADES_OPCOES[0],
            destino: item.finalidade || item.destino || FINALIDADES_OPCOES[0],
            responsaveis: "Mariana Vicente, Julia Santana e Vitória Barreto",
            intervaloLeitura: "5s",
            protocolo: PROTOCOLOS_CLINICOS[item.finalidade] || PROTOCOLOS_CLINICOS[item.destino] || PROTOCOLOS_CLINICOS["Simulação Fisiológica Humana"]
          }));
          setLots(mappedLots);
        }
      }
    } catch (err) {
      console.log("Erro ao carregar lotes do backend:", err);
    }
  };

  // Carrega histórico do lote selecionado
  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/history/${selectedLot}`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
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
        setAudits(data);
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
    const interval = setInterval(() => {
      fetchHistory();
      setPacketCount(prev => prev + 1);
    }, 4000);
    return () => clearInterval(interval);
  }, [selectedLot]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Envio de pergunta e integração com backend
  const handleSendMessage = async (text) => {
    if (!text.trim()) return;

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

    if (text.toLowerCase().includes("status atual") || text.toLowerCase().includes("condições do sangue")) {
      setMessages(prev => [...prev, 
        { role: 'user', content: text },
        { role: 'assistant', content: `Análise em tempo real do lote ${selectedLot}: Oxigenação está em 95% (ótimo), pH em 7.4 (fisiológico) e Temperatura em 36.5°C. Todos os parâmetros clínicos estão dentro da normalidade operacional.` }
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
        }, 1000);
      } else {
        setIsTyping(false);
      }
    } catch (err) {
      console.log("Erro no chat:", err);
      setIsTyping(false);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: '⚠️ **[Erro de Conexão]**: Não foi possível contatar o Tradutor Científico. Verifique se o servidor backend FastAPI está rodando na porta 8000.'
      }]);
    }
  };

  // Valores de exibição atuais (último do histórico ou simulados se vazio)
  const currentReading = history.length > 0 ? history[history.length - 1] : {
    oxigenacao_limpa: 0.95,
    temperatura_c: 36.5,
    vazao_l_min: 4.8,
    ph: 7.40,
    viscosidade_cp: 3.8,
    hematocrito_pct: 40.0,
    status: "ESTÁVEL",
    alerta_mensagem: "Sem sinal ativo de sensores. Iniciando ponte..."
  };

  // Obter array de valores históricos para o Sparkline
  const getSparkValues = (key) => {
    if (history.length === 0) return [0, 0];
    return history.map(item => item[key]);
  };

  const getStatusColor = (status) => {
    if (status === "CRÍTICO") return "text-biotech-crimson border-biotech-crimson glow-crimson";
    if (status === "ALERTA") return "text-yellow-400 border-yellow-400";
    return "text-biotech-neon border-biotech-neon glow-neon";
  };

  const getStatusBg = (status) => {
    if (status === "CRÍTICO") return "bg-biotech-crimson/10 border-biotech-crimson/30";
    if (status === "ALERTA") return "bg-yellow-500/10 border-yellow-500/30";
    return "bg-biotech-neon/10 border-biotech-neon/30";
  };

  const pythonScript = `import time
import json
import random
import requests

API_URL = "${import.meta.env.VITE_API_URL || (window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port : ''))}/api/sensor-data"
LOTE_ID = "${selectedLot}"

print("Ponte de Dados Iniciada. Enviando para:", API_URL)
t = 0
while True:
    ox = 94.0 + 3.0 * random.uniform(-0.5, 0.5)
    temp = 36.5 + random.uniform(-0.2, 0.2)
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
        print("Erro ao enviar:", e)
    
    time.sleep(2.0)
    t += 2`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(pythonScript);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const selectedLotObj = lots.find(l => l.id === selectedLot) || lots[0];

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col font-sans relative overflow-x-hidden overflow-y-auto">
      
      {/* Detalhe de Malha de Circuitos no Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-950/20 via-slate-950 to-slate-950 pointer-events-none z-0" />
      
      {/* 1. TOPO / CABEÇALHO */}
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full fill-biotech-crimson drop-shadow-[0_0_8px_rgba(255,42,66,0.6)]">
              <path d="M50,10 C50,10 85,45 85,68 C85,85 70,95 50,95 C30,95 15,85 15,68 C15,45 50,10 50,10 Z" />
              <path d="M50,30 L50,60 M35,55 L50,55 M50,45 L65,45 M35,70 L50,70 M50,70 L65,75" stroke="#00E5A3" strokeWidth="3" fill="none" opacity="0.8" />
              <circle cx="35" cy="55" r="4" fill="#00E5A3" />
              <circle cx="65" cy="45" r="4" fill="#00E5A3" />
              <circle cx="35" cy="70" r="4" fill="#00E5A3" />
            </svg>
          </div>
          
          <div>
            <h1 className="text-xl font-bold tracking-wider text-slate-100 flex items-center gap-2">
              FLOWTIFICIAL <span className="text-[10px] bg-biotech-crimson/20 border border-biotech-crimson/50 text-biotech-crimson px-1.5 py-0.5 rounded font-mono">PROTÓTIPO</span>
            </h1>
            <p className="text-xs text-slate-400 font-mono tracking-tight">TRADUTOR CIENTÍFICO E IA EXPLICÁVEL PARA SANGUE ARTIFICIAL</p>
          </div>
        </div>

        {/* Barra de Conexão de Hardware */}
        <div className="flex items-center gap-6">
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-2 ${activeTab === 'dashboard' ? 'bg-slate-800 text-biotech-neon' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <Activity className="w-3.5 h-3.5" />
              Monitor Clínico
            </button>
            <button 
              onClick={() => setActiveTab('tecnico')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-2 ${activeTab === 'tecnico' ? 'bg-slate-800 text-biotech-neon' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <Terminal className="w-3.5 h-3.5" />
              Console Técnico
            </button>
          </div>

          <div className="flex items-center gap-3 bg-slate-900/60 border border-slate-800/80 px-4 py-2 rounded-xl">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-biotech-neon opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-biotech-neon animate-pulse-green"></span>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-400 font-mono">SISTEMA CONECTADO</p>
              <p className="text-xs text-biotech-neon font-bold font-mono">Arduino Nano • Porta COM3</p>
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================
         MODAL: CRIAR NOVO LOTE
         ======================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-5 relative animate-in fade-in zoom-in duration-200">
            
            {/* Header do Modal */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-biotech-neon" />
                <h2 className="text-base font-bold text-white font-mono tracking-wide">➕ CRIAR NOVO LOTE DE SANGUE</h2>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmCreateLot} className="flex flex-col gap-4">
              
              {/* Campo 1: Nome do Lote */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono text-slate-300 font-semibold flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><Tag className="w-3.5 h-3.5 text-biotech-neon" /> NOME DO LOTE</span>
                  <span className="text-[10px] text-slate-500 font-sans">(Defina um nome)</span>
                </label>
                <input 
                  type="text" 
                  value={newLotName}
                  onChange={(e) => setNewLotName(e.target.value)}
                  placeholder="Ex: Lote Emergência Alpha"
                  required
                  className="bg-slate-950 border border-slate-700 focus:border-biotech-neon rounded-lg px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none transition-colors"
                />
              </div>

              {/* Campo 2: Código do Lote (Gerado Automático) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono text-slate-300 font-semibold flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5 text-biotech-crimson" /> CÓDIGO DO LOTE</span>
                  <span className="text-[10px] bg-biotech-neon/10 border border-biotech-neon/30 text-biotech-neon px-2 py-0.5 rounded font-mono">GERADO AUTOMATICAMENTE</span>
                </label>
                <input 
                  type="text" 
                  value={newLotCode}
                  readOnly
                  className="bg-slate-950/60 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-biotech-neon font-mono font-bold cursor-not-allowed select-all"
                />
              </div>

              {/* Campo 3: Data e Hora da Criação (Sistema do Computador) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono text-slate-300 font-semibold flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-cyan-400" /> DATA E HORA DA CRIAÇÃO</span>
                  <span className="text-[10px] text-cyan-400 font-mono">SISTEMA DO COMPUTADOR</span>
                </label>
                <input 
                  type="text" 
                  value={newLotCreatedAt}
                  readOnly
                  className="bg-slate-950/60 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-cyan-400 font-mono cursor-not-allowed select-all"
                />
              </div>

              {/* Campo 4: Finalidade (Dropdown com as 7 opções) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono text-slate-300 font-semibold flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-amber-400" /> FINALIDADE CLÍNICA DO LOTE
                </label>
                <select 
                  value={newLotFinalidade}
                  onChange={(e) => setNewLotFinalidade(e.target.value)}
                  className="bg-slate-950 border border-slate-700 focus:border-biotech-neon rounded-lg px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none transition-colors cursor-pointer"
                >
                  {FINALIDADES_OPCOES.map((opcao, idx) => (
                    <option key={idx} value={opcao} className="bg-slate-900 text-slate-100 py-1">
                      {opcao}
                    </option>
                  ))}
                </select>
              </div>

              {/* Botoes de Acao */}
              <div className="flex justify-end gap-3 mt-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-mono text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  CANCELAR
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-mono font-bold bg-biotech-neon text-slate-950 hover:bg-emerald-400 rounded-lg transition-all shadow-lg shadow-biotech-neon/20 flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> CRIAR LOTE
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {activeTab === 'dashboard' ? (
        /* ========================================================
           TELA PRINCIPAL: DASHBOARD BIOMÉDICO
           ======================================================== */
        <main className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 p-4 sm:p-6 z-10 overflow-visible">
          
          {/* COLUNA ESQUERDA (MÉTRICAS RÁPIDAS - 1/3) */}
          <section className="lg:col-span-1 flex flex-col gap-4">
            
            {/* Lotes em Monitoramento */}
            <div className="glass-panel rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h2 className="text-xs font-bold tracking-widest text-slate-400 flex items-center gap-2">
                  <Database className="w-3.5 h-3.5 text-biotech-crimson" />
                  LOTES DE SANGUE EM ENSAIO
                </h2>
                <button 
                  onClick={openCreateLotModal}
                  className="text-[10px] text-biotech-neon border border-biotech-neon/30 hover:border-biotech-neon hover:bg-biotech-neon/10 px-2 py-1 rounded transition-all font-mono flex items-center gap-1 font-bold"
                >
                  <Plus className="w-3 h-3" /> NOVO LOTE
                </button>
              </div>

              {/* Informações detalhadas do Lote Selecionado */}
              {selectedLotObj && (
                <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-2.5 text-xs flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-biotech-neon font-mono">{selectedLotObj.id} • {selectedLotObj.name || selectedLotObj.nome}</span>
                    <span className="text-[9px] text-slate-500 font-mono">{selectedLotObj.createdAt || selectedLotObj.data_criacao}</span>
                  </div>
                  <p className="text-[10px] text-slate-300 font-sans line-clamp-2">
                    🎯 <span className="font-semibold text-amber-300">Finalidade:</span> {selectedLotObj.finalidade || selectedLotObj.destino}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-3 gap-2 max-h-36 overflow-y-auto pr-1">
                {lots.map(l => (
                  <div key={l.id} className="relative group">
                    <button
                      onClick={() => setSelectedLot(l.id)}
                      className={`w-full p-2 rounded-lg border text-center font-mono transition-all ${
                        selectedLot === l.id
                          ? 'bg-slate-800 border-biotech-neon text-biotech-neon font-bold shadow-lg shadow-biotech-neon/10'
                          : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span className="block text-xs">{l.id}</span>
                      <span className="block text-[9px] text-slate-400 truncate mt-0.5">{l.name || l.nome || 'Lote de Sangue'}</span>
                    </button>

                    {lots.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteLot(l.id);
                        }}
                        title="Excluir este lote"
                        className="absolute -top-1.5 -right-1.5 bg-red-950/80 text-red-400 hover:bg-red-600 hover:text-white border border-red-800/50 w-5 h-5 rounded-full text-[10px] flex items-center justify-center transition-all opacity-80 hover:opacity-100 z-20"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 5 Variáveis Fisiológicas */}
            <div className="flex-1 flex flex-col gap-3 justify-between">
              
              {/* CARD 1: OXIGENAÇÃO */}
              <div className="glass-panel glass-panel-hover rounded-xl p-3.5 flex items-center justify-between relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-biotech-neon" />
                <div>
                  <span className="text-[10px] text-slate-400 font-mono tracking-wider block">01 • SATURAÇÃO DE O₂ (OXIGENAÇÃO)</span>
                  <span className="text-2xl font-mono font-bold tracking-tight text-white">
                    {(currentReading.oxigenacao_limpa * 100).toFixed(1)}
                    <span className="text-xs text-slate-400 ml-1 font-sans font-normal">%</span>
                  </span>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-[10px] px-2 py-0.5 border rounded-full font-mono font-bold ${
                    currentReading.oxigenacao_limpa < 0.85 ? 'text-biotech-crimson border-biotech-crimson bg-biotech-crimson/10 animate-pulse' :
                    currentReading.oxigenacao_limpa < 0.90 ? 'text-yellow-400 border-yellow-400 bg-yellow-500/10' : 'text-biotech-neon border-biotech-neon bg-biotech-neon/10'
                  }`}>
                    {currentReading.oxigenacao_limpa < 0.90 ? 'SAT BAIXA' : 'ÓTIMO'}
                  </span>
                  <Sparkline data={getSparkValues('oxigenacao_limpa')} color={currentReading.oxigenacao_limpa < 0.90 ? '#ff2a42' : '#00E5A3'} />
                </div>
              </div>

              {/* CARD 2: TEMPERATURA */}
              <div className="glass-panel glass-panel-hover rounded-xl p-3.5 flex items-center justify-between relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500" />
                <div>
                  <span className="text-[10px] text-slate-400 font-mono tracking-wider block">02 • ESTABILIDADE TÉRMICA</span>
                  <span className="text-2xl font-mono font-bold tracking-tight text-white">
                    {currentReading.temperatura_c.toFixed(1)}
                    <span className="text-xs text-slate-400 ml-1 font-sans font-normal">°C</span>
                  </span>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-[10px] px-2 py-0.5 border rounded-full font-mono font-bold ${
                    currentReading.temperatura_c > 38.0 || currentReading.temperatura_c < 35.0 ? 'text-biotech-crimson border-biotech-crimson bg-biotech-crimson/10 animate-pulse' :
                    currentReading.temperatura_c > 37.5 ? 'text-yellow-400 border-yellow-400 bg-yellow-500/10' : 'text-biotech-neon border-biotech-neon bg-biotech-neon/10'
                  }`}>
                    {currentReading.temperatura_c > 38.0 ? 'HIPERTERMIA' : currentReading.temperatura_c < 35.0 ? 'HIPOTERMIA' : 'NORMAL'}
                  </span>
                  <Sparkline data={getSparkValues('temperatura_c')} color={currentReading.temperatura_c > 38.0 ? '#ff2a42' : '#f59e0b'} />
                </div>
              </div>

              {/* CARD 3: pH */}
              <div className="glass-panel glass-panel-hover rounded-xl p-3.5 flex items-center justify-between relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-400" />
                <div>
                  <span className="text-[10px] text-slate-400 font-mono tracking-wider block">03 • POTENCIAL HIDROGENIÔNICO (pH)</span>
                  <span className="text-2xl font-mono font-bold tracking-tight text-white">
                    {currentReading.ph.toFixed(2)}
                    <span className="text-xs text-slate-400 ml-1 font-sans font-normal">pH</span>
                  </span>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-[10px] px-2 py-0.5 border rounded-full font-mono font-bold ${
                    currentReading.ph < 7.30 ? 'text-biotech-crimson border-biotech-crimson bg-biotech-crimson/10' :
                    currentReading.ph < 7.35 || currentReading.ph > 7.45 ? 'text-yellow-400 border-yellow-400 bg-yellow-500/10' : 'text-biotech-neon border-biotech-neon bg-biotech-neon/10'
                  }`}>
                    {currentReading.ph < 7.35 ? 'ACIDOSE' : currentReading.ph > 7.45 ? 'ALCALOSE' : 'FISIOLÓGICO'}
                  </span>
                  <Sparkline data={getSparkValues('ph')} color="#22d3ee" />
                </div>
              </div>

              {/* CARD 4: VISCOSIDADE */}
              <div className="glass-panel glass-panel-hover rounded-xl p-3.5 flex items-center justify-between relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500" />
                <div>
                  <span className="text-[10px] text-slate-400 font-mono tracking-wider block">04 • RESISTÊNCIA DE FLUXO (VISCOSIDADE)</span>
                  <span className="text-2xl font-mono font-bold tracking-tight text-white">
                    {currentReading.viscosidade_cp.toFixed(1)}
                    <span className="text-xs text-slate-400 ml-1 font-sans font-normal">cP</span>
                  </span>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-[10px] px-2 py-0.5 border rounded-full font-mono font-bold ${
                    currentReading.viscosidade_cp > 5.0 ? 'text-biotech-crimson border-biotech-crimson bg-biotech-crimson/10' :
                    currentReading.viscosidade_cp < 3.5 ? 'text-yellow-400 border-yellow-400 bg-yellow-500/10' : 'text-biotech-neon border-biotech-neon bg-biotech-neon/10'
                  }`}>
                    {currentReading.viscosidade_cp > 4.5 ? 'ESPESSO' : currentReading.viscosidade_cp < 3.5 ? 'FLUIDO' : 'ESTÁVEL'}
                  </span>
                  <Sparkline data={getSparkValues('viscosidade_cp')} color="#a855f7" />
                </div>
              </div>

              {/* CARD 5: HEMATÓCRITO */}
              <div className="glass-panel glass-panel-hover rounded-xl p-3.5 flex items-center justify-between relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-400" />
                <div>
                  <span className="text-[10px] text-slate-400 font-mono tracking-wider block">05 • FRAÇÃO VOLUMÉTRICA (HEMATÓCRITO)</span>
                  <span className="text-2xl font-mono font-bold tracking-tight text-white">
                    {currentReading.hematocrito_pct.toFixed(1)}
                    <span className="text-xs text-slate-400 ml-1 font-sans font-normal">%</span>
                  </span>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-[10px] px-2 py-0.5 border rounded-full font-mono font-bold ${
                    currentReading.hematocrito_pct < 35.0 ? 'text-yellow-400 border-yellow-400 bg-yellow-500/10' : 'text-biotech-neon border-biotech-neon bg-biotech-neon/10'
                  }`}>
                    {currentReading.hematocrito_pct < 37.0 ? 'MÉDIO-BAIXO' : 'ÓTIMO'}
                  </span>
                  <Sparkline data={getSparkValues('hematocrito_pct')} color="#f87171" />
                </div>
              </div>

            </div>

            {/* Status do Hardware Arduino */}
            <div className="glass-panel rounded-xl p-3 flex items-center justify-between bg-slate-900/40">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-biotech-neon" />
                <div>
                  <p className="text-[10px] text-slate-400 font-mono">CONEXÃO FÍSICA ARDUINO</p>
                  <p className="text-xs font-mono font-bold">115200 baud • {packetCount} packets rx</p>
                </div>
              </div>
              <span className="text-[9px] bg-slate-800 border border-slate-700 text-slate-400 font-mono px-2 py-0.5 rounded">
                DRV: CH340G
              </span>
            </div>
          </section>

          {/* COLUNA CENTRAL/DIREITA (CHATBOT PRINCIPAL - 2/3) */}
          <section className="lg:col-span-2 flex flex-col gap-4">
            
            {/* Status Alerta Geral */}
            <div className={`border rounded-xl p-4 flex items-center gap-4 transition-all duration-300 ${getStatusBg(currentReading.status)}`}>
              <div className={`p-2.5 rounded-lg border bg-slate-950/80 ${getStatusColor(currentReading.status)}`}>
                {currentReading.status === "CRÍTICO" ? <XCircle className="w-6 h-6" /> :
                 currentReading.status === "ALERTA" ? <AlertTriangle className="w-6 h-6" /> : <CheckCircle className="w-6 h-6" />}
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-mono">VEREDITO GERAL DA CAMADA 2 & 3 • LOTE {selectedLot}</p>
                <h3 className="text-lg font-bold text-white tracking-wide">STATUS DO SISTEMA: {currentReading.status}</h3>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{currentReading.alerta_mensagem}</p>
              </div>
            </div>

            {/* Janela de Chat Conversacional */}
            <div className="flex-1 glass-panel rounded-xl flex flex-col overflow-hidden relative">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,_transparent_1px),_linear-gradient(90deg,_rgba(255,255,255,0.01)_1px,_transparent_1px)] bg-[size:20px_20px] pointer-events-none z-0" />
              
              {/* Header do Chat */}
              <div className="z-10 bg-slate-900/60 border-b border-slate-800/80 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-biotech-crimson animate-pulse" />
                  <span className="text-xs font-bold font-mono tracking-widest text-slate-400">CAMADA 4: TRADUTOR CIENTÍFICO CONVERSACIONAL</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                  <span className="h-1.5 w-1.5 rounded-full bg-biotech-neon"></span>
                  ONLINE
                </div>
              </div>

              {/* Corpo de Mensagens */}
              <div className="z-10 flex-1 min-h-[360px] max-h-[480px] overflow-y-auto p-4 flex flex-col gap-4">
                {messages.map((msg, index) => (
                  <div 
                    key={index}
                    className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'self-end items-end' : 'self-start items-start'}`}
                  >
                    <div 
                      className={`p-3.5 rounded-2xl text-sm leading-relaxed ${
                        msg.role === 'user' 
                          ? 'bg-slate-800 text-slate-100 rounded-tr-none border border-slate-700/60' 
                          : 'bg-slate-900/90 text-slate-200 border border-slate-800 rounded-tl-none glow-neon-border'
                      }`}
                    >
                      <div className="whitespace-pre-line font-sans">{msg.content}</div>
                    </div>
                    
                    <span className="text-[9px] text-slate-500 font-mono mt-1 px-1">
                      {msg.role === 'user' ? 'Visitante' : 'Tradutor Clínico EcoSanguis'}
                    </span>

                    {msg.role === 'assistant' && msg.explicabilidade && (
                      <div className="mt-3 w-full bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
                        <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                          <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 flex items-center gap-1.5">
                            <Cpu className="w-3.5 h-3.5 text-biotech-crimson" />
                            DETALHAMENTO DE INFERÊNCIA DA IA EXPLICÁVEL
                          </span>
                          <span className={`text-xs font-mono font-bold ${getStatusColor(msg.explicabilidade.nivel_risco)}`}>
                            RISCO: {msg.explicabilidade.risco_degradacao_pct}%
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
                          <div className="bg-slate-900/40 p-2 rounded border border-slate-900">
                            <div className="flex justify-between text-[10px] font-mono mb-1">
                              <span className="text-slate-400">Oxigenação (Ideal &gt;= 90%)</span>
                              <span className="text-white font-bold">{(msg.explicabilidade.valores_sensores.oxigenacao*100).toFixed(0)}%</span>
                            </div>
                            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${msg.explicabilidade.valores_sensores.oxigenacao < 0.90 ? 'bg-biotech-crimson animate-pulse' : 'bg-biotech-neon'}`}
                                style={{ width: `${msg.explicabilidade.valores_sensores.oxigenacao * 100}%` }}
                              />
                            </div>
                          </div>

                          <div className="bg-slate-900/40 p-2 rounded border border-slate-900">
                            <div className="flex justify-between text-[10px] font-mono mb-1">
                              <span className="text-slate-400">Temperatura (Ideal 35.5 - 37.5)</span>
                              <span className="text-white font-bold">{msg.explicabilidade.valores_sensores.temperatura.toFixed(1)}°C</span>
                            </div>
                            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${msg.explicabilidade.valores_sensores.temperatura > 38.0 || msg.explicabilidade.valores_sensores.temperatura < 35.0 ? 'bg-biotech-crimson animate-pulse' : 'bg-biotech-neon'}`}
                                style={{ width: `${Math.min(100, (msg.explicabilidade.valores_sensores.temperatura / 45) * 100)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {isTyping && (
                  <div className="flex flex-col max-w-[85%] self-start items-start">
                    <div className="p-3.5 rounded-2xl bg-slate-900 text-slate-200 border border-slate-800 rounded-tl-none flex flex-col gap-2 min-w-[280px]">
                      <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                        <Activity className="w-3.5 h-3.5 text-biotech-crimson animate-heartbeat" />
                        <span>Analisando dados mais recentes do Arduino...</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Botões de Ações Rápidas (Pills) */}
              <div className="z-10 px-4 py-2 border-t border-slate-900 flex gap-2 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => handleSendMessage('Qual o status atual do lote?')}
                  className="whitespace-nowrap text-[11px] text-biotech-neon border border-biotech-neon px-3 py-1.5 rounded-md hover:bg-biotech-neon/10 transition-colors"
                >
                  Status atual
                </button>
                <button
                  type="button"
                  onClick={() => handleSendMessage('O que é sangue artificial?')}
                  className="whitespace-nowrap text-[11px] text-biotech-crimson border border-biotech-crimson px-3 py-1.5 rounded-md hover:bg-biotech-crimson/10 transition-colors"
                >
                  O que é sangue artificial?
                </button>
                <button
                  type="button"
                  onClick={() => handleSendMessage('Por que o lote está em risco?')}
                  className="whitespace-nowrap text-[11px] text-cyan-400 border border-cyan-400 px-3 py-1.5 rounded-md hover:bg-cyan-400/10 transition-colors"
                >
                  Por que o lote está em risco?
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
                  placeholder="Faça uma pergunta sobre o lote de sangue ou sobre a IA do sistema..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-slate-700 text-slate-100 placeholder-slate-500 transition-all font-sans"
                />
                <button 
                  type="submit"
                  className="bg-slate-850 hover:bg-slate-800 text-biotech-neon p-2.5 rounded-xl border border-slate-700/60 hover:border-biotech-neon transition-all"
                >
                  <Send className="w-4.5 h-4.5" />
                </button>
              </form>

            </div>

          </section>
        </main>
      ) : (
        /* ========================================================
           TELA SECUNDÁRIA: CONSOLE TÉCNICO
           ======================================================== */
        <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 p-4 sm:p-6 z-10 overflow-visible">
          <section className="flex flex-col gap-4">
            <div className="glass-panel rounded-xl p-5 flex flex-col gap-3 flex-1">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h2 className="text-xs font-bold tracking-widest text-slate-400 flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-biotech-neon" />
                  SCRIPT DE SUPORTE: PONTE PYTHON (ARDUINO PARA API)
                </h2>
                <button 
                  onClick={copyToClipboard}
                  className="text-[10px] text-biotech-neon border border-biotech-neon/30 hover:border-biotech-neon hover:bg-biotech-neon/10 px-2.5 py-1.5 rounded transition-all font-mono flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  {copiedScript ? "COPIADO!" : "COPIAR SCRIPT"}
                </button>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                Rode este script Python no computador do estande conectado ao Arduino. O script lê as leituras da porta serial e faz requisições HTTP POST para a API do site.
              </p>
              <div className="flex-1 bg-slate-950 border border-slate-900 rounded-lg p-3 overflow-auto max-h-[300px]">
                <pre className="text-[10px] text-slate-400 font-mono select-text">{pythonScript}</pre>
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <div className="glass-panel rounded-xl p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h2 className="text-xs font-bold tracking-widest text-slate-400 flex items-center gap-2 uppercase">
                  <Database className="w-3.5 h-3.5 text-biotech-crimson" />
                  LOGS DE AUDITORIA E RASTREABILIDADE
                </h2>
                <RefreshCw className="w-3 h-3 text-slate-400 animate-spin" />
              </div>

              <div className="flex-1 overflow-y-auto flex flex-col gap-2 max-h-[350px]">
                {audits.map((a, index) => (
                  <div
                    key={a.id || index}
                    className="p-2.5 rounded bg-slate-900/50 border border-slate-800/80 text-xs flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-bold">[{a.acao || a.action || 'Log'}]</span>
                      <span className="text-slate-500">{a.timestamp ? new Date(a.timestamp).toLocaleTimeString() : ''}</span>
                    </div>
                    <p className="text-slate-300 text-xs font-sans">{a.descricao || a.details}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
      )}

      <footer className="z-10 py-3 border-t border-slate-900 bg-slate-950/50">
        <p className="text-[10px] text-slate-500 font-mono tracking-wider text-center">
          CONCEPÇÃO CIENTÍFICA: ARQUITETURA INTELIGENTE PARA UM SISTEMA DE SANGUE ARTIFICIAL
        </p>
      </footer>
    </div>
  );
}
