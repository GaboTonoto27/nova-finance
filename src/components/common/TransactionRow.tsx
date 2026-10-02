import React from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  ShoppingBag,
  Home,
  Laptop,
  HeartPulse,
  Car,
  Utensils,
  BookOpen,
  Wifi,
  Briefcase,
  TrendingUp,
  CircleDollarSign,
} from 'lucide-react';
import { Transaction } from '../../types/finance';
import { formatCurrency } from '../../data/format';
import { CATEGORY_LABELS } from '../../data/copy';

interface TransactionRowProps {
  transaction: Transaction;
  onClick?: () => void;
}

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Income: Briefcase,
  Investments: TrendingUp,
  Technology: Laptop,
  Groceries: ShoppingBag,
  Equipment: Laptop,
  'Health & Wellness': HeartPulse,
  Utilities: Wifi,
  Dining: Utensils,
  Education: BookOpen,
  Housing: Home,
  'Transit & Mobility': Car,
  'Culture & Equipment': ShoppingBag,
};

export const TransactionRow: React.FC<TransactionRowProps> = ({
  transaction,
  onClick,
}) => {
  const Icon = CATEGORY_ICONS[transaction.category] || CircleDollarSign;
  const isIncome = transaction.type === 'income';

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`group flex items-center justify-between py-3.5 px-3 sm:px-4 rounded-lg transition-colors border-b border-[var(--color-border-subtle)] hover:bg-[var(--color-surface-hover)] text-left ${
        onClick ? 'cursor-pointer focus-visible:outline-none focus-visible:bg-[var(--color-surface-hover)]' : ''
      }`}
    >
      {/* Left: Icon & Merchant details */}
      <div className="flex items-center gap-3.5 min-w-0 pr-2">
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${
            isIncome
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
              : 'bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-[var(--color-text-secondary)] group-hover:text-[var(--color-accent)]'
          }`}
        >
          <Icon className="w-4 h-4" />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-[var(--color-text)] truncate group-hover:text-[var(--color-accent)] transition-colors">
              {transaction.merchant}
            </span>
            {transaction.status === 'pending' && (
              <span className="text-[11px] font-medium text-amber-500">
                Pendiente
              </span>
            )}
          </div>

          {/* Clean metadata */}
          <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)] mt-0.5 truncate">
            <span className="truncate">{transaction.description}</span>
            <span aria-hidden="true" className="text-[var(--color-text-muted)]">·</span>
            <span className="shrink-0">{CATEGORY_LABELS[transaction.category] || transaction.category}</span>
            <span aria-hidden="true" className="text-[var(--color-text-muted)] hidden sm:inline">·</span>
            <span className="shrink-0 text-[var(--color-text-secondary)] hidden sm:inline">
              {transaction.paymentMethod}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Amount & Date */}
      <div className="text-right shrink-0 pl-2">
        <div
          className={`text-sm sm:text-base font-bold tabular-nums ${
            isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-[var(--color-text)]'
          }`}
        >
          {isIncome ? `+${formatCurrency(transaction.amount)}` : `-${formatCurrency(transaction.amount)}`}
        </div>
        <div className="text-xs text-[var(--color-text-muted)] mt-0.5 font-normal">
          {transaction.date}
        </div>
      </div>
    </div>
  );
};
