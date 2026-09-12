import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  ZoomIn, 
  Contrast, 
  RotateCcw, 
  X, 
  Check, 
  Sparkles, 
  Sliders, 
  Type,
  Maximize2
} from 'lucide-react';

const STORAGE_KEY = 'flowtificial_accessibility_config';

const DEFAULT_CONFIG = {
  fontSize: 100, // 100, 115, 130 (%)
  highContrast: false,
  hoverZoom: true,
};

export function AccessibilityMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Erro ao carregar configurações de acessibilidade:', e);
    }
    return DEFAULT_CONFIG;
  });

  // Aplica as alterações no elemento raiz <html> e sincroniza com o localStorage
  useEffect(() => {
    try {
      const root = document.documentElement;

      // 1. Controle de Tamanho de Fonte Global
      root.style.fontSize = `${config.fontSize}%`;
      root.classList.remove('font-scale-100', 'font-scale-115', 'font-scale-130');
      root.classList.add(`font-scale-${config.fontSize}`);

      // 2. Alto Contraste
      if (config.highContrast) {
        root.classList.add('accessibility-high-contrast');
      } else {
        root.classList.remove('accessibility-high-contrast');
      }

      // 3. Efeito de Lupa / Zoom no Hover
      if (config.hoverZoom) {
        root.classList.add('accessibility-hover-zoom');
      } else {
        root.classList.remove('accessibility-hover-zoom');
      }

      // Salva no localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch (e) {
      console.warn('Erro ao aplicar acessibilidade:', e);
    }
  }, [config]);

  const updateConfig = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setConfig(DEFAULT_CONFIG);
  };

  return (
    <div className="accessibility-menu-no-zoom">
      {/* BOTÃO FLUTUANTE DE ACESSIBILIDADE */}
      <div className="fixed bottom-5 right-5 z-50 flex items-center">
        <button
          onClick={() => setIsOpen(prev => !prev)}
          title="Opções de Acessibilidade e Leitura (Fonte, Contraste, Zoom)"
          aria-label="Abrir menu de Acessibilidade"
          className={`group flex items-center gap-2 px-3.5 py-2.5 rounded-full border shadow-2xl transition-all duration-300 font-sans text-xs font-semibold ${
            isOpen || config.highContrast || config.fontSize > 100
              ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-400 shadow-[0_0_20px_rgba(225,29,72,0.5)] scale-105'
              : 'bg-slate-900/95 hover:bg-slate-800 text-slate-100 border-slate-700/80 hover:border-sky-400 hover:text-sky-300 shadow-[0_8px_24px_rgba(0,0,0,0.6)]'
          }`}
        >
          <div className="relative flex items-center justify-center">
            <Eye className="w-4 h-4 text-sky-400 group-hover:text-white transition-colors" />
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-400"></span>
            </span>
          </div>
          <span className="tracking-wide">Acessibilidade</span>
          {(config.fontSize > 100 || config.highContrast) && (
            <span className="bg-sky-400 text-slate-950 font-mono text-[10px] font-bold px-1.5 py-0.2 rounded-full">
              Ativo
            </span>
          )}
        </button>
      </div>

      {/* MODAL / POPUP DE CONFIGURAÇÃO DE ACESSIBILIDADE */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end p-4 sm:p-6 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="w-full max-w-md bg-slate-950/95 border border-slate-700/90 rounded-2xl p-5 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.85)] flex flex-col gap-5 relative animate-in zoom-in-95 duration-200 sm:mr-4 mb-16 sm:mb-0"
            role="dialog"
            aria-modal="true"
            aria-labelledby="accessibility-title"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-gradient-to-br from-sky-500/20 to-rose-500/20 border border-sky-500/30 text-sky-400">
                  <Sliders className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 id="accessibility-title" className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                    Acessibilidade e Leitura
                  </h3>
                  <p className="text-[11px] text-slate-400 font-sans">
                    Ajustes de visibilidade e ergonomia visual
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                aria-label="Fechar menu de acessibilidade"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* OPÇÃO 1: TAMANHO DE FONTE GLOBAL */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-mono tracking-wider text-slate-300 flex items-center gap-1.5 uppercase">
                  <Type className="w-3.5 h-3.5 text-sky-400" />
                  Tamanho do Texto Global
                </span>
                <span className="text-xs font-mono font-bold text-sky-400 bg-sky-500/10 border border-sky-500/30 px-2 py-0.5 rounded">
                  {config.fontSize === 100 ? 'Padrão (100%)' : config.fontSize === 115 ? 'Médio (+15%)' : 'Grande (+30%)'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => updateConfig('fontSize', 100)}
                  className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all flex flex-col items-center gap-1 ${
                    config.fontSize === 100
                      ? 'bg-sky-500/20 border-sky-400 text-sky-300 font-bold shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <span className="text-sm">A</span>
                  <span className="text-[10px] font-mono">100% (Padrão)</span>
                </button>

                <button
                  type="button"
                  onClick={() => updateConfig('fontSize', 115)}
                  className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all flex flex-col items-center gap-1 ${
                    config.fontSize === 115
                      ? 'bg-sky-500/20 border-sky-400 text-sky-300 font-bold shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <span className="text-base font-bold">A+</span>
                  <span className="text-[10px] font-mono">115% (Médio)</span>
                </button>

                <button
                  type="button"
                  onClick={() => updateConfig('fontSize', 130)}
                  className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all flex flex-col items-center gap-1 ${
                    config.fontSize === 130
                      ? 'bg-sky-500/20 border-sky-400 text-sky-300 font-bold shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <span className="text-lg font-bold">A++</span>
                  <span className="text-[10px] font-mono">130% (Grande)</span>
                </button>
              </div>

              {/* Caixa de Prévia de Leitura */}
              <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3 mt-1">
                <p className="text-[10px] text-slate-400 font-mono mb-1 uppercase tracking-wider">
                  Prévia de Legibilidade:
                </p>
                <p className="text-xs text-slate-200 leading-relaxed font-sans">
                  "O sangue artificial Flowtificial está com oxigenação em nível seguro de 98.4%."
                </p>
              </div>
            </div>

            {/* OPÇÃO 2: ALTO CONTRASTE */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <div className="flex flex-col gap-0.5 max-w-[75%]">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5 font-sans">
                  <Contrast className="w-3.5 h-3.5 text-rose-500" />
                  Modo Alto Contraste
                </span>
                <p className="text-[11px] text-slate-400 font-sans leading-tight">
                  Maximiza o contraste de textos, cartões e bordas sobre o fundo escuro.
                </p>
              </div>

              <button
                type="button"
                onClick={() => updateConfig('highContrast', !config.highContrast)}
                role="switch"
                aria-checked={config.highContrast}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  config.highContrast ? 'bg-rose-600' : 'bg-slate-800'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    config.highContrast ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* OPÇÃO 3: LUPA DINÂMICA / ZOOM NO HOVER */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <div className="flex flex-col gap-0.5 max-w-[75%]">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5 font-sans">
                  <ZoomIn className="w-3.5 h-3.5 text-emerald-400" />
                  Lupa Dinâmica (Zoom no Hover)
                </span>
                <p className="text-[11px] text-slate-400 font-sans leading-tight">
                  Amplia e destaca cartões B1-B5, blocos de sensores e laudos ao passar o cursor do mouse.
                </p>
              </div>

              <button
                type="button"
                onClick={() => updateConfig('hoverZoom', !config.hoverZoom)}
                role="switch"
                aria-checked={config.hoverZoom}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  config.hoverZoom ? 'bg-emerald-500' : 'bg-slate-800'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    config.hoverZoom ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* RODAPÉ DO MODAL: RESTAURAR E SALVAMENTO */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition-colors font-sans py-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Restaurar Padrão
              </button>

              <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono font-medium">
                <Check className="w-3.5 h-3.5" />
                Salvo no Navegador
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AccessibilityMenu;
