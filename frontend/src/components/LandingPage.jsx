import React, { useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BrainCircuit,
  Cpu,
  Droplets,
  Menu,
  QrCode,
  Thermometer,
  Waves,
  X,
  ShieldCheck,
  CheckCircle2,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuickEntryModal } from "./QuickEntryModal";

export function LandingPage({ onNavigate, onInjectReading, apiBase }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen overflow-x-hidden text-slate-100 selection:bg-rose-500 selection:text-white">
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800/80 bg-slate-950/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate("landing")}>
            <span
              className="flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-[0_0_15px_rgba(255,42,66,0.4)]"
              style={{ background: "linear-gradient(135deg, #ff2a42, #b91c1c)" }}
            >
              <Droplets className="h-5 w-5" />
            </span>
            <div>
              <span className="font-bold text-lg tracking-tight font-display text-white">
                FLOW<span className="text-rose-500">TIFICIAL</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] bg-rose-500/10 border border-rose-500/30 text-rose-400 px-1.5 py-0.2 rounded font-mono font-bold">
                FECART 2026
              </span>
            </div>
          </div>

          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#sobre"
              className="text-sm font-medium text-slate-400 transition-colors hover:text-white"
            >
              Sobre o Projeto
            </a>
            <a
              href="#hardware"
              className="text-sm font-medium text-slate-400 transition-colors hover:text-white"
            >
              Hardware IoT
            </a>
            <a
              href="#como-funciona"
              className="text-sm font-medium text-slate-400 transition-colors hover:text-white"
            >
              Como Funciona
            </a>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <QuickEntryModal onInjectReading={onInjectReading} apiBase={apiBase} />
            <Button
              onClick={() => onNavigate("dashboard")}
              className="gap-2 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white shadow-[0_0_20px_rgba(225,29,72,0.35)]"
            >
              Entrar no Dashboard
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          <button
            className="rounded-lg border border-slate-800 p-2 text-slate-400 md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileOpen ? (
          <div className="border-b border-slate-800 bg-slate-950/95 px-6 py-4 backdrop-blur-xl md:hidden">
            <nav className="flex flex-col gap-4">
              <a
                href="#sobre"
                onClick={() => setMobileOpen(false)}
                className="text-sm font-medium text-slate-300 hover:text-white"
              >
                Sobre o Projeto
              </a>
              <a
                href="#hardware"
                onClick={() => setMobileOpen(false)}
                className="text-sm font-medium text-slate-300 hover:text-white"
              >
                Hardware IoT
              </a>
              <a
                href="#como-funciona"
                onClick={() => setMobileOpen(false)}
                className="text-sm font-medium text-slate-300 hover:text-white"
              >
                Como Funciona
              </a>
              <div className="pt-2 flex flex-col gap-2">
                <Button
                  onClick={() => {
                    setMobileOpen(false);
                    onNavigate("dashboard");
                  }}
                  className="w-full gap-2 bg-rose-600 text-white"
                >
                  Entrar no Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </nav>
          </div>
        ) : null}
      </header>

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <section className="relative px-6 pt-36 pb-20 lg:pt-44 lg:pb-28">
          <div className="mx-auto grid max-w-[1280px] items-center gap-12 lg:grid-cols-2">
            <div className="space-y-8">
              <span className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-widest text-sky-400">
                <span className="h-2 w-2 rounded-full bg-sky-400 animate-pulse" />
                FECART 2026 • IA & Monitoramento Hospitalar
              </span>

              <h1 className="font-display text-4xl font-bold leading-[1.15] tracking-tight sm:text-5xl lg:text-6xl text-white">
                O Futuro da{" "}
                <span className="text-gradient-blood">Previsão Hospitalar</span>{" "}
                e Sangue Artificial
              </h1>

              <p className="max-w-xl text-base sm:text-lg leading-relaxed text-slate-300">
                Simulação em tempo real alimentada por sensores IoT (Arduino / ESP32) e Inteligência Artificial
                preditiva para gestão inteligente de insumos críticos em saúde.
              </p>

              <div className="flex flex-wrap gap-3.5 pt-2">
                <Button
                  size="lg"
                  onClick={() => onNavigate("simulation")}
                  className="gap-2.5 bg-gradient-to-r from-red-600 via-rose-600 to-fuchsia-600 hover:from-red-500 hover:to-fuchsia-500 text-white shadow-[0_0_25px_rgba(255,42,66,0.5)] text-sm px-6 h-12 font-bold border border-rose-400/30"
                >
                  <Sparkles className="h-4 w-4 text-white animate-pulse" />
                  Iniciar Simulação Interativa
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => onNavigate("emergency")}
                  className="gap-2 border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-200 text-sm px-5 h-12"
                >
                  <Zap className="h-4 w-4 text-rose-500" />
                  Simulador de Urgência
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => onNavigate("dashboard")}
                  className="gap-2 border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-200 text-sm px-5 h-12"
                >
                  <Activity className="h-4 w-4 text-rose-500" />
                  Monitor Clínico
                </Button>
              </div>
            </div>

            <div className="relative flex justify-center lg:justify-end">
              <div
                className="absolute inset-0 -z-10 opacity-70 blur-3xl"
                style={{
                  background:
                    "radial-gradient(400px 300px at 60% 40%, rgba(255, 42, 66, 0.25), transparent 60%)",
                }}
              />
              <HeroStatusCard onNavigate={onNavigate} />
            </div>
          </div>
        </section>

        {/* Pilares da Plataforma */}
        <section id="sobre" className="px-6 py-20 border-t border-slate-850 bg-slate-950/40">
          <div className="mx-auto max-w-[1280px]">
            <div className="mb-12 text-center">
              <p className="font-mono text-[11px] uppercase tracking-widest text-slate-400">
                Pilares da Plataforma
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl text-white">
                Biotecnologia e IA para <span className="text-sky-400">salvar vidas</span>
              </h2>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <PillarCard
                icon={Droplets}
                title="HBOCs & PFCs"
                description="Monitoramento da capacidade carreadora de O₂ e estabilidade química de transportadores de oxigênio baseados em hemoglobina e perfluorocarbonetos."
                accent="rose"
              />
              <PillarCard
                icon={Cpu}
                title="Sensores IoT"
                description="Telemetria em tempo real via Arduino Nano / ESP32 coletando vazão de fluxo, estabilidade térmica e pH dos compostos."
                accent="sky"
              />
              <PillarCard
                icon={BrainCircuit}
                title="IA Explicável"
                description="Algoritmos transparentes que classificam o risco de degradação estrutural e antecipam a demanda hospitalar com explicabilidade de features."
                accent="indigo"
              />
              <PillarCard
                icon={AlertTriangle}
                title="Sistema Semáforo"
                description="Classificação instantânea em 3 níveis (Verde/Adequado, Amarelo/Atenção e Vermelho/Crítico) para tomada rápida de decisões clínicas."
                accent="amber"
              />
            </div>
          </div>
        </section>

        {/* Hardware IoT */}
        <section id="hardware" className="px-6 py-20">
          <div className="mx-auto grid max-w-[1280px] items-center gap-12 lg:grid-cols-2">
            <div className="glass-panel grid-lines relative rounded-2xl p-8 border-slate-800">
              <div className="absolute inset-x-0 top-0 h-1 bg-sky-500" />
              <div className="flex items-center gap-3">
                <span className="rounded-xl border border-sky-500/40 bg-sky-500/12 p-3 text-sky-400">
                  <Cpu className="h-7 w-7" />
                </span>
                <div>
                  <h3 className="font-display text-2xl font-bold text-white">Hardware IoT em Bancada</h3>
                  <p className="text-xs sm:text-sm text-slate-400">
                    Arduino / ESP32 + Sensores Físicos de Teste
                  </p>
                </div>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <HardwareItem label="Microcontrolador" value="Arduino Nano / ESP32" />
                <HardwareItem label="Sensor de Fluxo" value="YF-S201 (Líquidos)" />
                <HardwareItem label="Sensor Térmico" value="DS18B20 Digital" />
                <HardwareItem label="Comunicação" value="Serial USB / Wi-Fi API" />
              </div>
            </div>

            <div className="space-y-6">
              <span className="font-mono text-[11px] uppercase tracking-widest text-sky-400">
                Integração Física Real
              </span>
              <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl text-white">
                Telemetria de precisão do <span className="text-sky-400">mundo físico</span>
              </h2>
              <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
                O FLOWTIFICIAL integra sensores reais montados em uma bancada de circulação fechada. 
                Os dados são transmitidos para a Camada 2 (Pipeline de Tratamento de Ruído) e analisados
                pela IA, garantindo previsões seguras e relatórios explicáveis para a equipe médica.
              </p>
              <div className="flex gap-4">
                <Button
                  onClick={() => onNavigate("tecnico")}
                  variant="outline"
                  className="gap-2 border-slate-700 text-slate-200 hover:bg-slate-800"
                >
                  Ver Console Técnico
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Como Funciona */}
        <section id="como-funciona" className="px-6 py-20 border-t border-slate-850 bg-slate-950/40">
          <div className="mx-auto max-w-[1280px]">
            <div className="mb-12 text-center">
              <p className="font-mono text-[11px] uppercase tracking-widest text-slate-400">
                Fluxo de 4 Camadas
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl text-white">
                Do sensor à <span className="text-rose-500">decisão clínica</span>
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-4">
              <StepCard
                step="01"
                title="Dados & Rastreabilidade"
                description="Coleta contínua de sensores físicos e auditoria de cada lote de sangue produzido."
              />
              <StepCard
                step="02"
                title="Processamento & Filtro"
                description="Eliminação de ruídos textuais e normalização matemática de grandezas biológicas."
              />
              <StepCard
                step="03"
                title="IA Explicável & Risco"
                description="Inferência de segurança, risco de degradação térmica e projeção de demanda."
              />
              <StepCard
                step="04"
                title="Intermediação Conversacional"
                description="Assistente Flow em linguagem natural com justificativas médicas embasadas."
              />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 px-6 py-10 bg-slate-950/80">
        <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-3">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-lg text-white"
              style={{ background: "linear-gradient(135deg, #ff2a42, #b91c1c)" }}
            >
              <Droplets className="h-4 w-4" />
            </span>
            <span className="font-display font-bold tracking-tight text-white">
              FLOW<span className="text-rose-500">TIFICIAL</span>
            </span>
          </div>
          <p className="text-center text-xs text-slate-400">
            Desenvolvido por Mariana Vicente, Julia Santana e Vitória Barreto • FECAP / FECART 2026
          </p>
          <Button
            onClick={() => onNavigate("dashboard")}
            variant="outline"
            size="sm"
            className="gap-2 border-slate-700 text-slate-300"
          >
            Dashboard
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </footer>
    </div>
  );
}

