import React, { useState, useEffect, useMemo } from 'react';
import { X, Check, ArrowDownRight, ArrowUpRight, AlertCircle } from 'lucide-react';
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

const MEDIOS_RECEPCION_INGRESO = [
  { value: 'transferencia', label: 'Transferencia bancaria' },
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'nequi', label: 'Nequi' },
  { value: 'daviplata', label: 'Daviplata' },
  { value: 'paypal', label: 'PayPal' },
  { value: 'otro', label: 'Otro (especificar)' },
];

interface ErroresForm {
  amount?: string;
  merchant?: string;
  category?: string;
  date?: string;
  paymentMethod?: string;
}

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
  const [touched, setTouched] = useState(false);

  const isExpense = type === 'expense';

  const categoriasDisponibles = useMemo(
    () => (isExpense ? categoriasGasto : categoriasIngreso),
    [isExpense, categoriasGasto, categoriasIngreso]
  );

  const mediosDisponibles = useMemo(
    () => (isExpense ? MEDIOS_PAGO_GASTO : MEDIOS_RECEPCION_INGRESO),
    [isExpense]
  );

  useEffect(() => {
    if (isOpen) {
      setType(initialType);
      setTouched(false);
      setCategory('');
      setPaymentMethod(initialType === 'expense' ? 'efectivo' : 'transferencia');
      setCustomPaymentMethod('');
      setAmount('');
      setMerchant('');
      setDescription('');
    }
  }, [isOpen, initialType]);

  useEffect(() => {
    if (
      categoriasDisponibles.length > 0 &&
      !categoriasDisponibles.some((c) => c.value === category)
    ) {
      setCategory(categoriasDisponibles[0].value);
    }
  }, [categoriasDisponibles, category]);

  useEffect(() => {
    if (isOpen) {
      setCategory('');
      setPaymentMethod(type === 'expense' ? 'efectivo' : 'transferencia');
      setCustomPaymentMethod('');
    }
  }, [type, isOpen]);

  // -------------------------------------------------------------------------
  // Validacion reactiva: calcula errores en tiempo real
  // -------------------------------------------------------------------------
  const errores: ErroresForm = useMemo(() => {
    const nuevosErrores: ErroresForm = {};

    const parsedAmount = parseFloat(amount);
    if (!amount.trim()) {
      nuevosErrores.amount = 'Ingresa el monto del movimiento.';
    } else if (isNaN(parsedAmount) || parsedAmount <= 0) {
      nuevosErrores.amount = 'El monto debe ser mayor a $0.';
    }

    if (!merchant.trim()) {
      nuevosErrores.merchant = isExpense
        ? 'Dinos donde o con quien pagaste.'
        : 'Dinos de donde viene el ingreso.';
    }

    if (!category) {
      nuevosErrores.category = 'Selecciona una categoria.';
    }

    if (!date) {
      nuevosErrores.date = 'Selecciona la fecha del movimiento.';
    }

    if (paymentMethod === 'otro' && !customPaymentMethod.trim()) {
      nuevosErrores.paymentMethod = isExpense
        ? 'Especifica como pagaste.'
        : 'Especifica como recibiste el dinero.';
    }

    return nuevosErrores;
  }, [amount, merchant, category, date, paymentMethod, customPaymentMethod, isExpense]);

  // Solo mostramos errores despues de que el usuario intento guardar (touched)
  // Pero los campos con error se marcan en rojo siempre que tengan error,
  // asi el usuario ve en tiempo real cuando corrige.
  const erroresVisibles = errores;
  const erroresCount = Object.keys(errores).length;
  const formValido = erroresCount === 0;

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);

    if (!formValido) return;

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

        <form onSubmit={handleSubmit} className="space-y-4 pt-4" noValidate>
          {/* Banner general de errores: se actualiza en tiempo real */}
          {erroresCount > 0 && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 stroke-[2.5]" />
              <div className="text-xs">
                <p className="font-bold">
                  {erroresCount === 1
                    ? 'Falta completar 1 campo'
                    : `Faltan completar ${erroresCount} campos`}
                </p>
                <p className="mt-0.5 leading-relaxed opacity-90">
                  Revisa los campos marcados en rojo antes de guardar.
                </p>
              </div>
            </div>
          )}

          {/* Banner de exito cuando todo esta listo (solo si touched) */}
          {touched && formValido && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 animate-in fade-in">
              <Check className="w-4 h-4 shrink-0 mt-0.5 stroke-[2.5]" />
              <div className="text-xs">
                <p className="font-bold">Todo listo</p>
                <p className="mt-0.5 leading-relaxed opacity-90">
                  Podes guardar el movimiento.
                </p>
              </div>
            </div>
          )}

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
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="50000"
                value={amount}
                onChange={(e) => {
                  const soloDigitos = e.target.value.replace(/[^0-9]/g, '');
                  setAmount(soloDigitos);
                }}
                className={`w-full pl-8 pr-4 py-2.5 bg-[var(--color-surface-subtle)] border rounded-xl text-lg font-bold text-[var(--color-text)] tabular-nums placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 ${
                  errores.amount
                    ? 'border-rose-500 focus:ring-rose-500/20'
                    : 'border-[var(--color-border)] focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)]'
                }`}
                autoFocus
              />
            </div>
            {amount && !errores.amount && (
              <p className="text-[11px] text-[var(--color-text-muted)] mt-1 tabular-nums">
                Se guardara como ${Number(amount).toLocaleString('es-CO')}
              </p>
            )}
            {errores.amount && (
              <p className="text-xs text-rose-500 mt-1 font-medium flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{errores.amount}</span>
              </p>
            )}
          </div>

          {/* Merchant + Categoria */}
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
                  errores.merchant
                    ? 'border-rose-500 focus:ring-rose-500/20'
                    : 'border-[var(--color-border)] focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)]'
                }`}
              />
              {errores.merchant && (
                <p className="text-xs text-rose-500 mt-1 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{errores.merchant}</span>
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
                className={`w-full px-3 py-2 bg-[var(--color-surface-subtle)] border rounded-xl text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 ${
                  errores.category
                    ? 'border-rose-500 focus:ring-rose-500/20'
                    : 'border-[var(--color-border)] focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)]'
                }`}
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
              {errores.category && (
                <p className="text-xs text-rose-500 mt-1 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{errores.category}</span>
                </p>
              )}
            </div>
          </div>

          {/* Fecha + Pago */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text)] mb-1">
                Fecha *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`w-full px-3 py-2 bg-[var(--color-surface-subtle)] border rounded-xl text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 ${
                  errores.date
                    ? 'border-rose-500 focus:ring-rose-500/20'
                    : 'border-[var(--color-border)] focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)]'
                }`}
              />
              {errores.date && (
                <p className="text-xs text-rose-500 mt-1 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{errores.date}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-text)] mb-1">
                {isExpense ? 'Como pagaste?' : 'Como recibiste el dinero?'}
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className={`w-full px-3 py-2 bg-[var(--color-surface-subtle)] border rounded-xl text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 ${
                  errores.paymentMethod
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

          {/* Custom payment method */}
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
                  errores.paymentMethod
                    ? 'border-rose-500 focus:ring-rose-500/20'
                    : 'border-[var(--color-border)] focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)]'
                }`}
              />
              {errores.paymentMethod && (
                <p className="text-xs text-rose-500 mt-1 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{errores.paymentMethod}</span>
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