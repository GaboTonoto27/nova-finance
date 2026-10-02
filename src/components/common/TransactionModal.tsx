import React, { useState, useEffect } from 'react';
import { X, Check, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Transaction, TransactionType } from '../../types/finance';
import { AVAILABLE_CATEGORIES } from '../../data/mockData';
import { UI_COPY, CATEGORY_LABELS } from '../../data/copy';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  initialType?: TransactionType;
}

// Opciones predeterminadas para el medio de pago
const MEDIOS_PAGO_PREDETERMINADOS = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'nequi', label: 'Nequi' },
  { value: 'daviplata', label: 'Daviplata' },
  { value: 'tarjeta_debito', label: 'Tarjeta debito' },
  { value: 'tarjeta_credito', label: 'Tarjeta credito' },
  { value: 'transferencia', label: 'Transferencia bancaria' },
  { value: 'paypal', label: 'PayPal' },
  { value: 'otro', label: 'Otro (especificar)' },
];

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onAddTransaction,
  initialType = 'expense',
}) => {
  const [type, setType] = useState<TransactionType>(initialType);
  const [merchant, setMerchant] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Groceries');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('efectivo');
  const [customPaymentMethod, setCustomPaymentMethod] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setType(initialType);
      setErrors({});
    }
  }, [isOpen, initialType]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!merchant.trim()) {
      newErrors.merchant = 'Dinos donde o a quien le pagaste.';
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
      newErrors.paymentMethod = 'Especifica como pagaste.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Si el usuario eligio "Otro", usamos el texto custom
    const finalPaymentMethod =
      paymentMethod === 'otro' && customPaymentMethod.trim()
        ? customPaymentMethod.trim()
        : MEDIOS_PAGO_PREDETERMINADOS.find((m) => m.value === paymentMethod)?.label ||
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

    // Reset and close
    setMerchant('');
    setDescription('');
    setAmount('');
    setCategory('Groceries');
    setPaymentMethod('efectivo');
    setCustomPaymentMethod('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="relative w-full max-w-md bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl shadow-2xl p-6 sm:p-7 text-[var(--color-text)] animate-in fade-in zoom-in-95 duration-200 transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--color-border)]">
          <div>
            <h2 id="modal-title" className="text-lg font-bold text-[var(--color-text)]">
              {type === 'expense' ? 'Registrar un gasto' : 'Registrar un ingreso'}
            </h2>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
              Guarda tus movimientos para tener tus cuentas al dia
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
          {/* Segmented Type Control */}
          <div className="flex p-1 bg-[var(--color-surface-subtle)] border border-[var(--color-border)] rounded-2xl">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-xl transition-all ${
                type === 'expense'
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
                type === 'income'
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-xs'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
              }`}
            >
              <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
              <span>Ingreso</span>
            </button>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-semibold text-[var(--color-text)] mb-1">
              {UI_COPY.forms.amount}
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] font-bold text-lg">
                $
              </span>
              <input
                type="number"
                step="any"
                min="0"
                placeholder={UI_COPY.forms.amountPlaceholder}
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

          {/* Merchant & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text)] mb-1">
                {UI_COPY.forms.merchant}
              </label>
              <input
                type="text"
                placeholder={UI_COPY.forms.merchantPlaceholder}
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                className={`w-full px-3 py-2 bg-[var(--color-surface-subtle)] border rounded-xl text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 ${
                  errors.merchant
                    ? 'border-rose-500 focus:ring-rose-500/20'
                    : 'border-[var(--color-border)] focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)]'
                }`}
              />
              {errors.merchant && (
                <p className="text-xs text-rose-500 mt-1 font-medium">{errors.merchant}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-text)] mb-1">
                {UI_COPY.forms.category}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--color-surface-subtle)] border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)]"
              >
                {AVAILABLE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {CATEGORY_LABELS[cat] || cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text)] mb-1">
                {UI_COPY.forms.date}
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
                {UI_COPY.forms.paymentChannel}
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
                {MEDIOS_PAGO_PREDETERMINADOS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Custom payment method (si elige "Otro") */}
          {paymentMethod === 'otro' && (
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text)] mb-1">
                Especifica como pagaste
              </label>
              <input
                type="text"
                placeholder="ej. PSE, tarjeta regalo, Bitcoin"
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

          {/* Note */}
          <div>
            <label className="block text-xs font-semibold text-[var(--color-text)] mb-1">
              {UI_COPY.forms.note}
            </label>
            <input
              type="text"
              placeholder={UI_COPY.forms.notePlaceholder}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--color-surface-subtle)] border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)]"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--color-border)]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
            >
              {UI_COPY.actions.cancel}
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 bg-teal-500 hover:bg-teal-400 active:bg-teal-600 text-slate-950 text-xs font-bold rounded-full transition-colors shadow-sm shadow-teal-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 interactive-pill"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>{UI_COPY.actions.saveTransaction}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};