import React from 'react';
import {
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  Home,
  Laptop,
  HeartPulse,
  Car,
  Utensils,
  Receipt,
  PiggyBank,
  CheckCircle2,
  BookOpen,
  Repeat,
  CreditCard,
  MoreHorizontal,
  Shield,
  TrendingUp,
  Plane,
  ShoppingCart,
  GraduationCap,
  Heart,
  Star,
  Target,
} from 'lucide-react';
import {
  FinancialSummary,
  Transaction,
  NavigationRoute,
  TransactionType,
  Presupuesto,
  MetaAhorro,
} from '../types/finance';
import { TransactionRow } from '../components/common/TransactionRow';
import { formatCurrency } from '../data/format';
import {
  UI_COPY,
  CATEGORY_LABELS,
  getTimeGreeting,
  getFinancialMood,
} from '../data/copy';
import { useAuth } from '../context/AuthContext';

interface DashboardViewProps {
  summary: FinancialSummary;
  transactions: Transaction[];
  presupuestos: Presupuesto[];
  metas: MetaAhorro[];
  cargandoPresupuestos: boolean;
  cargandoMetas: boolean;
  onOpenAddModal: (type?: TransactionType) => void;
  onNavigate: (route: NavigationRoute) => void;
}

const PRESUPUESTO_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
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

const MOOD_STYLES: Record<
  'excellent' | 'good' | 'warning' | 'alert' | 'neutral',
  string
> = {
  excellent: 'text-emerald-600 dark:text-emerald-400',
  good: 'text-teal-600 dark:text-teal-400',
  warning: 'text-amber-600 dark:text-amber-400',
  alert: 'text-rose-600 dark:text-rose-400',
  neutral: 'text-[var(--color-text-secondary)]',
};

