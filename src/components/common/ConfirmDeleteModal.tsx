import React, { useState } from 'react';
import { AlertTriangle, X, Trash2 } from 'lucide-react';

// ============================================================================
// NOVA v0.4.2 - Modal de confirmacion para eliminar
// ============================================================================
// Se usa antes de eliminar categorias, presupuestos o metas.
// Muestra una advertencia grande y explica las consecuencias.

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  titulo: string;
  itemNombre: string;
  consecuencias: string[];
  mensajeRecuperacion?: string;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  titulo,
  itemNombre,
  consecuencias,
  mensajeRecuperacion,
}) => {
  const [eliminando, setEliminando] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    try {
      setEliminando(true);
      await onConfirm();
      onClose();
    } catch (err) {
      console.error('Error al eliminar:', err);
      setEliminando(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-delete-title"
    >
      <div className="relative w-full max-w-lg bg-[var(--color-surface)] border-2 border-rose-500/40 rounded-3xl shadow-2xl p-6 sm:p-8 text-[var(--color-text)] animate-in zoom-in-95 duration-200">
        {/* Boton cerrar */}
        <button
          onClick={onClose}
          disabled={eliminando}
          className="absolute top-4 right-4 p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] rounded-full hover:bg-[var(--color-surface-hover)] transition-colors"
          type="button"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icono de advertencia GRANDE */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-20 h-20 rounded-full bg-rose-500/15 border-2 border-rose-500/40 flex items-center justify-center mb-4">
            <AlertTriangle
              className="w-10 h-10 text-rose-500 stroke-[2]"
              aria-hidden="true"
            />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-[10px] font-bold uppercase tracking-wider mb-3">
            <AlertTriangle className="w-3 h-3" />
            <span>Advertencia</span>
          </div>

          <h2
            id="confirm-delete-title"
            className="text-xl sm:text-2xl font-extrabold tracking-tight text-[var(--color-text)]"
          >
            {titulo}
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)] mt-2">
            Vas a eliminar:{' '}
            <strong className="text-[var(--color-text)] font-semibold">
              "{itemNombre}"
            </strong>
          </p>
        </div>

        {/* Consecuencias */}
        <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-4 mb-5">
          <p className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-2.5">
            Esto va a afectar:
          </p>
          <ul className="space-y-2">
            {consecuencias.map((c, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 text-xs text-[var(--color-text-secondary)] leading-relaxed"
              >
                <span className="shrink-0 w-1 h-1 rounded-full bg-rose-500 mt-1.5" />
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Mensaje de recuperacion */}
        {mensajeRecuperacion && (
          <div className="bg-teal-500/5 border border-teal-500/20 rounded-2xl p-4 mb-5">
            <p className="text-xs text-teal-700 dark:text-teal-300 leading-relaxed">
              <strong className="font-bold">💡 Tranquilo:</strong> {mensajeRecuperacion}
            </p>
          </div>
        )}

        {/* Acciones */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={eliminando}
            className="px-5 py-2.5 text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] rounded-full transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={eliminando}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-rose-500 hover:bg-rose-400 active:bg-rose-600 disabled:opacity-50 text-white text-xs font-bold rounded-full transition-colors shadow-sm shadow-rose-500/20 interactive-pill"
          >
            <Trash2 className="w-4 h-4 stroke-[2.5]" />
            <span>{eliminando ? 'Eliminando...' : 'Si, eliminar'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};