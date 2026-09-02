import { useState, useEffect } from 'react';

/**
 * Hook global `useArduinoData` para processar e expor os 5 valores numéricos dinâmicos (B1, B2, B3, B4, B5)
 * das leituras em tempo real e sinalizar a conectividade/disponibilidade serial do Arduino.
 */
export function useArduinoData(currentReading, history, lastPacketTime) {
  const [data, setData] = useState({
    b1: 0,
    b2: 0,
    b3: 0,
    b4: 0,
    b5: 0,
    isConnected: false,
    isAvailable: false,
    lastUpdate: null
  });

  useEffect(() => {
    if (!currentReading) {
      setData(prev => ({ ...prev, isConnected: false, isAvailable: false }));
      return;
    }

    // Extração dos 5 valores numéricos B1 a B5
    const b1 = parseFloat(
      currentReading.oxigenacao_limpa ? (currentReading.oxigenacao_limpa * 100).toFixed(1) :
      currentReading.expansao_volemica_pct ||
      currentReading.suporte_cec_pct ||
      currentReading.meia_vida_h ||
      currentReading.erosao_quimioterapica_pct ||
      currentReading.reposicao_volemica_ultra_pct ||
      currentReading.expressao_antigenica_pct ||
      currentReading.integralidade_conservacao_pct ||
      currentReading.fator_compatibilidade_pct || 0
    );

    const b2 = parseFloat(
      currentReading.viscosidade_cp ||
      currentReading.carga_o2_pct ||
      currentReading.resistencia_cisalhamento_pct ||
      currentReading.liberacao_o2_pct ||
      currentReading.biocompatibilidade_tecidual_pct ||
      currentReading.prevencao_hipotermia_c ||
      currentReading.reatividade_crossmatch_pct || 0
    );

    const b3 = parseFloat(
      currentReading.temperatura_c ||
      currentReading.tempo_reconstituicao_s ||
      currentReading.preservacao_hemostasia_pct ||
      currentReading.resposta_imunologica_pct ||
      currentReading.ph_tumoral ||
      currentReading.perfusao_cerebral_pct ||
      currentReading.pureza_molecular_pct ||
      currentReading.tolerancia_congelamento_c || 0
    );

    const b4 = parseFloat(
      currentReading.meia_vida_h ||
      currentReading.coagulabilidade_pct ||
      currentReading.estabilidade_osmotica_cec_mmhg ||
      currentReading.compatibilidade_serica_pct ||
      currentReading.retencao_o2_celular_pct ||
      currentReading.capacidade_tampao_ph ||
      currentReading.esterilidade_biologica_pct ||
      currentReading.estabilidade_suspensao_pct || 0
    );

    const b5 = parseFloat(
      currentReading.extracao_o2_pct ||
      currentReading.pressao_perfusao_mmhg ||
      currentReading.controle_acidose_lactica_ph ||
      currentReading.baixa_viscosidade_cp ||
      currentReading.sodio_serico_meql || 0
    );

    // Validação da transmissão serial ativa (últimos 15 segundos)
    const now = Date.now();
    const isRecent = lastPacketTime ? (now - lastPacketTime < 15000) : (history && history.length > 0);

    setData({
      b1: isNaN(b1) ? 0 : b1,
      b2: isNaN(b2) ? 0 : b2,
      b3: isNaN(b3) ? 0 : b3,
      b4: isNaN(b4) ? 0 : b4,
      b5: isNaN(b5) ? 0 : b5,
      isConnected: Boolean(isRecent),
      isAvailable: Boolean(isRecent),
      lastUpdate: new Date()
    });
  }, [currentReading, history, lastPacketTime]);

  return data;
}
