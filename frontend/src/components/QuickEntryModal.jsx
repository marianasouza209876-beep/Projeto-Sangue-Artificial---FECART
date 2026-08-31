import React, { useState } from "react";
import { QrCode, CheckCircle2, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function QuickEntryModal({ onInjectReading, apiBase }) {
  const [open, setOpen] = useState(false);
  const [lotId, setLotId] = useState("SA-026");
  const [ox, setOx] = useState("95%");
  const [temp, setTemp] = useState("36.8");
  const [vazao, setVazao] = useState("4.8");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      lote_id: lotId.trim() || "SA-026",
      oxigenacao: ox.includes("%") ? ox : `${ox}%`,
      temperatura: temp.includes("C") ? temp : `${temp}C`,
      vazao: String(vazao),
    };

    try {
      if (apiBase) {
        await fetch(`${apiBase}/api/sensor-data`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      if (onInjectReading) {
        onInjectReading(payload);
      }
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setOpen(false);
      }, 1400);
    } catch (err) {
      console.log("Erro ao enviar leitura simulada:", err);
      if (onInjectReading) {
        onInjectReading(payload);
      }
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setOpen(false);
      }, 1400);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white shadow-[0_0_20px_rgba(225,29,72,0.35)] border border-rose-500/30">
          <QrCode className="h-4 w-4" />
          Simular Entrada via QR Code
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-panel border-slate-700 sm:max-w-md bg-slate-950/95 text-slate-100">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-white">
            <Sparkles className="h-5 w-5 text-rose-500" />
            Simulação de Entrada de Lote
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400">
            Escaneie o QR Code do estande ou insira manualmente os parâmetros para alimentar o sistema em tempo real.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-8 flex flex-col items-center justify-center gap-3 text-center animate-in fade-in">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <p className="font-bold text-white text-base">Leitura Enviada com Sucesso!</p>
            <p className="text-xs text-slate-400 font-mono">
              Lote {lotId} processado e auditado pela Camada 2.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-4 mt-2">
            <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-2xl border border-dashed border-sky-500/40 bg-sky-500/5 text-sky-400 relative overflow-hidden group">
              <QrCode className="h-16 w-16 group-hover:scale-110 transition-transform duration-300" />
              <div className="absolute inset-0 bg-gradient-to-b from-sky-500/0 via-sky-500/10 to-sky-500/0 h-full w-full animate-pulse" />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field
                label="Identificador do Lote"
                value={lotId}
                onChange={(e) => setLotId(e.target.value)}
                placeholder="SA-026"
              />
              <Field
                label="Oxigenação (%)"
                value={ox}
                onChange={(e) => setOx(e.target.value)}
                placeholder="95%"
              />
              <Field
                label="Temperatura (°C)"
                value={temp}
                onChange={(e) => setTemp(e.target.value)}
                placeholder="36.8"
              />
              <Field
                label="Vazão (L/min)"
                value={vazao}
                onChange={(e) => setVazao(e.target.value)}
                placeholder="4.8"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full mt-2 gap-2 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-medium"
            >
              {loading ? (
                "Processando..."
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Enviar Leitura para o Pipeline
                </>
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <label className="grid gap-1.5 text-left">
      <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400">
        {label}
      </span>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="h-9 rounded-lg border border-slate-700 bg-slate-900/80 px-3 text-xs text-slate-100 outline-none placeholder:text-slate-500 focus:border-sky-500/80 transition-colors"
      />
    </label>
  );
}
