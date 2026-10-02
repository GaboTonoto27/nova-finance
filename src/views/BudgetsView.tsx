import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  Plus,
  Pencil,
  Trash2,
  Home,
  ShoppingBag,
  Laptop,
  HeartPulse,
  Car,
  Utensils,
  BookOpen,
  Repeat,
  CreditCard,
  MoreHorizontal,
  Wallet,
} from 'lucide-react';
import { Presupuesto, CategoriaGasto } from '../types/finance';
import { formatCurrency } from '../data/format';
import { CATEGORY_LABELS } from '../data/copy';

interface BudgetsViewProps {
  presupuestos: Presupuesto[];
  cargando: boolean;
  onNuevoPresupuesto: () => void;
  onEditarPresupuesto: (p: Presupuesto) => void;
  onEliminarPresupuesto: (p: Presupuesto) => void;
}

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Home: Home,
  ShoppingBag: ShoppingBag,
  Car: Car,
  Laptop: Laptop,
  HeartPulse: HeartPulse,
  Utensils: Utensils,
  BookOpen: BookOpen,
  Repeat: Repeat,
  CreditCard: CreditCard,
  MoreHorizontal: MoreHorizontal,
};

export const BudgetsView: React.FC<BudgetsViewProps> = ({
  presupuestos,
  cargando,
  onNuevoPresupuesto,
  onEditarPresupuesto,
  onEliminarPresupuesto,
}) => {
  const totalAllocated = useMemo(
    () => presupuestos.reduce((acc, p) => acc + p.limite, 0),
    [presupuestos]
  );
  const totalSpent = useMemo(
    () => presupuestos.reduce((acc, p) => acc + p.gastado, 0),
    [presupuestos]
  );
  const totalRemaining = totalAllocated - totalSpent;
  const overallPercentage =
    totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0;

  // ------------------------------------------------------------------------
  // Estado de carga
  // ------------------------------------------------------------------------
  if (cargando) {
    return (
      <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--color-text)]">
              Tus Presupuestos
            </h1>
            <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-1">
              Controla y ajusta los limites de lo que gastas cada mes
            </p>
          </div>
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

  // ------------------------------------------------------------------------
  // Estado vacio
  // ------------------------------------------------------------------------
  if (presupuestos.length === 0) {
    return (
      <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--color-text)]">
            Tus Presupuestos
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-1">
            Controla y ajusta los limites de lo que gastas cada mes
          </p>
        </div>

        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-8 sm:p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-teal-500/10 flex items-center justify-center mx-auto">
            <Wallet className="w-8 h-8 text-teal-500" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[var(--color-text)]">
              Aun no tienes presupuestos
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1 max-w-md mx-auto">
              Crea limites de gasto por categoria para tener el control de tu dinero.
              Cada mes vas a ver cuanto llevas gastado en cada uno.
            </p>
          </div>
          <button
            onClick={onNuevoPresupuesto}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-500 hover:bg-teal-400 active:bg-teal-600 text-slate-950 text-sm font-bold rounded-full transition-all shadow-sm shadow-teal-500/10 interactive-pill"
            type="button"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Crear mi primer presupuesto</span>
          </button>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------------------
  // Vista con datos
  // ------------------------------------------------------------------------
  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--color-text)]">
            Tus Presupuestos
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-1">
            Controla y ajusta los limites de lo que gastas cada mes
          </p>
        </div>

        <button
          onClick={onNuevoPresupuesto}
          className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-400 active:bg-teal-600 text-slate-950 text-xs font-bold rounded-full transition-all shadow-sm shadow-teal-500/10 self-start sm:self-auto interactive-pill"
          type="button"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Nuevo presupuesto</span>
        </button>
      </div>

      {/* Resumen */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-5 sm:p-7 shadow-xs interactive-card">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pb-6 border-b border-[var(--color-border)]">
          <div>
            <div className="text-xs text-[var(--color-text-secondary)] font-semibold mb-1">
              Presupuesto total del mes
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-[var(--color-text)] tabular-nums">
              {formatCurrency(totalAllocated)}
            </div>
            <div className="text-xs text-[var(--color-text-muted)] mt-1">
              Repartido en {presupuestos.length}{' '}
              {presupuestos.length === 1 ? 'categoria' : 'categorias'}
            </div>
          </div>

          <div>
            <div className="text-xs text-[var(--color-text-secondary)] font-semibold mb-1">
              Lo que llevas gastado
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-[var(--color-text)] tabular-nums">
              {formatCurrency(totalSpent)}
            </div>
            <div className="text-xs text-[var(--color-text-muted)] mt-1">
              {totalAllocated > 0
                ? `Has consumido el ${overallPercentage}% de tu presupuesto`
                : 'Sin limite definido aun'}
            </div>
          </div>

          <div>
            <div className="text-xs text-[var(--color-text-secondary)] font-semibold mb-1">
              Te queda libre
            </div>
            <div
              className={`text-2xl sm:text-3xl font-bold tabular-nums ${
                totalRemaining >= 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {formatCurrency(totalRemaining)}
            </div>
            <div className="text-xs text-[var(--color-text-muted)] mt-1">
              {totalRemaining >= 0
                ? 'Disponible para gastar sin salirte del plan'
                : 'Te pasaste del limite planeado'}
            </div>
          </div>
        </div>

        {totalAllocated > 0 && (
          <div className="pt-5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[var(--color-text)]">
                Avance general de tus gastos
              </span>
              <span className="text-[var(--color-text)] tabular-nums font-bold">
                {overallPercentage}% usado
              </span>
            </div>
            <div className="w-full h-3 bg-[var(--color-surface-subtle)] rounded-full overflow-hidden flex gap-1 p-0.5 border border-[var(--color-border)]">
              {presupuestos.map((p) => {
                const width =
                  totalSpent > 0 ? Math.max(4, (p.gastado / totalSpent) * 100) : 4;
                return (
                  <div
                    key={p.id}
                    style={{ width: `${width}%`, backgroundColor: p.color }}
                    className="h-full rounded-full transition-all"
                    title={`${CATEGORY_LABELS[p.categoria] || p.categoria}: ${formatCurrency(p.gastado)}`}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Grid de presupuestos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {presupuestos.map((p) => {
          const percent = p.limite > 0 ? Math.round((p.gastado / p.limite) * 100) : 0;
          const remaining = p.limite - p.gastado;
          const isOver = remaining < 0;
          const Icon = CATEGORY_ICONS[p.iconName] || ShoppingBag;

          return (
            <div
              key={p.id}
              className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-5 flex flex-col justify-between space-y-4 hover:border-[var(--color-accent-border)] shadow-xs transition-all interactive-card group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${p.color}20`, color: p.color }}
                    >
                      <Icon className="w-4 h-4 stroke-[2]" />
                    </div>
                    <h3 className="text-sm font-bold text-[var(--color-text)] truncate">
                      {CATEGORY_LABELS[p.categoria] || p.categoria}
                    </h3>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEditarPresupuesto(p)}
                      className="p-1.5 text-[var(--color-text-secondary)] hover:text-teal-500 hover:bg-teal-500/10 rounded-full transition-colors"
                      title="Editar"
                      aria-label="Editar presupuesto"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onEliminarPresupuesto(p)}
                      className="p-1.5 text-[var(--color-text-secondary)] hover:text-rose-500 hover:bg-rose-500/10 rounded-full transition-colors"
                      title="Eliminar"
                      aria-label="Eliminar presupuesto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Barra de progreso */}
                <div className="w-full h-2.5 bg-[var(--color-surface-subtle)] rounded-full overflow-hidden my-3">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isOver ? 'bg-rose-500' : ''
                    }`}
                    style={{
                      width: `${Math.min(100, percent)}%`,
                      backgroundColor: isOver ? '#EF4444' : p.color,
                    }}
                  />
                </div>

                {/* Numeros */}
                <div className="flex items-baseline justify-between pt-1">
                  <span className="text-xs text-[var(--color-text-secondary)] font-medium">
                    Gastado:
                  </span>
                  <span className="text-base font-bold text-[var(--color-text)] tabular-nums">
                    {formatCurrency(p.gastado)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)] mt-1">
                  <span className="font-medium">Presupuesto:</span>
                  <span className="font-bold text-[var(--color-text-secondary)] tabular-nums">
                    {p.limite > 0 ? formatCurrency(p.limite) : 'Sin limite'}
                  </span>
                </div>
              </div>

              {/* Footer de estado */}
              <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-between text-xs">
                <span className="text-[var(--color-text-secondary)]">
                  {p.limite === 0 ? (
                    <span className="text-amber-600 dark:text-amber-400 font-semibold">
                      <AlertTriangle className="w-3.5 h-3.5 inline mr-1" />
                      Definí un limite
                    </span>
                  ) : isOver ? (
                    <span className="text-rose-500 flex items-center gap-1 font-semibold">
                      <AlertTriangle className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Te pasaste por {formatCurrency(Math.abs(remaining))}</span>
                    </span>
                  ) : (
                    <span>
                      Te queda libre:{' '}
                      <strong className="text-[var(--color-text)] font-semibold">
                        {formatCurrency(remaining)}
                      </strong>
                    </span>
                  )}
                </span>
                {p.limite > 0 && (
                  <span className="text-xs font-bold text-[var(--color-text-muted)] tabular-nums">
                    {percent}%
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};