function HeroStatusCard({ onNavigate }) {
  return (
    <article className="glass-panel float-card grid-lines relative w-full max-w-md overflow-hidden rounded-2xl p-6 border-slate-700">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-rose-500 via-sky-400 to-rose-500" />

      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400">
            Status da Telemetria
          </p>
          <p className="mt-1 flex items-center gap-2 font-display text-lg font-semibold text-white">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
            Sistema Ativo & Conectado
          </p>
        </div>
        <span className="rounded-xl border border-sky-500/40 bg-sky-500/12 p-3 text-sky-400">
          <Activity className="h-6 w-6" />
        </span>
      </div>

      <div className="mt-6 space-y-3">
        <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-rose-500/12 p-2 text-rose-400">
              <Waves className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs text-slate-400">Vazão do Circuito</p>
              <p className="font-mono text-sm font-semibold text-white">4,8 L/min (Estável)</p>
            </div>
          </div>
          <span className="h-2 w-2 rounded-full bg-sky-400 shadow-[0_0_10px_#38bdf8]" />
        </div>

        <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-sky-500/12 p-2 text-sky-400">
              <Thermometer className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs text-slate-400">Temperatura</p>
              <p className="font-mono text-sm font-semibold text-white">36,5 °C</p>
            </div>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-400 font-bold">
            Fisiológica
          </span>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-slate-400">
          Classificação Semáforo
        </p>
        <div className="flex items-center justify-between gap-2">
          <SemaphoreDot color="bg-emerald-400" label="OK" active />
          <SemaphoreDot color="bg-amber-400" label="Atenção" />
          <SemaphoreDot color="bg-rose-500" label="Crítico" />
        </div>
      </div>
    </article>
  );
}

