import React from "react";
import { cn } from "@/lib/utils";

export function levelFor(pct) {
  if (pct <= 45) return "critical";
  if (pct <= 70) return "warning";
  return "success";
}

const levelStyles = {
  critical: {
    text: "text-rose-500",
    bg: "bg-rose-500/10",
    ring: "border-rose-500/30",
    bar: "bg-rose-500",
    glow: "shadow-[0_0_12px_rgba(244,63,94,0.3)]",
    label: "CRÍTICO",
  },
  warning: {
    text: "text-amber-400",
    bg: "bg-amber-400/10",
    ring: "border-amber-400/30",
    bar: "bg-amber-400",
    glow: "shadow-[0_0_12px_rgba(251,191,36,0.3)]",
    label: "ATENÇÃO",
  },
  success: {
    text: "text-emerald-400",
    bg: "bg-emerald-400/10",
    ring: "border-emerald-400/30",
    bar: "bg-emerald-400",
    glow: "shadow-[0_0_12px_rgba(52,211,153,0.3)]",
    label: "ADEQUADO",
  },
};

export function MetricCard({
  title,
  subtitle,
  value,
  unit,
  percent = 70,
  level: overrideLevel,
  detail,
  icon: Icon,
  sparkline,
  accentColor,
  badgeText
}) {
  const level = overrideLevel || levelFor(percent);
  const s = levelStyles[level] || levelStyles.success;

  return (
    <article className="glass-panel glass-panel-hover group relative overflow-hidden rounded-xl p-5 transition-all duration-300">
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-1 transition-colors",
          accentColor ? accentColor : s.bar
        )}
      />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-slate-400 font-semibold">
            {title}
          </p>
          {subtitle && <p className="mt-0.5 text-xs text-slate-400/80">{subtitle}</p>}
        </div>
        {Icon && (
          <span className={cn("rounded-lg border p-2", s.bg, s.ring, s.text)}>
            <Icon className="h-4 w-4" />
          </span>
        )}
      </div>

      <div className="mt-4 flex items-end justify-between">
        <div className="flex items-end gap-1.5">
          <span className={cn("font-mono text-3xl sm:text-4xl font-bold leading-none tracking-tight", s.text)}>
            {value}
          </span>
          {unit ? <span className="pb-0.5 text-xs font-mono text-slate-400">{unit}</span> : null}
        </div>

        {sparkline && <div className="ml-auto">{sparkline}</div>}
      </div>

      <div className="mt-3.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-800/80">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-700",
            s.bar,
            s.glow
          )}
          style={{ width: `${Math.min(100, Math.max(3, percent))}%` }}
        />
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <p className="text-xs text-slate-400 truncate">{detail}</p>
        <span
          className={cn(
            "rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-bold tracking-wider shrink-0",
            s.bg,
            s.ring,
            s.text
          )}
        >
          {badgeText || s.label}
        </span>
      </div>
    </article>
  );
}
