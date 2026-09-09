import React, { useState } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceArea,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ShieldAlert,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  CheckCircle2,
  Clock,
  Layers,
  Info
} from "lucide-react";

// Dados enriquecidos com trajetória histórica, previsão com incerteza e os dois cenários de estoque
const defaultData = [
  {
    dia: "D-6",
    fase: "historico",
    consumoHistorico: 42,
    previsao: null,
    faixaIncerteza: null,
    estoqueSemAcao: 78,
    estoqueComIA: 78,
  },
  {
    dia: "D-5",
    fase: "historico",
    consumoHistorico: 48,
    previsao: null,
    faixaIncerteza: null,
    estoqueSemAcao: 76,
    estoqueComIA: 76,
  },
  {
    dia: "D-4",
    fase: "historico",
    consumoHistorico: 44,
    previsao: null,
    faixaIncerteza: null,
    estoqueSemAcao: 74,
    estoqueComIA: 74,
  },
  {
    dia: "D-3",
    fase: "historico",
    consumoHistorico: 57,
    previsao: null,
    faixaIncerteza: null,
    estoqueSemAcao: 71,
    estoqueComIA: 71,
  },
  {
    dia: "D-2",
    fase: "historico",
    consumoHistorico: 61,
    previsao: null,
    faixaIncerteza: null,
    estoqueSemAcao: 69,
    estoqueComIA: 69,
  },
  {
    dia: "D-1",
    fase: "historico",
    consumoHistorico: 66,
    previsao: null,
    faixaIncerteza: null,
    estoqueSemAcao: 66,
    estoqueComIA: 66,
  },
  {
    dia: "Hoje",
    fase: "transicao",
    consumoHistorico: 72,
    previsao: 72,
    faixaIncerteza: [70, 74],
    estoqueSemAcao: 64,
    estoqueComIA: 64,
  },
  {
    dia: "D+1",
    fase: "previsao",
    consumoHistorico: null,
    previsao: 79,
    faixaIncerteza: [74, 84],
    estoqueSemAcao: 58,
    estoqueComIA: 58,
  },
  {
    dia: "D+2",
    fase: "previsao",
    consumoHistorico: null,
    previsao: 86,
    faixaIncerteza: [80, 92],
    estoqueSemAcao: 51,
    estoqueComIA: 68, // Lote entra no início de D+2 (+30 unidades após síntese em D+1)
    eventoIA: "Disparo do Lote SA-026",
  },
  {
    dia: "D+3",
    fase: "previsao",
    consumoHistorico: null,
    previsao: 92,
    faixaIncerteza: [84, 100],
    estoqueSemAcao: 43, // Ponto crítico sem ação: cai abaixo dos 50u mínimos!
    estoqueComIA: 62, // Seguro acima de 50u
    pontoCritico: true,
  },
  {
    dia: "D+4",
    fase: "previsao",
    consumoHistorico: null,
    previsao: 88,
    faixaIncerteza: [79, 97],
    estoqueSemAcao: 36, // Risco severo de desabastecimento
    estoqueComIA: 56, // Estável com margem
  },
];

const ESTOQUE_MINIMO_SEGURANCA = 50;

