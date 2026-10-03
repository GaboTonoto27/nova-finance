import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { UI_COPY } from '../data/copy';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { actualizarSaldoInicial } from '../firebase/users';
import { formatCurrency } from '../data/format';
import { Categoria } from '../types/finance';

interface SettingsViewProps {
  onResetData: () => void;
  categoriasGasto: Categoria[];
  categoriasIngreso: Categoria[];
  onNuevaCategoria: (tipo: 'gasto' | 'ingreso') => void;
  onEditarCategoria: (categoria: Categoria) => void;
  onEliminarCategoria: (categoria: Categoria) => void;
}

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

  // Saldo inicial
  const [saldoInicialInput, setSaldoInicialInput] = useState('');
  const [savingSaldo, setSavingSaldo] = useState(false);
  const [saldoError, setSaldoError] = useState<string | null>(null);

  useEffect(() => {
    if (perfil?.saldoInicial?.configurado) {
      setSaldoInicialInput(String(perfil.saldoInicial.monto));
    } else {
      setSaldoInicialInput('0');
    }
  }, [perfil]);

  const handleSave = () => {
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  const handleSaveSaldo = async () => {
    if (!usuario) return;
    setSaldoError(null);

    const monto = parseFloat(saldoInicialInput);
    if (isNaN(monto) || monto < 0) {
      setSaldoError('Ingresa un monto valido (mayor o igual a cero).');
      return;
    }

    try {
      setSavingSaldo(true);
      await actualizarSaldoInicial(usuario.uid, monto, currency);
      setSuccessToast('Saldo inicial actualizado correctamente.');
      setTimeout(() => setSuccessToast(null), 3000);
    } catch (error) {
      console.error('Error al guardar saldo inicial:', error);
      setSaldoError('No se pudo guardar. Intenta de nuevo.');
    } finally {
      setSavingSaldo(false);
    }
  };

  const saldoActual = perfil?.saldoInicial?.configurado
    ? perfil.saldoInicial.monto
    : 0;

  // Componente de lista de categorias
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
      {/* Header */}
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

      {/* Saldo Inicial */}
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

        <div className="space-y-3">
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)]">
            <div className="flex-1">
              <span className="text-xs font-semibold text-[var(--color-text-secondary)] block mb-1">
                Saldo inicial actual
              </span>
              <span className="text-2xl font-bold text-[var(--color-text)] tabular-nums">
                {formatCurrency(saldoActual)}
              </span>
            </div>
          </div>

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
                  type="number"
                  step="any"
                  min="0"
                  value={saldoInicialInput}
                  onChange={(e) => setSaldoInicialInput(e.target.value)}
                  className={`w-full pl-8 pr-4 py-2.5 bg-[var(--color-surface-subtle)] border rounded-2xl text-sm font-bold text-[var(--color-text)] tabular-nums focus:outline-none focus:ring-2 ${
                    saldoError
                      ? 'border-rose-500 focus:ring-rose-500/20'
                      : 'border-[var(--color-border)] focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)]'
                  }`}
                  disabled={savingSaldo}
                />
              </div>
              <button
                onClick={handleSaveSaldo}
                disabled={savingSaldo || !saldoInicialInput}
                className="px-5 py-2.5 bg-teal-500 hover:bg-teal-400 active:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 text-xs font-bold rounded-full transition-colors shadow-sm shadow-teal-500/10"
              >
                {savingSaldo ? 'Guardando...' : 'Actualizar'}
              </button>
            </div>
            {saldoError && (
              <p className="text-xs text-rose-500 mt-1.5 font-medium">{saldoError}</p>
            )}
            <p className="text-xs text-[var(--color-text-muted)] mt-2">
              Cambiar este valor recalcula tu saldo disponible en el dashboard.
            </p>
          </div>
        </div>
      </div>

      {/* Mis Categorias */}
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

        {/* Categorias de gasto */}
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

        {/* Categorias de ingreso */}
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

      {/* Theme / Appearance */}
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

      {/* Financial Parameters */}
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

      {/* Notifications */}
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

      {/* Privacy */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-5 sm:p-6 space-y-3 shadow-xs transition-colors interactive-card">
        <div className="flex items-center gap-2 text-base font-bold text-[var(--color-text)]">
          <Lock className="w-4 h-4 text-[var(--color-accent)] stroke-[2]" />
          <span>Tu privacidad ante todo</span>
        </div>
        <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed font-normal">
          NOVA esta disenada pensando en la seguridad de tu informacion.
        </p>
      </div>

      {/* Actions */}
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