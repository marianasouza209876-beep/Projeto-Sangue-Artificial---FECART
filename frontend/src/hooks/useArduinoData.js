import { useState, useEffect, useCallback, useRef } from 'react';

const SERIAL_BAUD_RATE = Number(import.meta.env.VITE_ARDUINO_BAUD || 9600);

/**
 * Calcula dinamicamente a porcentagem em relação a um valor ideal/referência.
 */
export function calculatePercentage(valorLido, valorIdeal) {
  if (valorLido === null || valorLido === undefined || isNaN(valorLido)) return 0;
  if (!valorIdeal || valorIdeal === 0) return 0;
  const pct = (parseFloat(valorLido) / parseFloat(valorIdeal)) * 100;
  return Math.min(100, Math.max(0, parseFloat(pct.toFixed(1))));
}

/**
 * Retorna o rótulo, badge e estilo de cor com base no valor da porcentagem.
 * - Verde (#00ff9d) para porcentagem >= 90% -> [ÓTIMO]
 * - Amarelo (#ffb703) para porcentagem entre 70% e 89% -> [ESTÁVEL]
 * - Vermelho (#ff4d4d) para porcentagem < 70% -> [ALERTA]
 * - Desconectado / Nulo -> [AGUARDANDO LEITURA SERIAL]
 */
export function getStatusBadge(porcentagem, isConnected = true) {
  if (!isConnected) {
    return {
      text: "[AGUARDANDO LEITURA SERIAL]",
      badgeText: "AGUARDANDO LEITURA SERIAL",
      statusText: "[AGUARDANDO LEITURA SERIAL]",
      color: "#38bdf8",
      textColor: "text-sky-400",
      bgColor: "bg-sky-500/10",
      borderColor: "border-sky-500/30",
      isWaiting: true
    };
  }

  const pct = parseFloat(porcentagem) || 0;

  if (pct >= 90) {
    return {
      text: "[ÓTIMO]",
      badgeText: "ÓTIMO",
      statusText: "[ÓTIMO]",
      color: "#00ff9d",
      textColor: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/30",
      isWaiting: false
    };
  } else if (pct >= 70) {
    return {
      text: "[ESTÁVEL]",
      badgeText: "ESTÁVEL",
      statusText: "[ESTÁVEL]",
      color: "#ffb703",
      textColor: "text-amber-400",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/30",
      isWaiting: false
    };
  } else {
    return {
      text: "[ALERTA]",
      badgeText: "ALERTA",
      statusText: "[ALERTA]",
      color: "#ff4d4d",
      textColor: "text-rose-400",
      bgColor: "bg-rose-500/10",
      borderColor: "border-rose-500/30",
      isWaiting: false
    };
  }
}

/**
 * Parser resiliente multi-formato para dados vindos da porta serial do Arduino.
 * Suporta:
 * 1. JSON: {"gas_value": 98.0, "flow_value": 4.8, "temp_value": 22.0} ou {"b1": 97.0, "b2": 4.8, ...}
 * 2. Chave-Valor: GAS:98.0,FLOW:4.8,TEMP:22.0 ou B1:97.0,B2:4.8,B3:53.0...
 * 3. CSV: 98.0, 4.8, 22.0 (3 valores) ou 97.0, 4.8, 53.0, 98.5, 60.6 (5 valores)
 */
