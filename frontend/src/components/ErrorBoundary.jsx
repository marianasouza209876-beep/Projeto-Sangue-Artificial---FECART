import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Erro não tratado na aplicação:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <main className="min-h-screen bg-slate-950 px-6 py-16 text-slate-100 flex items-center justify-center">
          <section className="max-w-lg rounded-2xl border border-rose-500/30 bg-slate-900/80 p-8 text-center shadow-2xl">
            <h1 className="text-xl font-bold">Não foi possível carregar o painel</h1>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Ocorreu um erro inesperado. Atualize a página para tentar novamente.
            </p>
            <button
              type="button"
              onClick={this.handleReload}
              className="mt-6 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-500"
            >
              Atualizar página
            </button>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}
