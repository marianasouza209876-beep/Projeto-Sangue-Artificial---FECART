import React, { useState, useEffect, useRef } from 'react';
import {
  Terminal,
  Send,
  Trash2,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  Zap,
  X,
  ChevronDown,
  ChevronUp,
  Cpu,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ArduinoSerialMonitor({
  logs = [],
  onClearLogs,
  onSendData,
  isSerialConnected = false,
  onConnect,
  onDisconnect,
  baudRate = 115200,
  onBaudChange,
  packetCount = 0,
  portInfo = "COM3"
}) {
  const [inputText, setInputText] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const [showTimestamps, setShowTimestamps] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [filterText, setFilterText] = useState('');
  const logsContainerRef = useRef(null);

  // Rolagem automática sempre que novos logs chegarem
  useEffect(() => {
    if (autoScroll && logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const handleSend = (e) => {
    e?.preventDefault();
    if (!inputText.trim()) return;
    if (onSendData) {
      onSendData(inputText.trim());
      setInputText('');
    }
  };

  const handleCopyLogs = () => {
    const textContent = logs.map(l => `[${l.timestamp}] ${l.text}`).join('\n');
    navigator.clipboard.writeText(textContent).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const filteredLogs = logs.filter(l => 
    !filterText || l.text.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div className={`glass-panel rounded-xl overflow-hidden border border-slate-800 bg-[#0B0F19] shadow-2xl flex flex-col transition-all duration-300 ${
      isExpanded ? 'fixed inset-4 sm:inset-10 z-50 h-auto' : 'w-full'
    }`}>
      {/* HEADER DO MONITOR SERIAL (Estilo Arduino IDE 2.0) */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className={`p-1.5 rounded-lg border ${
            isSerialConnected
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-slate-800 border-slate-700 text-slate-400'
          }`}>
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-mono font-bold tracking-wider text-slate-200 uppercase">
                MONITOR SERIAL • ARDUINO IDE
              </h4>
              {isSerialConnected ? (
                <span className="flex items-center gap-1 text-[9px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  CONECTADO
                </span>
              ) : (
                <span className="text-[9px] font-mono text-amber-400/80 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                  DESCONECTADO
                </span>
              )}
            </div>
            <p className="text-[10px] font-mono text-slate-400 mt-0.5">
              Porta: <span className="text-slate-300 font-semibold">{portInfo}</span> • {baudRate} baud • {packetCount} rx
            </p>
          </div>
        </div>

        {/* Controles do Cabeçalho */}
        <div className="flex items-center gap-2">
          {/* Campo de filtro rápido */}
          <input
            type="text"
            placeholder="Filtrar saída..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="text-[10px] bg-slate-950/70 text-slate-300 font-mono border border-slate-800 rounded px-2 py-1 focus:outline-none focus:border-cyan-500 w-28 sm:w-36"
          />

          {/* Opções de Rolagem e Timestamp */}
          <label className="hidden sm:flex items-center gap-1.5 text-[10px] text-slate-400 font-mono cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="w-3 h-3 accent-cyan-500 rounded cursor-pointer"
            />
            Auto-scroll
          </label>

          <label className="hidden sm:flex items-center gap-1.5 text-[10px] text-slate-400 font-mono cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showTimestamps}
              onChange={(e) => setShowTimestamps(e.target.checked)}
              className="w-3 h-3 accent-cyan-500 rounded cursor-pointer"
            />
            Timestamp
          </label>

          <Button
            type="button"
            onClick={handleCopyLogs}
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 text-[10px] font-mono gap-1"
            title="Copiar todos os logs"
          >
            {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span className="hidden md:inline">{isCopied ? 'Copiado!' : 'Copiar'}</span>
          </Button>

          <Button
            type="button"
            onClick={onClearLogs}
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 text-[10px] font-mono gap-1"
            title="Limpar terminal"
          >
            <Trash2 className="w-3 h-3" />
            <span className="hidden md:inline">Limpar</span>
          </Button>

          <Button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            title={isExpanded ? "Reduzir" : "Expandir para tela cheia"}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </Button>
        </div>
      </div>

      {/* ÁREA DE EXIBIÇÃO SERIAL (Terminal Preto com fontes mono) */}
      <div
        ref={logsContainerRef}
        className={`bg-[#050811] p-3 overflow-y-auto font-mono text-xs space-y-1 scrollbar-thin scrollbar-thumb-slate-800 select-text ${
          isExpanded ? 'flex-1 min-h-[400px]' : 'h-48'
        }`}
      >
        {filteredLogs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 py-6 text-center">
            <Terminal className="w-8 h-8 opacity-40 mb-2" />
            <p className="text-xs">Nenhum dado recebido na porta serial ainda.</p>
            <p className="text-[10px] text-slate-600 mt-1">
              Conecte o Arduino ou use o botão TESTAR para ver as saídas como no Arduino IDE.
            </p>
          </div>
        ) : (
          filteredLogs.map((log) => {
            const isJson = log.text.startsWith('{') && log.text.endsWith('}');
            const isTx = log.type === 'tx';
            const isSystem = log.type === 'system';

            return (
              <div
                key={log.id}
                className={`flex items-start gap-2 leading-tight hover:bg-slate-900/50 px-1 py-0.5 rounded transition-colors ${
                  isTx ? 'text-amber-300' : isSystem ? 'text-sky-400' : isJson ? 'text-emerald-400' : 'text-slate-300'
                }`}
              >
                {showTimestamps && (
                  <span className="text-[10px] text-slate-600 shrink-0 select-none">
                    [{log.timestamp}]
                  </span>
                )}
                <span className={`text-[10px] shrink-0 font-bold select-none ${
                  isTx ? 'text-amber-500' : isSystem ? 'text-sky-500' : 'text-emerald-500'
                }`}>
                  {isTx ? 'TX »' : isSystem ? 'SYS »' : 'RX «'}
                </span>
                <span className="break-all whitespace-pre-wrap flex-1">
                  {log.text}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* BARRA INFERIOR DE ENVIO DE COMANDOS (TX) */}
      <form onSubmit={handleSend} className="bg-slate-950 border-t border-slate-800 p-2.5 flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={isSerialConnected ? "Digite comando para enviar ao Arduino (TX)..." : "Conecte a porta serial para enviar comandos..."}
          disabled={!isSerialConnected}
          className="flex-1 bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 disabled:opacity-50"
        />

        <Button
          type="submit"
          disabled={!isSerialConnected || !inputText.trim()}
          size="sm"
          className="gap-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono px-3 py-1.5 h-auto transition-all disabled:opacity-40"
        >
          <Send className="w-3.5 h-3.5" />
          Enviar
        </Button>
      </form>
    </div>
  );
}
