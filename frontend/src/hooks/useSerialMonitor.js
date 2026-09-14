import { useEffect, useRef, useState } from 'react';
import { createSerialConnection } from '../lib/arduinoSerial';

const initial = { status: 'OFFLINE', error: '', records: [], received: 0, valid: 0, sensors: {}, lastUpdate: null };
export function useSerialMonitor() {
  const [state, setState] = useState(initial);
  const [now, setNow] = useState(Date.now());
  const owner = useRef(null);
  const supported = typeof navigator !== 'undefined' && 'serial' in navigator && globalThis.isSecureContext;
  useEffect(() => {
    let mounted = true;
    const connection = createSerialConnection(supported ? navigator.serial : null, event => {
      if (!mounted) return;
      setState(previous => {
        const next = event.reset ? { ...initial } : { ...previous };
        if (event.status) next.status = event.status;
        if (event.error !== undefined) next.error = event.error;
        if (event.line) {
          next.received++;
          next.records = [{ text: event.line, time: event.time, valid: Boolean(event.sensors) }, ...next.records].slice(0, 40);
        }
        if (event.sensors) {
          // O firmware pode enviar sensores em pacotes separados. Preserve o
          // último valor válido de cada um para não apagar a tela entre linhas.
          next.sensors = { ...previous.sensors, ...event.sensors };
          next.valid++;
          next.lastUpdate = event.time;
        }
        return next;
      });
    });
    owner.current = connection;
    // Reconecta silenciosamente uma porta que já foi autorizada neste navegador.
    // Sem permissão prévia, a aplicação mantém os dados de simulação.
    if (supported) {
      void navigator.serial.getPorts()
        .then(ports => ports[0] && connection.connect(115200, ports[0]))
        .catch(() => {});
    }
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => { mounted = false; clearInterval(timer); void connection.disconnect(); };
  }, [supported]);
  return { ...state, supported, fresh: state.status === 'CONECTADO' && state.lastUpdate !== null && now - state.lastUpdate < 15000,
    connect: baud => owner.current?.connect(baud), disconnect: () => owner.current?.disconnect() };
}
