import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  PiggyBank,
  Wallet,
} from 'lucide-react';
import { CashFlowMonth } from '../types/finance';
import { CASH_FLOW_HISTORY, formatCurrency } from '../data/mockData';
import { UI_COPY, formatMonthEs } from '../data/copy';

export const AnalyticsView: React.FC = () => {
  const [activeMonthIndex, setActiveMonthIndex] = useState<number>(CASH_FLOW_HISTORY.length - 1);
  const activeMonth = CASH_FLOW_HISTORY[activeMonthIndex];

  // Highest income to scale bars
  const maxCashflow = Math.max(...CASH_FLOW_HISTORY.map((m) => Math.max(m.income, m.expenses)));

  // Averages
  const avgIncome = Math.round(
    CASH_FLOW_HISTORY.reduce((acc, m) => acc + m.income, 0) / CASH_FLOW_HISTORY.length
  );
  const avgExpenses = Math.round(
    CASH_FLOW_HISTORY.reduce((acc, m) => acc + m.expenses, 0) / CASH_FLOW_HISTORY.length
  );
  const avgSavings = avgIncome - avgExpenses;
  const avgSavingsRate = Math.round((avgSavings / avgIncome) * 100);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--color-text)]">
            Estadísticas
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-1 font-normal">
            Aprende cómo se mueve tu dinero y cómo evolucionan tus hábitos mes a mes
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-[var(--color-text-secondary)] bg-[var(--color-surface)] px-3 py-1.5 rounded-full border border-[var(--color-border)]">
          <Calendar className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
          <span>Últimos 6 meses</span>
        </div>
      </div>

      {/* Analytics KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-xs transition-all interactive-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[var(--color-text-secondary)] font-semibold">
              Promedio que te entra
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[var(--color-text)] tabular-nums">
            {formatCurrency(avgIncome)}
          </div>
          <div className="text-xs text-[var(--color-text-muted)] mt-1 font-normal">
            Ingresos promedio al mes
          </div>
        </div>

        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-xs transition-all interactive-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[var(--color-text-secondary)] font-semibold">
              Promedio que gastas
            </span>
            <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <ArrowDownRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[var(--color-text)] tabular-nums">
            {formatCurrency(avgExpenses)}
          </div>
          <div className="text-xs text-[var(--color-text-muted)] mt-1 font-normal">
            Gastos promedio al mes
          </div>
        </div>

        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-xs transition-all interactive-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[var(--color-text-secondary)] font-semibold">
              Lo que te queda libre
            </span>
            <div className="w-7 h-7 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Wallet className="w-3.5 h-3.5 stroke-[2]" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[var(--color-accent)] tabular-nums">
            {formatCurrency(avgSavings)}
          </div>
          <div className="text-xs text-[var(--color-text-muted)] mt-1 font-normal">
            Superávit libre para tus metas
          </div>
        </div>

        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-xs transition-all interactive-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[var(--color-text-secondary)] font-semibold">
              Tu ritmo de ahorro
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <PiggyBank className="w-3.5 h-3.5 stroke-[2]" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[var(--color-text)] tabular-nums">
            {avgSavingsRate}%
          </div>
          <div className="text-xs text-[var(--color-text-muted)] mt-1 font-normal">
            De lo que ganas cada mes
          </div>
        </div>
      </div>

      {/* Cash Flow History Visualization */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-5 sm:p-7 space-y-6 shadow-xs transition-colors interactive-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold tracking-tight text-[var(--color-text)]">
              Tu flujo de dinero mes a mes
            </h2>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
              Toca o haz clic en cualquier mes para ver los detalles
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-[var(--color-text-secondary)]">Ingresos</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="text-[var(--color-text-secondary)]">Gastos</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
              <span className="text-[var(--color-text-secondary)]">Te quedó libre</span>
            </div>
          </div>
        </div>

        {/* Visual Bar Histogram */}
        <div className="pt-6 pb-2">
          <div className="grid grid-cols-6 gap-2 sm:gap-6 h-56 items-end border-b border-[var(--color-border)] pb-2">
            {CASH_FLOW_HISTORY.map((item, idx) => {
              const isSelected = idx === activeMonthIndex;
              const incomeHeight = Math.round((item.income / maxCashflow) * 100);
              const expenseHeight = Math.round((item.expenses / maxCashflow) * 100);
              const savingsHeight = Math.round((item.savings / maxCashflow) * 100);

              return (
                <div
                  key={item.month}
                  onClick={() => setActiveMonthIndex(idx)}
                  className={`flex flex-col items-center h-full justify-end cursor-pointer group p-1 sm:p-2 rounded-2xl transition-all ${
                    isSelected ? 'bg-[var(--color-surface-subtle)] ring-1 ring-[var(--color-accent)]' : 'hover:bg-[var(--color-surface-hover)]'
                  }`}
                >
                  {/* Grouped Bars with rounded tops */}
                  <div className="w-full flex items-end justify-center gap-1 sm:gap-2 h-44">
                    {/* Income Bar */}
                    <div
                      style={{ height: `${incomeHeight}%` }}
                      className={`w-2.5 sm:w-4 rounded-t-full transition-all ${
                        isSelected
                          ? 'bg-emerald-500 shadow-sm shadow-emerald-500/20'
                          : 'bg-emerald-500/70 group-hover:bg-emerald-500'
                      }`}
                      title={`Ingresos: ${formatCurrency(item.income)}`}
                    />
                    {/* Expense Bar */}
                    <div
                      style={{ height: `${expenseHeight}%` }}
                      className={`w-2.5 sm:w-4 rounded-t-full transition-all ${
                        isSelected
                          ? 'bg-rose-500 shadow-sm shadow-rose-500/20'
                          : 'bg-rose-500/70 group-hover:bg-rose-500'
                      }`}
                      title={`Gastos: ${formatCurrency(item.expenses)}`}
                    />
                    {/* Net Savings Bar */}
                    <div
                      style={{ height: `${savingsHeight}%` }}
                      className={`w-2.5 sm:w-4 rounded-t-full transition-all ${
                        isSelected
                          ? 'bg-teal-500 shadow-sm shadow-teal-500/20'
                          : 'bg-teal-500/60 group-hover:bg-teal-500'
                      }`}
                      title={`Te quedó libre: ${formatCurrency(item.savings)}`}
                    />
                  </div>

                  {/* Month Label */}
                  <span
                    className={`mt-3 text-xs font-semibold tracking-tight transition-colors ${
                      isSelected
                        ? 'text-[var(--color-accent)] font-bold'
                        : 'text-[var(--color-text-secondary)] group-hover:text-[var(--color-text)]'
                    }`}
                  >
                    {formatMonthEs(item.month).split(' ')[0]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Month Detail Strip */}
        <div className="bg-[var(--color-surface-subtle)] border border-[var(--color-border)] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-semibold">
              Mes seleccionado:
            </span>
            <span className="text-sm font-bold text-[var(--color-text)]">
              {formatMonthEs(activeMonth.month)}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs tabular-nums font-semibold">
            <div>
              <span className="text-[var(--color-text-secondary)] mr-1.5 font-normal">Entró:</span>
              <strong className="text-emerald-600 dark:text-emerald-400">+{formatCurrency(activeMonth.income)}</strong>
            </div>
            <div>
              <span className="text-[var(--color-text-secondary)] mr-1.5 font-normal">Salió:</span>
              <strong className="text-rose-600 dark:text-rose-400">-{formatCurrency(activeMonth.expenses)}</strong>
            </div>
            <div>
              <span className="text-[var(--color-text-secondary)] mr-1.5 font-normal">Te quedó:</span>
              <strong className="text-[var(--color-accent)]">+{formatCurrency(activeMonth.savings)}</strong>
            </div>
            <div>
              <span className="text-[var(--color-text-secondary)] mr-1.5 font-normal">Ahorraste:</span>
              <strong className="text-[var(--color-text)]">
                {Math.round((activeMonth.savings / activeMonth.income) * 100)}%
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
