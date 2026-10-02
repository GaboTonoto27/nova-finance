import React, { useState, useMemo } from 'react';
import {
  Plus,
  Calendar,
  CheckCircle,
  Shield,
  TrendingUp,
  Plane,
  ShoppingCart,
  Home,
  Car,
  GraduationCap,
  Heart,
  Star,
  Target,
  Pencil,
  Trash2,
  PiggyBank,
} from 'lucide-react';
import { MetaAhorro } from '../types/finance';
import { formatCurrency } from '../data/format';

interface GoalsViewProps {
  metas: MetaAhorro[];
  cargando: boolean;
  onNuevaMeta: () => void;
  onEditarMeta: (m: MetaAhorro) => void;
  onEliminarMeta: (m: MetaAhorro) => void;
  onAbonarMeta: (m: MetaAhorro, monto: number) => Promise<void>;
}

const CATEGORY_LABELS: Record<string, string> = {
  seguridad: 'Fondo de emergencia',
  inversion: 'Inversion y futuro',
  viaje: 'Viajes y gustos',
  compra: 'Compra grande',
  otro: 'Otra meta',
};

const META_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Shield: Shield,
  TrendingUp: TrendingUp,
  Plane: Plane,
  ShoppingCart: ShoppingCart,
  Home: Home,
  Car: Car,
  GraduationCap: GraduationCap,
  Heart: Heart,
  Star: Star,
  Target: Target,
};

