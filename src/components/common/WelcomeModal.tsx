import React, { useState } from 'react';
import { Check, Wallet, Sparkles, Calendar, Clock, CalendarDays } from 'lucide-react';
import { PeriodoActualizacion } from '../../types/finance';

interface WelcomeModalProps {
  isOpen: boolean;
  nombreUsuario: string;
  onConfirm: (monto: number, periodo: PeriodoActualizacion) => Promise<void>;
}

const PERIODOS: {
  value: PeriodoActualizacion;
  label: string;
  descripcion: string;
  icono: React.ComponentType<{ className?: string }>;
  ejemplo: string;
}[] = [
  {
    value: 'mensual',
    label: 'Mensual',
    descripcion: 'Actualizas tu saldo el 1° de cada mes',
    icono: Calendar,
    ejemplo: 'Ideal si recibis tu sueldo mensual',
  },
  {
    value: 'quincenal',
    label: 'Quincenal',
    descripcion: 'Actualizas tu saldo el 1° y el 15',
    icono: Clock,
    ejemplo: 'Ideal si te pagan cada 15 dias',
  },
  {
    value: 'anual',
    label: 'Anual',
    descripcion: 'Actualizas tu saldo el 1° de enero',
    icono: CalendarDays,
    ejemplo: 'Ideal para freelancers o largo plazo',
  },
];

