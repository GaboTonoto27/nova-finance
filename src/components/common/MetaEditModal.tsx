import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { MetaAhorro } from '../../types/finance';

interface MetaEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    nombre: string;
    montoObjetivo: number;
    fechaObjetivo: string;
    categoria: MetaAhorro['categoria'];
    color: string;
    iconName: string;
  }) => Promise<void>;
  metaEditar?: MetaAhorro | null;
}

const CATEGORIAS_META: {
  value: MetaAhorro['categoria'];
  label: string;
}[] = [
  { value: 'seguridad', label: 'Fondo de emergencia' },
  { value: 'inversion', label: 'Inversion y futuro' },
  { value: 'viaje', label: 'Viaje' },
  { value: 'compra', label: 'Compra grande' },
  { value: 'otro', label: 'Otro' },
];

const COLORES_DISPONIBLES = [
  { name: 'Esmeralda', value: '#10B981' },
  { name: 'Teal', value: '#0D9488' },
  { name: 'Indigo', value: '#6366F1' },
  { name: 'Azul', value: '#3B82F6' },
  { name: 'Ambar', value: '#F59E0B' },
  { name: 'Rosa', value: '#EC4899' },
  { name: 'Purpura', value: '#8B5CF6' },
  { name: 'Rojo', value: '#EF4444' },
];

const ICONOS_DISPONIBLES: { value: string; label: string }[] = [
  { value: 'Shield', label: 'Escudo' },
  { value: 'TrendingUp', label: 'Crecimiento' },
  { value: 'Plane', label: 'Avion' },
  { value: 'ShoppingCart', label: 'Carrito' },
  { value: 'Home', label: 'Casa' },
  { value: 'Car', label: 'Auto' },
  { value: 'GraduationCap', label: 'Educacion' },
  { value: 'Heart', label: 'Corazon' },
  { value: 'Star', label: 'Estrella' },
  { value: 'Target', label: 'Objetivo' },
];

export const MetaEditModal: React.FC<MetaEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  metaEditar,
}) => {
  const modoEdicion = Boolean(metaEditar);

  const [nombre, setNombre] = useState('');
  const [montoObjetivo, setMontoObjetivo] = useState('');
  const [fechaObjetivo, setFechaObjetivo] = useState('');
  const [categoria, setCategoria] =
    useState<MetaAhorro['categoria']>('seguridad');
  const [color, setColor] = useState('#10B981');
  const [iconName, setIconName] = useState('Shield');
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (metaEditar) {
        setNombre(metaEditar.nombre);
        setMontoObjetivo(String(metaEditar.montoObjetivo));
        setFechaObjetivo(metaEditar.fechaObjetivo.split('T')[0]);
        setCategoria(metaEditar.categoria);
        setColor(metaEditar.color);
        setIconName(metaEditar.iconName);
      } else {
        setNombre('');
        setMontoObjetivo('');
        const fecha = new Date();
        fecha.setMonth(fecha.getMonth() + 6);
        setFechaObjetivo(fecha.toISOString().split('T')[0]);
        setCategoria('seguridad');
        setColor('#10B981');
        setIconName('Shield');
      }
      setError(null);
      setGuardando(false);
    }
  }, [isOpen, metaEditar]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!nombre.trim()) {
      setError('El nombre de la meta es obligatorio.');
      return;
    }

    const objetivoNum = parseFloat(montoObjetivo);
    if (isNaN(objetivoNum) || objetivoNum <= 0) {
      setError('El monto objetivo debe ser mayor a cero.');
      return;
    }

    if (!fechaObjetivo) {
      setError('La fecha objetivo es obligatoria.');
      return;
    }

    try {
      setGuardando(true);
      await onSave({
        nombre: nombre.trim(),
        montoObjetivo: objetivoNum,
        fechaObjetivo: new Date(`${fechaObjetivo}T12:00:00.000Z`).toISOString(),
        categoria,
        color,
        iconName,
      });
      onClose();
    } catch (err) {
      console.error('Error al guardar meta:', err);
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
              {modoEdicion ? 'Editar meta' : 'Nueva meta de ahorro'}
            </h2>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
              {modoEdicion
                ? 'Actualiza el nombre, monto, fecha o color'
                : 'Define un objetivo y empeza a ahorrar'}
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
              Nombre de la meta *
            </label>
            <input
              type="text"
              placeholder="ej. Viaje a Japon, Fondo emergencia"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full px-3 py-2.5 bg-[var(--color-surface-subtle)] border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-text)] mb-1">
              Tipo de meta
            </label>
            <select
              value={categoria}
              onChange={(e) =>
                setCategoria(e.target.value as MetaAhorro['categoria'])
              }
              className="w-full px-3 py-2.5 bg-[var(--color-surface-subtle)] border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            >
              {CATEGORIAS_META.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-text)] mb-1">
              Monto objetivo *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] font-bold text-lg">
                $
              </span>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="5000000"
                value={montoObjetivo}
                onChange={(e) => {
                  const soloDigitos = e.target.value.replace(/[^0-9]/g, '');
                  setMontoObjetivo(soloDigitos);
                }}
                className="w-full pl-8 pr-4 py-2.5 bg-[var(--color-surface-subtle)] border border-[var(--color-border)] rounded-xl text-lg font-bold text-[var(--color-text)] tabular-nums placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              />
            </div>
            {montoObjetivo && (
              <p className="text-[11px] text-[var(--color-text-muted)] mt-1 tabular-nums">
                Se guardara como ${Number(montoObjetivo).toLocaleString('es-CO')}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-text)] mb-1">
              Fecha objetivo *
            </label>
            <input
              type="date"
              value={fechaObjetivo}
              onChange={(e) => setFechaObjetivo(e.target.value)}
              className="w-full px-3 py-2.5 bg-[var(--color-surface-subtle)] border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            />
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
                  : 'Crear meta'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};