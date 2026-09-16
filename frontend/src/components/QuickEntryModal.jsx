import { ExternalLink, QrCode, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const EVALUATION_URL = "https://www.fecart.com.br/visitor/d1703db8-2c2c-495d-b94f-45dc2236dbe3";

export function ProjectEvaluationModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="ds-primary-action rounded-full gap-2 px-4 font-semibold hover:shadow-[0_0_20px_rgba(255,0,85,0.45)]">
          <Star className="h-4 w-4" />
          Avaliar Projeto
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-panel border-slate-700 bg-[#0F172A] text-slate-100 sm:max-w-md">
        <DialogHeader className="text-center sm:text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-400/40 bg-cyan-400/10 text-cyan-400">
            <QrCode className="h-6 w-6" />
          </span>
          <DialogTitle className="pt-3 text-xl font-bold text-white">Avalie o Projeto</DialogTitle>
          <DialogDescription className="text-sm leading-6 text-slate-400">
            A banca e os visitantes podem escanear o QR Code ou abrir o formulário oficial de avaliação da FECART.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 space-y-4 text-center">
          <img
            src="/qr-code-fecart.png"
            alt="QR Code para avaliar o projeto Flowtificial na FECART"
            className="mx-auto h-48 w-48 rounded-xl bg-white p-3 object-contain"
          />
          <a
            href={EVALUATION_URL}
            target="_blank"
            rel="noreferrer"
            className="ds-primary-action inline-flex w-full items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold"
          >
            Abrir formulário de avaliação
            <ExternalLink className="h-4 w-4" />
          </a>
          <p className="break-all font-mono text-[10px] text-slate-500">{EVALUATION_URL}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
