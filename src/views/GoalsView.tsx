import React, { useState } from 'react';
import {
  Target,
  Plus,
  Calendar,
  Sparkles,
  TrendingUp,
  CheckCircle,
  PiggyBank,
} from 'lucide-react';
import { SavingsGoal } from '../types/finance';
import { formatCurrency } from '../data/mockData';
import { UI_COPY, GOAL_CATEGORY_LABELS } from '../data/copy';

interface GoalsViewProps {
  goals: SavingsGoal[];
}

export const GoalsView: React.FC<GoalsViewProps> = ({ goals: initialGoals }) => {
  const [goals, setGoals] = useState<SavingsGoal[]>(initialGoals);
  const [contributeGoalId, setContributeGoalId] = useState<string | null>(null);
  const [contributionAmount, setContributionAmount] = useState<string>('500000');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const totalTarget = goals.reduce((acc, g) => acc + g.targetAmount, 0);
  const totalAccumulated = goals.reduce((acc, g) => acc + g.currentAmount, 0);
  const totalRemaining = totalTarget - totalAccumulated;
  const overallProgress = Math.round((totalAccumulated / totalTarget) * 100);

  const handleContribute = (goalId: string) => {
    const val = parseFloat(contributionAmount);
    if (isNaN(val) || val <= 0) return;

    setGoals((prev) =>
      prev.map((g) =>
        g.id === goalId
          ? { ...g, currentAmount: Math.min(g.targetAmount, g.currentAmount + val) }
          : g
      )
    );

    const goal = goals.find((g) => g.id === goalId);
    setSuccessToast(`¡Abonaste ${formatCurrency(val)} a ${goal?.name}! Tu ahorro sigue creciendo.`);
    setContributeGoalId(null);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--color-text)]">
            Tus Metas de Ahorro
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-1 font-normal">
            Ahorros para lo que sueñas: viajes, emergencias y proyectos personales
          </p>
        </div>
      </div>

      {successToast && (
        <div className="flex items-center gap-2 p-3.5 bg-teal-950/40 border border-teal-800/60 rounded-2xl text-xs text-teal-600 dark:text-teal-300 animate-in fade-in">
          <CheckCircle className="w-4 h-4 shrink-0 text-teal-500 dark:text-teal-400" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Aggregate Capital Stats */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-5 sm:p-7 shadow-xs transition-colors interactive-card">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pb-6 border-b border-[var(--color-border)]">
          <div>
            <div className="text-xs text-[var(--color-text-secondary)] font-semibold mb-1">
              Meta total de ahorro
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-[var(--color-text)] tabular-nums">
              {formatCurrency(totalTarget)}
            </div>
            <div className="text-xs text-[var(--color-text-muted)] mt-1 font-normal">
              Repartido en {goals.length} metas activas
            </div>
          </div>

          <div>
            <div className="text-xs text-[var(--color-text-secondary)] font-semibold mb-1">
              Llevas ahorrado
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-[var(--color-accent)] tabular-nums">
              {formatCurrency(totalAccumulated)}
            </div>
            <div className="text-xs text-[var(--color-text-muted)] mt-1 font-normal">
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
            <div className="text-xs text-[var(--color-text-muted)] mt-1 font-normal">
              Abonando mes a mes estás cada vez más cerca
            </div>
          </div>
        </div>

        {/* Global Progress Track */}
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
      </div>

      {/* Goals Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {goals.map((goal) => {
          const percent = Math.min(
            100,
            Math.round((goal.currentAmount / goal.targetAmount) * 100)
          );
          const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
          const isContributing = contributeGoalId === goal.id;

          return (
            <div
              key={goal.id}
              className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-5 sm:p-6 flex flex-col justify-between space-y-5 hover:border-[var(--color-accent-border)] shadow-xs transition-all interactive-card"
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-semibold text-[var(--color-accent)]">
                      {GOAL_CATEGORY_LABELS[goal.category] || goal.category}
                    </span>
                    <h3 className="text-base font-bold text-[var(--color-text)] mt-0.5">
                      {goal.name}
                    </h3>
                  </div>
                  <span className="text-xl font-bold text-[var(--color-accent)] tabular-nums">
                    {percent}%
                  </span>
                </div>

                {/* Progress bar with soft rounded indicator */}
                <div className="w-full h-3 bg-[var(--color-surface-subtle)] rounded-full overflow-hidden border border-[var(--color-border)] p-0.5">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${percent}%`,
                      backgroundColor: goal.color,
                    }}
                  />
                </div>

                {/* Financial figures */}
                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div>
                    <span className="text-[var(--color-text-secondary)] block text-xs font-medium">Llevas ahorrado</span>
                    <span className="text-base font-bold text-[var(--color-text)] tabular-nums">
                      {formatCurrency(goal.currentAmount)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[var(--color-text-secondary)] block text-xs font-medium">Tu meta</span>
                    <span className="text-base font-bold text-[var(--color-text-secondary)] tabular-nums">
                      {formatCurrency(goal.targetAmount)}
                    </span>
                  </div>
                </div>

                {/* Remaining gap & Target Date */}
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
                      <span>Plazo estimado:</span>
                    </span>
                    <span className="text-[var(--color-text)] font-medium">
                      {goal.targetDate}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action / Quick contribution mock */}
              <div className="pt-3 border-t border-[var(--color-border)]">
                {isContributing ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[var(--color-text-secondary)]">$</span>
                      <input
                        type="number"
                        min="1"
                        value={contributionAmount}
                        onChange={(e) => setContributionAmount(e.target.value)}
                        className="w-full px-3 py-1.5 bg-[var(--color-surface-subtle)] border border-[var(--color-accent)] rounded-xl text-xs font-bold text-[var(--color-text)] tabular-nums focus:outline-none"
                        placeholder={UI_COPY.forms.amountSimple}
                        autoFocus
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleContribute(goal.id)}
                        className="flex-1 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold rounded-full transition-all interactive-pill"
                      >
                        {UI_COPY.actions.confirmDeposit}
                      </button>
                      <button
                        onClick={() => setContributeGoalId(null)}
                        className="px-3 py-2 text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
                      >
                        {UI_COPY.actions.cancel}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setContributeGoalId(goal.id)}
                    className="w-full py-2.5 bg-[var(--color-surface-subtle)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text)] text-xs font-bold rounded-full border border-[var(--color-border)] transition-all flex items-center justify-center gap-1.5 shadow-xs interactive-pill"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>{UI_COPY.actions.simulateContribution}</span>
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
