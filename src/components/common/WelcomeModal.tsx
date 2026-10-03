import React, { useState } from 'react';
import { Check, Wallet, Sparkles } from 'lucide-react';

// ============================================================================
// NOVA v0.4.2.5 - Modal de bienvenida (BLOQUEANTE)
// ============================================================================
// Se muestra al primer login del usuario y NO se puede cerrar hasta
// que configure su saldo inicial (puede ser $0).
// - Sin boton de cerrar (X)
// - Sin Escape
// - Sin click afuera
// - Solo avanza con el boton "Empezar"

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

    // Permitir monto vacio => tratar como 0
    const montoTexto = monto.trim();
    const montoNum = montoTexto === '' ? 0 : parseFloat(montoTexto);

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

  const handleEmpezarConCero = async () => {
    setError(null);
    try {
      setEnviando(true);
      await onConfirm(0);
    } catch (err) {
      console.error('Error al guardar saldo inicial:', err);
      setError('No se pudo guardar. Intenta de nuevo.');
      setEnviando(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-title"
      // Sin onClick para cerrar: el usuario DEBE configurar el saldo
    >
      <div className="relative w-full max-w-md bg-[var(--color-surface)] border-2 border-[var(--color-accent-border)] rounded-3xl shadow-2xl p-6 sm:p-8 text-[var(--color-text)] animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
        {/* Icono decorativo */}
        <div className="flex justify-center mb-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-teal-500/15 border-2 border-teal-500/30 flex items-center justify-center">
              <Wallet className="w-9 h-9 text-teal-500 stroke-[2]" />
            </div>
            <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-[var(--color-surface)] border-2 border-teal-500/40 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-teal-500 stroke-[2.5]" />
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-700 dark:text-teal-300 text-[10px] font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3 h-3" />
            <span>Paso obligatorio</span>
          </div>

          <h2
            id="welcome-title"
            className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--color-text)]"
          >
            Hola, {nombreUsuario.split(' ')[0]}
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)] mt-2 leading-relaxed">
            Antes de empezar, contanos: <br />
            <strong className="text-[var(--color-text)]">
              ¿Cuánto dinero tenés disponible ahora mismo?
            </strong>
          </p>
        </div>

        {/* Info */}
        <div className="p-3.5 rounded-2xl bg-teal-500/5 border border-teal-500/20 mb-5">
          <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
            <strong className="text-[var(--color-text)]">💡 ¿Por qué?</strong>{' '}
            Este será tu saldo inicial y es la base para calcular todo lo que
            entra y sale. Vas a poder cambiarlo después desde Ajustes.
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-[var(--color-text)] mb-2">
              Tu saldo inicial en COP
            </label>
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
                className={`w-full pl-9 pr-4 py-3.5 bg-[var(--color-surface-subtle)] border-2 rounded-2xl text-xl font-bold text-[var(--color-text)] tabular-nums placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 ${
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

          {/* Boton principal */}
          <button
            type="submit"
            disabled={enviando}
            className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-teal-500 hover:bg-teal-400 active:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 text-sm font-bold rounded-full transition-colors shadow-sm shadow-teal-500/20 interactive-pill"
          >
            {enviando ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>Empezar con {monto.trim() ? 'este monto' : '$0'}</span>
              </>
            )}
          </button>

          {/* Boton secundario: empezar en 0 */}
          {monto.trim() !== '' && (
            <button
              type="button"
              onClick={handleEmpezarConCero}
              disabled={enviando}
              className="w-full py-2.5 text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
            >
              Mejor empezá con $0
            </button>
          )}

          <p className="text-xs text-center text-[var(--color-text-muted)] leading-relaxed pt-2 border-t border-[var(--color-border)]">
            Podés empezar con $0 si todavía no tenés dinero registrado.
            <br />
            <strong className="text-[var(--color-text-secondary)]">
              Este paso es obligatorio para continuar.
            </strong>
          </p>
        </form>
      </div>
    </div>
  );
};