function parseSerialLine(line) {
  const trimmed = line.trim();
  if (!trimmed) return null;

  // 1. Tentar JSON
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      const json = JSON.parse(trimmed);
      const mq135Raw = json.mq135_raw;
      const gasRaw = json.gas_raw ?? mq135Raw;
      const parsed = {
        gas: parseFloat(json.gas_value ?? json.gas ?? (gasRaw !== undefined ? (Number(gasRaw) / 1023) * 100 : json.oxigenacao ?? json.ox ?? 0)),
        flow: parseFloat(json.flow_value ?? json.flow ?? json.water_flow_l_min ?? json.flow_rate ?? json.vazao ?? 0),
        temp: parseFloat(json.temp_value ?? json.temp ?? json.temperatura ?? 0),
        b1: json.b1 !== undefined ? parseFloat(json.b1) : undefined,
        b2: json.b2 !== undefined ? parseFloat(json.b2) : undefined,
        b3: json.b3 !== undefined ? parseFloat(json.b3) : undefined,
        b4: json.b4 !== undefined ? parseFloat(json.b4) : undefined,
        b5: json.b5 !== undefined ? parseFloat(json.b5) : undefined,
      };
      return Number.isFinite(parsed.gas) && Number.isFinite(parsed.flow) && Number.isFinite(parsed.temp)
        ? parsed
        : null;
    } catch {
      // continua para outros formatos
    }
  }

  // 2. Tentar Chave-Valor (ex: GAS:98.5, FLOW:4.8, TEMP:22.0 ou B1:97.0)
  if (trimmed.includes(':') || trimmed.includes('=')) {
    const sep = trimmed.includes(',') ? ',' : ';';
    const pairs = trimmed.split(sep);
    const result = {};
    let matchedAny = false;

    for (const pair of pairs) {
      const parts = pair.split(/[:=]/);
      if (parts.length === 2) {
        const key = parts[0].trim().toLowerCase();
        const val = parseFloat(parts[1].trim());
        if (!isNaN(val)) {
          matchedAny = true;
          if (key.includes('gas') || key.includes('ox')) result.gas = val;
          else if (key.includes('flow') || key.includes('vaz')) result.flow = val;
          else if (key.includes('temp')) result.temp = val;
          else if (key === 'b1') result.b1 = val;
          else if (key === 'b2') result.b2 = val;
          else if (key === 'b3') result.b3 = val;
          else if (key === 'b4') result.b4 = val;
          else if (key === 'b5') result.b5 = val;
        }
      }
    }

    if (matchedAny && ('gas' in result || 'flow' in result || 'temp' in result)) {
      return {
        gas: result.gas,
        flow: result.flow,
        temp: result.temp,
        b1: result.b1,
        b2: result.b2,
        b3: result.b3,
        b4: result.b4,
        b5: result.b5,
      };
    }
  }

  // 3. Tentar CSV numérico puro (ex: "98.5, 4.8, 22.0" ou "97.0, 4.8, 53.0, 98.5, 60.6")
  const sep = trimmed.includes(',') ? ',' : (trimmed.includes(';') ? ';' : ' ');
  const rawParts = trimmed.split(sep).map(p => parseFloat(p.trim())).filter(n => !isNaN(n));

  if (rawParts.length >= 5) {
    return {
      b1: rawParts[0],
      b2: rawParts[1],
      b3: rawParts[2],
      b4: rawParts[3],
      b5: rawParts[4],
      gas: rawParts[0],
      flow: rawParts[1],
      temp: rawParts[2]
    };
  } else if (rawParts.length >= 3) {
    return {
      gas: rawParts[0],
      flow: rawParts[1],
      temp: rawParts[2]
    };
  }

  return null;
}

function getFormattedTimestamp() {
  const now = new Date();
  return now.toLocaleTimeString('pt-BR', { hour12: false }) + '.' + String(now.getMilliseconds()).padStart(3, '0');
}

/**
 * Hook global `useArduinoData` para captura contínua de leituras da Serial USB Arduino (Web Serial API),
 * processamento resiliente de pacotes, sincronização de dados e logs estilo Monitor Serial da Arduino IDE.
 */
