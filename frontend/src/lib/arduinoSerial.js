export function parseSensorLine(line) {
  const data = JSON.parse(line);
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Envie um objeto JSON por linha.');
  const fields = {
    gas_value: data.gas_value ?? data.gas ?? data.oxigenacao,
    flow_value: data.flow_value ?? data.flow ?? data.vazao,
    temp_value: data.temp_value ?? data.temp ?? data.temperatura,
  };
  const result = {};
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined) continue;
    if (typeof value !== 'number' || !Number.isFinite(value)) throw new Error('Os sensores devem enviar números finitos, sem unidades.');
    result[key] = value;
  }
  if (!Object.keys(result).length) throw new Error('JSON sem campos de sensores reconhecidos.');
  return result;
}

// Um único proprietário da porta. O monitor recebe eventos e nunca escreve na USB.
export function createSerialConnection(serial, emit) {
  let session = null;
  const disconnect = async () => {
    const active = session;
    if (!active) return;
    active.stopped = true;
    if (active.reader) await active.reader.cancel().catch(() => {});
    await active.done;
  };
  const connect = async (baudRate = 115200) => {
    if (session) return false;
    if (!serial) { emit({ status: 'OFFLINE', error: 'Use Chrome ou Edge no computador, em HTTPS ou localhost.' }); return false; }
    const active = { stopped: false, reader: null };
    session = active;
    emit({ status: 'CONECTANDO', error: '', reset: true });
    active.done = (async () => {
      let port;
      let opened = false;
      try {
        port = await serial.requestPort();
        if (active.stopped) return;
        await port.open({ baudRate });
        opened = true;
        if (active.stopped) return;
        active.reader = port.readable.getReader();
        emit({ status: 'CONECTADO' });
        const decoder = new TextDecoder();
        let buffer = '';
        let discarding = false;
        while (!active.stopped) {
          const { value, done } = await active.reader.read();
          if (done) break;
          for (const char of decoder.decode(value, { stream: true })) {
            if (char === '\n') {
              if (!discarding && buffer.trim()) {
                const line = buffer.trim();
                let sensors;
                let error = '';
                try { sensors = parseSensorLine(line); } catch (cause) { error = cause.message; }
                emit({ line, sensors, error, time: Date.now() });
              }
              buffer = ''; discarding = false;
            } else if (!discarding) {
              buffer += char;
              if (buffer.length > 4096) {
                buffer = ''; discarding = true;
                emit({ error: 'Linha maior que 4096 caracteres descartada.' });
              }
            }
          }
        }
      } catch (cause) {
        if (!active.stopped) emit({ error: cause.name === 'NotFoundError' ? 'Seleção de porta cancelada.' : `Falha USB: ${cause.message}. Confira cabo, velocidade e se outro programa está usando a porta.` });
      } finally {
        active.reader?.releaseLock();
        if (opened) {
          try { await port.close(); } catch (cause) { emit({ error: `Não foi possível fechar a porta: ${cause.message}` }); }
        }
        session = null;
        emit({ status: 'OFFLINE' });
      }
    })();
    return true;
  };
  return { connect, disconnect };
}
