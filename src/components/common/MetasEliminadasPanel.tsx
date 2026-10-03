import React, { useState } from 'react';
import { RotateCcw, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { MetaAhorro } from '../../types/finance';
import { diasRestantesRecuperacionMeta } from '../../firebase/metas';

// ============================================================================
// NOVA v0.4.3 - Panel de metas eliminadas recientemente
// ============================================================================

interface MetasEliminadasPanelProps {
  metasRecuperables: MetaAhorro[];
  onRestaurar: (meta: MetaAhorro) => Promise<void>;
}

export const MetasEliminadasPanel: React.FC<MetasEliminadasPanelProps> = ({
  metasRecuperables,
  onRestaurar,
}) => {
  const [expandido, setExpandido] = useState(false);
  const [restaurandoId, setRestaurandoId] = useState<string | null>(null);

  if (metasRecuperables.length === 0) return null;

  const handleRestaurar = async (meta: MetaAhorro) => {
    if (!meta.id) return;
    try {
      setRestaurandoId(meta.id);
      await onRestaurar(meta);
    } catch (err) {
      console.error('Error al restaurar meta:', err);
    } finally {
      setRestaurandoId(null);
    }
  };

  return (
    <div className="bg-amber-500/5 border border-amber-500/30 rounded-3xl overflow-hidden shadow-xs">
      <button
        type="button"
        onClick={() => setExpandido(!expandido)}
        className="w-full flex items-center justify-between gap-3 p-4 sm:p-5 hover:bg-amber-500/5 transition-colors text-left"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 stroke-[2]" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold text-[var(--color-text)]">
              Metas eliminadas recientemente
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5 truncate">
              {metasRecuperables.length === 1
                ? 'Tenes 1 meta que podes recuperar'
                : `Tenes ${metasRecuperables.length} metas que podes recuperar`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300">
            {metasRecuperables.length}
          </span>
          {expandido ? (
            <ChevronUp className="w-4 h-4 text-[var(--color-text-muted)]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[var(--color-text-muted)]" />
          )}
        </div>
      </button>

      {expandido && (
        <div className="border-t border-amber-500/20 p-4 sm:p-5 space-y-3 bg-[var(--color-surface)]/50">
          <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
            Las metas se pueden recuperar durante los 7 dias siguientes a su
            eliminacion.
          </p>

          {metasRecuperables.map((meta) => {
            const dias = diasRestantesRecuperacionMeta(meta);
            const restaurando = restaurandoId === meta.id;

            return (
              <div
                key={meta.id}
                className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)]"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${meta.color}20`, color: meta.color }}
                  >
                    <span className="text-sm font-bold">
                      {meta.nombre.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-[var(--color-text)] truncate">
                      {meta.nombre}
                    </p>
                    <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {dias === 0
                        ? 'Ultimo dia para recuperar'
                        : dias === 1
                        ? 'Podes recuperarla por 1 dia mas'
                        : `Podes recuperarla por ${dias} dias mas`}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRestaurar(meta)}
                  disabled={restaurando}
                  className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 bg-teal-500 hover:bg-teal-400 active:bg-teal-600 disabled:opacity-50 text-slate-950 text-xs font-bold rounded-full transition-colors interactive-pill"
                >
                  <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>{restaurando ? 'Restaurando...' : 'Recuperar'}</span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};