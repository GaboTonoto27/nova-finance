import React, { useState, useEffect, useMemo } from 'react';
import { X, Check, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Transaction, TransactionType } from '../../types/finance';

interface CategoriaOption {
  value: string;
  label: string;
}

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  initialType?: TransactionType;
  categoriasGasto: CategoriaOption[];
  categoriasIngreso: CategoriaOption[];
}

// Opciones de pago para GASTOS
const MEDIOS_PAGO_GASTO = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'tarjeta_debito', label: 'Tarjeta debito' },
  { value: 'tarjeta_credito', label: 'Tarjeta credito' },
  { value: 'nequi', label: 'Nequi' },
  { value: 'daviplata', label: 'Daviplata' },
  { value: 'transferencia', label: 'Transferencia bancaria' },
  { value: 'paypal', label: 'PayPal' },
  { value: 'otro', label: 'Otro (especificar)' },
];

// Opciones de recepcion para INGRESOS
const MEDIOS_RECEPCION_INGRESO = [
  { value: 'transferencia', label: 'Transferencia bancaria' },
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'nequi', label: 'Nequi' },
  { value: 'daviplata', label: 'Daviplata' },
  { value: 'paypal', label: 'PayPal' },
  { value: 'otro', label: 'Otro (especificar)' },
];

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onAddTransaction,
  initialType = 'expense',
  categoriasGasto,
  categoriasIngreso,
}) => {
  const [type, setType] = useState<TransactionType>(initialType);
  const [merchant, setMerchant] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('efectivo');
  const [customPaymentMethod, setCustomPaymentMethod] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isExpense = type === 'expense';

  const categoriasDisponibles = useMemo(
    () => (isExpense ? categoriasGasto : categoriasIngreso),
    [isExpense, categoriasGasto, categoriasIngreso]
  );

  const mediosDisponibles = useMemo(
    () => (isExpense ? MEDIOS_PAGO_GASTO : MEDIOS_RECEPCION_INGRESO),
    [isExpense]
  );

  // Al abrir el modal, resetear
  useEffect(() => {
    if (isOpen) {
      setType(initialType);
      setErrors({});
      setCategory('');
      setPaymentMethod(initialType === 'expense' ? 'efectivo' : 'transferencia');
      setCustomPaymentMethod('');
    }
  }, [isOpen, initialType]);

  // Cuando se cargan las categorias disponibles, seleccionar la primera
  useEffect(() => {
    if (categoriasDisponibles.length > 0 && !categoriasDisponibles.some((c) => c.value === category)) {
      setCategory(categoriasDisponibles[0].value);
    }
  }, [categoriasDisponibles, category]);

  // Cuando el usuario cambia el tipo
  useEffect(() => {
    if (isOpen) {
      setCategory('');
      setPaymentMethod(type === 'expense' ? 'efectivo' : 'transferencia');
      setCustomPaymentMethod('');
    }
  }, [type, isOpen]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!merchant.trim()) {
      newErrors.merchant = isExpense
        ? 'Dinos donde pagaste.'
        : 'Dinos de donde viene el ingreso.';
    }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      newErrors.amount = 'Ingresa un valor mayor a $0.';
    }
    if (!category) {
      newErrors.category = 'Selecciona una categoria.';
    }
    if (!date) {
      newErrors.date = 'La fecha es obligatoria.';
    }
    if (paymentMethod === 'otro' && !customPaymentMethod.trim()) {
      newErrors.paymentMethod = 'Especifica los detalles.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const finalPaymentMethod =
      paymentMethod === 'otro' && customPaymentMethod.trim()
        ? customPaymentMethod.trim()
        : mediosDisponibles.find((m) => m.value === paymentMethod)?.label ||
          paymentMethod;

    onAddTransaction({
      merchant: merchant.trim(),
      description: description.trim() || merchant.trim(),
      amount: parseFloat(amount),
      type,
      category,
      date,
      paymentMethod: finalPaymentMethod,
      status: 'completed',
    });

    setMerchant('');
    setDescription('');
    setAmount('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="relative w-full max-w-md bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl shadow-2xl p-6 sm:p-7 text-[var(--color-text)] animate-in fade-in zoom-in-95 duration-200 transition-colors max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-[var(--color-border)]">
          <div>
            <h2 id="modal-title" className="text-lg font-bold text-[var(--color-text)]">
              {isExpense ? 'Registrar un gasto' : 'Registrar un ingreso'}
            </h2>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
              {isExpense
                ? 'Guarda tus gastos para tener tus cuentas al dia'
                : 'Registra lo que entra para trackear tus finanzas'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text)] rounded-full hover:bg-[var(--color-surface-hover)] transition-colors"
            type="button"
            aria-label="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {/* Tipo */}
          <div className="flex p-1 bg-[var(--color-surface-subtle)] border border-[var(--color-border)] rounded-2xl">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-xl transition-all ${
                isExpense
                  ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 shadow-xs'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
              }`}
            >
              <ArrowDownRight className="w-4 h-4 stroke-[2.5]" />
              <span>Gasto</span>
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-xl transition-all ${
                !isExpense
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-xs'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
              }`}
            >
              <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
              <span>Ingreso</span>
            </button>
          </div>

          {/* Monto */}
          <div>
            <label className="block text-xs font-semibold text-[var(--color-text)] mb-1">
              Cuanto fue? ($ COP) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] font-bold text-lg">
                $
              </span>
              <input
                type="number"
                step="any"
                min="0"
                placeholder="50000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`w-full pl-8 pr-4 py-2.5 bg-[var(--color-surface-subtle)] border rounded-xl text-lg font-bold text-[var(--color-text)] tabular-nums placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 ${
                  errors.amount
                    ? 'border-rose-500 focus:ring-rose-500/20'
                    : 'border-[var(--color-border)] focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)]'
                }`}
                autoFocus
              />
            </div>
            {errors.amount && (
              <p className="text-xs text-rose-500 mt-1 font-medium">{errors.amount}</p>
            )}
          </div>

          {/* Donde + Categoria */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text)] mb-1">
                {isExpense ? 'Donde pagaste? *' : 'De donde viene? *'}
              </label>
              <input
                type="text"
                placeholder={
                  isExpense ? 'ej. Exito, Netflix, Uber' : 'ej. Empresa, Cliente, Mama'
                }
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                className={`w-full px-3 py-2 bg-[var(--color-surface-subtle)] border rounded-xl text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 ${
                  errors.merchant
                    ? 'border-rose-500 focus:ring-rose-500/20'
                    : 'border-[var(--color-border)] focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)]'
                }`}
              />
              {errors.merchant && (
                <p className="text-xs text-rose-500 mt-1 font-medium">
                  {errors.merchant}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-text)] mb-1">
                Categoria *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--color-surface-subtle)] border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)]"
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
              {errors.category && (
                <p className="text-xs text-rose-500 mt-1 font-medium">
                  {errors.category}
                </p>
              )}
            </div>
          </div>

          {/* Fecha + Como pago */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text)] mb-1">
                Fecha *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--color-surface-subtle)] border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-text)] mb-1">
                {isExpense ? 'Como pagaste?' : 'Como recibiste el dinero?'}
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className={`w-full px-3 py-2 bg-[var(--color-surface-subtle)] border rounded-xl text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 ${
                  errors.paymentMethod
                    ? 'border-rose-500 focus:ring-rose-500/20'
                    : 'border-[var(--color-border)] focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)]'
                }`}
              >
                {mediosDisponibles.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Custom payment */}
          {paymentMethod === 'otro' && (
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text)] mb-1">
                {isExpense ? 'Especifica como pagaste' : 'Especifica como recibiste'}
              </label>
              <input
                type="text"
                placeholder="ej. PSE, tarjeta regalo, cripto"
                value={customPaymentMethod}
                onChange={(e) => setCustomPaymentMethod(e.target.value)}
                className={`w-full px-3 py-2 bg-[var(--color-surface-subtle)] border rounded-xl text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 ${
                  errors.paymentMethod
                    ? 'border-rose-500 focus:ring-rose-500/20'
                    : 'border-[var(--color-border)] focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)]'
                }`}
              />
              {errors.paymentMethod && (
                <p className="text-xs text-rose-500 mt-1 font-medium">
                  {errors.paymentMethod}
                </p>
              )}
            </div>
          )}

          {/* Nota */}
          <div>
            <label className="block text-xs font-semibold text-[var(--color-text)] mb-1">
              Nota o detalle (opcional)
            </label>
            <input
              type="text"
              placeholder="ej. Compra semanal, pago mensual"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--color-surface-subtle)] border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)]"
            />
          </div>

          {/* Acciones */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--color-border)]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold rounded-full transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 interactive-pill ${
                isExpense
                  ? 'bg-rose-500 hover:bg-rose-400 active:bg-rose-600 text-white shadow-rose-500/10 focus-visible:ring-rose-400'
                  : 'bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-white shadow-emerald-500/10 focus-visible:ring-emerald-400'
              }`}
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>{isExpense ? 'Guardar gasto' : 'Guardar ingreso'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};