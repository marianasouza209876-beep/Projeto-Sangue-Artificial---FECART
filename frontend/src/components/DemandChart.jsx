import React, { useMemo, useState } from "react";
import { Area, CartesianGrid, ComposedChart, Line, ReferenceArea, ReferenceDot, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertTriangle, CheckCircle2, Clock, Info, Layers, Sparkles, TrendingDown, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const profiles = {
  "SA-026": { historico: [42, 48, 44, 57, 61, 66, 72], previsao: [72, 79, 86, 92, 88], semAcao: [78, 76, 74, 71, 69, 66, 64, 58, 51, 43, 36], comIa: [78, 76, 74, 71, 69, 66, 64, 58, 68, 62, 56], minimo: 50, riscoDia: "D+3", janela: "Hoje a D+1", recomendacao: "Sintetizar +30 bolsas em D+1", impacto: "+44,2% de resiliência", leadTime: "18h" },
  "SA-023": { historico: [54, 58, 55, 63, 68, 73, 76], previsao: [76, 82, 90, 96, 93], semAcao: [84, 82, 79, 76, 73, 70, 66, 59, 49, 39, 31], comIa: [84, 82, 79, 76, 73, 70, 66, 59, 72, 65, 59], minimo: 50, riscoDia: "D+2", janela: "Hoje", recomendacao: "Priorizar síntese +35 bolsas hoje", impacto: "+52,0% de resiliência", leadTime: "12h" },
  default: { historico: [38, 43, 46, 50, 54, 58, 62], previsao: [62, 68, 74, 79, 76], semAcao: [74, 72, 70, 68, 66, 64, 61, 56, 52, 47, 41], comIa: [74, 72, 70, 68, 66, 64, 61, 56, 66, 60, 55], minimo: 50, riscoDia: "D+3", janela: "Hoje a D+1", recomendacao: "Programar síntese +25 bolsas em D+1", impacto: "+35,7% de resiliência", leadTime: "18h" },
};

const days = ["D-6", "D-5", "D-4", "D-3", "D-2", "D-1", "Hoje", "D+1", "D+2", "D+3", "D+4"];

export function getForecastScenario(lotId, lot) {
  const profile = profiles[lotId] || profiles.default;
  const lotLabel = lot?.name ? `${lotId} • ${lot.name}` : lotId || "Lote selecionado";
  const data = days.map((dia, index) => {
    const forecastIndex = index - 6;
    const previsao = forecastIndex >= 0 ? profile.previsao[forecastIndex] : null;
    return {
      dia,
      fase: index < 6 ? "historico" : index === 6 ? "transicao" : "previsao",
      consumoHistorico: index <= 6 ? profile.historico[index] : null,
      previsao,
      faixaIncerteza: previsao == null ? null : [Math.max(0, previsao - (forecastIndex < 2 ? 5 : 8)), previsao + (forecastIndex < 2 ? 5 : 8)],
      estoqueSemAcao: profile.semAcao[index],
      estoqueComIA: profile.comIa[index],
      pontoCritico: dia === profile.riscoDia,
    };
  });
  const hoje = data[6];
  const critical = data.find((point) => point.pontoCritico) || data[9];
  return { ...profile, data, lotLabel, hoje, critical, protectedStock: critical.estoqueComIA };
}

function LayerToggle({ checked, onChange, onDetails, label, marker, className = "" }) {
  return (
    <button type="button" aria-pressed={checked} onClick={() => { onChange(); onDetails(); }} className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-1.5 text-left transition-all duration-300 ease-in-out hover:scale-[1.02] hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(0,229,255,0.25)] ${checked ? "border-slate-700 bg-slate-900 text-slate-200" : "border-slate-800 bg-slate-950/60 text-slate-500"} ${className}`}>
      <span className={`h-3 w-3 rounded border ${checked ? "border-emerald-400 bg-emerald-400/20" : "border-slate-600"}`}>{checked && <span className="block text-center text-[9px] leading-[10px] text-emerald-300">✓</span>}</span>
      {marker}<span>{label}</span>
    </button>
  );
}

export function DemandChart({ lotId, lot }) {
  const scenario = useMemo(() => getForecastScenario(lotId, lot), [lotId, lot]);
  const [layers, setLayers] = useState({ historico: true, comIa: true, minimo: true, incerteza: false, semAcao: false });
  const [detailModal, setDetailModal] = useState(null);
  const toggle = (key) => setLayers((current) => ({ ...current, [key]: !current[key] }));
  const decisionPoint = scenario.data.find((point) => point.dia === "D+1");
  const hasPredictiveRupture = scenario.critical.estoqueSemAcao < scenario.minimo;

  return (
    <div className="flex w-full flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2.5 rounded-xl border border-slate-800/90 bg-slate-900/70 p-3 font-mono text-[10px] backdrop-blur-md">
        <span className="mr-1 inline-flex items-center gap-1.5 uppercase tracking-wider text-slate-400"><Layers className="h-3.5 w-3.5 text-rose-500" />Camadas visuais</span>
        <LayerToggle checked={layers.historico} onChange={() => toggle("historico")} onDetails={() => setDetailModal({ title: "Consumo histórico", tone: "cyan", description: "Série observada do lote selecionado antes da projeção. Ela ancora o modelo em consumo real e identifica tendências de utilização.", metric: `${scenario.historico[0]} → ${scenario.hoje.consumoHistorico} unidades` })} label="Consumo histórico" marker={<span className="h-0.5 w-4 bg-sky-400" />} />
        <LayerToggle checked={layers.comIa} onChange={() => toggle("comIa")} onDetails={() => setDetailModal({ title: "Estoque com IA", tone: "emerald", description: "Cenário recomendado após a intervenção preditiva. A síntese é programada antes de atingir o mínimo seguro.", metric: `${scenario.protectedStock} unidades protegidas` })} label="Estoque com IA" marker={<span className="h-0.5 w-4 bg-emerald-400" />} />
        <LayerToggle checked={layers.minimo} onChange={() => toggle("minimo")} onDetails={() => setDetailModal({ title: "Estoque mínimo seguro", tone: "amber", description: "Limite operacional definido para preservar a cobertura assistencial enquanto a reposição é processada.", metric: `${scenario.minimo} unidades mínimas` })} label="Estoque mínimo seguro" marker={<span className="w-4 border-t-2 border-dashed border-amber-400" />} />
        <LayerToggle checked={layers.incerteza} onChange={() => toggle("incerteza")} onDetails={() => setDetailModal({ title: "Faixa de incerteza da IA", tone: "rose", description: "Intervalo de variação esperado pela projeção, calculado a partir da volatilidade recente da demanda.", metric: "Margem dinâmica por horizonte" })} label="Faixa de incerteza (IA)" marker={<span className="h-2 w-4 rounded border border-rose-500/40 bg-rose-500/20" />} className="ml-auto" />
        <LayerToggle checked={layers.semAcao} onChange={() => toggle("semAcao")} onDetails={() => setDetailModal({ title: "Estoque sem ação", tone: "rose", description: "Cenário de referência caso não ocorra intervenção. Ele evidencia o momento de ruptura e a justificativa para a recomendação.", metric: `${scenario.critical.estoqueSemAcao} unidades em ${scenario.riscoDia}` })} label="Estoque sem ação" marker={<span className="w-4 border-t-2 border-dashed border-rose-400" />} />
      </div>

      <div className="relative h-[360px] w-full min-w-0 overflow-visible">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={scenario.data} margin={{ top: 20, right: 24, left: -10, bottom: 5 }}>
            <defs>
              <linearGradient id="histFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#38bdf8" stopOpacity={0.28} /><stop offset="100%" stopColor="#38bdf8" stopOpacity={0} /></linearGradient>
              <linearGradient id="incertezaFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ff2a42" stopOpacity={0.22} /><stop offset="100%" stopColor="#ff2a42" stopOpacity={0.02} /></linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
            <XAxis dataKey="dia" tickLine={false} axisLine={{ stroke: "rgba(255,255,255,0.1)" }} tick={{ fill: "#94a3b8", fontSize: 11, fontFamily: "monospace" }} />
            <YAxis tickLine={false} axisLine={false} width={48} tick={{ fill: "#94a3b8", fontSize: 11, fontFamily: "monospace" }} domain={[20, 110]} unit=" u" />
            <Tooltip isAnimationActive={false} wrapperStyle={{ zIndex: 30, pointerEvents: "none" }} content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              const point = payload[0].payload;
              const decisionSafe = point.estoqueComIA >= scenario.minimo;
              return <div className="min-w-[220px] rounded-lg border border-slate-700 bg-[#0F172A] p-3 text-xs shadow-xl">
                <div className="mb-2 flex items-center justify-between border-b border-slate-700 pb-2 font-mono"><span className="font-bold text-white">{label}</span><span className="text-[10px] text-slate-400">{scenario.lotLabel}</span></div>
                <div className="space-y-1.5 font-mono"><div className="flex justify-between text-sky-300"><span>Consumo real</span><strong>{point.consumoHistorico ?? "—"} un</strong></div><div className="flex justify-between text-rose-300"><span>Demanda prevista</span><strong>{point.previsao ?? "—"} un</strong></div>{layers.incerteza && point.faixaIncerteza && <div className="flex justify-between text-slate-400"><span>Incerteza IA</span><strong>{point.faixaIncerteza[0]}–{point.faixaIncerteza[1]} un</strong></div>}</div>
                <div className={`mt-2 flex items-center gap-2 rounded-md border px-2 py-1.5 font-mono text-[10px] ${decisionSafe ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300" : "border-rose-500/40 bg-rose-500/10 text-rose-300"}`}><span className={`h-2 w-2 rounded-full ${decisionSafe ? "bg-emerald-400" : "bg-rose-400"}`} />IA: {decisionSafe ? `estoque protegido (${point.estoqueComIA} un)` : "intervenção necessária"}</div>
              </div>;
            }} />
            <ReferenceArea x1="Hoje" x2="D+1" y1={20} y2={110} fill="rgba(56, 189, 248, 0.06)" stroke="rgba(56, 189, 248, 0.2)" strokeDasharray="4 4" />
            <ReferenceArea y1={20} y2={scenario.minimo} fill="rgba(239, 68, 68, 0.10)" stroke="none" />
            <ReferenceLine x="Hoje" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="3 3" label={{ value: "HOJE", fill: "#cbd5e1", fontSize: 10, position: "insideTopLeft", fontFamily: "monospace" }} />
            {layers.minimo && <ReferenceLine y={scenario.minimo} stroke="#f59e0b" strokeWidth={1.8} strokeDasharray="5 4" label={{ value: `${scenario.minimo} un mínimo`, fill: "#fbbf24", fontSize: 10, position: "insideBottomRight", fontFamily: "monospace" }} />}
            {layers.incerteza && <Area isAnimationActive={false} type="monotone" dataKey="faixaIncerteza" stroke="rgba(255, 42, 66, 0.4)" strokeDasharray="3 3" fill="url(#incertezaFill)" connectNulls name="Incerteza IA" />}
            {layers.historico && <Area isAnimationActive={false} type="monotone" dataKey="consumoHistorico" stroke="#38bdf8" strokeWidth={2.5} fill="url(#histFill)" dot={{ r: 3, fill: "#38bdf8" }} connectNulls name="Consumo histórico" />}
            {layers.semAcao && <Line isAnimationActive={false} type="monotone" dataKey="estoqueSemAcao" stroke="#f43f5e" strokeWidth={2.2} strokeDasharray="4 4" dot={{ r: 2.5, fill: "#f43f5e" }} name="Estoque sem ação" />}
            {layers.comIa && <>
              <Line isAnimationActive={false} type="monotone" dataKey="estoqueComIA" stroke="#00ff9d" strokeWidth={2.8} dot={{ r: 3, fill: "#00ff9d" }} name="Estoque com IA" />
              <ReferenceDot
                x="D+1"
                y={decisionPoint.estoqueComIA}
                r={6}
                fill="#00ff9d"
                stroke="#ffffff"
                strokeWidth={2}
                shape={({ cx, cy }) => <circle cx={cx} cy={cy} r={6} fill="#00ff9d" stroke="#ffffff" strokeWidth={2} />}
                label={{ value: "SÍNTESE +25un", fill: "#86efac", fontSize: 10, position: "top", fontFamily: "monospace", fontWeight: "bold" }}
              />
            </>}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 gap-2.5 border-t border-slate-800 pt-2 md:grid-cols-6">
        <StoryCard title="1. HISTÓRICO" tone="sky" icon={<Info className="h-3 w-3" />} onClick={() => setDetailModal({ title: "Histórico de consumo", tone: "cyan", description: "A IA compara a evolução do consumo do lote para detectar acelerações, sazonalidade e pontos fora do padrão.", metric: `${scenario.historico[0]} a ${scenario.hoje.consumoHistorico} unidades` })}>Consumo de <strong>{scenario.historico[0]} a {scenario.hoje.consumoHistorico} un</strong> até hoje.</StoryCard>
        <StoryCard title="2. PREVISÃO IA" tone="rose" icon={<Sparkles className="h-3 w-3" />} onClick={() => setDetailModal({ title: "Previsão de demanda", tone: "rose", description: "A projeção combina o histórico, a variabilidade recente e o horizonte de reposição para antecipar a demanda máxima.", metric: `Pico previsto: ${scenario.previsao[3]} unidades` })}>Demanda estimada em <strong>{scenario.previsao[3]} un</strong> no pico.</StoryCard>
        <StoryCard title="3. RISCO" tone="amber" alert={hasPredictiveRupture ? "amber" : undefined} icon={<TrendingDown className="h-3 w-3" />} onClick={() => setDetailModal({ title: "Risco de ruptura", tone: "amber", description: "Sem a recomendação da IA, o estoque cruza o limite de segurança. O alerta permite agir antes da indisponibilidade clínica.", metric: `${scenario.critical.estoqueSemAcao} unidades em ${scenario.riscoDia}` })}>Sem ação: <strong>{scenario.critical.estoqueSemAcao} un</strong> em {scenario.riscoDia}.</StoryCard>
        <StoryCard title="4. JANELA IDEAL" tone="purple" icon={<Clock className="h-3 w-3" />} onClick={() => setDetailModal({ title: "Janela ideal de decisão", tone: "purple", description: "Período em que a decisão ainda compensa o lead time produtivo e mantém a margem clínica protegida.", metric: `${scenario.janela} • lead time ${scenario.leadTime}` })}>Ação entre <strong>{scenario.janela}</strong>; lead time de {scenario.leadTime}.</StoryCard>
        <StoryCard title="5. RECOMENDAÇÃO" tone="rose" alert={hasPredictiveRupture ? "red" : undefined} icon={<AlertTriangle className="h-3 w-3" />} onClick={() => setDetailModal({ title: "Recomendação da IA", tone: "rose", description: "A ação sugerida considera a previsão, a capacidade operacional e o tempo de reposição para evitar uma ruptura com o menor excesso possível.", metric: scenario.recomendacao })}>{scenario.recomendacao} para <strong>{lotId}</strong>.</StoryCard>
        <StoryCard title="6. IMPACTO" tone="emerald" icon={<CheckCircle2 className="h-3 w-3" />} onClick={() => setDetailModal({ title: "Impacto preventivo", tone: "emerald", description: "O cenário recomendado preserva a cobertura de segurança e melhora a resiliência do estoque diante da demanda projetada.", metric: `${scenario.protectedStock} unidades • ${scenario.impacto}` })}>Estoque protegido em <strong>{scenario.protectedStock} un</strong>. {scenario.impacto}.</StoryCard>
      </div>
      <Dialog open={Boolean(detailModal)} onOpenChange={() => setDetailModal(null)}>
        <DialogContent className="border-cyan-400/40 bg-slate-950/95 text-slate-100 backdrop-blur-md sm:max-w-lg">
          <button type="button" onClick={() => setDetailModal(null)} aria-label="Fechar detalhes" className="absolute right-4 top-4 rounded-lg border border-slate-700 p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"><X className="h-4 w-4" /></button>
          <DialogHeader className="pr-12"><DialogTitle className="text-xl text-white">{detailModal?.title}</DialogTitle><DialogDescription className="pt-2 text-sm leading-6 text-slate-300">{detailModal?.description}</DialogDescription></DialogHeader>
          <div className="rounded-xl border border-cyan-400/30 bg-cyan-500/10 p-4"><p className="font-mono text-[10px] uppercase tracking-wider text-cyan-300">Métrica principal</p><p className="mt-1 text-lg font-bold text-white">{detailModal?.metric}</p></div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StoryCard({ title, tone, icon, children, alert, onClick }) {
  const colors = { sky: "text-sky-400", rose: "text-rose-400", amber: "text-amber-400", purple: "text-purple-300", emerald: "text-emerald-300" };
  const alertBorder = alert === "red" ? "border-red-500/40" : alert === "amber" ? "border-amber-500/40" : "border-slate-800";
  return <button type="button" onClick={onClick} className={`flex min-h-28 cursor-pointer flex-col justify-between rounded-xl border bg-slate-900/50 p-3 text-left transition-all duration-300 ease-in-out hover:scale-[1.02] hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(0,229,255,0.25)] ${alertBorder}`}><div className={`flex items-center justify-between font-mono text-[10px] font-bold ${colors[tone]}`}><span>{title}</span>{icon}</div><p className="text-xs leading-snug text-slate-300">{children}</p></button>;
}
