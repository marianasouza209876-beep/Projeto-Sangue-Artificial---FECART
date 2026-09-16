import React, { useState, useEffect, useRef } from 'react';
import {
  Code,
  Play,
  Upload,
  Terminal,
  Save,
  FileCode,
  Download,
  FolderOpen,
  Cpu,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Zap,
  RefreshCw,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  Trash2,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { flashArduinoBoard } from '@/lib/arduinoFlasher';

const API_BASE = import.meta.env.VITE_API_URL || window.location.origin;

// Presets de Código Arduino prontos para teste
const CODE_PRESETS = [
  {
    id: "multisensor",
    name: "🧪 Telemetria Flowtificial (DS18B20 + YF-S201 + MQ-135)",
    description: "Firmware completo com 3 sensores biomédicos físicos e saída em JSON por linha",
    code: `/*
 * ==============================================================================
 * PROJETO SANGUE ARTIFICIAL - FECART (FLOWTIFICIAL)
 * Firmware de Telemetria Multisensores (DS18B20, YF-S201, MQ-135)
 * ==============================================================================
 */

#include <OneWire.h>
#include <DallasTemperature.h>

// Mapeamento de Pinos
#define PINO_ONE_WIRE          2   // DS18B20 Temperatura (Digital 2)
#define PINO_SENSOR_FLUXO      3   // YF-S201 Vazão/Interrupção (Digital 3)
#define PINO_MQ135             A0  // MQ-135 Ar/Gás (Analógico A0)

OneWire oneWire(PINO_ONE_WIRE);
DallasTemperature sensorTemperatura(&oneWire);

volatile unsigned long contadorPulsos = 0;
float vazaoLmin = 0.0;
float volumeTotalLitros = 0.0;
float fatorCalibracaoYF = 7.5;

const unsigned long INTERVALO_LEITURA_MS = 1000;
unsigned long ultimoTempoLeitura = 0;

void IRAM_ATTR contaPulso() {
  contadorPulsos++;
}

void setup() {
  Serial.begin(115200);
  delay(500);

  sensorTemperatura.begin();
  pinMode(PINO_SENSOR_FLUXO, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(PINO_SENSOR_FLUXO), contaPulso, RISING);
  pinMode(PINO_MQ135, INPUT);

  Serial.println(F("{\\"status\\":\\"HARDWARE_ONLINE\\",\\"dispositivo\\":\\"FLOWTIFICIAL_MULTISENSOR\\"}"));
}

void loop() {
  unsigned long tempoAtual = millis();

  if (tempoAtual - ultimoTempoLeitura >= INTERVALO_LEITURA_MS) {
    unsigned long deltaTempoMs = tempoAtual - ultimoTempoLeitura;
    ultimoTempoLeitura = tempoAtual;

    // 1. Temperatura DS18B20
    sensorTemperatura.requestTemperatures();
    float tempC = sensorTemperatura.getTempCByIndex(0);
    bool tempValida = (tempC > -55.0 && tempC < 125.0 && tempC != 85.0);

    // 2. Vazão YF-S201
    noInterrupts();
    unsigned long pulsos = contadorPulsos;
    contadorPulsos = 0;
    interrupts();

    vazaoLmin = ((float)pulsos / fatorCalibracaoYF) * (1000.0 / (float)deltaTempoMs);
    float volumeJanela = (vazaoLmin / 60.0) * ((float)deltaTempoMs / 1000.0);
    volumeTotalLitros += volumeJanela;

    // 3. Gás MQ-135
    int rawMQ135 = analogRead(PINO_MQ135);

    bool ehSimulado = (!tempValida && pulsos == 0 && rawMQ135 < 10);
    float finalTemp = ehSimulado ? (36.5 + (random(-10, 10) / 10.0)) : tempC;
    float finalVazao = ehSimulado ? (4.8 + (random(-4, 4) / 10.0)) : vazaoLmin;
    int finalMQ135 = ehSimulado ? (320 + random(-20, 20)) : rawMQ135;

    // Transmissão JSON por Linha
    Serial.print(F("{\\"temp\\":"));
    Serial.print(finalTemp, 1);
    Serial.print(F(",\\"flow_rate\\":"));
    Serial.print(finalVazao, 1);
    Serial.print(F(",\\"volume\\":"));
    Serial.print(volumeTotalLitros, 2);
    Serial.print(F(",\\"mq135_raw\\":"));
    Serial.print(finalMQ135);
    Serial.print(F(",\\"is_simulated\\":"));
    Serial.print(ehSimulado ? F("true") : F("false"));
    Serial.println(F("}"));
  }
}
`
  },
  {
    id: "basic_telemetry",
    name: "📡 Telemetria Básica Serial (Sensors Simples)",
    description: "Sketch leve para leitura de potênciometros de teste em pinos analógicos",
    code: `/*
 * Flowtificial - Telemetria Básica Serial
 */

const int PINO_GAS   = A0;
const int PINO_FLUXO = A1;
const int PINO_TEMP  = A2;

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println(F("{\\"status\\": \\"HARDWARE_ONLINE\\"}"));
}

void loop() {
  int rawGas = analogRead(PINO_GAS);
  int rawFlow = analogRead(PINO_FLUXO);
  int rawTemp = analogRead(PINO_TEMP);

  float gas = (rawGas / 1023.0) * 30.0 + 70.0;
  float flow = (rawFlow / 1023.0) * 5.0 + 1.0;
  float temp = (rawTemp / 1023.0) * 25.0 + 15.0;

  Serial.print(F("{\\"gas_value\\": "));
  Serial.print(gas, 1);
  Serial.print(F(", \\"flow_value\\": "));
  Serial.print(flow, 1);
  Serial.print(F(", \\"temp_value\\": "));
  Serial.print(temp, 1);
  Serial.println(F("}"));

  delay(1000);
}
`
  },
  {
    id: "blink",
    name: "💡 Blink LED Teste (Pin 13)",
    description: "Sketch clássico de teste para piscar o LED embutido da placa",
    code: `/*
 * Flowtificial - Teste Piscar LED (Blink)
 */

void setup() {
  pinMode(LED_BUILTIN, OUTPUT);
  Serial.begin(115200);
  Serial.println("Teste Blink Inicializado no LED 13");
}

void loop() {
  digitalWrite(LED_BUILTIN, HIGH);
  Serial.println("LED LIGADO [HIGH]");
  delay(1000);
  
  digitalWrite(LED_BUILTIN, LOW);
  Serial.println("LED DESLIGADO [LOW]");
  delay(1000);
}
`
  }
];

export function ArduinoIDE({
  arduinoData,
  onNavigateToDashboard
}) {
  // Código no editor
  const [code, setCode] = useState(() => {
    return localStorage.getItem('flow_arduino_code') || CODE_PRESETS[0].code;
  });

  const [selectedPreset, setSelectedPreset] = useState("multisensor");
  const [selectedBoard, setSelectedBoard] = useState("arduino:avr:uno");
  const [isCompiling, setIsCompiling] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Estados de Console
  const [activeConsoleTab, setActiveConsoleTab] = useState('compiler'); // 'compiler' | 'flasher' | 'serial'
  const [compilerOutput, setCompilerOutput] = useState('');
  const [compilerErrors, setCompilerErrors] = useState([]);
  const [compiledHex, setCompiledHex] = useState(null);
  const [flasherLogs, setFlasherLogs] = useState([]);
  const [saveStatus, setSaveStatus] = useState('Salvo');
  const [highlightLine, setHighlightLine] = useState(null);

  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const consoleBottomRef = useRef(null);

  // Auto-salvar no LocalStorage
  useEffect(() => {
    localStorage.setItem('flow_arduino_code', code);
    setSaveStatus('Salvo no navegador');
  }, [code]);

  const handleCodeChange = (e) => {
    setCode(e.target.value);
    setSaveStatus('Modificado...');
  };

  const handleKeyDown = (e) => {
    // Suporte para tecla TAB no editor (insere 2 espaços)
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;

      const newCode = code.substring(0, start) + "  " + code.substring(end);
      setCode(newCode);

      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  // Carregar preset de código
  const handlePresetSelect = (presetId) => {
    const preset = CODE_PRESETS.find(p => p.id === presetId);
    if (preset) {
      setSelectedPreset(presetId);
      setCode(preset.code);
    }
  };

  // Importar arquivo .ino do computador
  const handleImportIno = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setCode(String(event.target.result));
        setSelectedPreset('custom');
      }
    };
    reader.readAsText(file);
  };

  // Exportar / Baixar arquivo .ino
  const handleExportIno = () => {
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'flowtificial_sketch.ino';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Ação 1: Compilar Código via API FastAPI
  const handleCompile = async () => {
    setIsCompiling(true);
    setActiveConsoleTab('compiler');
    setCompilerOutput('Compilando sketch com Arduino CLI... Por favor aguarde.\n');
    setCompilerErrors([]);

    try {
      const res = await fetch(`${API_BASE}/api/arduino/compile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code,
          board: selectedBoard
        })
      });

      if (!res.ok) {
        throw new Error(`Erro na API de compilação (HTTP ${res.status})`);
      }

      const data = await res.json();

      if (data.success) {
        setCompilerOutput(
          `✅ COMPILAÇÃO CONCLUÍDA COM SUCESSO!\n` +
          `Placa: ${selectedBoard}\n` +
          `Bibliotecas vinculadas: OneWire, DallasTemperature\n\n` +
          `${data.stdout || ''}`
        );
        setCompiledHex(data.hex);
        setCompilerErrors([]);
      } else {
        setCompilerOutput(
          `❌ FALHA DE COMPILAÇÃO!\n\n` +
          `${data.stderr || data.stdout || 'Erros encontrados durante a compilação do código.'}`
        );
        setCompilerErrors(data.errors || []);
        setCompiledHex(null);
      }
    } catch (err) {
      setCompilerOutput(`❌ Erro ao conectar ao serviço de compilação: ${err.message}\nVerifique se a API backend Python está rodando.`);
      setCompiledHex(null);
    } finally {
      setIsCompiling(false);
    }
  };

  // Ação 2: Enviar/Gravar na Placa via Web Serial
  const handleUpload = async () => {
    setIsUploading(true);
    setUploadProgress(0);
    setActiveConsoleTab('flasher');
    setFlasherLogs([{ time: new Date().toLocaleTimeString(), text: "Iniciando processo de verificação e gravação..." }]);

    try {
      // 1. Compila primeiro se não estiver compilado ainda
      let hexToFlash = compiledHex;
      if (!hexToFlash) {
        setFlasherLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), text: "Compilando código antes do envio..." }]);
        
        const res = await fetch(`${API_BASE}/api/arduino/compile`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: code, board: selectedBoard })
        });
        const data = await res.json();

        if (!data.success || !data.hex) {
          throw new Error(`Compilação falhou: ${data.stderr || 'Verifique o console de compilação.'}`);
        }
        hexToFlash = data.hex;
        setCompiledHex(hexToFlash);
      }

      // 2. Se a porta serial do monitor estiver aberta para leitura contínua, pausa para liberar a porta COM
      if (arduinoData.isSerialConnected) {
        setFlasherLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), text: "Pausando leitura serial do monitor para liberar a porta COM..." }]);
        await arduinoData.disconnectSerial();
      }

      // 3. Solicita a porta serial se necessário e grava o HEX
      if (!navigator.serial) {
        throw new Error("Web Serial API não disponível neste navegador. Use Google Chrome ou Edge.");
      }

      let port = arduinoData.portRef?.current;
      if (!port) {
        setFlasherLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), text: "Selecione a porta USB do Arduino na janela do navegador..." }]);
        port = await navigator.serial.requestPort();
      }

      // Executa gravação STK500
      await flashArduinoBoard({
        port,
        hexString: hexToFlash,
        baudRate: selectedBoard.includes("old") ? 57600 : 115200,
        onProgress: (pct) => setUploadProgress(pct),
        onLog: (msg) => {
          setFlasherLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), text: msg }]);
        }
      });

      setFlasherLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), text: "🎉 Gravação concluída! Retomando conexão serial do monitor..." }]);

      // 4. Retoma a leitura serial no monitor após a gravação
      setTimeout(() => {
        arduinoData.connectSerial(115200);
      }, 1000);

    } catch (err) {
      setFlasherLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), text: `❌ Erro de Envio: ${err.message}` }]);
    } finally {
      setIsUploading(false);
    }
  };

  // Formatação de números de linha
  const linesCount = code.split('\n').length;
  const lineNumbers = Array.from({ length: linesCount }, (_, i) => i + 1);

  return (
    <div className="flex-1 max-w-[1680px] w-full mx-auto p-4 sm:p-6 z-10 flex flex-col gap-4 min-h-[calc(100vh-120px)]">

      {/* PAINEL SUPERIOR: CABEÇALHO DA IDE E SELEÇÃO DE PLACA */}
      <div className="glass-panel rounded-xl p-4 bg-[#0B0F19] border-slate-800 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        
        {/* Título da IDE */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Code className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-mono font-bold tracking-wider text-slate-100 uppercase">
                PROGRAMAR ARDUINO • IDE WEB FLOWTIFICIAL
              </h2>
              <span className="text-[9px] font-mono font-bold bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 px-2 py-0.5 rounded">
                v2.0 NATIVA
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Escreva, compile e grave códigos C++/Arduino diretamente no seu microcontrolador.
            </p>
          </div>
        </div>

        {/* Seletor de Presets & Placas */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Preset Selector */}
          <div className="flex flex-col">
            <label className="text-[9px] font-mono text-slate-400 uppercase mb-0.5">Exemplos Prontos:</label>
            <select
              aria-label="Exemplos Prontos"
              value={selectedPreset}
              onChange={(e) => handlePresetSelect(e.target.value)}
              className="text-xs bg-slate-900 text-slate-200 font-mono border border-slate-700 rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-500 cursor-pointer max-w-xs"
            >
              {CODE_PRESETS.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
              <option value="custom">✏️ Código Personalizado</option>
            </select>
          </div>

          {/* Board Selector */}
          <div className="flex flex-col">
            <label className="text-[9px] font-mono text-slate-400 uppercase mb-0.5">Placa Alvo:</label>
            <select
              aria-label="Placa Alvo"
              value={selectedBoard}
              onChange={(e) => setSelectedBoard(e.target.value)}
              className="text-xs bg-slate-900 text-slate-200 font-mono border border-slate-700 rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="arduino:avr:uno">Arduino Uno (ATmega328P)</option>
              <option value="arduino:avr:nano">Arduino Nano (ATmega328P)</option>
              <option value="arduino:avr:nano:cpu=atmega328old">Arduino Nano (Old Bootloader)</option>
              <option value="arduino:avr:mega">Arduino Mega 2560</option>
              <option value="esp32:esp32:esp32">ESP32 Dev Module</option>
            </select>
          </div>

          {/* Status de auto-salvamento */}
          <div className="hidden lg:flex items-center gap-1.5 text-[10px] font-mono text-slate-400 bg-slate-900/60 border border-slate-800 px-3 py-1.5 rounded-lg self-end">
            <Save className="w-3 h-3 text-emerald-400" />
            <span>{saveStatus}</span>
          </div>
        </div>
      </div>

      {/* BARRA DE AÇÕES PRINCIPAIS (BOTÕES DE VERIFICAR, ENVIAR, CONECTAR) */}
      <div className="flex items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl flex-wrap">
        
        <div className="flex items-center gap-2">
          {/* Botão Compilar */}
          <Button
            type="button"
            onClick={handleCompile}
            disabled={isCompiling || isUploading}
            size="sm"
            className="gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold px-4 py-2 h-auto shadow-lg shadow-cyan-950/40 border border-cyan-400/30 transition-all disabled:opacity-50"
          >
            {isCompiling ? <RefreshCw className="w-4 h-4 animate-spin text-cyan-200" /> : <Play className="w-4 h-4 text-cyan-200" />}
            {isCompiling ? "COMPILANDO..." : "VERIFICAR / COMPILAR"}
          </Button>

          {/* Botão Enviar para a Placa */}
          <Button
            type="button"
            onClick={handleUpload}
            disabled={isCompiling || isUploading}
            size="sm"
            className="gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold px-4 py-2 h-auto shadow-lg shadow-emerald-950/40 border border-emerald-400/30 transition-all disabled:opacity-50"
          >
            {isUploading ? <RefreshCw className="w-4 h-4 animate-spin text-emerald-200" /> : <Upload className="w-4 h-4 text-emerald-200" />}
            {isUploading ? `ENVIANDO (${uploadProgress}%)...` : "ENVIAR PARA A PLACA"}
          </Button>
        </div>

        {/* Ações de Arquivo & Conexão */}
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportIno}
            accept=".ino,.cpp,.c,.txt"
            className="hidden"
          />

          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            size="sm"
            variant="outline"
            className="gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700 text-xs font-mono px-3 py-2 h-auto"
            title="Importar arquivo .ino do computador"
          >
            <FolderOpen className="w-3.5 h-3.5 text-sky-400" />
            Importar .ino
          </Button>

          <Button
            type="button"
            onClick={handleExportIno}
            size="sm"
            variant="outline"
            className="gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700 text-xs font-mono px-3 py-2 h-auto"
            title="Exportar sketch como arquivo .ino"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            Exportar .ino
          </Button>

          {/* Conectar USB */}
          {arduinoData.isSerialConnected ? (
            <Button
              type="button"
              onClick={arduinoData.disconnectSerial}
              size="sm"
              className="gap-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-mono px-3 py-2 h-auto"
            >
              <XCircle className="w-3.5 h-3.5" />
              Desconectar USB
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() => arduinoData.connectSerial()}
              size="sm"
              className="gap-1.5 bg-amber-600 hover:bg-amber-500 text-white font-mono text-xs font-semibold px-3 py-2 h-auto shadow-md border border-amber-400/30"
            >
              <Zap className="w-3.5 h-3.5" />
              Conectar USB
            </Button>
          )}
        </div>
      </div>

      {/* ÁREA CENTRAL: EDITOR DE CÓDIGO COM NÚMEROS DE LINHA */}
      <div className="flex-1 glass-panel rounded-xl border border-slate-800 bg-[#050811] overflow-hidden flex flex-col min-h-[420px] shadow-2xl relative">
        
        {/* Linha de Status da Biblioteca */}
        <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-1.5 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-3">
            <span className="text-slate-300 font-bold">Arquivos: sketch.ino</span>
            <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
              ✓ Suporte a OneWire & DallasTemperature Ativo
            </span>
          </div>
          <div>
            <span>Linhas: {linesCount}</span>
          </div>
        </div>

        {/* Corpo do Editor */}
        <div className="flex-1 flex overflow-hidden relative">
          
          {/* Gutter com números de linha */}
          <div className="w-12 bg-slate-950 border-r border-slate-800 text-right pr-2.5 py-3 font-mono text-xs text-slate-600 select-none overflow-hidden flex flex-col">
            {lineNumbers.map(n => (
              <span
                key={n}
                className={`leading-6 ${
                  highlightLine === n ? 'text-rose-400 font-bold bg-rose-500/20 px-1 rounded' : ''
                }`}
              >
                {n}
              </span>
            ))}
          </div>

          {/* Área Textarea do Código */}
          <textarea
            ref={textareaRef}
            value={code}
            onChange={handleCodeChange}
            onKeyDown={handleKeyDown}
            spellCheck="false"
            className="flex-1 bg-transparent p-3 font-mono text-xs text-slate-200 leading-6 focus:outline-none resize-none scrollbar-thin scrollbar-thumb-slate-800 selection:bg-cyan-500/30"
            style={{ tabSize: 2 }}
          />
        </div>
      </div>

      {/* PAINEL INFERIOR: CONSOLE DE ERROS, FLASH E MONITOR SERIAL */}
      <div className="glass-panel rounded-xl border border-slate-800 bg-[#0B0F19] overflow-hidden flex flex-col h-64 shadow-2xl">
        
        {/* Abas do Console */}
        <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveConsoleTab('compiler')}
              className={`px-3 py-1 rounded text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                activeConsoleTab === 'compiler'
                  ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              Compilação & Erros
              {compilerErrors.length > 0 && (
                <span className="bg-rose-500 text-white text-[9px] px-1.5 rounded-full font-bold">
                  {compilerErrors.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveConsoleTab('flasher')}
              className={`px-3 py-1 rounded text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                activeConsoleTab === 'flasher'
                  ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              Progresso do Envio
              {isUploading && (
                <span className="text-emerald-400 text-[10px] font-mono animate-pulse">
                  {uploadProgress}%
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveConsoleTab('serial')}
              className={`px-3 py-1 rounded text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                activeConsoleTab === 'serial'
                  ? 'bg-slate-800 text-amber-400 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              Monitor Serial
            </button>
          </div>

          <div className="flex items-center gap-2">
            {onNavigateToDashboard && (
              <Button
                type="button"
                onClick={onNavigateToDashboard}
                size="sm"
                variant="outline"
                className="gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 text-[11px] font-mono px-3 py-1 h-auto"
              >
                <Zap className="w-3.5 h-3.5 text-rose-400" />
                Ir para o Dashboard Clínico
              </Button>
            )}
          </div>
        </div>

        {/* Conteúdo da Aba 1: Compilador */}
        {activeConsoleTab === 'compiler' && (
          <div className="flex-1 p-3 bg-[#050811] overflow-y-auto font-mono text-xs space-y-2 select-text">
            {compilerErrors.length > 0 && (
              <div className="mb-3 space-y-1">
                <p className="text-rose-400 font-bold text-[11px] uppercase tracking-wider">
                  ⚠️ Erros de Compilação Encontrados:
                </p>
                {compilerErrors.map((err, idx) => (
                  <div
                    key={idx}
                    onClick={() => setHighlightLine(err.line)}
                    className="p-2 rounded bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/20 cursor-pointer flex items-center justify-between"
                  >
                    <span>Linha {err.line}, Coluna {err.column}: {err.message}</span>
                    <span className="text-[10px] text-rose-400 font-mono underline">Ir para a linha</span>
                  </div>
                ))}
              </div>
            )}
            
            <pre className="whitespace-pre-wrap break-all text-slate-300 leading-relaxed">
              {compilerOutput || "Clique em [VERIFICAR / COMPILAR] para testar o código."}
            </pre>
          </div>
        )}

        {/* Conteúdo da Aba 2: Flasher / Envio */}
        {activeConsoleTab === 'flasher' && (
          <div className="flex-1 p-3 bg-[#050811] overflow-y-auto font-mono text-xs space-y-1 select-text">
            {isUploading && (
              <div className="mb-3 bg-slate-900 border border-slate-800 rounded p-2.5">
                <div className="flex items-center justify-between text-xs font-mono text-slate-300 mb-1">
                  <span>Gravando firmware no Arduino...</span>
                  <span className="text-emerald-400 font-bold">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full transition-all duration-200"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {flasherLogs.map((logItem, idx) => (
              <div key={idx} className="flex items-start gap-2 text-slate-300 hover:bg-slate-900/50 px-1 py-0.5 rounded">
                <span className="text-[10px] text-slate-500 select-none">[{logItem.time}]</span>
                <span>{logItem.text}</span>
              </div>
            ))}
          </div>
        )}

        {/* Conteúdo da Aba 3: Monitor Serial */}
        {activeConsoleTab === 'serial' && (
          <div className="flex-1 p-3 bg-[#050811] overflow-y-auto font-mono text-xs space-y-1 select-text">
            {arduinoData.rawSerialLogs.map((logItem) => (
              <div
                key={logItem.id}
                className={`flex items-start gap-2 ${
                  logItem.type === 'tx' ? 'text-amber-300' : logItem.type === 'system' ? 'text-sky-400' : 'text-emerald-400'
                }`}
              >
                <span className="text-[10px] text-slate-600 select-none">[{logItem.timestamp}]</span>
                <span className="text-[10px] font-bold select-none">{logItem.type === 'tx' ? 'TX »' : logItem.type === 'system' ? 'SYS »' : 'RX «'}</span>
                <span>{logItem.text}</span>
              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
}
