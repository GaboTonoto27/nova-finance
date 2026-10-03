import React, { useState } from 'react';
import { RotateCcw, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { Categoria } from '../../types/finance';
import { diasRestantesRecuperacion } from '../../firebase/categorias';

// ============================================================================
// NOVA v0.4.2 - Panel de categorias eliminadas recientemente
// ============================================================================
// Muestra las categorias soft-deleted que aun pueden recuperarse (7 dias).

interface CategoriasEliminadasPanelProps {
  categoriasRecuperables: Categoria[];
  onRestaurar: (categoria: Categoria) => Promise<void>;
}

export const CategoriasEliminadasPanel: React.FC<CategoriasEliminadasPanelProps> = ({
  categoriasRecuperables,
  onRestaurar,
}) => {
  const [expandido, setExpandido] = useState(false);
  const [restaurandoId, setRestaurandoId] = useState<string | null>(null);

  if (categoriasRecuperables.length === 0) return null;

  const handleRestaurar = async (cat: Categoria) => {
    if (!cat.id) return;
    try {
      setRestaurandoId(cat.id);
      await onRestaurar(cat);
    } catch (err) {
      console.error('Error al restaurar categoria:', err);
    } finally {
      setRestaurandoId(null);
    }
  };

  return (
    <div className="bg-amber-500/5 border border-amber-500/30 rounded-3xl overflow-hidden shadow-xs">
      {/* Header */}
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
              Categorias eliminadas recientemente
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5 truncate">
              {categoriasRecuperables.length === 1
                ? 'Tenes 1 categoria que podes recuperar'
                : `Tenes ${categoriasRecuperables.length} categorias que podes recuperar`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300">
            {categoriasRecuperables.length}
          </span>
          {expandido ? (
            <ChevronUp className="w-4 h-4 text-[var(--color-text-muted)]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[var(--color-text-muted)]" />
          )}
        </div>
      </button>

      {/* Lista expandida */}
      {expandido && (
        <div className="border-t border-amber-500/20 p-4 sm:p-5 space-y-3 bg-[var(--color-surface)]/50">
          <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
            Las categorias se pueden recuperar durante los 7 dias siguientes
            a su eliminacion. Despues de ese plazo, se ocultan definitivamente.
          </p>

          {categoriasRecuperables.map((cat) => {
            const dias = diasRestantesRecuperacion(cat);
            const restaurando = restaurandoId === cat.id;

            return (
              <div
                key={cat.id}
                className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)]"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                  >
                    <span className="text-sm font-bold">
                      {cat.nombre.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-[var(--color-text)] truncate">
                      {cat.nombre}
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
                  onClick={() => handleRestaurar(cat)}
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