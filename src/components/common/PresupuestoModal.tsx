import React, { useState, useEffect } from 'react';
import { X, Check, Plus, Sparkles } from 'lucide-react';
import { Presupuesto } from '../../types/finance';

interface CategoriaOption {
  value: string;
  label: string;
  color?: string;
  iconName?: string;
}

interface PresupuestoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    categoria: string;
    categoriaCustom?: string;
    limite: number;
    color: string;
    iconName: string;
  }) => Promise<void>;
  presupuestoEditar?: Presupuesto | null;
  categoriasYaUsadas: string[];
  categoriasGasto: CategoriaOption[];
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
];

export const PresupuestoModal: React.FC<PresupuestoModalProps> = ({
  isOpen,
  onClose,
  onSave,
  presupuestoEditar,
  categoriasYaUsadas,
  categoriasGasto,
}) => {
  const modoEdicion = Boolean(presupuestoEditar);

  const [categoria, setCategoria] = useState<string>('');
  const [modoCustom, setModoCustom] = useState(false);
  const [categoriaCustom, setCategoriaCustom] = useState('');
  const [limite, setLimite] = useState('');
  const [color, setColor] = useState('#0D9488');
  const [iconName, setIconName] = useState('ShoppingBag');
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const categoriasDisponibles = modoEdicion
    ? categoriasGasto
    : categoriasGasto.filter((c) => !categoriasYaUsadas.includes(c.value));

  useEffect(() => {
    if (isOpen) {
      if (presupuestoEditar) {
        const esPredeterminada = categoriasGasto.some(
          (c) => c.value === presupuestoEditar.categoria
        );
        if (esPredeterminada) {
          setCategoria(presupuestoEditar.categoria);
          setModoCustom(false);
          setCategoriaCustom('');
        } else {
          setModoCustom(true);
          setCategoriaCustom(presupuestoEditar.categoria);
          setCategoria('');
        }
        setLimite(String(presupuestoEditar.limite));
        setColor(presupuestoEditar.color);
        setIconName(presupuestoEditar.iconName);
      } else {
        const disponibles = categoriasGasto.filter(
          (c) => !categoriasYaUsadas.includes(c.value)
        );
        if (disponibles.length > 0) {
          setCategoria(disponibles[0].value);
          setModoCustom(false);
          setCategoriaCustom('');
        } else {
          setModoCustom(true);
          setCategoriaCustom('');
          setCategoria('');
        }
        setLimite('');
        setColor('#0D9488');
        setIconName('ShoppingBag');
      }
      setError(null);
      setGuardando(false);
    }
  }, [isOpen, presupuestoEditar, categoriasYaUsadas, categoriasGasto]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    let categoriaFinal: string = categoria;
    let categoriaCustomFinal: string | undefined;

    if (modoCustom) {
      const custom = categoriaCustom.trim();
      if (!custom) {
        setError('Escribi el nombre de la categoria.');
        return;
      }
      if (custom.length < 2) {
        setError('La categoria debe tener al menos 2 caracteres.');
        return;
      }
      categoriaFinal = custom.toLowerCase().replace(/\s+/g, '_');
      categoriaCustomFinal = custom;
    }

    const limiteNum = parseFloat(limite);
    if (isNaN(limiteNum) || limiteNum < 0) {
      setError('Ingresa un limite valido (mayor o igual a cero).');
      return;
    }

    try {
      setGuardando(true);
      await onSave({
        categoria: categoriaFinal,
        categoriaCustom: categoriaCustomFinal,
        limite: limiteNum,
        color,
        iconName,
      });
      onClose();
    } catch (err) {
      console.error('Error al guardar presupuesto:', err);
      setError('No se pudo guardar. Intenta de nuevo.');
      setGuardando(false);
    }
  };

  const noHayCategorias = categoriasDisponibles.length === 0 && !modoCustom;

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
              {modoEdicion ? 'Editar presupuesto' : 'Nuevo presupuesto'}
            </h2>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
              {modoEdicion
                ? 'Modifica el limite, color o icono'
                : 'Define un limite de gasto para una categoria'}
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
          {!modoCustom ? (
            <>
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text)] mb-1">
                  Categoria *
                </label>
                {noHayCategorias ? (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-700 dark:text-amber-300">
                    Ya usaste todas las categorias disponibles. Crea una
                    categoria personalizada.
                  </div>
                ) : (
                  <select
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[var(--color-surface-subtle)] border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                  >
                    {categoriasDisponibles.length === 0 && (
                      <option value="">Sin categorias disponibles</option>
                    )}
                    {categoriasDisponibles.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  setModoCustom(true);
                  setCategoriaCustom('');
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border-2 border-dashed border-[var(--color-border)] hover:border-[var(--color-accent)] rounded-xl text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-all"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Crear categoria personalizada</span>
              </button>
            </>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-[var(--color-text)]">
                  Nombre de la categoria *
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setModoCustom(false);
                    setCategoriaCustom('');
                    if (categoriasDisponibles.length > 0) {
                      setCategoria(categoriasDisponibles[0].value);
                    }
                  }}
                  className="text-xs text-[var(--color-accent)] hover:underline font-medium"
                >
                  Volver a predeterminadas
                </button>
              </div>
              <input
                type="text"
                placeholder="ej. Mascotas, Regalos, Viajes"
                value={categoriaCustom}
                onChange={(e) => setCategoriaCustom(e.target.value)}
                className="w-full px-3 py-2.5 bg-[var(--color-surface-subtle)] border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                autoFocus
              />
              <p className="text-xs text-[var(--color-text-muted)] mt-1.5 flex items-start gap-1.5">
                <Sparkles className="w-3 h-3 shrink-0 mt-0.5 text-teal-500" />
                <span>
                  Escribi como quieras. La app va a guardarla como tu categoria personal.
                </span>
              </p>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[var(--color-text)] mb-1">
              Limite mensual *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] font-bold text-lg">
                $
              </span>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="500000"
                value={limite}
                onChange={(e) => {
                  const soloDigitos = e.target.value.replace(/[^0-9]/g, '');
                  setLimite(soloDigitos);
                }}
                className={`w-full pl-8 pr-4 py-2.5 bg-[var(--color-surface-subtle)] border rounded-xl text-lg font-bold text-[var(--color-text)] tabular-nums placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 ${
                  error
                    ? 'border-rose-500 focus:ring-rose-500/20'
                    : 'border-[var(--color-border)] focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)]'
                }`}
              />
            </div>
            {limite && (
              <p className="text-[11px] text-[var(--color-text-muted)] mt-1 tabular-nums">
                Se guardara como ${Number(limite).toLocaleString('es-CO')}
              </p>
            )}
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              Podes empezar con $0 y ajustarlo luego.
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
                  : 'Crear presupuesto'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};