import { useState, useEffect, useCallback } from 'react';

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
 * Hook global `useArduinoData` para captura contínua de leituras da Serial USB Arduino (Baud Rate 115200),
 * processamento dos 3 sensores físicos (gas_value, flow_value, temp_value) e gestão do estado serial.
 */
export function useArduinoData(currentReading, history, lastPacketTime) {
  const [serialState, setSerialState] = useState({
    port: null,
    isSerialConnected: false,
    baudRate: 115200,
    webSerialSupported: typeof navigator !== 'undefined' && 'serial' in navigator
  });

  const [sensorValues, setSensorValues] = useState({
    gas_value: 0,
    flow_value: 0,
    temp_value: 0,
    b1: 0,
    b2: 0,
    b3: 0,
    b4: 0,
    b5: 0,
    isConnected: false,
    isSerialConnected: false,
    statusText: "[AGUARDANDO LEITURA SERIAL]",
    lastUpdate: null
  });

  // Conexão Web Serial USB direta via navegador (Baud Rate 115200)
  const connectSerial = useCallback(async () => {
    if (!serialState.webSerialSupported) return false;
    try {
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 115200 });
      setSerialState(prev => ({ ...prev, port, isSerialConnected: true }));
      
      const decoder = new TextDecoderStream();
      port.readable.pipeTo(decoder.writable);
      const inputStream = decoder.readable;
      const reader = inputStream.getReader();

      (async () => {
        let buffer = '';
        try {
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            buffer += value;
            const lines = buffer.split('\n');
            buffer = lines.pop();

            for (const line of lines) {
              const trimmed = line.trim();
              if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
                try {
                  const json = JSON.parse(trimmed);
                  const gas = parseFloat(json.gas_value ?? json.gas ?? json.oxigenacao ?? 0);
                  const flow = parseFloat(json.flow_value ?? json.flow ?? json.vazao ?? 0);
                  const temp = parseFloat(json.temp_value ?? json.temp ?? json.temperatura ?? 0);
                  
                  setSensorValues(prev => ({
                    ...prev,
                    gas_value: gas,
                    flow_value: flow,
                    temp_value: temp,
                    isConnected: true,
                    isSerialConnected: true,
                    statusText: getStatusBadge((gas / 100) * 100, true).text,
                    lastUpdate: new Date()
                  }));
                } catch {
                  // Silently ignore parse errors
                }
              }
            }
          }
        } catch {
          setSerialState(prev => ({ ...prev, isSerialConnected: false, port: null }));
        } finally {
          reader.releaseLock();
        }
      })();

      return true;
    } catch {
      setSerialState(prev => ({ ...prev, isSerialConnected: false, port: null }));
      return false;
    }
  }, [serialState.webSerialSupported]);

  // Atualização síncrona de estado com base nas leituras recebidas por props (Arduino/API Telemetria)
  useEffect(() => {
    if (!currentReading) {
      setSensorValues(prev => ({
        ...prev,
        isConnected: serialState.isSerialConnected,
        isSerialConnected: serialState.isSerialConnected,
        statusText: serialState.isSerialConnected ? prev.statusText : "[AGUARDANDO LEITURA SERIAL]"
      }));
      return;
    }

    // Leitura contínua dos 3 sensores físicos
    const gas_value = parseFloat(
      currentReading.gas_value ??
      (currentReading.oxigenacao_limpa ? (currentReading.oxigenacao_limpa * 100).toFixed(1) : 0)
    );

    const flow_value = parseFloat(
      currentReading.flow_value ??
      currentReading.vazao_l_min ??
      0
    );

    const temp_value = parseFloat(
      currentReading.temp_value ??
      currentReading.temperatura_c ??
      0
    );

    // Extração dos 5 valores numéricos B1 a B5
    const b1 = parseFloat(
      currentReading.oxigenacao_limpa ? (currentReading.oxigenacao_limpa * 100).toFixed(1) :
      currentReading.expansao_volemica_pct ||
      currentReading.suporte_cec_pct ||
      currentReading.meia_vida_h ||
      0
    );

    const b2 = parseFloat(
      currentReading.viscosidade_cp ||
      currentReading.carga_o2_pct ||
      0
    );

    const b3 = parseFloat(
      currentReading.temperatura_c ||
      currentReading.tempo_reconstituicao_s ||
      0
    );

    const b4 = parseFloat(
      currentReading.meia_vida_h ||
      currentReading.coagulabilidade_pct ||
      0
    );

    const b5 = parseFloat(
      currentReading.extracao_o2_pct ||
      currentReading.pressao_perfusao_mmhg ||
      0
    );

    // Validação da transmissão serial ativa (últimos 15 segundos)
    const now = Date.now();
    const isRecent = serialState.isSerialConnected || (lastPacketTime ? (now - lastPacketTime < 15000) : (history && history.length > 0));
    const activeConnection = Boolean(isRecent);

    const mainPct = isNaN(gas_value) ? (isNaN(b1) ? 0 : b1) : gas_value;
    const badgeInfo = getStatusBadge(mainPct, activeConnection);

    setSensorValues({
      gas_value: isNaN(gas_value) ? 0 : gas_value,
      flow_value: isNaN(flow_value) ? 0 : flow_value,
      temp_value: isNaN(temp_value) ? 0 : temp_value,
      b1: isNaN(b1) ? 0 : b1,
      b2: isNaN(b2) ? 0 : b2,
      b3: isNaN(b3) ? 0 : b3,
      b4: isNaN(b4) ? 0 : b4,
      b5: isNaN(b5) ? 0 : b5,
      isConnected: activeConnection,
      isSerialConnected: activeConnection,
      statusText: badgeInfo.text,
      badgeInfo: badgeInfo,
      lastUpdate: new Date()
    });
  }, [currentReading, history, lastPacketTime, serialState.isSerialConnected]);

  return {
    ...sensorValues,
    connectSerial,
    baudRate: 115200,
    webSerialSupported: serialState.webSerialSupported
  };
}
