import React, { useState, useEffect, useMemo } from 'react';
import {
  Sliders,
  Bell,
  RefreshCw,
  CheckCircle2,
  Lock,
  Sun,
  Moon,
  Palette,
  Wallet,
  Tags,
  Plus,
  Pencil,
  Trash2,
  AlertTriangle,
  AlertCircle,
  Clock,
  Calendar,
  History,
  RotateCcw,
  Ban,
} from 'lucide-react';
import { UI_COPY } from '../data/copy';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { actualizarSaldoInicial, PerfilUsuario } from '../firebase/users';
import { formatCurrency } from '../data/format';
import { Categoria, PeriodoActualizacion } from '../types/finance';
import { useSaldoInicial } from '../hooks/useSaldoInicial';

interface SettingsViewProps {
  onResetData: () => void;
  categoriasGasto: Categoria[];
  categoriasIngreso: Categoria[];
  onNuevaCategoria: (tipo: 'gasto' | 'ingreso') => void;
  onEditarCategoria: (categoria: Categoria) => void;
  onEliminarCategoria: (categoria: Categoria) => void;
}

const NIVEL_STYLES: Record<
  'ok' | 'info' | 'warn' | 'danger' | 'blocked',
  { container: string; icon: string; iconClass: string }
> = {
  ok: {
    container: 'bg-emerald-500/5 border-emerald-500/20',
    icon: CheckCircle2 as unknown as string,
    iconClass: 'text-emerald-500',
  },
  info: {
    container: 'bg-teal-500/5 border-teal-500/20',
    icon: AlertCircle as unknown as string,
    iconClass: 'text-teal-500',
  },
  warn: {
    container: 'bg-amber-500/10 border-amber-500/30',
    icon: AlertTriangle as unknown as string,
    iconClass: 'text-amber-500',
  },
  danger: {
    container: 'bg-rose-500/10 border-rose-500/30',
    icon: AlertTriangle as unknown as string,
    iconClass: 'text-rose-500',
  },
  blocked: {
    container: 'bg-[var(--color-surface-subtle)] border-[var(--color-border)]',
    icon: Ban as unknown as string,
    iconClass: 'text-[var(--color-text-muted)]',
  },
};