export function DemandChart({ data = defaultData }) {
  // Cenário visual: 'comparativo' (ambos) | 'com_ia' (apenas plano IA) | 'sem_acao' (apenas inércia)
  const [cenario, setCenario] = useState("comparativo");
  const [mostrarIncerteza, setMostrarIncerteza] = useState(true);

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* 1. SELETOR DE CENÁRIO & CONTROLES TECNOLÓGICOS */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/70 border border-slate-800/90 p-3 rounded-xl backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-rose-500" />
            CENÁRIO DE DECISÃO:
          </span>
          <div className="inline-flex rounded-lg bg-slate-950 p-1 border border-slate-800">
            <button
              onClick={() => setCenario("comparativo")}
              className={`px-3 py-1 text-xs font-mono rounded-md transition-all ${
                cenario === "comparativo"
                  ? "bg-gradient-to-r from-rose-500/25 to-sky-500/25 text-white font-bold border border-rose-500/50 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Comparar Ambos
            </button>
            <button
              onClick={() => setCenario("com_ia")}
              className={`px-3 py-1 text-xs font-mono rounded-md transition-all ${
                cenario === "com_ia"
                  ? "bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Com Decisão da IA
            </button>
            <button
              onClick={() => setCenario("sem_acao")}
              className={`px-3 py-1 text-xs font-mono rounded-md transition-all ${
                cenario === "sem_acao"
                  ? "bg-rose-500/20 text-rose-300 font-bold border border-rose-500/40 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Sem Intervenção
            </button>
          </div>
        </div>

        {/* Toggle da Faixa de Incerteza */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-mono text-slate-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={mostrarIncerteza}
              onChange={(e) => setMostrarIncerteza(e.target.checked)}
              className="rounded border-slate-700 bg-slate-950 text-rose-500 focus:ring-0 focus:ring-offset-0 cursor-pointer h-3.5 w-3.5"
            />
            <span>Faixa de Incerteza (IA)</span>
          </label>
        </div>
      </div>

      {/* 2. LEGENDA DIDÁTICA DO FLUXO DECISÓRIO */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 font-mono text-[10px] text-slate-400 bg-slate-950/60 border border-slate-850 px-3.5 py-2 rounded-xl">
        <div className="flex items-center gap-2">
          <span className="h-2 w-3.5 rounded-full bg-sky-400 inline-block" />
          <span>Consumo Histórico</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-3.5 rounded-full bg-rose-500 inline-block border-b-2 border-dashed border-rose-300" />
          <span>Previsão de Demanda IA</span>
        </div>
        {mostrarIncerteza && (
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-3.5 rounded bg-rose-500/20 border border-rose-500/40 inline-block" />
            <span className="text-rose-400/90">Incerteza (Intervalo 95%)</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <span className="h-0.5 w-4 bg-amber-400/80 inline-block border-t border-dashed border-amber-400" />
          <span className="text-amber-400">Estoque Mínimo Seguro (50u)</span>
        </div>
        {(cenario === "comparativo" || cenario === "sem_acao") && (
          <div className="flex items-center gap-2">
            <span className="h-2 w-3.5 rounded-full bg-rose-400/90 inline-block border-dashed border-t-2" />
            <span className="text-rose-400">Estoque Sem Ação (Colapso)</span>
          </div>
        )}
        {(cenario === "comparativo" || cenario === "com_ia") && (
          <div className="flex items-center gap-2">
            <span className="h-2 w-3.5 rounded-full bg-[#00ff9d] inline-block shadow-[0_0_6px_#00ff9d]" />
            <span className="text-emerald-300 font-bold">Estoque Com IA (Protegido)</span>
          </div>
        )}
      </div>

      {/* 3. GRÁFICO RECHARTS COM HISTÓRIA VISUAL COMPLETA */}
      <div className="h-[360px] w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 20, right: 24, left: -10, bottom: 5 }}
          >
            <defs>
              {/* Gradiente Demanda Histórica */}
              <linearGradient id="histFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
              </linearGradient>

              {/* Gradiente Faixa de Incerteza */}
              <linearGradient id="incertezaFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ff2a42" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#ff2a42" stopOpacity={0.03} />
              </linearGradient>

              {/* Gradiente Estoque Protegido Com IA */}
              <linearGradient id="estoqueIaFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00ff9d" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#00ff9d" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid stroke="rgba(255, 255, 255, 0.05)" vertical={false} />

            <XAxis
              dataKey="dia"
              tickLine={false}
              axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
              tick={{ fill: "#94a3b8", fontSize: 11, fontFamily: "monospace" }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={48}
              tick={{ fill: "#94a3b8", fontSize: 11, fontFamily: "monospace" }}
              domain={[20, 110]}
              unit=" u"
            />

            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload || !payload.length) return null;
                const d = payload[0]?.payload;
                return (
                  <div className="bg-slate-950/95 border border-slate-700/80 p-3 rounded-xl shadow-2xl backdrop-blur-xl text-xs space-y-2 min-w-[210px] font-sans">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 font-mono">
                      <span className="font-bold text-white text-sm">{label}</span>
                      <span className="text-[10px] text-slate-400 uppercase">
                        {d.fase === "historico"
                          ? "Passado (Real)"
                          : d.fase === "transicao"
                          ? "Ponto Atual (Hoje)"
                          : "Projeção Futura"}
                      </span>
                    </div>

                    {d.consumoHistorico != null && (
                      <div className="flex justify-between items-center text-sky-400 font-mono">
                        <span>Consumo Real:</span>
                        <span className="font-bold">{d.consumoHistorico} un</span>
                      </div>
                    )}

                    {d.previsao != null && (
                      <div className="flex justify-between items-center text-rose-400 font-mono">
                        <span>Demanda Prevista:</span>
                        <span className="font-bold">{d.previsao} un</span>
                      </div>
                    )}

                    {d.faixaIncerteza && mostrarIncerteza && (
                      <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                        <span>Intervalo de Incerteza:</span>
                        <span>{d.faixaIncerteza[0]} - {d.faixaIncerteza[1]} un</span>
                      </div>
                    )}

                    <div className="pt-1.5 border-t border-slate-850 space-y-1">
                      {(cenario === "comparativo" || cenario === "sem_acao") && (
                        <div className="flex justify-between items-center text-xs font-mono">
                          <span className="text-slate-400">Estoque Sem Ação:</span>
                          <span className={`font-bold ${d.estoqueSemAcao < ESTOQUE_MINIMO_SEGURANCA ? "text-rose-400" : "text-slate-200"}`}>
                            {d.estoqueSemAcao} un {d.estoqueSemAcao < ESTOQUE_MINIMO_SEGURANCA ? "⚠️" : ""}
                          </span>
                        </div>
                      )}

                      {(cenario === "comparativo" || cenario === "com_ia") && (
                        <div className="flex justify-between items-center text-xs font-mono text-emerald-400">
                          <span>Estoque Com Decisão IA:</span>
                          <span className="font-bold">{d.estoqueComIA} un ✅</span>
                        </div>
                      )}
                    </div>

                    {d.pontoCritico && (
                      <div className="p-1.5 rounded bg-rose-500/15 border border-rose-500/40 text-[10px] text-rose-300 font-mono">
                        ⚠️ Alerta: Sem ação, estoque atinge nível crítico abaixo de 50u!
                      </div>
                    )}
                    {d.eventoIA && (
                      <div className="p-1.5 rounded bg-emerald-500/15 border border-emerald-500/40 text-[10px] text-emerald-300 font-mono">
                        ⚡ {d.eventoIA}: reposição automatizada protege o hospital.
                      </div>
                    )}
                  </div>
                );
              }}
            />

            {/* FAIXA: JANELA IDEAL DE PRODUÇÃO (Hoje até D+1) */}
            <ReferenceArea
              x1="Hoje"
              x2="D+1"
              y1={20}
              y2={110}
              fill="rgba(56, 189, 248, 0.07)"
              stroke="rgba(56, 189, 248, 0.25)"
              strokeDasharray="4 4"
            />

            {/* LINHA DE CORTE: HOJE (MARCO DA TRANSIÇÃO) */}
            <ReferenceLine
              x="Hoje"
              stroke="#94a3b8"
              strokeWidth={1.5}
              strokeDasharray="3 3"
              label={{
                value: "HOJE (Início da Previsão)",
                fill: "#cbd5e1",
                fontSize: 10,
                position: "insideTopLeft",
                fontFamily: "monospace"
              }}
            />

            {/* LINHA HORIZONTAL: ESTOQUE MÍNIMO DE SEGURANÇA (50u) */}
            <ReferenceLine
              y={ESTOQUE_MINIMO_SEGURANCA}
              stroke="#f59e0b"
              strokeWidth={1.8}
              strokeDasharray="5 4"
              label={{
                value: "ESTOQUE MÍNIMO DE SEGURANÇA (50 un)",
                fill: "#fbbf24",
                fontSize: 10,
                position: "insideBottomRight",
                fontFamily: "monospace"
              }}
            />

            {/* FAIXA DE INCERTEZA DA PREVISÃO */}
            {mostrarIncerteza && (
              <Area
                type="monotone"
                dataKey="faixaIncerteza"
                stroke="rgba(255, 42, 66, 0.4)"
                strokeDasharray="3 3"
                fill="url(#incertezaFill)"
                connectNulls
                name="Incerteza da Previsão"
              />
            )}

            {/* DEMANDA HISTÓRICA REAL */}
            <Area
              type="monotone"
              dataKey="consumoHistorico"
              stroke="#38bdf8"
              strokeWidth={2.5}
              fill="url(#histFill)"
              dot={{ r: 3, fill: "#38bdf8", strokeWidth: 1, stroke: "#0ea5e9" }}
              connectNulls
              name="Consumo Histórico"
            />

            {/* PREVISÃO DE DEMANDA DA IA */}
            <Line
              type="monotone"
              dataKey="previsao"
              stroke="#ff2a42"
              strokeWidth={2.5}
              strokeDasharray="5 5"
              dot={{ r: 4, fill: "#ff2a42", stroke: "#ffffff", strokeWidth: 1.5 }}
              connectNulls
              name="Previsão de Demanda IA"
            />

            {/* CENÁRIO SEM AÇÃO (ESTOQUE CAI ATÉ COLAPSO) */}
            {(cenario === "comparativo" || cenario === "sem_acao") && (
              <Line
                type="monotone"
                dataKey="estoqueSemAcao"
                stroke="#f43f5e"
                strokeWidth={2.2}
                strokeDasharray="4 4"
                dot={(props) => {
                  const { cx, cy, payload } = props;
                  // Destacar o PONTO CRÍTICO em D+3
                  if (payload.pontoCritico) {
                    return (
                      <g key={`crit-${payload.dia}`}>
                        <circle cx={cx} cy={cy} r={8} fill="#ff2a42" opacity={0.3} className="animate-ping" />
                        <circle cx={cx} cy={cy} r={5} fill="#ff2a42" stroke="#ffffff" strokeWidth={2} />
                      </g>
                    );
                  }
                  return <circle key={payload.dia} cx={cx} cy={cy} r={2.5} fill="#f43f5e" />;
                }}
                name="Estoque Sem Intervenção"
              />
            )}

            {/* CENÁRIO COM RECOMENDAÇÃO DA IA (PROTEGIDO) */}
            {(cenario === "comparativo" || cenario === "com_ia") && (
              <Line
                type="monotone"
                dataKey="estoqueComIA"
                stroke="#00ff9d"
                strokeWidth={2.8}
                dot={(props) => {
                  const { cx, cy, payload } = props;
                  // Destacar o MOMENTO DA PRODUÇÃO DA IA em D+1 / D+2
                  if (payload.eventoIA) {
                    return (
                      <g key={`prod-${payload.dia}`}>
                        <circle cx={cx} cy={cy} r={9} fill="#00ff9d" opacity={0.35} className="animate-pulse" />
                        <circle cx={cx} cy={cy} r={5.5} fill="#00ff9d" stroke="#0f172a" strokeWidth={2} />
                      </g>
                    );
                  }
                  return <circle key={payload.dia} cx={cx} cy={cy} r={3} fill="#00ff9d" />;
                }}
                name="Estoque Com Decisão IA"
              />
            )}

            {/* MARCADOR DO EVENTO DE PRODUÇÃO RECOMENDADO PELA IA */}
            <ReferenceDot
              x="D+1"
              y={58}
              r={6}
              fill="#a855f7"
              stroke="#ffffff"
              strokeWidth={2}
              label={{
                value: "⚡ Produção Recomendada (D+1)",
                fill: "#c084fc",
                fontSize: 10,
                position: "top",
                fontFamily: "monospace",
                fontWeight: "bold"
              }}
            />

            {/* MARCADOR DO PONTO CRÍTICO SEM AÇÃO */}
            {(cenario === "comparativo" || cenario === "sem_acao") && (
              <ReferenceDot
                x="D+3"
                y={43}
                r={6}
                fill="#ff2a42"
                stroke="#ffffff"
                strokeWidth={2}
                label={{
                  value: "⚠️ Ponto Crítico (43u < 50u)",
                  fill: "#f87171",
                  fontSize: 10,
                  position: "bottom",
                  fontFamily: "monospace",
                  fontWeight: "bold"
                }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* 4. FLUXO VISUAL DA HISTÓRIA DE DECISÃO (STORYTELLING) */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-2.5 pt-2 border-t border-slate-850">
        {/* Passo 1 */}
        <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[10px] font-mono text-sky-400 font-bold mb-1">
            <span>1. HISTÓRICO</span>
            <span className="text-slate-500">D-6 a D-1</span>
          </div>
          <p className="text-xs text-slate-300 leading-snug">
            Consumo médio de <strong>42 a 66 un</strong>, crescendo em ritmo constante no pronto-socorro.
          </p>
        </div>

        {/* Passo 2 */}
        <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[10px] font-mono text-rose-400 font-bold mb-1">
            <span>2. PREVISÃO IA</span>
            <span className="text-slate-500">D+1 a D+4</span>
          </div>
          <p className="text-xs text-slate-300 leading-snug">
            Demanda acelera para <strong>92 un em D+3</strong> com banda de incerteza delimitada.
          </p>
        </div>

        {/* Passo 3 */}
        <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[10px] font-mono text-amber-400 font-bold mb-1">
            <span>3. RISCO IDENTIFICADO</span>
            <TrendingDown className="w-3 h-3 text-amber-400" />
          </div>
          <p className="text-xs text-slate-300 leading-snug">
            Estoque cairia para <strong>43 un em D+3</strong>, rompendo o mínimo de segurança (50 un).
          </p>
        </div>

        {/* Passo 4 */}
        <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/30 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[10px] font-mono text-purple-300 font-bold mb-1">
            <span>4. JANELA IDEAL</span>
            <Clock className="w-3 h-3 text-purple-400" />
          </div>
          <p className="text-xs text-slate-200 leading-snug">
            Lead time de <strong>18h</strong> exige disparar produção entre <strong>Hoje e D+1</strong>.
          </p>
        </div>

        {/* Passo 5 */}
        <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[10px] font-mono text-rose-300 font-bold mb-1">
            <span>5. RECOMENDAÇÃO</span>
            <Sparkles className="w-3 h-3 text-rose-400" />
          </div>
          <p className="text-xs text-slate-200 leading-snug">
            IA recomenda sintetizar <strong>Lote SA-026 (+30 bolsas)</strong> preventivamente em D+1.
          </p>
        </div>

        {/* Passo 6 */}
        <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[10px] font-mono text-emerald-300 font-bold mb-1">
            <span>6. IMPACTO POSITIVO</span>
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          </div>
          <p className="text-xs text-slate-200 leading-snug">
            Estoque sustentado em <strong>62 un</strong>, zerando o risco de desabastecimento hospitalar.
          </p>
        </div>
      </div>
    </div>
  );
}
