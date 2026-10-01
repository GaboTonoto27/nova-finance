import React from 'react';
import { ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string;
  subValue?: string;
  change?: number;
  changeLabel?: string;
  trend?: 'up' | 'down' | 'neutral';
  accent?: 'teal' | 'emerald' | 'amber' | 'rose' | 'default';
  icon?: React.ComponentType<{ className?: string }>;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subValue,
  change,
  changeLabel = 'vs. mes anterior',
  trend,
  accent = 'default',
  icon: Icon,
}) => {
  const iconAccentStyles = {
    teal: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
    emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
    default: 'bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)]',
  };

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 sm:p-5 transition-all shadow-xs hover:border-[var(--color-accent-border)] interactive-card">
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <span className="text-xs font-semibold text-[var(--color-text-secondary)]">{label}</span>
        {Icon && (
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${iconAccentStyles[accent]}`}>
            <Icon className="w-4 h-4 stroke-[2]" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2 mb-1.5">
        <span className="text-2xl sm:text-[28px] font-bold tracking-tight text-[var(--color-text)] tabular-nums">
          {value}
        </span>
        {subValue && (
          <span className="text-xs font-medium text-[var(--color-text-muted)]">
            {subValue}
          </span>
        )}
      </div>

      {(change !== undefined || changeLabel) && (
        <div className="flex items-center gap-1.5 text-xs">
          {change !== undefined && (
            <span
              className={`flex items-center font-semibold tabular-nums ${
                change > 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : change < 0
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-[var(--color-text-secondary)]'
              }`}
            >
              {change > 0 ? (
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5 inline stroke-[2.5]" />
              ) : change < 0 ? (
                <ArrowDownRight className="w-3.5 h-3.5 mr-0.5 inline stroke-[2.5]" />
              ) : null}
              {change > 0 ? `+${change}%` : `${change}%`}
            </span>
          )}
          <span className="text-[var(--color-text-secondary)] text-[11px] font-normal">{changeLabel}</span>
        </div>
      )}
    </div>
  );
};
