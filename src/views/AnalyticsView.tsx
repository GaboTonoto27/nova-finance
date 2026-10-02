import React, { useState } from 'react';
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  PiggyBank,
  Wallet,
  BarChart3,
} from 'lucide-react';
import { formatCurrency } from '../data/format';
import { formatMonthEs } from '../data/copy';

// ============================================================================
// TODO Fase 05: calcular CASH_FLOW_HISTORY de datos reales
// ============================================================================
interface CashFlowMonth {
  month: string;
  income: number;
  expenses: number;
  savings: number;
}

const CASH_FLOW_HISTORY: CashFlowMonth[] = [];

export const AnalyticsView: React.FC = () => {
  const [activeMonthIndex, setActiveMonthIndex] = useState<number>(0);

  // ------------------------------------------------------------------------
  // Estado vacio
  // ------------------------------------------------------------------------
  if (CASH_FLOW_HISTORY.length === 0) {
    return (
      <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--color-text)]">
              Estadisticas
            </h1>
            <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-1">
              Aprende como se mueve tu dinero y como evolucionan tus habitos mes a mes
            </p>
          </div>
        </div>

        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-8 sm:p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-teal-500/10 flex items-center justify-center mx-auto">
            <BarChart3 className="w-8 h-8 text-teal-500" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[var(--color-text)]">
              Aun no hay suficientes datos
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1 max-w-md mx-auto">
              Registra movimientos durante algunos meses y aca vas a ver tus
              estadisticas: flujo de dinero, promedios y tendencias.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------------------
  // Vista con datos
  // ------------------------------------------------------------------------
  const activeMonth = CASH_FLOW_HISTORY[activeMonthIndex];
  const maxCashflow = Math.max(
    ...CASH_FLOW_HISTORY.map((m) => Math.max(m.income, m.expenses))
  );

  const avgIncome = Math.round(
    CASH_FLOW_HISTORY.reduce((acc, m) => acc + m.income, 0) / CASH_FLOW_HISTORY.length
  );
  const avgExpenses = Math.round(
    CASH_FLOW_HISTORY.reduce((acc, m) => acc + m.expenses, 0) / CASH_FLOW_HISTORY.length
  );
  const avgSavings = avgIncome - avgExpenses;
  const avgSavingsRate = avgIncome > 0 ? Math.round((avgSavings / avgIncome) * 100) : 0;

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--color-text)]">
            Estadisticas
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-1">
            Aprende como se mueve tu dinero y como evolucionan tus habitos mes a mes
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-[var(--color-text-secondary)] bg-[var(--color-surface)] px-3 py-1.5 rounded-full border border-[var(--color-border)]">
          <Calendar className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
          <span>Ultimos 6 meses</span>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-xs interactive-card">
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
          <div className="text-xs text-[var(--color-text-muted)] mt-1">
            Ingresos promedio al mes
          </div>
        </div>

        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-xs interactive-card">
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
          <div className="text-xs text-[var(--color-text-muted)] mt-1">
            Gastos promedio al mes
          </div>
        </div>

        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-xs interactive-card">
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
          <div className="text-xs text-[var(--color-text-muted)] mt-1">
            Superavit libre para tus metas
          </div>
        </div>

        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-xs interactive-card">
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
          <div className="text-xs text-[var(--color-text-muted)] mt-1">
            De lo que ganas cada mes
          </div>
        </div>
      </div>

      {/* Grafica */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-5 sm:p-7 space-y-6 shadow-xs interactive-card">
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
              <span className="text-[var(--color-text-secondary)]">Libre</span>
            </div>
          </div>
        </div>

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
                    isSelected
                      ? 'bg-[var(--color-surface-subtle)] ring-1 ring-[var(--color-accent)]'
                      : 'hover:bg-[var(--color-surface-hover)]'
                  }`}
                >
                  <div className="w-full flex items-end justify-center gap-1 sm:gap-2 h-44">
                    <div
                      style={{ height: `${incomeHeight}%` }}
                      className={`w-2.5 sm:w-4 rounded-t-full transition-all ${
                        isSelected
                          ? 'bg-emerald-500 shadow-sm shadow-emerald-500/20'
                          : 'bg-emerald-500/70 group-hover:bg-emerald-500'
                      }`}
                      title={`Ingresos: ${formatCurrency(item.income)}`}
                    />
                    <div
                      style={{ height: `${expenseHeight}%` }}
                      className={`w-2.5 sm:w-4 rounded-t-full transition-all ${
                        isSelected
                          ? 'bg-rose-500 shadow-sm shadow-rose-500/20'
                          : 'bg-rose-500/70 group-hover:bg-rose-500'
                      }`}
                      title={`Gastos: ${formatCurrency(item.expenses)}`}
                    />
                    <div
                      style={{ height: `${savingsHeight}%` }}
                      className={`w-2.5 sm:w-4 rounded-t-full transition-all ${
                        isSelected
                          ? 'bg-teal-500 shadow-sm shadow-teal-500/20'
                          : 'bg-teal-500/60 group-hover:bg-teal-500'
                      }`}
                      title={`Libre: ${formatCurrency(item.savings)}`}
                    />
                  </div>

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

        <div className="bg-[var(--color-surface-subtle)] border border-[var(--color-border)] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
              <span className="text-[var(--color-text-secondary)] mr-1.5 font-normal">Entro:</span>
              <strong className="text-emerald-600 dark:text-emerald-400">
                +{formatCurrency(activeMonth.income)}
              </strong>
            </div>
            <div>
              <span className="text-[var(--color-text-secondary)] mr-1.5 font-normal">Salio:</span>
              <strong className="text-rose-600 dark:text-rose-400">
                -{formatCurrency(activeMonth.expenses)}
              </strong>
            </div>
            <div>
              <span className="text-[var(--color-text-secondary)] mr-1.5 font-normal">Quedo:</span>
              <strong className="text-[var(--color-accent)]">
                +{formatCurrency(activeMonth.savings)}
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};