export function useArduinoData(currentReading, history, lastPacketTimeProp) {
  const [baudRate, setBaudRate] = useState(SERIAL_BAUD_RATE);
  const [isSerialConnected, setIsSerialConnected] = useState(false);
  const [packetCount, setPacketCount] = useState(1420);
  const [portInfo, setPortInfo] = useState("COM3 (CH340G)");
  
  // Histórico completo de mensagens brutas (exatamente como o Monitor Serial da Arduino IDE)
  const [rawSerialLogs, setRawSerialLogs] = useState([
    {
      id: 1,
      timestamp: getFormattedTimestamp(),
      text: "Monitor Serial pronto. Conecte o cabo USB e clique em [CONECTAR ARDUINO].",
      type: "system"
    }
  ]);

  const portRef = useRef(null);
  const readerRef = useRef(null);
  const keepReadingRef = useRef(false);
  const serialSnapshotRef = useRef({ gas: null, flow: null, temp: null });

  const [sensorValues, setSensorValues] = useState({
    gas_value: 98.0,
    flow_value: 4.8,
    temp_value: 22.0,
    b1: 97.0,
    b2: 4.8,
    b3: 53.0,
    b4: 98.5,
    b5: 60.6,
    isConnected: false,
    isSerialConnected: false,
    statusText: "[AGUARDANDO LEITURA SERIAL]",
    badgeInfo: getStatusBadge(0, false),
    lastUpdate: null
  });

  const webSerialSupported = typeof navigator !== 'undefined' && 'serial' in navigator;

  // Limpar logs do Monitor Serial
  const clearSerialLogs = useCallback(() => {
    setRawSerialLogs([]);
  }, []);

  // Enviar dados/comandos para o Arduino (TX)
  const sendSerialData = useCallback(async (text) => {
    if (!portRef.current || !portRef.current.writable) {
      alert("Porta serial não conectada ou sem permissão de escrita.");
      return false;
    }

    try {
      const encoder = new TextEncoder();
      const writer = portRef.current.writable.getWriter();
      await writer.write(encoder.encode(text + "\r\n"));
      writer.releaseLock();

      setRawSerialLogs(prev => [
        ...prev.slice(-400),
        {
          id: Date.now() + Math.random(),
          timestamp: getFormattedTimestamp(),
          text: text,
          type: "tx"
        }
      ]);
      return true;
    } catch (err) {
      console.error("Erro ao enviar dados para a porta serial:", err);
      return false;
    }
  }, []);

  // Desconexão segura da porta Serial
  const disconnectSerial = useCallback(async () => {
    keepReadingRef.current = false;
    try {
      if (readerRef.current) {
        await readerRef.current.cancel();
        readerRef.current.releaseLock();
        readerRef.current = null;
      }
      if (portRef.current) {
        await portRef.current.close();
        portRef.current = null;
      }
    } catch (err) {
      console.warn("Aviso ao fechar porta serial:", err);
    } finally {
      setIsSerialConnected(false);
      setRawSerialLogs(prev => [
        ...prev.slice(-400),
        {
          id: Date.now() + Math.random(),
          timestamp: getFormattedTimestamp(),
          text: "[SISTEMA] Porta serial desconectada.",
          type: "system"
        }
      ]);
      setSensorValues(prev => ({
        ...prev,
        isConnected: false,
        isSerialConnected: false,
        statusText: "[AGUARDANDO LEITURA SERIAL]",
        badgeInfo: getStatusBadge(0, false)
      }));
    }
  }, []);

  // Conexão Web Serial USB direta via navegador
  const connectSerial = useCallback(async (selectedBaud = baudRate) => {
    if (!webSerialSupported) {
      alert("A Web Serial API não é suportada neste navegador. Utilize o Google Chrome ou Microsoft Edge.");
      return false;
    }

    try {
      // Se já estava conectado, fecha antes
      if (portRef.current) {
        await disconnectSerial();
      }

      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: Number(selectedBaud) });
      
      portRef.current = port;
      keepReadingRef.current = true;
      setIsSerialConnected(true);

      // Informações amigáveis da porta
      const info = port.getInfo ? port.getInfo() : {};
      const portName = info.usbVendorId ? `USB (VID: 0x${info.usbVendorId.toString(16)})` : "CH340G / COM3";
      setPortInfo(portName);

      setRawSerialLogs(prev => [
        ...prev.slice(-400),
        {
          id: Date.now() + Math.random(),
          timestamp: getFormattedTimestamp(),
          text: `[SISTEMA] Conectado na porta ${portName} a ${selectedBaud} baud. Aguardando transmissão...`,
          type: "system"
        }
      ]);

      const decoder = new TextDecoderStream();
      port.readable.pipeTo(decoder.writable);
      const inputStream = decoder.readable;
      const reader = inputStream.getReader();
      readerRef.current = reader;

      (async () => {
        let buffer = '';
        try {
          while (keepReadingRef.current) {
            const { value, done } = await reader.read();
            if (done) break;
            buffer += value;
            const lines = buffer.split('\n');
            buffer = lines.pop();

            for (const line of lines) {
              const trimmed = line.trim();
              if (trimmed) {
                // Registrar no Monitor Serial exatamente como a Arduino IDE faz
                setRawSerialLogs(prev => [
                  ...prev.slice(-400),
                  {
                    id: Date.now() + Math.random(),
                    timestamp: getFormattedTimestamp(),
                    text: trimmed,
                    type: "rx"
                  }
                ]);

                // Parser para atualizar os campos do site em tempo real
                const parsed = parseSerialLine(trimmed);
                if (parsed) {
                  setPacketCount(c => c + 1);

                  const snapshot = serialSnapshotRef.current;
                  const gas = parsed.gas ?? snapshot.gas;
                  const flow = parsed.flow ?? snapshot.flow;
                  const temp = parsed.temp ?? snapshot.temp;

                  if (![gas, flow, temp].every(Number.isFinite)) continue;
                  serialSnapshotRef.current = { gas, flow, temp };

                  // Calcular B1 a B5 se não vierem explícitos
                  const flow_pct = flow > 10 ? flow : (flow / 5) * 100;
                  const temp_pct = temp > 10 ? (temp <= 40 ? (temp / 40) * 100 : Math.min(100, temp)) : Math.min(100, (temp / 40) * 100);

                  const b1 = parsed.b1 !== undefined ? parsed.b1 : (flow_pct * 0.6) + (gas * 0.4);
                  const b2 = parsed.b2 !== undefined ? parsed.b2 : flow;
                  const b3 = parsed.b3 !== undefined ? parsed.b3 : (gas * 0.5) + (temp_pct * 0.5);
                  const b4 = parsed.b4 !== undefined ? parsed.b4 : gas;
                  const b5 = parsed.b5 !== undefined ? parsed.b5 : (flow_pct * 0.6) + (temp_pct * 0.4);

                  const badge = getStatusBadge(b1, true);

                  setSensorValues({
                    gas_value: gas,
                    flow_value: flow,
                    temp_value: temp,
                    b1: parseFloat(b1.toFixed(1)),
                    b2: parseFloat(b2.toFixed(1)),
                    b3: parseFloat(b3.toFixed(1)),
                    b4: parseFloat(b4.toFixed(1)),
                    b5: parseFloat(b5.toFixed(1)),
                    isConnected: true,
                    isSerialConnected: true,
                    statusText: badge.text,
                    badgeInfo: badge,
                    lastUpdate: new Date()
                  });
                }
              }
            }
          }
        } catch (readErr) {
          console.warn("Leitura serial encerrada:", readErr);
        } finally {
          try {
            reader.releaseLock();
          } catch {}
          setIsSerialConnected(false);
        }
      })();

      return true;
    } catch (err) {
      console.error("Falha ao abrir porta serial:", err);
      setIsSerialConnected(false);
      return false;
    }
  }, [baudRate, disconnectSerial, webSerialSupported]);

  // Função de injeção de teste para simulação ou validação rápida no dashboard
  const injectTestData = useCallback((customData) => {
    const gas = customData?.gas ?? 98.2;
    const flow = customData?.flow ?? 4.8;
    const temp = customData?.temp ?? 22.4;

    const flow_pct = flow > 10 ? flow : (flow / 5) * 100;
    const temp_pct = temp > 10 ? (temp <= 40 ? (temp / 40) * 100 : Math.min(100, temp)) : Math.min(100, (temp / 40) * 100);

    const b1 = customData?.b1 ?? ((flow_pct * 0.6) + (gas * 0.4));
    const b2 = customData?.b2 ?? flow;
    const b3 = customData?.b3 ?? ((gas * 0.5) + (temp_pct * 0.5));
    const b4 = customData?.b4 ?? gas;
    const b5 = customData?.b5 ?? ((flow_pct * 0.6) + (temp_pct * 0.4));

    const badge = getStatusBadge(b1, true);
    const mockJson = `{"gas_value": ${gas}, "flow_value": ${flow}, "temp_value": ${temp}}`;

    setRawSerialLogs(prev => [
      ...prev.slice(-400),
      {
        id: Date.now() + Math.random(),
        timestamp: getFormattedTimestamp(),
        text: mockJson,
        type: "rx"
      }
    ]);

    setPacketCount(c => c + 1);
    setSensorValues({
      gas_value: gas,
      flow_value: flow,
      temp_value: temp,
      b1: parseFloat(b1.toFixed(1)),
      b2: parseFloat(b2.toFixed(1)),
      b3: parseFloat(b3.toFixed(1)),
      b4: parseFloat(b4.toFixed(1)),
      b5: parseFloat(b5.toFixed(1)),
      isConnected: true,
      isSerialConnected: true,
      statusText: badge.text,
      badgeInfo: badge,
      lastUpdate: new Date()
    });
  }, []);

  // Sincronização secundária com leituras da API / telemetria persistida
  useEffect(() => {
    // Se a serial física estiver conectada, não sobrescreve os dados recebidos da USB
    if (isSerialConnected) return;

    if (!currentReading) {
      setSensorValues(prev => ({
        ...prev,
        isConnected: false,
        isSerialConnected: false,
        statusText: "[AGUARDANDO LEITURA SERIAL]",
        badgeInfo: getStatusBadge(0, false)
      }));
      return;
    }

    const gas_value = parseFloat(
      currentReading.gas_value ??
      (currentReading.oxigenacao_limpa ? (currentReading.oxigenacao_limpa * 100).toFixed(1) : 0)
    );
    const flow_value = parseFloat(currentReading.flow_value ?? currentReading.vazao_l_min ?? 0);
    const temp_value = parseFloat(currentReading.temp_value ?? currentReading.temperatura_c ?? 0);

    const now = Date.now();
    const hasRecentPacket = Boolean(lastPacketTimeProp && (now - lastPacketTimeProp < 15000));
    const activeConnection = hasRecentPacket;

    const b1 = currentReading.b1 ?? (gas_value || 97.0);
    const b2 = currentReading.b2 ?? (flow_value || 4.8);
    const b3 = currentReading.b3 ?? 53.0;
    const b4 = currentReading.b4 ?? 98.5;
    const b5 = currentReading.b5 ?? 60.6;

    const badgeInfo = getStatusBadge(b1, activeConnection);

    setSensorValues(prev => ({
      ...prev,
      gas_value: isNaN(gas_value) ? 98.0 : gas_value,
      flow_value: isNaN(flow_value) ? 4.8 : flow_value,
      temp_value: isNaN(temp_value) ? 22.0 : temp_value,
      b1,
      b2,
      b3,
      b4,
      b5,
      isConnected: activeConnection,
      isSerialConnected: activeConnection,
      statusText: badgeInfo.text,
      badgeInfo: badgeInfo,
      lastUpdate: activeConnection ? new Date() : prev.lastUpdate
    }));
  }, [currentReading, history, lastPacketTimeProp, isSerialConnected]);

  return {
    ...sensorValues,
    connectSerial,
    disconnectSerial,
    injectTestData,
    packetCount,
    setPacketCount,
    baudRate,
    setBaudRate,
    portInfo,
    webSerialSupported,
    isSerialConnected,
    rawSerialLogs,
    clearSerialLogs,
    sendSerialData
  };
}
