const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export default function PatientMonitor({ oxygen, flow, temperature, connected }) {
  const safeOxygen = Number.isFinite(oxygen) ? oxygen : 0;
  const safeFlow = Number.isFinite(flow) ? flow : 0;
  const safeTemperature = Number.isFinite(temperature) ? temperature : 0;
  const bpm = Math.round(clamp(54 + safeFlow * 10 + (safeOxygen - 95) * 0.8, 45, 145));
  const amplitude = Math.round(clamp(4 + (safeOxygen - 85) * 0.45, 3, 12));
  const ecgPath = `M 0 28 L 28 28 L 38 28 L 45 ${28 - amplitude} L 51 ${28 + amplitude} L 58 28 L 93 28 L 103 28 L 110 ${28 - amplitude} L 116 ${28 + amplitude} L 123 28 L 160 28 L 170 28 L 177 ${28 - amplitude} L 183 ${28 + amplitude} L 190 28 L 240 28`;
  const healthy = connected && safeOxygen >= 93 && safeTemperature >= 36 && safeTemperature <= 37.8;
  const color = healthy ? '#00ff9d' : connected ? '#ffb703' : '#f59e0b';

  return <section className="glass-panel rounded-xl border border-slate-800 p-4" aria-live="polite" aria-label="Monitor do paciente em tempo real">
    <div className="flex items-center justify-between gap-3">
      <div><p className="text-[10px] font-mono tracking-[0.16em] text-slate-400">PACIENTE • SINAL EM TEMPO REAL</p><p className="text-xs font-mono font-bold" style={{ color }}>{connected ? 'DADOS DO ARDUINO' : 'MODO SIMULAÇÃO'}</p></div>
      <span className="text-lg font-mono font-bold text-slate-100">{bpm} <small className="text-[10px] text-slate-400">BPM*</small></span>
    </div>
    <div className="mt-3 grid grid-cols-[76px_1fr] items-center gap-4">
      <div className="relative h-28 rounded-full border border-slate-700 bg-slate-950/70 overflow-hidden">
        <div className="absolute left-1/2 top-4 h-7 w-7 -translate-x-1/2 rounded-full border-2" style={{ borderColor: color, boxShadow: `0 0 14px ${color}` }} />
        <div className="absolute left-1/2 top-11 h-12 w-9 -translate-x-1/2 rounded-t-[45%] border-2" style={{ borderColor: color }} />
        <span className="absolute left-0 right-0 h-px animate-pulse" style={{ top: `${clamp(72 - safeOxygen * 0.42, 24, 62)}%`, backgroundColor: color, boxShadow: `0 0 10px ${color}` }} />
      </div>
      <div>
        <svg viewBox="0 0 240 56" className="h-16 w-full" fill="none" role="img" aria-label="Traçado ECG reativo">
          <path d={ecgPath} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ecg-path" style={{ animationDuration: `${clamp(7 - safeFlow * 0.45, 2.5, 7)}s` }} />
        </svg>
        <div className="grid grid-cols-3 gap-2 text-center font-mono text-[10px]"><span>O₂ <b className="text-slate-100">{safeOxygen.toFixed(1)}%</b></span><span>FLUXO <b className="text-slate-100">{safeFlow.toFixed(1)}</b></span><span>TEMP <b className="text-slate-100">{safeTemperature.toFixed(1)}°C</b></span></div>
      </div>
    </div>
    <p className="mt-3 text-[10px] text-slate-500">*Estimativa visual calculada a partir da vazão; não substitui monitoramento médico.</p>
  </section>;
}
