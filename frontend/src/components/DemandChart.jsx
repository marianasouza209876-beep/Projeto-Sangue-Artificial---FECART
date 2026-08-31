import React from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const defaultData = [
  { dia: "D-6", historico: 42, previsao: null, estoque: 78 },
  { dia: "D-5", historico: 48, previsao: null, estoque: 76 },
  { dia: "D-4", historico: 44, previsao: null, estoque: 74 },
  { dia: "D-3", historico: 57, previsao: null, estoque: 71 },
  { dia: "D-2", historico: 61, previsao: null, estoque: 69 },
  { dia: "D-1", historico: 66, previsao: null, estoque: 66 },
  { dia: "Hoje", historico: 72, previsao: 72, estoque: 64 },
  { dia: "D+1", historico: null, previsao: 79, estoque: 58 },
  { dia: "D+2", historico: null, previsao: 86, estoque: 51 },
  { dia: "D+3", historico: null, previsao: 92, estoque: 43 },
  { dia: "D+4", historico: null, previsao: 88, estoque: 38 },
];

export function DemandChart({ data = defaultData }) {
  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 12, left: -14, bottom: 0 }}>
          <defs>
            <linearGradient id="histFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.45} />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="prevFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff2a42" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#ff2a42" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255, 255, 255, 0.07)" vertical={false} />
          <XAxis
            dataKey="dia"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#94a3b8", fontSize: 11 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={48}
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            unit=" u"
          />
          <Tooltip
            contentStyle={{
              background: "rgba(15, 23, 42, 0.95)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              borderRadius: 12,
              fontSize: 12,
              color: "#f8fafc",
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
            }}
            labelStyle={{ color: "#94a3b8", fontWeight: 600 }}
          />
          <ReferenceLine
            x="Hoje"
            stroke="#94a3b8"
            strokeDasharray="3 3"
            label={{ value: "Agora", fill: "#94a3b8", fontSize: 10, position: "top" }}
          />
          <Area
            type="monotone"
            dataKey="historico"
            stroke="#38bdf8"
            strokeWidth={2.5}
            fill="url(#histFill)"
            connectNulls
            name="Demanda histórica"
          />
          <Line
            type="monotone"
            dataKey="previsao"
            stroke="#ff2a42"
            strokeWidth={2.5}
            strokeDasharray="6 5"
            dot={{ r: 3, fill: "#ff2a42" }}
            connectNulls
            name="Previsão IA"
          />
          <Line
            type="monotone"
            dataKey="estoque"
            stroke="#00e5a3"
            strokeWidth={2}
            dot={false}
            name="Estoque projetado"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
