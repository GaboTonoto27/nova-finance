import React, { useState } from 'react';
import { Sparkles, Check } from 'lucide-react';

interface WelcomeModalProps {
  isOpen: boolean;
  nombreUsuario: string;
  onConfirm: (monto: number) => Promise<void>;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  isOpen,
  nombreUsuario,
  onConfirm,
}) => {
  const [monto, setMonto] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const montoNum = parseFloat(monto);
    if (isNaN(montoNum) || montoNum < 0) {
      setError('Ingresa un monto valido (mayor o igual a cero).');
      return;
    }

    try {
      setEnviando(true);
      await onConfirm(montoNum);
    } catch (err) {
      console.error('Error al guardar saldo inicial:', err);
      setError('No se pudo guardar. Intenta de nuevo.');
      setEnviando(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-md bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl shadow-2xl p-6 sm:p-8 text-[var(--color-text)]">
        <div className="flex justify-center mb-5">
          <div className="w-16 h-16 rounded-full bg-teal-500/10 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-teal-500" />
          </div>
        </div>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-[var(--color-text)] mb-2">
            Hola, {nombreUsuario.split(' ')[0]}
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Bienvenido a NOVA. Antes de empezar, contanos:
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">
              Cuanto dinero tienes disponible ahora mismo?
            </label>
            <p className="text-xs text-[var(--color-text-muted)] mb-3">
              Este sera tu saldo inicial. Podes cambiarlo despues en Ajustes.
            </p>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] font-bold text-lg">
                $
              </span>
              <input
                type="number"
                step="any"
                min="0"
                placeholder="0"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                className={`w-full pl-9 pr-4 py-3 bg-[var(--color-surface-subtle)] border rounded-xl text-lg font-bold text-[var(--color-text)] tabular-nums placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 ${
                  error
                    ? 'border-rose-500 focus:ring-rose-500/20'
                    : 'border-[var(--color-border)] focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)]'
                }`}
                autoFocus
                disabled={enviando}
              />
            </div>
            {error && (
              <p className="text-xs text-rose-500 mt-2 font-medium">{error}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={enviando || !monto}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-teal-500 hover:bg-teal-400 active:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 text-sm font-bold rounded-full transition-colors shadow-sm shadow-teal-500/10"
          >
            {enviando ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>Empezar</span>
              </>
            )}
          </button>

          <p className="text-xs text-center text-[var(--color-text-muted)]">
            Podes empezar con $0 si todavia no tienes dinero registrado.
          </p>
        </form>
      </div>
    </div>
  );
};