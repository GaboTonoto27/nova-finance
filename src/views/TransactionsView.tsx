import React, { useState, useMemo } from 'react';
import {
  Search,
  Download,
  Plus,
  CheckCircle2,
} from 'lucide-react';
import { Transaction, TransactionType } from '../types/finance';
import { TransactionRow } from '../components/common/TransactionRow';
import { formatCurrency } from '../data/format';
import { UI_COPY, CATEGORY_LABELS } from '../data/copy';

// Categorias disponibles para el filtro (todas las que tienen label)
const AVAILABLE_CATEGORIES = Object.keys(CATEGORY_LABELS);

interface TransactionsViewProps {
  transactions: Transaction[];
  onOpenAddModal: () => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  onOpenAddModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | TransactionType>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc'>('date-desc');
  const [exportedToast, setExportedToast] = useState(false);

  // Filtro y orden
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((tx) => {
        const matchesSearch =
          tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tx.merchant.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tx.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesType = selectedType === 'all' || tx.type === selectedType;

        const matchesCategory =
          selectedCategory === 'all' || tx.category === selectedCategory;

        return matchesSearch && matchesType && matchesCategory;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') return b.date.localeCompare(a.date);
        if (sortBy === 'date-asc') return a.date.localeCompare(b.date);
        if (sortBy === 'amount-desc') return b.amount - a.amount;
        return 0;
      });
  }, [transactions, searchTerm, selectedType, selectedCategory, sortBy]);

  // Totales filtrados
  const totalInflow = filteredTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalOutflow = filteredTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const handleExportCSV = () => {
    const headers = [
      'Fecha',
      'Comercio',
      'Descripcion',
      'Tipo',
      'Categoria',
      'Monto',
      'MedioDePago',
      'Estado',
    ];
    const rows = filteredTransactions.map((tx) => [
      tx.date,
      `"${tx.merchant.replace(/"/g, '""')}"`,
      `"${tx.description.replace(/"/g, '""')}"`,
      tx.type,
      tx.category,
      tx.amount,
      `"${tx.paymentMethod.replace(/"/g, '""')}"`,
      tx.status,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `nova_movimientos_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportedToast(true);
    setTimeout(() => setExportedToast(false), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--color-text)]">
            Movimientos
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-1">
            Historial de todo lo que entra y sale de tus cuentas
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 bg-[var(--color-surface-subtle)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text)] text-xs font-semibold rounded-full transition-all border border-[var(--color-border)] shadow-xs interactive-pill"
            type="button"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{UI_COPY.actions.exportCSV}</span>
          </button>
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-400 active:bg-teal-600 text-slate-950 text-xs font-bold rounded-full transition-all shadow-sm shadow-teal-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 interactive-pill"
            type="button"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{UI_COPY.actions.addTransaction}</span>
          </button>
        </div>
      </div>

      {exportedToast && (
        <div className="flex items-center gap-2 p-3 bg-teal-500/10 border border-teal-500/30 rounded-xl text-xs text-teal-700 dark:text-teal-300 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Reporte descargado exitosamente.</span>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 space-y-3.5 shadow-xs transition-colors">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Buscador */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-[var(--color-text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={UI_COPY.forms.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2.5 bg-[var(--color-surface-subtle)] border border-[var(--color-border)] rounded-xl text-xs text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)]"
            />
          </div>

          {/* Tipo */}
          <div className="md:col-span-3 flex p-1 bg-[var(--color-surface-subtle)] border border-[var(--color-border)] rounded-xl">
            <button
              onClick={() => setSelectedType('all')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                selectedType === 'all'
                  ? 'bg-[var(--color-surface)] text-[var(--color-text)] shadow-xs'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
              }`}
            >
              {UI_COPY.forms.allTypes}
            </button>
            <button
              onClick={() => setSelectedType('expense')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                selectedType === 'expense'
                  ? 'bg-[var(--color-surface)] text-rose-500 shadow-xs'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
              }`}
            >
              Gastos
            </button>
            <button
              onClick={() => setSelectedType('income')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                selectedType === 'income'
                  ? 'bg-[var(--color-surface)] text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
              }`}
            >
              Ingresos
            </button>
          </div>

          {/* Categoria */}
          <div className="md:col-span-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2.5 bg-[var(--color-surface-subtle)] border border-[var(--color-border)] rounded-xl text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            >
              <option value="all">{UI_COPY.forms.allCategories}</option>
              {AVAILABLE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {CATEGORY_LABELS[cat] || cat}
                </option>
              ))}
            </select>
          </div>

          {/* Ordenar */}
          <div className="md:col-span-2">
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as 'date-desc' | 'date-asc' | 'amount-desc')
              }
              className="w-full px-3 py-2.5 bg-[var(--color-surface-subtle)] border border-[var(--color-border)] rounded-xl text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            >
              <option value="date-desc">{UI_COPY.forms.newestFirst}</option>
              <option value="date-asc">{UI_COPY.forms.oldestFirst}</option>
              <option value="amount-desc">{UI_COPY.forms.highestAmount}</option>
            </select>
          </div>
        </div>

        {/* Resumen filtros */}
        <div className="flex flex-wrap items-center justify-between text-xs text-[var(--color-text-secondary)] pt-2 border-t border-[var(--color-border)]">
          <div className="flex items-center gap-2">
            <span>
              Tienes{' '}
              <strong className="text-[var(--color-text)] font-semibold">
                {filteredTransactions.length}
              </strong>{' '}
              movimientos
            </span>
            {(searchTerm || selectedType !== 'all' || selectedCategory !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedType('all');
                  setSelectedCategory('all');
                }}
                className="text-[var(--color-accent)] hover:underline text-xs font-semibold"
              >
                {UI_COPY.actions.clearFilters}
              </button>
            )}
          </div>

          <div className="flex items-center gap-4 text-xs tabular-nums mt-1 sm:mt-0 font-medium">
            <span>
              Entro:{' '}
              <strong className="text-emerald-600 dark:text-emerald-400">
                +{formatCurrency(totalInflow)}
              </strong>
            </span>
            <span aria-hidden="true" className="text-[var(--color-text-muted)]">
              ·
            </span>
            <span>
              Salio:{' '}
              <strong className="text-[var(--color-text)]">
                -{formatCurrency(totalOutflow)}
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* Lista */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-4 sm:p-6 shadow-xs transition-colors">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12 px-4 space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mx-auto text-[var(--color-accent)]">
              <svg
                className="w-8 h-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h3 className="text-base font-bold text-[var(--color-text)]">
              {UI_COPY.emptyStates.noTransactionsTitle}
            </h3>
            <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] max-w-sm mx-auto leading-relaxed">
              {UI_COPY.emptyStates.noTransactionsDesc}
            </p>
            <div className="pt-2">
              <button
                onClick={onOpenAddModal}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-500 text-slate-950 text-xs font-bold rounded-full hover:bg-teal-400 transition-colors shadow-sm shadow-teal-500/10 interactive-pill"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Registrar mi primer movimiento</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-border-subtle)]">
            {filteredTransactions.map((tx) => (
              <TransactionRow key={tx.id} transaction={tx} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};