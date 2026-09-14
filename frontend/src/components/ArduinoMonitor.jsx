import { useState } from 'react';
export default function ArduinoMonitor({ monitor }) {
  const [baud, setBaud] = useState(115200);
  const busy = monitor.status !== 'OFFLINE';
  const status = monitor.status === 'CONECTADO' ? (monitor.fresh ? 'RECEBENDO DADOS' : 'CONECTADO · AGUARDANDO DADOS') : monitor.status;
  return <section className="glass-panel rounded-xl p-4 border-slate-800 space-y-4 min-w-0" aria-labelledby="arduino-monitor-title">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 id="arduino-monitor-title" className="font-semibold text-slate-100">Conectar Arduino USB</h2>
      <span role="status" aria-live="polite" className="text-xs text-sky-300">{status}</span>
    </div>
    <p className="text-xs text-slate-400">Veja no computador as informações que o Arduino envia. A leitura USB fica neste navegador.</p>
    <div className="flex flex-wrap gap-3 items-end">
      <label className="text-xs text-slate-300">Velocidade serial
        <select className="block bg-slate-900 border border-slate-600 rounded p-2 mt-1" value={baud} disabled={busy} onChange={e => setBaud(Number(e.target.value))}>
          {[9600, 19200, 38400, 57600, 115200].map(value => <option key={value} value={value}>{value} baud</option>)}
        </select>
      </label>
      <button type="button" disabled={!monitor.supported || busy} onClick={() => monitor.connect(baud)} className="rounded bg-sky-700 px-3 py-2 text-sm text-white disabled:opacity-40">Conectar Arduino</button>
      <button type="button" disabled={!busy} onClick={monitor.disconnect} className="rounded border border-slate-600 px-3 py-2 text-sm text-slate-200 disabled:opacity-40">Desconectar</button>
    </div>
    {!monitor.supported && <p className="text-xs text-amber-300">Abra em Chrome ou Edge no computador, usando HTTPS ou localhost, para conectar por USB.</p>}
    {monitor.error && <p className="text-xs text-amber-300 break-words">{monitor.error}</p>}
    <dl className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {[['Gás / oxigenação', 'gas_value'], ['Vazão', 'flow_value'], ['Temperatura', 'temp_value']].map(([label, key]) => <div key={key} className="rounded bg-slate-900 p-3"><dt className="text-xs text-slate-400">{label}</dt><dd className="text-lg text-slate-100 font-mono">{monitor.sensors[key] ?? '—'}</dd></div>)}
    </dl>
    <p className="text-xs text-slate-400">Valores brutos conforme o firmware. {monitor.received} linhas recebidas · {monitor.valid} leituras válidas. {monitor.lastUpdate ? `Última leitura: ${new Date(monitor.lastUpdate).toLocaleTimeString('pt-BR')}${monitor.fresh ? '' : ' (sem atualização recente)'}.` : 'Nenhuma leitura recebida.'}</p>
    <details className="text-xs text-slate-400"><summary className="cursor-pointer">Como enviar os dados</summary><p className="mt-2">Conecte o cabo USB, feche o Monitor Serial da IDE e selecione a mesma velocidade de Serial.begin() no Arduino. Envie um JSON por linha com Serial.println(), com números sem unidades:</p><pre className="overflow-x-auto mt-2">{'{"gas_value":98,"flow_value":4.8,"temp_value":22}'}</pre><p className="mt-2">O painel recebe sensores; não envia comandos ao Arduino. Confirmações de comando e atuação não fazem parte deste protocolo.</p></details>
    <details className="text-xs text-slate-400"><summary className="cursor-pointer">Mensagens recebidas · últimas 40 linhas</summary><ol className="max-h-64 overflow-y-auto mt-2 space-y-2">{monitor.records.map((record, index) => <li key={`${record.time}-${index}`} className="rounded bg-slate-900 p-2"><time>{new Date(record.time).toLocaleTimeString('pt-BR')}</time> · Arduino → PC · {record.valid ? 'JSON válido' : 'Texto / formato não reconhecido'}<code className="block whitespace-pre-wrap break-all mt-1">{record.text}</code></li>)}</ol>{!monitor.records.length && <p className="mt-2">Aguardando mensagens do Arduino.</p>}</details>
  </section>;
}
