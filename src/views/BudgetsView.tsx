import React, { useState } from 'react';
import {
  PieChart,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  Plus,
  Sliders,
  Check,
  Home,
  ShoppingBag,
  Laptop,
  HeartPulse,
  Car,
  Utensils,
} from 'lucide-react';
import { BudgetCategory, TransactionType } from '../types/finance';
import { formatCurrency } from '../data/mockData';
import { UI_COPY, BUDGET_LABELS } from '../data/copy';

interface BudgetsViewProps {
  budgets: BudgetCategory[];
  onOpenAddModal: (type?: TransactionType) => void;
}

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'Housing & Residence': Home,
  'Groceries & Dining': ShoppingBag,
  'Technology & Cloud': Laptop,
  'Health & Wellness': HeartPulse,
  'Transit & Mobility': Car,
  'Culture & Equipment': Utensils,
};

export const BudgetsView: React.FC<BudgetsViewProps> = ({
  budgets,
  onOpenAddModal,
}) => {
  const [budgetList, setBudgetList] = useState<BudgetCategory[]>(budgets);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAllocated, setEditAllocated] = useState<number>(0);

  const totalAllocated = budgetList.reduce((acc, b) => acc + b.allocated, 0);
  const totalSpent = budgetList.reduce((acc, b) => acc + b.spent, 0);
  const totalRemaining = totalAllocated - totalSpent;
  const overallPercentage = Math.round((totalSpent / totalAllocated) * 100);

  const handleStartEdit = (b: BudgetCategory) => {
    setEditingId(b.id);
    setEditAllocated(b.allocated);
  };

  const handleSaveEdit = (id: string) => {
    setBudgetList((prev) =>
      prev.map((b) => (b.id === id ? { ...b, allocated: Number(editAllocated) } : b))
    );
    setEditingId(null);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--color-text)]">
            Tus Presupuestos
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-1 font-normal">
            Controla y ajusta los límites de lo que gastas cada mes
          </p>
        </div>

        <button
          onClick={() => onOpenAddModal('expense')}
          className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-400 active:bg-teal-600 text-slate-950 text-xs font-bold rounded-full transition-all shadow-sm shadow-teal-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 self-start sm:self-auto interactive-pill"
          type="button"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>{UI_COPY.actions.addTransaction}</span>
        </button>
      </div>

      {/* Aggregate Overview Card */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-5 sm:p-7 shadow-xs transition-colors interactive-card">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pb-6 border-b border-[var(--color-border)]">
          <div>
            <div className="text-xs text-[var(--color-text-secondary)] font-semibold mb-1">
              Presupuesto total del mes
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-[var(--color-text)] tabular-nums">
              {formatCurrency(totalAllocated)}
            </div>
            <div className="text-xs text-[var(--color-text-muted)] mt-1 font-normal">
              Repartido en {budgetList.length} categorías
            </div>
          </div>

          <div>
            <div className="text-xs text-[var(--color-text-secondary)] font-semibold mb-1">
              Lo que llevas gastado
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-[var(--color-text)] tabular-nums">
              {formatCurrency(totalSpent)}
            </div>
            <div className="text-xs text-[var(--color-text-muted)] mt-1 font-normal">
              Has consumido el {overallPercentage}% de tu presupuesto
            </div>
          </div>

          <div>
            <div className="text-xs text-[var(--color-text-secondary)] font-semibold mb-1">
              Te queda libre
            </div>
            <div
              className={`text-2xl sm:text-3xl font-bold tabular-nums ${
                totalRemaining >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {formatCurrency(totalRemaining)}
            </div>
            <div className="text-xs text-[var(--color-text-muted)] mt-1 font-normal">
              {totalRemaining >= 0 ? 'Disponible para gastar sin salirte del plan' : 'Te pasaste del límite planeado'}
            </div>
          </div>
        </div>

        {/* Global Progress Track */}
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
            {budgetList.map((b) => {
              const width = Math.max(4, (b.spent / totalAllocated) * 100);
              return (
                <div
                  key={b.id}
                  style={{ width: `${width}%`, backgroundColor: b.color }}
                  className="h-full rounded-full transition-all"
                  title={`${BUDGET_LABELS[b.name] || b.name}: ${formatCurrency(b.spent)}`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Categorized Budgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {budgetList.map((category) => {
          const percent = Math.round((category.spent / category.allocated) * 100);
          const remaining = category.allocated - category.spent;
          const isOver = remaining < 0;
          const isEditing = editingId === category.id;
          const Icon = CATEGORY_ICONS[category.name] || ShoppingBag;

          return (
            <div
              key={category.id}
              className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-5 flex flex-col justify-between space-y-4 hover:border-[var(--color-accent-border)] shadow-xs transition-all interactive-card"
            >
              {/* Card Header */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${category.color}20`, color: category.color }}
                    >
                      <Icon className="w-4 h-4 stroke-[2]" />
                    </div>
                    <h3 className="text-sm font-bold text-[var(--color-text)] truncate">
                      {BUDGET_LABELS[category.name] || category.name}
                    </h3>
                  </div>
                  <button
                    onClick={() =>
                      isEditing
                        ? handleSaveEdit(category.id)
                        : handleStartEdit(category)
                    }
                    className="text-[var(--color-text-secondary)] hover:text-[var(--color-text)] p-1.5 rounded-full hover:bg-[var(--color-surface-hover)] text-xs transition-colors"
                    title={isEditing ? 'Guardar' : 'Ajustar presupuesto'}
                    aria-label={isEditing ? 'Guardar presupuesto' : 'Ajustar presupuesto'}
                  >
                    {isEditing ? <Check className="w-4 h-4 text-teal-500" /> : <Sliders className="w-4 h-4" />}
                  </button>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2.5 bg-[var(--color-surface-subtle)] rounded-full overflow-hidden my-3">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isOver ? 'bg-rose-500' : ''
                    }`}
                    style={{
                      width: `${Math.min(100, percent)}%`,
                      backgroundColor: isOver ? '#EF4444' : category.color,
                    }}
                  />
                </div>

                {/* Numbers */}
                <div className="flex items-baseline justify-between pt-1">
                  <span className="text-xs text-[var(--color-text-secondary)] font-medium">Gastado:</span>
                  <span className="text-base font-bold text-[var(--color-text)] tabular-nums">
                    {formatCurrency(category.spent)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)] mt-1">
                  <span className="font-medium">Presupuesto:</span>
                  {isEditing ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[var(--color-text-secondary)] font-bold">$</span>
                      <input
                        type="number"
                        value={editAllocated}
                        onChange={(e) => setEditAllocated(Number(e.target.value))}
                        className="w-24 px-2 py-0.5 bg-[var(--color-surface-subtle)] border border-[var(--color-accent)] rounded-lg text-xs font-bold text-[var(--color-text)] tabular-nums"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveEdit(category.id)}
                        className="text-xs font-bold text-[var(--color-accent)] hover:underline"
                      >
                        {UI_COPY.actions.save}
                      </button>
                    </div>
                  ) : (
                    <span className="font-bold text-[var(--color-text-secondary)] tabular-nums">
                      {formatCurrency(category.allocated)}
                    </span>
                  )}
                </div>
              </div>

              {/* Status footer with natural human tone */}
              <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-between text-xs">
                <span className="text-[var(--color-text-secondary)]">
                  {isOver ? (
                    <span className="text-rose-500 flex items-center gap-1 font-semibold">
                      <AlertTriangle className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Te pasaste por {formatCurrency(Math.abs(remaining))}</span>
                    </span>
                  ) : (
                    <span>
                      Te queda libre: <strong className="text-[var(--color-text)] font-semibold">{formatCurrency(remaining)}</strong>
                    </span>
                  )}
                </span>
                <span className="text-xs font-bold text-[var(--color-text-muted)] tabular-nums">
                  {percent}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