export const DashboardView: React.FC<DashboardViewProps> = ({
  summary,
  transactions,
  presupuestos,
  metas,
  cargandoPresupuestos,
  cargandoMetas,
  onOpenAddModal,
  onNavigate,
}) => {
  const { perfil, usuario } = useAuth();
  const primerNombre =
    perfil?.nombre?.trim().split(/\s+/)[0] ||
    usuario?.displayName?.trim().split(/\s+/)[0] ||
    'Usuario';

  const greetingBase = getTimeGreeting();
  const greeting = `${greetingBase}, ${primerNombre}`;

  const mood = getFinancialMood(
    summary.savingsRate,
    summary.monthlyIncome,
    summary.monthlyExpenses
  );
  const moodClass = MOOD_STYLES[mood.tone];

  const recentTransactions = transactions.slice(0, 5);

  const totalAllocated = presupuestos.reduce((acc, p) => acc + p.limite, 0);
  const totalSpent = presupuestos.reduce((acc, p) => acc + p.gastado, 0);
  const budgetUtilization =
    totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0;

  const presupuestosTop = presupuestos
    .slice()
    .sort((a, b) => {
      const aPct = a.limite > 0 ? a.gastado / a.limite : 0;
      const bPct = b.limite > 0 ? b.gastado / b.limite : 0;
      return bPct - aPct;
    })
    .slice(0, 5);

  const metasTop = metas.slice(0, 3);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* 1. Saludo + mensaje motivador */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--color-text)]">
            {greeting}
          </h1>
          <p className={`text-xs sm:text-sm mt-1 font-medium ${moodClass}`}>
            {mood.message}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Tus cuentas al dia</span>
          </span>
        </div>
      </div>

      {/* 2. Saldo disponible */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-surface-subtle)] border border-[var(--color-border)] rounded-3xl p-6 sm:p-8 shadow-sm transition-all interactive-card">
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
        </div>
      </div>

      {/* 3. Ingresos / Gastos / Ahorro */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
            <span className="text-[var(--color-text-secondary)] text-[11px]">
              Total ingresado este mes
            </span>
          </div>
        </div>

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
            <span className="text-[var(--color-text-secondary)] text-[11px]">
              Total gastado este mes
            </span>
          </div>
        </div>

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
            <span className="text-[var(--color-text-secondary)] text-[11px]">
              Tasa de ahorro del mes
            </span>
          </div>
        </div>
      </div>

      {/* 4. Accesos rapidos */}
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

      {/* 5 y 6. Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* En que gastaste */}
        <div className="lg:col-span-7 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-5 sm:p-6 space-y-5 shadow-xs transition-colors interactive-card">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold tracking-tight text-[var(--color-text)]">
                En que gastaste
              </h2>
              <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                {totalAllocated > 0 ? (
                  <>
                    Usaste el{' '}
                    <strong className="text-[var(--color-text)] font-semibold">
                      {budgetUtilization}%
                    </strong>{' '}
                    de tu presupuesto este mes
                  </>
                ) : (
                  'Aun no definiste limites de presupuesto'
                )}
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

          {cargandoPresupuestos ? (
            <div className="animate-pulse space-y-3">
              <div className="h-3 bg-[var(--color-surface-subtle)] rounded" />
              <div className="h-12 bg-[var(--color-surface-subtle)] rounded" />
            </div>
          ) : presupuestos.length === 0 ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-12 h-12 rounded-full bg-teal-500/10 flex items-center justify-center mx-auto">
                <ShoppingBag className="w-6 h-6 text-teal-500" />
              </div>
              <p className="text-sm text-[var(--color-text-secondary)]">
                Crea tu primer presupuesto para ver el desglose.
              </p>
              <button
                onClick={() => onNavigate('budgets')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold rounded-full transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Crear presupuesto</span>
              </button>
            </div>
          ) : (
            <>
              {totalSpent > 0 && (
                <div className="w-full h-3 bg-[var(--color-surface-subtle)] rounded-full overflow-hidden flex gap-1 p-0.5 border border-[var(--color-border)]">
                  {presupuestos.map((p) => {
                    const widthPct = Math.max(4, (p.gastado / totalSpent) * 100);
                    return (
                      <div
                        key={p.id}
                        style={{ width: `${widthPct}%`, backgroundColor: p.color }}
                        className="h-full rounded-full transition-all"
                        title={`${CATEGORY_LABELS[p.categoria] || p.categoria}: ${formatCurrency(p.gastado)}`}
                      />
                    );
                  })}
                </div>
              )}

              <div className="space-y-3 pt-1">
                {presupuestosTop.map((cat) => {
                  const percent =
                    cat.limite > 0
                      ? Math.min(100, Math.round((cat.gastado / cat.limite) * 100))
                      : 0;
                  const isOver = cat.limite > 0 && cat.gastado > cat.limite;
                  const Icon = PRESUPUESTO_ICONS[cat.iconName] || ShoppingBag;

                  return (
                    <div
                      key={cat.id}
                      className="space-y-1.5 p-2 rounded-xl hover:bg-[var(--color-surface-hover)] transition-colors"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                            style={{
                              backgroundColor: `${cat.color}20`,
                              color: cat.color,
                            }}
                          >
                            <Icon className="w-3.5 h-3.5 stroke-[2]" />
                          </div>
                          <span className="font-semibold text-[var(--color-text)] truncate">
                            {CATEGORY_LABELS[cat.categoria] || cat.categoria}
                          </span>
                        </div>
                        <div className="text-right shrink-0 tabular-nums">
                          <span className="font-bold text-[var(--color-text)]">
                            {formatCurrency(cat.gastado)}
                          </span>
                          {cat.limite > 0 && (
                            <span className="text-[var(--color-text-muted)] text-[11px] ml-1">
                              / {formatCurrency(cat.limite)}
                            </span>
                          )}
                        </div>
                      </div>

                      {cat.limite > 0 && (
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
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Tus metas */}
        <div className="lg:col-span-5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-5 sm:p-6 flex flex-col justify-between space-y-5 shadow-xs transition-colors interactive-card">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold tracking-tight text-[var(--color-text)]">
                  Tus metas
                </h2>
                <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                  Ahorros para lo que suenas
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

            {cargandoMetas ? (
              <div className="animate-pulse space-y-3">
                <div className="h-20 bg-[var(--color-surface-subtle)] rounded-2xl" />
                <div className="h-20 bg-[var(--color-surface-subtle)] rounded-2xl" />
              </div>
            ) : metas.length === 0 ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-12 h-12 rounded-full bg-teal-500/10 flex items-center justify-center mx-auto">
                  <Target className="w-6 h-6 text-teal-500" />
                </div>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Aun no tienes metas. Crea la primera!
                </p>
                <button
                  onClick={() => onNavigate('goals')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold rounded-full transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Crear meta</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3.5">
                {metasTop.map((meta) => {
                  const percent = Math.min(
                    100,
                    Math.round((meta.montoActual / meta.montoObjetivo) * 100)
                  );
                  const Icon = META_ICONS[meta.iconName] || Target;
                  return (
                    <div
                      key={meta.id}
                      className="p-4 rounded-2xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] space-y-2.5 hover:border-[var(--color-accent-border)] transition-colors"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                            style={{
                              backgroundColor: `${meta.color}20`,
                              color: meta.color,
                            }}
                          >
                            <Icon className="w-3 h-3 stroke-[2]" />
                          </div>
                          <span className="font-bold text-[var(--color-text)] truncate">
                            {meta.nombre}
                          </span>
                        </div>
                        <span className="font-bold text-[var(--color-accent)] tabular-nums shrink-0">
                          {percent}%
                        </span>
                      </div>

                      <div className="w-full h-2.5 bg-[var(--color-border)] rounded-full overflow-hidden p-0.5">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${percent}%`,
                            backgroundColor: meta.color,
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-xs tabular-nums text-[var(--color-text-secondary)]">
                        <span>
                          Llevas{' '}
                          <strong className="text-[var(--color-text)] font-semibold">
                            {formatCurrency(meta.montoActual)}
                          </strong>
                        </span>
                        <span className="text-[var(--color-text-muted)]">
                          Meta: {formatCurrency(meta.montoObjetivo)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-[var(--color-accent)] shrink-0 mt-0.5 stroke-[2]" />
            <div className="text-xs text-[var(--color-text)] leading-relaxed">
              <span className="font-bold text-[var(--color-accent)]">Buen ritmo.</span>{' '}
              Sigue registrando tus movimientos para ver proyecciones personalizadas.
            </div>
          </div>
        </div>
      </div>

      {/* 7. Ultimos movimientos */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-5 sm:p-6 space-y-4 shadow-xs transition-colors interactive-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[var(--color-border)]">
          <div>
            <h2 className="text-base font-bold tracking-tight text-[var(--color-text)]">
              Ultimos movimientos
            </h2>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
              Lo mas reciente en tus cuentas
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

        {transactions.length === 0 ? (
          <div className="text-center py-8 space-y-3">
            <div className="w-14 h-14 rounded-full bg-[var(--color-surface-subtle)] flex items-center justify-center mx-auto">
              <Receipt className="w-6 h-6 text-[var(--color-text-muted)]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--color-text)]">
                Aun no tienes movimientos
              </p>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                Empieza registrando tu primer gasto o ingreso.
              </p>
            </div>
            <button
              onClick={() => onOpenAddModal('expense')}
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold rounded-full transition-all shadow-sm shadow-teal-500/10 interactive-pill"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Registrar mi primer movimiento</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-border-subtle)]">
            {recentTransactions.map((tx) => (
              <TransactionRow key={tx.id} transaction={tx} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};