import React from 'react';
import {
  Sparkles,
  TrendingUp,
  AlertCircle,
  Lightbulb,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { FinancialInsight } from '../types/finance';
import { FINANCIAL_INSIGHTS, formatCurrency } from '../data/mockData';
import { UI_COPY } from '../data/copy';

const CATEGORY_TRANSLATIONS: Record<string, string> = {
  savings: 'Ahorro',
  recurring: 'Suscripciones y fijos',
  budget: 'Presupuestos',
  spending: 'Salidas y gustos',
};

export const InsightsView: React.FC = () => {
  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--color-text)]">
              Consejos para ti
            </h1>
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-300 border border-teal-500/20">
              <Sparkles className="w-3.5 h-3.5 text-[var(--color-accent)] stroke-[2]" />
              <span>Personalizado</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-1 font-normal">
            Recomendaciones inteligentes y alertas de hábitos para cuidar tu bolsillo
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-[var(--color-text-secondary)] bg-[var(--color-surface)] px-3 py-1.5 rounded-full border border-[var(--color-border)]">
          <Calendar className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
          <span>{UI_COPY.time.updatedToday}</span>
        </div>
      </div>

      {/* Summary Banner */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-accent-border)] rounded-3xl p-6 sm:p-7 bg-gradient-to-r from-teal-500/10 via-[var(--color-surface-subtle)] to-[var(--color-surface)] shadow-xs transition-all interactive-card">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <h2 className="text-base font-bold text-[var(--color-accent)] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[var(--color-accent)] stroke-[2]" />
              <span>¡Tu dinero va por excelente camino!</span>
            </h2>
            <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] max-w-2xl leading-relaxed font-normal">
              Este mes estás ahorrando más del 50% de lo que te entra. Gastaste menos en compras impulsivas y te quedaron {formatCurrency(190000)} extra listos para irse a tus metas.
            </p>
          </div>
          <div className="shrink-0 text-left sm:text-right">
            <div className="text-xs text-[var(--color-text-muted)] font-medium">Si sigues así este año:</div>
            <div className="text-2xl font-bold text-[var(--color-accent)] tabular-nums">
              +{formatCurrency(49404000)}
            </div>
          </div>
        </div>
      </div>

      {/* Insights List */}
      <div className="space-y-4">
        {FINANCIAL_INSIGHTS.map((insight) => {
          const isPositive = insight.type === 'positive';
          const isAttention = insight.type === 'attention';

          return (
            <div
              key={insight.id}
              className={`bg-[var(--color-surface)] border rounded-3xl p-5 sm:p-6 transition-all space-y-3 shadow-xs interactive-card ${
                isPositive
                  ? 'border-emerald-500/30 hover:border-emerald-500/50'
                  : isAttention
                  ? 'border-amber-500/30 hover:border-amber-500/50'
                  : 'border-[var(--color-border)] hover:border-[var(--color-accent-border)]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${
                      isPositive
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                        : isAttention
                        ? 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400'
                        : 'bg-[var(--color-surface-subtle)] border-[var(--color-border)] text-[var(--color-accent)]'
                    }`}
                  >
                    {isPositive ? (
                      <TrendingUp className="w-5 h-5 stroke-[2]" />
                    ) : isAttention ? (
                      <AlertCircle className="w-5 h-5 stroke-[2]" />
                    ) : (
                      <Lightbulb className="w-5 h-5 stroke-[2]" />
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-[var(--color-text)]">
                      {insight.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)] mt-0.5">
                      <span className="font-semibold text-[var(--color-accent)]">
                        {CATEGORY_TRANSLATIONS[insight.category] || insight.category}
                      </span>
                      <span aria-hidden="true" className="text-[var(--color-text-muted)]">·</span>
                      <span>{insight.date}</span>
                    </div>
                  </div>
                </div>

                {insight.impactAmount !== undefined && (
                  <div className="text-right shrink-0 text-xs tabular-nums">
                    <span className="text-xs text-[var(--color-text-muted)] block font-medium">Impacto estimado</span>
                    <strong
                      className={`text-sm sm:text-base font-bold ${
                        insight.impactAmount > 0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : insight.impactAmount < 0
                          ? 'text-[var(--color-accent)]'
                          : 'text-[var(--color-text)]'
                      }`}
                    >
                      {insight.impactAmount > 0 ? '+' : ''}
                      {formatCurrency(insight.impactAmount)}
                    </strong>
                  </div>
                )}
              </div>

              <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed pl-13 font-normal">
                {insight.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