const FRASES_CONTEXTUALES: Record<PeriodoActualizacion, string> = {
  mensual: 'Tu saldo se actualiza cada mes, como tu sueldo.',
  quincenal: 'Tu saldo se actualiza cada quincena, como tu pago.',
  anual: 'Tu saldo se actualiza cada ano, como tus impuestos.',
};

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  isOpen,
  nombreUsuario,
  onConfirm,
}) => {
  // Paso 1: monto. Paso 2: periodo. Paso 3: confirmacion.
  const [paso, setPaso] = useState<1 | 2 | 3>(1);
  const [monto, setMonto] = useState('');
  const [periodo, setPeriodo] = useState<PeriodoActualizacion>('mensual');
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  if (!isOpen) return null;

  const montoNum = monto.trim() === '' ? 0 : parseFloat(monto);
  const montoValido = !isNaN(montoNum) && montoNum >= 0;

  // -------------------------------------------------------------------------
  // Paso 1: Monto
  // -------------------------------------------------------------------------
  const handleContinuarPaso1 = () => {
    setError(null);
    if (!montoValido) {
      setError('Ingresa un monto valido (mayor o igual a cero).');
      return;
    }
    setPaso(2);
  };

  // -------------------------------------------------------------------------
  // Paso 2: Periodo
  // -------------------------------------------------------------------------
  const handleContinuarPaso2 = () => {
    setError(null);
    if (!periodo) {
      setError('Selecciona un periodo.');
      return;
    }
    setPaso(3);
  };

  // -------------------------------------------------------------------------
  // Paso 3: Confirmar
  // -------------------------------------------------------------------------
  const handleConfirmar = async () => {
    setError(null);
    try {
      setEnviando(true);
      await onConfirm(montoNum, periodo);
    } catch (err) {
      console.error('Error al guardar saldo inicial:', err);
      setError('No se pudo guardar. Intenta de nuevo.');
      setEnviando(false);
    }
  };

  // -------------------------------------------------------------------------
  // Boton "Empezar con $0"
  // -------------------------------------------------------------------------
  const handleEmpezarConCero = () => {
    setMonto('0');
    setPaso(2);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-title"
    >
      <div className="relative w-full max-w-md bg-[var(--color-surface)] border-2 border-[var(--color-accent-border)] rounded-3xl shadow-2xl p-6 sm:p-8 text-[var(--color-text)] animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
        {/* Indicador de pasos */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div
            className={`w-2 h-2 rounded-full transition-all ${
              paso >= 1 ? 'bg-teal-500 w-8' : 'bg-[var(--color-border)]'
            }`}
          />
          <div
            className={`w-2 h-2 rounded-full transition-all ${
              paso >= 2 ? 'bg-teal-500 w-8' : 'bg-[var(--color-border)]'
            }`}
          />
          <div
            className={`w-2 h-2 rounded-full transition-all ${
              paso >= 3 ? 'bg-teal-500 w-8' : 'bg-[var(--color-border)]'
            }`}
          />
        </div>

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

        {/* ====================================================================
            PASO 1: Monto
        ==================================================================== */}
        {paso === 1 && (
          <>
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-700 dark:text-teal-300 text-[10px] font-bold uppercase tracking-wider mb-3">
                <Sparkles className="w-3 h-3" />
                <span>Paso 1 de 3 · Saldo inicial</span>
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

            <div className="p-3.5 rounded-2xl bg-teal-500/5 border border-teal-500/20 mb-5">
              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                <strong className="text-[var(--color-text)]">💡 ¿Por qué?</strong>{' '}
                Este será tu saldo inicial y es la base para calcular todo lo que
                entra y sale.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text)] mb-2">
                  Tu saldo inicial en COP
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] font-bold text-lg">
                    $
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="0"
                    value={monto}
                    onChange={(e) => {
                      const soloDigitos = e.target.value.replace(/[^0-9]/g, '');
                      setMonto(soloDigitos);
                      setError(null);
                    }}
                    className={`w-full pl-9 pr-4 py-3.5 bg-[var(--color-surface-subtle)] border-2 rounded-2xl text-xl font-bold text-[var(--color-text)] tabular-nums placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 ${
                      error
                        ? 'border-rose-500 focus:ring-rose-500/20'
                        : 'border-[var(--color-border)] focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)]'
                    }`}
                    autoFocus
                    disabled={enviando}
                  />
                </div>
                {monto && (
                  <p className="text-xs text-[var(--color-text-muted)] mt-2 tabular-nums">
                    Se guardara como ${Number(monto).toLocaleString('es-CO')}
                  </p>
                )}
                {error && (
                  <p className="text-xs text-rose-500 mt-2 font-medium">{error}</p>
                )}
              </div>

              <button
                type="button"
                onClick={handleContinuarPaso1}
                disabled={enviando}
                className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-teal-500 hover:bg-teal-400 active:bg-teal-600 disabled:opacity-50 text-slate-950 text-sm font-bold rounded-full transition-colors shadow-sm shadow-teal-500/20 interactive-pill"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>Continuar</span>
              </button>

              <button
                type="button"
                onClick={handleEmpezarConCero}
                disabled={enviando}
                className="w-full py-2.5 text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
              >
                Mejor empezá con $0
              </button>
            </div>
          </>
        )}

        {/* ====================================================================
            PASO 2: Periodo
        ==================================================================== */}
        {paso === 2 && (
          <>
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-700 dark:text-teal-300 text-[10px] font-bold uppercase tracking-wider mb-3">
                <Sparkles className="w-3 h-3" />
                <span>Paso 2 de 3 · Periodo</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[var(--color-text)]">
                ¿Cada cuánto actualizas tu saldo?
              </h2>
              <p className="text-sm text-[var(--color-text-secondary)] mt-2 leading-relaxed">
                Vas a poder editar tu saldo inicial
                <strong className="text-[var(--color-text)]"> una vez por periodo</strong>.
              </p>
            </div>

            <div className="space-y-3 mb-5">
              {PERIODOS.map((p) => {
                const Icono = p.icono;
                const seleccionado = periodo === p.value;
                return (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => {
                      setPeriodo(p.value);
                      setError(null);
                    }}
                    className={`w-full flex items-start gap-3 p-4 rounded-2xl border-2 text-left transition-all ${
                      seleccionado
                        ? 'border-[var(--color-accent)] bg-teal-500/5 ring-2 ring-[var(--color-accent)]/20'
                        : 'border-[var(--color-border)] hover:border-[var(--color-accent-border)] bg-[var(--color-surface-subtle)]'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        seleccionado
                          ? 'bg-teal-500 text-white'
                          : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)]'
                      }`}
                    >
                      <Icono className="w-5 h-5 stroke-[2]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-[var(--color-text)]">
                          {p.label}
                        </p>
                        {seleccionado && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-700 dark:text-teal-300">
                            Elegido
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                        {p.descripcion}
                      </p>
                      <p className="text-[11px] text-[var(--color-text-muted)] mt-1 italic">
                        {p.ejemplo}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {error && (
              <p className="text-xs text-rose-500 mb-3 font-medium text-center">
                {error}
              </p>
            )}

            <div className="space-y-3">
              <button
                type="button"
                onClick={handleContinuarPaso2}
                disabled={enviando}
                className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-teal-500 hover:bg-teal-400 active:bg-teal-600 disabled:opacity-50 text-slate-950 text-sm font-bold rounded-full transition-colors shadow-sm shadow-teal-500/20 interactive-pill"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>Continuar</span>
              </button>

              <button
                type="button"
                onClick={() => setPaso(1)}
                disabled={enviando}
                className="w-full py-2.5 text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
              >
                Volver al paso anterior
              </button>
            </div>
          </>
        )}

        {/* ====================================================================
            PASO 3: Confirmacion
        ==================================================================== */}
        {paso === 3 && (
          <>
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-700 dark:text-teal-300 text-[10px] font-bold uppercase tracking-wider mb-3">
                <Sparkles className="w-3 h-3" />
                <span>Paso 3 de 3 · Confirma</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[var(--color-text)]">
                Todo listo
              </h2>
              <p className="text-sm text-[var(--color-text-secondary)] mt-2 leading-relaxed">
                Revisa tu configuracion antes de empezar.
              </p>
            </div>

            <div className="space-y-3 mb-5">
              <div className="p-4 rounded-2xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)]">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                  Saldo inicial
                </p>
                <p className="text-2xl font-bold text-[var(--color-text)] tabular-nums mt-1">
                  ${montoNum.toLocaleString('es-CO')}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)]">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                  Periodo de actualizacion
                </p>
                <p className="text-base font-bold text-[var(--color-text)] mt-1">
                  {PERIODOS.find((p) => p.value === periodo)?.label}
                </p>
                <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                  {PERIODOS.find((p) => p.value === periodo)?.descripcion}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-teal-500/5 border border-teal-500/20">
                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed italic">
                  💬 "{FRASES_CONTEXTUALES[periodo]}"
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/20 mb-5">
              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                <strong className="text-[var(--color-text)]">📌 Importante:</strong>{' '}
                Vas a poder editar tu saldo inicial en Ajustes durante las
                primeras <strong>48 horas</strong>. Después queda bloqueado
                hasta el proximo periodo.
              </p>
            </div>

            {error && (
              <p className="text-xs text-rose-500 mb-3 font-medium text-center">
                {error}
              </p>
            )}

            <div className="space-y-3">
              <button
                type="button"
                onClick={handleConfirmar}
                disabled={enviando}
                className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-teal-500 hover:bg-teal-400 active:bg-teal-600 disabled:opacity-50 text-slate-950 text-sm font-bold rounded-full transition-colors shadow-sm shadow-teal-500/20 interactive-pill"
              >
                {enviando ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Configurando...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    <span>Empezar a usar NOVA</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setPaso(2)}
                disabled={enviando}
                className="w-full py-2.5 text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
              >
                Volver al paso anterior
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};