function formatearFecha(fechaISO: string): string {
  try {
    const fecha = new Date(fechaISO);
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${fecha.getFullYear()}-${mes}-${dia}`;
  } catch {
    return fechaISO;
  }
}

export const GoalsView: React.FC<GoalsViewProps> = ({
  metas,
  cargando,
  onNuevaMeta,
  onEditarMeta,
  onEliminarMeta,
  onAbonarMeta,
}) => {
  const [abonarMetaId, setAbonarMetaId] = useState<string | null>(null);
  const [abonoMonto, setAbonoMonto] = useState<string>('50000');
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [abonando, setAbonando] = useState(false);

  const totalTarget = useMemo(
    () => metas.reduce((acc, m) => acc + m.montoObjetivo, 0),
    [metas]
  );
  const totalAccumulated = useMemo(
    () => metas.reduce((acc, m) => acc + m.montoActual, 0),
    [metas]
  );
  const totalRemaining = totalTarget - totalAccumulated;
  const overallProgress =
    totalTarget > 0 ? Math.round((totalAccumulated / totalTarget) * 100) : 0;

  const handleAbonar = async (meta: MetaAhorro) => {
    const val = parseFloat(abonoMonto);
    if (isNaN(val) || val <= 0) return;

    try {
      setAbonando(true);
      await onAbonarMeta(meta, val);
      setSuccessToast(
        `Abonaste ${formatCurrency(val)} a "${meta.nombre}". Tu ahorro sigue creciendo.`
      );
      setAbonarMetaId(null);
      setTimeout(() => setSuccessToast(null), 3500);
    } catch (err) {
      console.error('Error al abonar meta:', err);
      setSuccessToast('No se pudo abonar. Intenta de nuevo.');
      setTimeout(() => setSuccessToast(null), 3500);
    } finally {
      setAbonando(false);
    }
  };

  // Estado de carga
  if (cargando) {
    return (
      <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--color-text)]">
            Tus Metas de Ahorro
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-1">
            Ahorros para lo que suenas: viajes, emergencias y proyectos personales
          </p>
        </div>
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-8 text-center">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-[var(--color-surface-subtle)] rounded w-1/3 mx-auto" />
            <div className="h-4 bg-[var(--color-surface-subtle)] rounded w-1/2 mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  // Estado vacio
  if (metas.length === 0) {
    return (
      <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--color-text)]">
            Tus Metas de Ahorro
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-1">
            Ahorros para lo que suenas: viajes, emergencias y proyectos personales
          </p>
        </div>

        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-8 sm:p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-teal-500/10 flex items-center justify-center mx-auto">
            <PiggyBank className="w-8 h-8 text-teal-500" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[var(--color-text)]">
              Aun no tienes metas de ahorro
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1 max-w-md mx-auto">
              Define objetivos como un fondo de emergencia, un viaje, o una
              compra grande. Vas a poder ir abonando mes a mes y ver tu progreso.
            </p>
          </div>
          <button
            onClick={onNuevaMeta}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-500 hover:bg-teal-400 active:bg-teal-600 text-slate-950 text-sm font-bold rounded-full transition-all shadow-sm shadow-teal-500/10 interactive-pill"
            type="button"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Crear mi primera meta</span>
          </button>
        </div>
      </div>
    );
  }

  // Vista con datos
  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--color-text)]">
            Tus Metas de Ahorro
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-1">
            Ahorros para lo que suenas: viajes, emergencias y proyectos personales
          </p>
        </div>

        <button
          onClick={onNuevaMeta}
          className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-400 active:bg-teal-600 text-slate-950 text-xs font-bold rounded-full transition-all shadow-sm shadow-teal-500/10 self-start sm:self-auto interactive-pill"
          type="button"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Nueva meta</span>
        </button>
      </div>

      {successToast && (
        <div className="flex items-center gap-2 p-3.5 bg-teal-500/10 border border-teal-500/30 rounded-2xl text-xs text-teal-700 dark:text-teal-300 animate-in fade-in">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Resumen */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-5 sm:p-7 shadow-xs interactive-card">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pb-6 border-b border-[var(--color-border)]">
          <div>
            <div className="text-xs text-[var(--color-text-secondary)] font-semibold mb-1">
              Meta total de ahorro
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-[var(--color-text)] tabular-nums">
              {formatCurrency(totalTarget)}
            </div>
            <div className="text-xs text-[var(--color-text-muted)] mt-1">
              Repartido en {metas.length} {metas.length === 1 ? 'meta activa' : 'metas activas'}
            </div>
          </div>

          <div>
            <div className="text-xs text-[var(--color-text-secondary)] font-semibold mb-1">
              Llevas ahorrado
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-[var(--color-accent)] tabular-nums">
              {formatCurrency(totalAccumulated)}
            </div>
            <div className="text-xs text-[var(--color-text-muted)] mt-1">
              Has alcanzado el {overallProgress}% de tu objetivo global
            </div>
          </div>

          <div>
            <div className="text-xs text-[var(--color-text-secondary)] font-semibold mb-1">
              Te falta por ahorrar
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-[var(--color-text)] tabular-nums">
              {formatCurrency(totalRemaining)}
            </div>
            <div className="text-xs text-[var(--color-text-muted)] mt-1">
              Abonando mes a mes estas cada vez mas cerca
            </div>
          </div>
        </div>

        {totalTarget > 0 && (
          <div className="pt-5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[var(--color-text)]">
                Progreso acumulado de tus metas
              </span>
              <span className="text-[var(--color-accent)] font-bold tabular-nums">
                {overallProgress}% completado
              </span>
            </div>
            <div className="w-full h-3 bg-[var(--color-surface-subtle)] rounded-full overflow-hidden p-0.5 border border-[var(--color-border)]">
              <div
                className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Grid de metas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {metas.map((meta) => {
          const percent =
            meta.montoObjetivo > 0
              ? Math.min(100, Math.round((meta.montoActual / meta.montoObjetivo) * 100))
              : 0;
          const remaining = Math.max(0, meta.montoObjetivo - meta.montoActual);
          const isAbonando = abonarMetaId === meta.id;
          const Icon = META_ICONS[meta.iconName] || Target;

          return (
            <div
              key={meta.id}
              className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-5 sm:p-6 flex flex-col justify-between space-y-5 hover:border-[var(--color-accent-border)] shadow-xs transition-all interactive-card group"
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${meta.color}20`, color: meta.color }}
                    >
                      <Icon className="w-4 h-4 stroke-[2]" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-semibold text-[var(--color-accent)] block">
                        {CATEGORY_LABELS[meta.categoria] || meta.categoria}
                      </span>
                      <h3 className="text-base font-bold text-[var(--color-text)] mt-0.5 truncate">
                        {meta.nombre}
                      </h3>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      onClick={() => onEditarMeta(meta)}
                      className="p-1.5 text-[var(--color-text-secondary)] hover:text-teal-500 hover:bg-teal-500/10 rounded-full transition-colors"
                      title="Editar"
                      aria-label="Editar meta"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onEliminarMeta(meta)}
                      className="p-1.5 text-[var(--color-text-secondary)] hover:text-rose-500 hover:bg-rose-500/10 rounded-full transition-colors"
                      title="Eliminar"
                      aria-label="Eliminar meta"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Barra de progreso */}
                <div className="w-full h-3 bg-[var(--color-surface-subtle)] rounded-full overflow-hidden border border-[var(--color-border)] p-0.5">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${percent}%`,
                      backgroundColor: meta.color,
                    }}
                  />
                </div>

                {/* Cifras */}
                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div>
                    <span className="text-[var(--color-text-secondary)] block text-xs font-medium">
                      Llevas ahorrado
                    </span>
                    <span className="text-base font-bold text-[var(--color-text)] tabular-nums">
                      {formatCurrency(meta.montoActual)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[var(--color-text-secondary)] block text-xs font-medium">
                      Meta
                    </span>
                    <span className="text-base font-bold text-[var(--color-text-secondary)] tabular-nums">
                      {formatCurrency(meta.montoObjetivo)}
                    </span>
                  </div>
                </div>

                {/* Gap + fecha */}
                <div className="text-xs text-[var(--color-text-secondary)] space-y-1.5 pt-2 border-t border-[var(--color-border)]">
                  <div className="flex items-center justify-between">
                    <span>Falta para llegar:</span>
                    <span className="text-[var(--color-text)] tabular-nums font-semibold">
                      {formatCurrency(remaining)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                      <span>Fecha objetivo:</span>
                    </span>
                    <span className="text-[var(--color-text)] font-medium">
                      {formatearFecha(meta.fechaObjetivo)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Acciones inferiores */}
              <div className="pt-3 border-t border-[var(--color-border)]">
                {isAbonando ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[var(--color-text-secondary)]">
                        $
                      </span>
                      <input
                        type="number"
                        min="1"
                        step="any"
                        value={abonoMonto}
                        onChange={(e) => setAbonoMonto(e.target.value)}
                        className="w-full px-3 py-1.5 bg-[var(--color-surface-subtle)] border border-[var(--color-accent)] rounded-xl text-xs font-bold text-[var(--color-text)] tabular-nums focus:outline-none"
                        placeholder="50000"
                        autoFocus
                        disabled={abonando}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAbonar(meta)}
                        disabled={abonando}
                        className="flex-1 py-2 bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-slate-950 text-xs font-bold rounded-full transition-all interactive-pill"
                      >
                        {abonando ? 'Abonando...' : 'Confirmar abono'}
                      </button>
                      <button
                        onClick={() => setAbonarMetaId(null)}
                        disabled={abonando}
                        className="px-3 py-2 text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setAbonarMetaId(meta.id ?? null);
                      setAbonoMonto('50000');
                    }}
                    className="w-full py-2.5 bg-[var(--color-surface-subtle)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text)] text-xs font-bold rounded-full border border-[var(--color-border)] transition-all flex items-center justify-center gap-1.5 shadow-xs interactive-pill"
                    type="button"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Abonar a esta meta</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};