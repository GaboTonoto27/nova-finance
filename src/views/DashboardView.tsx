import React from 'react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  ArrowRight,
  Target,
  Sparkles,
  PieChart as PieIcon,
  ShoppingBag,
  Home,
  Laptop,
  HeartPulse,
  Car,
  Utensils,
  Receipt,
  PiggyBank,
  CheckCircle2,
} from 'lucide-react';
import {
  BudgetCategory,
  FinancialSummary,
  SavingsGoal,
  Transaction,
  NavigationRoute,
  TransactionType,
} from '../types/finance';
import { TransactionRow } from '../components/common/TransactionRow';
import { formatCurrency } from '../data/mockData';
import { UI_COPY, BUDGET_LABELS, getGreeting } from '../data/copy';

interface DashboardViewProps {
  summary: FinancialSummary;
  transactions: Transaction[];
  budgets: BudgetCategory[];
  goals: SavingsGoal[];
  onOpenAddModal: (type?: TransactionType) => void;
  onNavigate: (route: NavigationRoute) => void;
}

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'Housing & Residence': Home,
  'Groceries & Dining': ShoppingBag,
  'Technology & Cloud': Laptop,
  'Health & Wellness': HeartPulse,
  'Transit & Mobility': Car,
  'Culture & Equipment': Utensils,
};