function SemaphoreDot({ color, label, active }) {
  return (
    <div className="flex flex-1 flex-col items-center gap-1.5">
      <span
        className={`h-4 w-4 rounded-full ${color} ${
          active ? "ring-2 ring-offset-2 ring-offset-slate-950 ring-white/40 shadow-[0_0_10px_currentColor]" : "opacity-30"
        }`}
      />
      <span className="font-mono text-[9px] uppercase tracking-widest text-slate-400 font-bold">
        {label}
      </span>
    </div>
  );
}

function PillarCard({ icon: Icon, title, description, accent }) {
  const accentColors = {
    rose: "bg-rose-500/10 border-rose-500/30 text-rose-400 border-t-rose-500",
    sky: "bg-sky-500/10 border-sky-500/30 text-sky-400 border-t-sky-500",
    indigo: "bg-indigo-500/10 border-indigo-500/30 text-indigo-400 border-t-indigo-500",
    amber: "bg-amber-500/10 border-amber-500/30 text-amber-400 border-t-amber-500",
  };

  return (
    <article className="glass-panel group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 border-slate-800">
      <div className={`pointer-events-none absolute inset-x-0 top-0 h-1 ${accentColors[accent].split(" ").pop()}`} />
      <span className={`mb-5 inline-flex rounded-xl border p-3 ${accentColors[accent]}`}>
        <Icon className="h-6 w-6" />
      </span>
      <h3 className="font-display text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-400">
        {description}
      </p>
    </article>
  );
}

function HardwareItem({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
      <p className="font-mono text-[10px] uppercase tracking-widest text-slate-400">
        {label}
      </p>
      <p className="mt-1 font-display font-semibold text-white text-sm">{value}</p>
    </div>
  );
}

function StepCard({ step, title, description }) {
  return (
    <div className="glass-panel relative rounded-2xl p-6 border-slate-800 flex flex-col justify-between">
      <div>
        <span className="font-mono text-3xl font-bold text-slate-600 block">
          {step}
        </span>
        <h3 className="mt-3 font-display text-base font-semibold text-white">{title}</h3>
        <p className="mt-2 text-xs text-slate-400 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