export const SettingsView: React.FC<SettingsViewProps> = ({
  onResetData,
  categoriasGasto,
  categoriasIngreso,
  onNuevaCategoria,
  onEditarCategoria,
  onEliminarCategoria,
}) => {
  const { theme, setTheme } = useTheme();
  const { usuario, perfil } = useAuth();

  const [currency, setCurrency] = useState('COP');
  const [cycleStart, setCycleStart] = useState('1');
  const [notifications, setNotifications] = useState(true);
  const [autoReconcile, setAutoReconcile] = useState(true);
  const [savedToast, setSavedToast] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const [saldoInicialInput, setSaldoInicialInput] = useState('');
  const [savingSaldo, setSavingSaldo] = useState(false);
  const [saldoError, setSaldoError] = useState<string | null>(null);
  const [confirmarCambio, setConfirmarCambio] = useState(false);
  const [mostrarHistorial, setMostrarHistorial] = useState(false);

  // Hook de saldo inicial
  const saldo = useSaldoInicial(perfil as PerfilUsuario | null);

  useEffect(() => {
    if (saldo.configurado) {
      setSaldoInicialInput(String(saldo.montoActual));
    } else {
      setSaldoInicialInput('0');
    }
  }, [saldo.configurado, saldo.montoActual]);

  const handleSave = () => {
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  const handleSolicitarGuardarSaldo = () => {
    setSaldoError(null);

    const monto = parseFloat(saldoInicialInput);
    if (isNaN(monto) || monto < 0) {
      setSaldoError('Ingresa un monto valido (mayor o igual a cero).');
      return;
    }

    if (monto === saldo.montoActual) {
      setSaldoError('El monto es el mismo que tenes actualmente.');
      return;
    }

    if (!saldo.puedeEditar) {
      setSaldoError('El saldo esta bloqueado. Espera al proximo periodo.');
      return;
    }

    // Si requiere confirmacion, mostrar dialogo
    if (saldo.requiereConfirmacion) {
      setConfirmarCambio(true);
      return;
    }

    // Guardado directo
    ejecutarGuardado(monto);
  };

  const ejecutarGuardado = async (monto: number) => {
    if (!usuario) return;

    try {
      setSavingSaldo(true);
      setConfirmarCambio(false);

      await actualizarSaldoInicial(
        usuario.uid,
        monto,
        saldo.periodo,
        currency,
        saldo.historialSaldos,
        saldo.intentosUsados,
        perfil?.saldoInicial?.intentosRenovadosEn || new Date().toISOString()
      );

      const restantes = Math.max(0, saldo.intentosMaximos - (saldo.intentosUsados + 1));
      const mensaje =
        restantes === 0
          ? 'Saldo actualizado. Agotaste los 3 intentos de este periodo.'
          : restantes === 1
          ? 'Saldo actualizado. Te queda 1 intento de correccion.'
          : `Saldo actualizado. Te quedan ${restantes} intentos de correccion.`;

      setSuccessToast(mensaje);
      setTimeout(() => setSuccessToast(null), 5000);
    } catch (error) {
      console.error('Error al guardar saldo inicial:', error);
      setSaldoError('No se pudo guardar. Intenta de nuevo.');
    } finally {
      setSavingSaldo(false);
    }
  };

  const saldoActualFormateado = useMemo(
    () => formatCurrency(saldo.montoActual),
    [saldo.montoActual]
  );

  const nivel = NIVEL_STYLES[saldo.nivelAdvertencia];

  const renderListaCategorias = (
    categorias: Categoria[],
    tipo: 'gasto' | 'ingreso'
  ) => (
    <div className="space-y-2">
      {categorias.map((cat) => (
        <div
          key={cat.id}
          className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] hover:border-[var(--color-accent-border)] transition-colors group"
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold"
              style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
            >
              {cat.nombre.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-[var(--color-text)] truncate">
                {cat.nombre}
              </p>
              {cat.esPredeterminada && (
                <p className="text-[11px] text-[var(--color-text-muted)] font-medium">
                  Predeterminada
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <button
              type="button"
              onClick={() => onEditarCategoria(cat)}
              className="p-2 text-[var(--color-text-secondary)] hover:text-teal-500 hover:bg-teal-500/10 rounded-full transition-colors"
              title="Editar"
              aria-label="Editar categoria"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onEliminarCategoria(cat)}
              className="p-2 text-[var(--color-text-secondary)] hover:text-rose-500 hover:bg-rose-500/10 rounded-full transition-colors"
              title="Eliminar"
              aria-label="Eliminar categoria"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200 max-w-4xl mx-auto w-full">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--color-text)]">
          {UI_COPY.sections.systemPreferences}
        </h1>
        <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-1 font-normal">
          Personaliza tu experiencia, moneda base y privacidad de tu dinero
        </p>
      </div>

      {savedToast && (
        <div className="flex items-center gap-2 p-3.5 bg-teal-950/40 border border-teal-800/60 rounded-2xl text-xs text-teal-600 dark:text-teal-300 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-teal-500 dark:text-teal-400" />
          <span>Tus preferencias se guardaron correctamente en este dispositivo.</span>
        </div>
      )}

      {successToast && (
        <div className="flex items-center gap-2 p-3.5 bg-emerald-950/40 border border-emerald-800/60 rounded-2xl text-xs text-emerald-600 dark:text-emerald-300 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500 dark:text-emerald-400" />
          <span>{successToast}</span>
        </div>
      )}

      {/* ====================================================================
          SALDO INICIAL
      ==================================================================== */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-5 sm:p-6 space-y-4 shadow-xs transition-colors interactive-card">
        <div className="border-b border-[var(--color-border)] pb-3">
          <h2 className="text-base font-bold text-[var(--color-text)] flex items-center gap-2">
            <Wallet className="w-4 h-4 text-[var(--color-accent)] stroke-[2]" />
            <span>Saldo inicial</span>
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
            El dinero con el que empiezas. Es la base para calcular tu saldo actual.
          </p>
        </div>

        {/* Banner de estado segun intentos */}
        {saldo.mensajeAdvertencia && (
          <div
            className={`flex items-start gap-3 p-4 rounded-2xl border ${nivel.container}`}
          >
            {saldo.nivelAdvertencia === 'blocked' ? (
              <Ban className={`w-5 h-5 shrink-0 mt-0.5 stroke-[2.5] ${nivel.iconClass}`} />
            ) : saldo.nivelAdvertencia === 'danger' ? (
              <AlertTriangle className={`w-5 h-5 shrink-0 mt-0.5 stroke-[2.5] ${nivel.iconClass}`} />
            ) : (
              <AlertTriangle className={`w-5 h-5 shrink-0 mt-0.5 stroke-[2] ${nivel.iconClass}`} />
            )}
            <div className="text-xs leading-relaxed">
              <p
                className={`font-bold ${
                  saldo.nivelAdvertencia === 'blocked'
                    ? 'text-[var(--color-text)]'
                    : saldo.nivelAdvertencia === 'danger'
                    ? 'text-rose-700 dark:text-rose-300'
                    : 'text-amber-700 dark:text-amber-300'
                }`}
              >
                {saldo.nivelAdvertencia === 'blocked'
                  ? '🔒 Saldo bloqueado'
                  : saldo.nivelAdvertencia === 'danger'
                  ? '⚠️ Ultimo intento disponible'
                  : '⚠️ Cuidado con los intentos'}
              </p>
              <p className="mt-1 opacity-90">{saldo.mensajeAdvertencia}</p>
            </div>
          </div>
        )}

        {/* Contador de intentos */}
        <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)]">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-[var(--color-text-secondary)] stroke-[2]" />
            <span className="text-xs font-semibold text-[var(--color-text-secondary)]">
              Intentos de correccion
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: saldo.intentosMaximos }).map((_, i) => (
              <div
                key={i}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  i < saldo.intentosRestantes
                    ? 'bg-emerald-500'
                    : 'bg-[var(--color-border)]'
                }`}
                title={
                  i < saldo.intentosRestantes
                    ? 'Intento disponible'
                    : 'Intento usado'
                }
              />
            ))}
            <span className="text-xs font-bold text-[var(--color-text)] ml-1 tabular-nums">
              {saldo.intentosRestantes} / {saldo.intentosMaximos}
            </span>
          </div>
        </div>

        {/* Saldo actual */}
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)]">
          <div className="flex-1">
            <span className="text-xs font-semibold text-[var(--color-text-secondary)] block mb-1">
              Saldo actual
            </span>
            <span className="text-2xl font-bold text-[var(--color-text)] tabular-nums">
              {saldoActualFormateado}
            </span>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-700 dark:text-teal-300">
              {saldo.periodo}
            </span>
            {saldo.proximaActualizacion && (
              <span className="text-[11px] text-[var(--color-text-muted)]">
                Renueva {saldo.proximaActualizacion.toLocaleDateString('es-CO', {
                  day: 'numeric',
                  month: 'short',
                })}
              </span>
            )}
          </div>
        </div>

        {/* Frase contextual */}
        <div className="p-3.5 rounded-2xl bg-teal-500/5 border border-teal-500/20">
          <p className="text-xs text-[var(--color-text-secondary)] italic">
            💬 "{saldo.fraseContextual}"
          </p>
        </div>

        {/* Input de edicion o bloqueo */}
        {saldo.puedeEditar ? (
          <div>
            <label className="block text-xs font-semibold text-[var(--color-text)] mb-1">
              Editar saldo inicial
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] font-bold text-base">
                  $
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={saldoInicialInput}
                  onChange={(e) => {
                    const soloDigitos = e.target.value.replace(/[^0-9]/g, '');
                    setSaldoInicialInput(soloDigitos);
                    setSaldoError(null);
                  }}
                  className={`w-full pl-8 pr-4 py-2.5 bg-[var(--color-surface-subtle)] border rounded-2xl text-sm font-bold text-[var(--color-text)] tabular-nums focus:outline-none focus:ring-2 ${
                    saldoError
                      ? 'border-rose-500 focus:ring-rose-500/20'
                      : 'border-[var(--color-border)] focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)]'
                  }`}
                  disabled={savingSaldo}
                />
              </div>
              <button
                onClick={handleSolicitarGuardarSaldo}
                disabled={savingSaldo || !saldoInicialInput}
                className="px-5 py-2.5 bg-teal-500 hover:bg-teal-400 active:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 text-xs font-bold rounded-full transition-colors shadow-sm shadow-teal-500/10"
              >
                {savingSaldo ? 'Guardando...' : 'Actualizar'}
              </button>
            </div>
            {saldoError && (
              <p className="text-xs text-rose-500 mt-1.5 font-medium">
                {saldoError}
              </p>
            )}
            <p className="text-xs text-[var(--color-text-muted)] mt-2">
              Cada actualizacion consume 1 intento de correccion.
            </p>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] flex items-start gap-3">
            <Lock className="w-5 h-5 text-[var(--color-text-muted)] shrink-0 mt-0.5 stroke-[2]" />
            <div>
              <p className="text-xs font-bold text-[var(--color-text)]">
                Edicion bloqueada
              </p>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1 leading-relaxed">
                {saldo.textoBloqueo ||
                  'Vas a poder editar tu saldo cuando renueve el periodo.'}
              </p>
            </div>
          </div>
        )}

        {/* Historial colapsable */}
        {saldo.historialSaldos.length > 0 && (
          <div>
            <button
              type="button"
              onClick={() => setMostrarHistorial(!mostrarHistorial)}
              className="w-full flex items-center justify-between gap-2 p-3 rounded-2xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] hover:border-[var(--color-accent-border)] transition-colors"
            >
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-[var(--color-text-secondary)]" />
                <span className="text-xs font-bold text-[var(--color-text)]">
                  Historial de saldos ({saldo.historialSaldos.length})
                </span>
              </div>
              <span className="text-[var(--color-text-muted)] text-xs">
                {mostrarHistorial ? 'Ocultar' : 'Ver'}
              </span>
            </button>

            {mostrarHistorial && (
              <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
                {[...saldo.historialSaldos].reverse().map((entrada, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-2xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)]"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-teal-500/15 flex items-center justify-center">
                        <Calendar className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 stroke-[2]" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[var(--color-text)] tabular-nums">
                          ${entrada.monto.toLocaleString('es-CO')}
                        </p>
                        <p className="text-[10px] text-[var(--color-text-muted)]">
                          {new Date(entrada.fecha).toLocaleDateString('es-CO', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--color-surface)] text-[var(--color-text-secondary)] border border-[var(--color-border)]">
                      {entrada.periodo}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Dialogo de confirmacion (24-48h) */}
        {confirmarCambio && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3 animate-in fade-in">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 stroke-[2.5]" />
              <div className="text-xs">
                <p className="font-bold text-amber-700 dark:text-amber-300">
                  Confirmar cambio de saldo
                </p>
                <p className="mt-1 text-[var(--color-text-secondary)] leading-relaxed">
                  Pasaron mas de 24 horas desde tu ultimo cambio. Este ajuste
                  va a consumir 1 intento de correccion.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmarCambio(false)}
                className="px-4 py-2 text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => ejecutarGuardado(parseFloat(saldoInicialInput))}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-white text-xs font-bold rounded-full transition-colors"
              >
                Si, cambiar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ====================================================================
          MIS CATEGORIAS
      ==================================================================== */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-5 sm:p-6 space-y-5 shadow-xs transition-colors interactive-card">
        <div className="border-b border-[var(--color-border)] pb-3">
          <h2 className="text-base font-bold text-[var(--color-text)] flex items-center gap-2">
            <Tags className="w-4 h-4 text-[var(--color-accent)] stroke-[2]" />
            <span>Mis categorias</span>
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
            Crea, edita o elimina las categorias que usas en presupuestos y transacciones.
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              Gastos ({categoriasGasto.length})
            </h3>
            <button
              type="button"
              onClick={() => onNuevaCategoria('gasto')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-[11px] font-bold rounded-full transition-colors"
            >
              <Plus className="w-3 h-3 stroke-[2.5]" />
              <span>Nueva</span>
            </button>
          </div>
          {categoriasGasto.length === 0 ? (
            <p className="text-xs text-[var(--color-text-muted)] italic py-3">
              No hay categorias de gasto activas.
            </p>
          ) : (
            renderListaCategorias(categoriasGasto, 'gasto')
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Ingresos ({categoriasIngreso.length})
            </h3>
            <button
              type="button"
              onClick={() => onNuevaCategoria('ingreso')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold rounded-full transition-colors"
            >
              <Plus className="w-3 h-3 stroke-[2.5]" />
              <span>Nueva</span>
            </button>
          </div>
          {categoriasIngreso.length === 0 ? (
            <p className="text-xs text-[var(--color-text-muted)] italic py-3">
              No hay categorias de ingreso activas.
            </p>
          ) : (
            renderListaCategorias(categoriasIngreso, 'ingreso')
          )}
        </div>
      </div>

      {/* ====================================================================
          TEMA
      ==================================================================== */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-5 sm:p-6 space-y-4 shadow-xs transition-colors interactive-card">
        <div className="border-b border-[var(--color-border)] pb-3">
          <h2 className="text-base font-bold text-[var(--color-text)] flex items-center gap-2">
            <Palette className="w-4 h-4 text-[var(--color-accent)] stroke-[2]" />
            <span>Tema y apariencia</span>
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
            Elige el estilo visual con el que te sientas mas comodo
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`flex items-start gap-3.5 p-4 rounded-2xl border text-left transition-all interactive-pill ${
              theme === 'dark'
                ? 'border-[var(--color-accent)] bg-[var(--color-surface-subtle)] ring-1 ring-[var(--color-accent)]'
                : 'border-[var(--color-border)] hover:bg-[var(--color-surface-hover)]'
            }`}
          >
            <div className="w-10 h-10 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0 text-amber-300">
              <Moon className="w-5 h-5 stroke-[2]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[var(--color-text)]">
                  Tema Oscuro
                </span>
                {theme === 'dark' && (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-400">
                    Activo
                  </span>
                )}
              </div>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1 leading-relaxed">
                Fondo obsidiana con acentos verde azulado.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`flex items-start gap-3.5 p-4 rounded-2xl border text-left transition-all interactive-pill ${
              theme === 'light'
                ? 'border-[var(--color-accent)] bg-[var(--color-surface-subtle)] ring-1 ring-[var(--color-accent)]'
                : 'border-[var(--color-border)] hover:bg-[var(--color-surface-hover)]'
            }`}
          >
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0 text-amber-600">
              <Sun className="w-5 h-5 stroke-[2]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[var(--color-text)]">
                  Tema Claro
                </span>
                {theme === 'light' && (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-700">
                    Activo
                  </span>
                )}
              </div>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1 leading-relaxed">
                Tarjetas blancas luminosas y alto contraste.
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* ====================================================================
          MONEDA Y CORTE
      ==================================================================== */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-5 sm:p-6 space-y-5 shadow-xs transition-colors interactive-card">
        <div className="border-b border-[var(--color-border)] pb-3">
          <h2 className="text-base font-bold text-[var(--color-text)] flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[var(--color-accent)] stroke-[2]" />
            <span>{UI_COPY.sections.financialConfiguration}</span>
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
            Moneda en la que ves tu dinero y dia de corte mensual
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--color-text)] mb-1">
              Moneda Principal
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[var(--color-surface-subtle)] border border-[var(--color-border)] rounded-2xl text-xs font-semibold text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            >
              <option value="COP">COP ($) - Peso colombiano</option>
              <option value="USD">USD ($) - Dolar estadounidense</option>
              <option value="EUR">EUR (EUR) - Euro</option>
              <option value="GBP">GBP (GBP) - Libra esterlina</option>
              <option value="BRL">BRL (R$) - Real brasileno</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-text)] mb-1">
              Dia de corte mensual
            </label>
            <select
              value={cycleStart}
              onChange={(e) => setCycleStart(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[var(--color-surface-subtle)] border border-[var(--color-border)] rounded-2xl text-xs font-semibold text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            >
              <option value="1">1 de cada mes (Inicio de mes)</option>
              <option value="15">15 de cada mes (Pago quincenal)</option>
              <option value="25">25 de cada mes (Pago de nomina)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ====================================================================
          NOTIFICACIONES
      ==================================================================== */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-5 sm:p-6 space-y-4 shadow-xs transition-colors interactive-card">
        <div className="border-b border-[var(--color-border)] pb-3">
          <h2 className="text-base font-bold text-[var(--color-text)] flex items-center gap-2">
            <Bell className="w-4 h-4 text-[var(--color-accent)] stroke-[2]" />
            <span>{UI_COPY.sections.alertsMonitoring}</span>
          </h2>
        </div>

        <div className="space-y-3">
          <label className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] cursor-pointer hover:bg-[var(--color-surface-hover)] transition-colors">
            <div>
              <span className="text-xs font-bold text-[var(--color-text)] block">
                Aviso cuando llegues al 90% de un presupuesto
              </span>
            </div>
            <input
              type="checkbox"
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
              className="w-4 h-4 rounded text-teal-500 focus:ring-teal-400 accent-teal-500"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] cursor-pointer hover:bg-[var(--color-surface-hover)] transition-colors">
            <div>
              <span className="text-xs font-bold text-[var(--color-text)] block">
                Categorizacion automatica inteligente
              </span>
            </div>
            <input
              type="checkbox"
              checked={autoReconcile}
              onChange={(e) => setAutoReconcile(e.target.checked)}
              className="w-4 h-4 rounded text-teal-500 focus:ring-teal-400 accent-teal-500"
            />
          </label>
        </div>
      </div>

      {/* ====================================================================
          PRIVACIDAD
      ==================================================================== */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-5 sm:p-6 space-y-3 shadow-xs transition-colors interactive-card">
        <div className="flex items-center gap-2 text-base font-bold text-[var(--color-text)]">
          <Lock className="w-4 h-4 text-[var(--color-accent)] stroke-[2]" />
          <span>Tu privacidad ante todo</span>
        </div>
        <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed font-normal">
          NOVA esta disenada pensando en la seguridad de tu informacion.
        </p>
      </div>

      {/* ====================================================================
          ACCIONES
      ==================================================================== */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onResetData}
          className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-[var(--color-text-secondary)] hover:text-rose-500 hover:bg-rose-500/10 rounded-full transition-all border border-transparent hover:border-rose-500/20 interactive-pill"
          type="button"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{UI_COPY.actions.resetDefaultData}</span>
        </button>

        <button
          onClick={handleSave}
          className="px-6 py-2.5 bg-teal-500 hover:bg-teal-400 active:bg-teal-600 text-slate-950 text-xs font-bold rounded-full transition-all shadow-sm shadow-teal-500/10 interactive-pill"
          type="button"
        >
          {UI_COPY.actions.savePreferences}
        </button>
      </div>
    </div>
  );
};