export const DashboardView: React.FC<DashboardViewProps> = ({
  summary,
  transactions,
  budgets,
  goals,
  onOpenAddModal,
  onNavigate,
}) => {
  const { greeting, subtitle } = getGreeting('Nicolás');
  const recentTransactions = transactions.slice(0, 5);

  const totalAllocated = budgets.reduce((acc, b) => acc + b.allocated, 0);
  const totalSpent = budgets.reduce((acc, b) => acc + b.spent, 0);
  const budgetUtilization = Math.round((totalSpent / totalAllocated) * 100);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* 1. Saludo personal cálido */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--color-text)]">
            {greeting}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-1 font-normal">
            {subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Tus cuentas al día</span>
          </span>
        </div>
      </div>

      {/* 2. Segundo bloque — Protagonista: El saldo disponible */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-surface-subtle)] border border-[var(--color-border)] rounded-3xl p-6 sm:p-8 shadow-sm transition-all interactive-card">
        {/* Subtle decorative glow */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-semibold text-[var(--color-text-secondary)]">
              {UI_COPY.metrics.netLiquidity}
            </span>
            <span className="text-xs font-medium text-[var(--color-text-muted)] bg-[var(--color-surface-subtle)] px-2.5 py-1 rounded-full border border-[var(--color-border)]">
              {UI_COPY.metrics.availableToSpend}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[var(--color-text)] tabular-nums">
              {formatCurrency(summary.currentBalance)}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 tabular-nums">
              <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>+{summary.balanceChangePercentage}%</span>
            </span>
            <span className="text-[var(--color-text-secondary)]">
              {UI_COPY.metrics.vsLastMonth} · vas por buen camino con tus gastos
            </span>
          </div>
        </div>
      </div>

      {/* 3. Tercer bloque — Dos tarjetas medianas (Ingresos y Gastos) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Ingresos del mes */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-xs transition-all interactive-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[var(--color-text-secondary)]">
              {UI_COPY.metrics.monthlyInflow}
            </span>
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-text)] tabular-nums">
            +{formatCurrency(summary.monthlyIncome)}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs">
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              +{summary.incomeChangePercentage}%
            </span>
            <span className="text-[var(--color-text-secondary)] text-[11px]">
              {UI_COPY.metrics.vsTargetBase}
            </span>
          </div>
        </div>

        {/* En qué se fue el dinero */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-xs transition-all interactive-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[var(--color-text-secondary)]">
              {UI_COPY.metrics.monthlyOutflow}
            </span>
            <div className="w-8 h-8 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <ArrowDownRight className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-text)] tabular-nums">
            -{formatCurrency(summary.monthlyExpenses)}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs">
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              {summary.expensesChangePercentage}%
            </span>
            <span className="text-[var(--color-text-secondary)] text-[11px]">
              {UI_COPY.metrics.spendingContraction}
            </span>
          </div>
        </div>

        {/* Cuánto estás ahorrando */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-xs transition-all sm:col-span-2 lg:col-span-1 interactive-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[var(--color-text-secondary)]">
              {UI_COPY.metrics.savingsRate}
            </span>
            <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <PiggyBank className="w-4 h-4 stroke-[2]" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-text)] tabular-nums">
              {summary.savingsRate.toFixed(1)}%
            </span>
            <span className="text-xs font-medium text-[var(--color-text-muted)]">
              de tus ingresos
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs">
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              +4.7%
            </span>
            <span className="text-[var(--color-text-secondary)] text-[11px]">
              {UI_COPY.metrics.aboveTargetReserve}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Cuarto bloque — Accesos rápidos horizontales tipo píldora */}
      <div className="flex flex-wrap items-center gap-2.5 pt-1">
        <button
          onClick={() => onOpenAddModal('expense')}
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-500 hover:bg-teal-400 active:bg-teal-600 text-slate-950 text-xs font-bold rounded-full transition-all shadow-sm shadow-teal-500/10 interactive-pill"
        >
          <ArrowDownRight className="w-4 h-4 stroke-[2.5]" />
          <span>{UI_COPY.actions.addExpense}</span>
        </button>

        <button
          onClick={() => onOpenAddModal('income')}
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-[var(--color-text)] text-xs font-semibold rounded-full transition-all shadow-xs interactive-pill"
        >
          <ArrowUpRight className="w-4 h-4 text-emerald-500 stroke-[2.5]" />
          <span>{UI_COPY.actions.addIncome}</span>
        </button>

        <button
          onClick={() => onNavigate('transactions')}
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-[var(--color-text)] text-xs font-semibold rounded-full transition-all shadow-xs interactive-pill"
        >
          <Receipt className="w-4 h-4 text-[var(--color-accent)] stroke-[2]" />
          <span>Ver movimientos</span>
          <ArrowRight className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
        </button>
      </div>

      {/* 5 y 6. Grid: En qué gastaste (Categorías) & Tus Metas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 5. En qué gastaste */}
        <div className="lg:col-span-7 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-5 sm:p-6 space-y-5 shadow-xs transition-colors interactive-card">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold tracking-tight text-[var(--color-text)]">
                En qué gastaste
              </h2>
              <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                Usaste el <strong className="text-[var(--color-text)] font-semibold">{budgetUtilization}%</strong> de tu presupuesto este mes
              </p>
            </div>
            <button
              onClick={() => onNavigate('budgets')}
              className="text-xs font-semibold text-[var(--color-accent)] hover:underline flex items-center gap-1 transition-colors"
            >
              <span>{UI_COPY.actions.manageBudgets}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Segmented Progress Breakdown Bar with soft aesthetics */}
          <div className="w-full h-3 bg-[var(--color-surface-subtle)] rounded-full overflow-hidden flex gap-1 p-0.5 border border-[var(--color-border)]">
            {budgets.map((b) => {
              const widthPct = Math.max(4, (b.spent / totalSpent) * 100);
              return (
                <div
                  key={b.id}
                  style={{ width: `${widthPct}%`, backgroundColor: b.color }}
                  className="h-full rounded-full transition-all"
                  title={`${BUDGET_LABELS[b.name] || b.name}: ${formatCurrency(b.spent)}`}
                />
              );
            })}
          </div>

          {/* Category List */}
          <div className="space-y-3 pt-1">
            {budgets.map((cat) => {
              const percent = Math.min(100, Math.round((cat.spent / cat.allocated) * 100));
              const isOver = cat.spent > cat.allocated;
              const Icon = CATEGORY_ICONS[cat.name] || ShoppingBag;

              return (
                <div key={cat.id} className="space-y-1.5 p-2 rounded-xl hover:bg-[var(--color-surface-hover)] transition-colors">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                      >
                        <Icon className="w-3.5 h-3.5 stroke-[2]" />
                      </div>
                      <span className="font-semibold text-[var(--color-text)] truncate">
                        {BUDGET_LABELS[cat.name] || cat.name}
                      </span>
                    </div>
                    <div className="text-right shrink-0 tabular-nums">
                      <span className="font-bold text-[var(--color-text)]">{formatCurrency(cat.spent)}</span>
                      <span className="text-[var(--color-text-muted)] text-[11px] ml-1">/ {formatCurrency(cat.allocated)}</span>
                    </div>
                  </div>

                  {/* Progress track */}
                  <div className="w-full h-2 bg-[var(--color-surface-subtle)] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isOver ? 'bg-rose-500' : ''
                      }`}
                      style={{
                        width: `${percent}%`,
                        backgroundColor: isOver ? '#EF4444' : cat.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 6. Tus metas con termómetro / hitos visuales */}
        <div className="lg:col-span-5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-5 sm:p-6 flex flex-col justify-between space-y-5 shadow-xs transition-colors interactive-card">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold tracking-tight text-[var(--color-text)]">
                  Tus metas
                </h2>
                <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                  Ahorros para lo que sueñas
                </p>
              </div>
              <button
                onClick={() => onNavigate('goals')}
                className="text-xs font-semibold text-[var(--color-accent)] hover:underline flex items-center gap-1 transition-colors"
              >
                <span>{UI_COPY.actions.viewAll}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3.5">
              {goals.map((goal) => {
                const percent = Math.min(
                  100,
                  Math.round((goal.currentAmount / goal.targetAmount) * 100)
                );
                return (
                  <div
                    key={goal.id}
                    className="p-4 rounded-2xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] space-y-2.5 hover:border-[var(--color-accent-border)] transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: goal.color }}
                        />
                        <span className="font-bold text-[var(--color-text)]">
                          {goal.name}
                        </span>
                      </div>
                      <span className="font-bold text-[var(--color-accent)] tabular-nums">
                        {percent}%
                      </span>
                    </div>

                    {/* Progress track */}
                    <div className="w-full h-2.5 bg-[var(--color-border)] rounded-full overflow-hidden p-0.5">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${percent}%`,
                          backgroundColor: goal.color,
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs tabular-nums text-[var(--color-text-secondary)]">
                      <span>
                        Llevas <strong className="text-[var(--color-text)] font-semibold">{formatCurrency(goal.currentAmount)}</strong>
                      </span>
                      <span className="text-[var(--color-text-muted)]">Meta: {formatCurrency(goal.targetAmount)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick tip / Motivación */}
          <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-[var(--color-accent)] shrink-0 mt-0.5 stroke-[2]" />
            <div className="text-xs text-[var(--color-text)] leading-relaxed">
              <span className="font-bold text-[var(--color-accent)]">¡Buen ritmo!</span> Al ritmo de ahorro actual, completarás tu fondo de emergencia 18 días antes de lo planeado.
            </div>
          </div>
        </div>
      </div>

      {/* 7. Últimos movimientos (Máximo 5 con opción Ver todos) */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-5 sm:p-6 space-y-4 shadow-xs transition-colors interactive-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[var(--color-border)]">
          <div>
            <h2 className="text-base font-bold tracking-tight text-[var(--color-text)]">
              Últimos movimientos
            </h2>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
              Lo más reciente en tus cuentas
            </p>
          </div>
          <button
            onClick={() => onNavigate('transactions')}
            className="text-xs font-semibold text-[var(--color-accent)] hover:underline flex items-center gap-1 transition-colors self-start sm:self-auto"
          >
            <span>Ver todos ({transactions.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-[var(--color-border-subtle)]">
          {recentTransactions.map((tx) => (
            <TransactionRow key={tx.id} transaction={tx} />
          ))}
        </div>
      </div>
    </div>
  );
};
