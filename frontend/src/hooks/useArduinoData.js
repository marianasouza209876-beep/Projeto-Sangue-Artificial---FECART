import { useMemo } from 'react';
import { useSerialMonitor } from './useSerialMonitor';

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
 * A classificação visual sempre segue o valor exibido, inclusive no fallback.
 */
export function getStatusBadge(porcentagem) {
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
  const serialMonitor = useSerialMonitor();
  const sensorValues = useMemo(() => {
    if (!currentReading) return { gas_value: null, flow_value: null, temp_value: null, isConnected: false };

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
    const isRecent = (lastPacketTime ? (now - lastPacketTime < 15000) : (history && history.length > 0));
    const activeConnection = Boolean(isRecent);

    const mainPct = isNaN(gas_value) ? (isNaN(b1) ? 0 : b1) : gas_value;
    const badgeInfo = getStatusBadge(mainPct, activeConnection);

    return {
      gas_value: isNaN(gas_value) ? 0 : gas_value,
      flow_value: isNaN(flow_value) ? 0 : flow_value,
      temp_value: isNaN(temp_value) ? 0 : temp_value,
      b1: isNaN(b1) ? 0 : b1,
      b2: isNaN(b2) ? 0 : b2,
      b3: isNaN(b3) ? 0 : b3,
      b4: isNaN(b4) ? 0 : b4,
      b5: isNaN(b5) ? 0 : b5,
      isConnected: activeConnection,
      isSerialConnected: false,
      statusText: badgeInfo.text,
      badgeInfo: badgeInfo,
      lastUpdate: new Date()
    };
  }, [currentReading, history, lastPacketTime]);

  const usbSelected = serialMonitor.status !== 'OFFLINE' || serialMonitor.received > 0;
  const isUsbLive = serialMonitor.fresh;
  const reading = useMemo(() => {
    if (!isUsbLive) return currentReading;

    const gas = serialMonitor.sensors.gas_value;
    const flow = serialMonitor.sensors.flow_value;
    const temperature = serialMonitor.sensors.temp_value;
    const oxigenacao = typeof gas === 'number' ? gas / 100 : currentReading.oxigenacao_limpa;
    const temperatura = typeof temperature === 'number' ? temperature : currentReading.temperatura_c;
    const vazao = typeof flow === 'number' ? flow : currentReading.vazao_l_min;
    const critical = oxigenacao < 0.9 || temperatura < 35 || temperatura > 38.5;
    const warning = oxigenacao < 0.93 || temperatura < 36 || temperatura > 37.8;
    const status = critical ? 'CRÍTICO' : warning ? 'ALERTA' : 'ESTÁVEL';

    return {
      ...currentReading,
      oxigenacao_limpa: oxigenacao,
      temperatura_c: temperatura,
      vazao_l_min: vazao,
      status,
      alerta_mensagem: critical
        ? 'Leitura USB fora da faixa clínica configurada. Verifique o lote e os sensores.'
        : warning
          ? 'Leitura USB requer atenção: parâmetro próximo da faixa de alerta.'
          : 'Leitura USB recebida: parâmetros dentro da faixa configurada.',
      source: 'arduino-usb',
      receivedAt: serialMonitor.lastUpdate,
    };
  }, [currentReading, isUsbLive, serialMonitor.lastUpdate, serialMonitor.sensors]);

  return {
    ...sensorValues,
    ...(usbSelected ? {
      gas_value: serialMonitor.sensors.gas_value ?? null,
      flow_value: serialMonitor.sensors.flow_value ?? null,
      temp_value: serialMonitor.sensors.temp_value ?? null,
      isConnected: serialMonitor.fresh,
      statusText: serialMonitor.fresh ? '[ATUALIZAÇÃO EM TEMPO REAL]' : '',
      lastUpdate: serialMonitor.lastUpdate,
    } : {}),
    isSerialConnected: serialMonitor.status === 'CONECTADO',
    serialMonitor,
    connectSerial: serialMonitor.connect,
    disconnectSerial: serialMonitor.disconnect,
    webSerialSupported: serialMonitor.supported,
    reading,
    source: isUsbLive ? 'arduino-usb' : 'simulation',
  };
}
