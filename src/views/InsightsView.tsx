import React from 'react';
import { Sparkles, Calendar, Lightbulb } from 'lucide-react';
import { UI_COPY } from '../data/copy';

// ============================================================================
// TODO Fase 06: generar insights con Gemini basado en datos reales
// ============================================================================
interface FinancialInsight {
  id: string;
  title: string;
  description: string;
  category: string;
  type: 'positive' | 'attention' | 'neutral';
  impactAmount?: number;
  date: string;
}

const FINANCIAL_INSIGHTS: FinancialInsight[] = [];

export const InsightsView: React.FC = () => {
  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--color-text)]">
              Consejos para ti
            </h1>
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-300 border border-teal-500/20">
              <Sparkles className="w-3.5 h-3.5 text-[var(--color-accent)] stroke-[2]" />
              <span>Proximamente</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-1">
            Recomendaciones inteligentes y alertas de habitos para cuidar tu bolsillo
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-[var(--color-text-secondary)] bg-[var(--color-surface)] px-3 py-1.5 rounded-full border border-[var(--color-border)]">
          <Calendar className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
          <span>{UI_COPY.time.updatedToday}</span>
        </div>
      </div>

      {/* Estado vacio / Proximamente */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-8 sm:p-12 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-teal-500/10 flex items-center justify-center mx-auto">
          <Lightbulb className="w-8 h-8 text-teal-500" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-[var(--color-text)]">
            Consejos personalizados con IA
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1 max-w-lg mx-auto leading-relaxed">
            Estamos trabajando en un asistente de inteligencia financiera que va a
            analizar tus movimientos y darte recomendaciones personalizadas.
            Vuelve pronto para ver tus consejos.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 text-xs font-semibold border border-teal-500/20">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Disponible en la Fase 06</span>
        </div>
      </div>

      {/* Lista de insights (vacia por ahora) */}
      {FINANCIAL_INSIGHTS.length > 0 && (
        <div className="space-y-4">
          {FINANCIAL_INSIGHTS.map((insight) => (
            <div
              key={insight.id}
              className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-5 sm:p-6 transition-all space-y-3 shadow-xs interactive-card"
            >
              <h3 className="text-sm sm:text-base font-bold text-[var(--color-text)]">
                {insight.title}
              </h3>
              <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed">
                {insight.description}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};