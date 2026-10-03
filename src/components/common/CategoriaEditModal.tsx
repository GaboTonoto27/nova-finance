import React, { useState, useEffect } from 'react';
import { X, Check, Sparkles } from 'lucide-react';
import { Categoria } from '../../types/finance';

interface CategoriaEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    nombre: string;
    color: string;
    iconName: string;
  }) => Promise<void>;
  categoriaEditar?: Categoria | null;
  tipoNueva: 'gasto' | 'ingreso';
}

const COLORES_DISPONIBLES = [
  { name: 'Teal', value: '#0D9488' },
  { name: 'Azul', value: '#3B82F6' },
  { name: 'Ambar', value: '#F59E0B' },
  { name: 'Purpura', value: '#8B5CF6' },
  { name: 'Esmeralda', value: '#10B981' },
  { name: 'Rosa', value: '#EC4899' },
  { name: 'Indigo', value: '#6366F1' },
  { name: 'Rojo', value: '#EF4444' },
  { name: 'Gris', value: '#64748B' },
];

const ICONOS_DISPONIBLES: { value: string; label: string }[] = [
  { value: 'Home', label: 'Casa' },
  { value: 'ShoppingBag', label: 'Bolsa' },
  { value: 'Car', label: 'Auto' },
  { value: 'Laptop', label: 'Laptop' },
  { value: 'HeartPulse', label: 'Salud' },
  { value: 'Utensils', label: 'Comida' },
  { value: 'BookOpen', label: 'Libro' },
  { value: 'Repeat', label: 'Suscripcion' },
  { value: 'CreditCard', label: 'Tarjeta' },
  { value: 'MoreHorizontal', label: 'Otro' },
  { value: 'Briefcase', label: 'Maletin' },
  { value: 'TrendingUp', label: 'Grafico' },
  { value: 'Gift', label: 'Regalo' },
  { value: 'HandCoins', label: 'Monedas' },
  { value: 'CircleDollarSign', label: 'Dolar' },
];

export const CategoriaEditModal: React.FC<CategoriaEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  categoriaEditar,
  tipoNueva,
}) => {
  const modoEdicion = Boolean(categoriaEditar);

  const [nombre, setNombre] = useState('');
  const [color, setColor] = useState('#0D9488');
  const [iconName, setIconName] = useState('MoreHorizontal');
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (categoriaEditar) {
        setNombre(categoriaEditar.nombre);
        setColor(categoriaEditar.color);
        setIconName(categoriaEditar.iconName);
      } else {
        setNombre('');
        setColor('#0D9488');
        setIconName(tipoNueva === 'gasto' ? 'ShoppingBag' : 'Briefcase');
      }
      setError(null);
    }
  }, [isOpen, categoriaEditar, tipoNueva]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const nombreLimpio = nombre.trim();
    if (!nombreLimpio || nombreLimpio.length < 2) {
      setError('El nombre debe tener al menos 2 caracteres.');
      return;
    }

    try {
      setGuardando(true);
      await onSave({
        nombre: nombreLimpio,
        color,
        iconName,
      });
      onClose();
    } catch (err) {
      console.error('Error al guardar categoria:', err);
      setError('No se pudo guardar. Intenta de nuevo.');
      setGuardando(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-md bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl shadow-2xl p-6 sm:p-7 text-[var(--color-text)] animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-[var(--color-border)]">
          <div>
            <h2 className="text-lg font-bold text-[var(--color-text)]">
              {modoEdicion ? 'Editar categoria' : `Nueva categoria de ${tipoNueva}`}
            </h2>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
              {modoEdicion
                ? 'Cambia el nombre, color o icono'
                : 'Escribi como quieras. La app la va a guardar.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text)] rounded-full hover:bg-[var(--color-surface-hover)] transition-colors"
            type="button"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--color-text)] mb-1">
              Nombre de la categoria *
            </label>
            <input
              type="text"
              placeholder={
                tipoNueva === 'gasto'
                  ? 'ej. Mascotas, Regalos, Viajes'
                  : 'ej. Alquiler, Bonos, Devoluciones'
              }
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className={`w-full px-3 py-2.5 bg-[var(--color-surface-subtle)] border rounded-xl text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 ${
                error
                  ? 'border-rose-500 focus:ring-rose-500/20'
                  : 'border-[var(--color-border)] focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)]'
              }`}
              autoFocus
            />
            <p className="text-xs text-[var(--color-text-muted)] mt-1.5 flex items-start gap-1.5">
              <Sparkles className="w-3 h-3 shrink-0 mt-0.5 text-teal-500" />
              <span>
                Va a aparecer automaticamente en los modales de presupuestos y
                transacciones.
              </span>
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-text)] mb-2">
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {COLORES_DISPONIBLES.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={`w-8 h-8 rounded-full transition-all ${
                    color === c.value
                      ? 'ring-2 ring-offset-2 ring-offset-[var(--color-surface)] ring-[var(--color-accent)] scale-110'
                      : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c.value }}
                  aria-label={`Color ${c.name}`}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-text)] mb-1">
              Icono
            </label>
            <select
              value={iconName}
              onChange={(e) => setIconName(e.target.value)}
              className="w-full px-3 py-2.5 bg-[var(--color-surface-subtle)] border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            >
              {ICONOS_DISPONIBLES.map((i) => (
                <option key={i.value} value={i.value}>
                  {i.label}
                </option>
              ))}
            </select>
          </div>

          {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--color-border)]">
            <button
              type="button"
              onClick={onClose}
              disabled={guardando}
              className="px-4 py-2 text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-teal-500 hover:bg-teal-400 active:bg-teal-600 disabled:opacity-50 text-slate-950 text-xs font-bold rounded-full transition-colors shadow-sm shadow-teal-500/10 interactive-pill"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>
                {guardando
                  ? 'Guardando...'
                  : modoEdicion
                  ? 'Guardar cambios'
                  : 'Crear categoria'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};