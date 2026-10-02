import {
  BudgetCategory,
  CashFlowMonth,
  FinancialInsight,
  FinancialSummary,
  SavingsGoal,
  Transaction,
} from '../types/finance';

export const INITIAL_SUMMARY: FinancialSummary = {
  currentBalance: 38650000,
  monthlyIncome: 7550000,
  monthlyExpenses: 3433000,
  savingsRate: 54.5,
  incomeChangePercentage: 5.2,
  expensesChangePercentage: -2.8,
  balanceChangePercentage: 8.4,
};

export const INITIAL_TRANSACTIONS: Transaction[] = [];

export const INITIAL_BUDGETS: BudgetCategory[] = [
  {
    id: 'b-housing',
    name: 'Housing & Residence',
    allocated: 1700000,
    spent: 1650000,
    color: '#0D9488',
    iconName: 'Home',
  },
  {
    id: 'b-food',
    name: 'Groceries & Dining',
    allocated: 650000,
    spent: 413000,
    color: '#3B82F6',
    iconName: 'Utensils',
  },
  {
    id: 'b-tech',
    name: 'Technology & Cloud',
    allocated: 350000,
    spent: 280000,
    color: '#8B5CF6',
    iconName: 'Cpu',
  },
  {
    id: 'b-wellness',
    name: 'Health & Wellness',
    allocated: 200000,
    spent: 160000,
    color: '#10B981',
    iconName: 'Activity',
  },
  {
    id: 'b-transport',
    name: 'Transit & Mobility',
    allocated: 250000,
    spent: 140000,
    color: '#F59E0B',
    iconName: 'Navigation',
  },
  {
    id: 'b-lifestyle',
    name: 'Culture & Equipment',
    allocated: 850000,
    spent: 815000,
    color: '#EC4899',
    iconName: 'ShoppingBag',
  },
];

export const INITIAL_GOALS: SavingsGoal[] = [
  {
    id: 'g-emergency',
    name: 'Fondo de Emergencia Nivel 1',
    targetAmount: 25000000,
    currentAmount: 21500000,
    targetDate: '2026-12-31',
    category: 'Security',
    color: '#10B981',
  },
  {
    id: 'g-portfolio',
    name: 'Portafolio Renta Variable Global',
    targetAmount: 40000000,
    currentAmount: 31200000,
    targetDate: '2027-06-30',
    category: 'Wealth',
    color: '#0D9488',
  },
  {
    id: 'g-travel',
    name: 'Viaje Internacional Cultural',
    targetAmount: 10000000,
    currentAmount: 6800000,
    targetDate: '2027-04-15',
    category: 'Lifestyle',
    color: '#6366F1',
  },
];

export const CASH_FLOW_HISTORY: CashFlowMonth[] = [
  { month: 'Apr 2026', income: 6900000, expenses: 3500000, savings: 3400000 },
  { month: 'May 2026', income: 6900000, expenses: 3300000, savings: 3600000 },
  { month: 'Jun 2026', income: 7200000, expenses: 3450000, savings: 3750000 },
  { month: 'Jul 2026', income: 7300000, expenses: 3200000, savings: 4100000 },
  { month: 'Aug 2026', income: 7300000, expenses: 3600000, savings: 3700000 },
  { month: 'Sep 2026', income: 7550000, expenses: 3433000, savings: 4117000 },
];

export const FINANCIAL_INSIGHTS: FinancialInsight[] = [
  {
    id: 'ins-001',
    title: 'Aceleracion en la Tasa de Ahorro',
    description:
      'Tu tasa de ahorro del 54.5% supera el promedio historico de los ultimos 6 meses (50.2%).',
    category: 'savings',
    type: 'positive',
    impactAmount: 4117000,
    date: '2026-09-29',
  },
];

// Categorias legacy en ingles (compatibilidad con mock y componentes viejos)
export const AVAILABLE_CATEGORIES = [
  'Housing',
  'Groceries',
  'Technology',
  'Health & Wellness',
  'Transit & Mobility',
  'Culture & Equipment',
  'Dining',
  'Education',
  'Utilities',
  'Income',
  'Investments',
  'General',
];

// ============================================================================
// Categorias para el modal adaptativo
// ============================================================================

// Categorias de GASTO (para el modal de gastos)
export const CATEGORIAS_GASTO: { value: string; label: string }[] = [
  { value: 'vivienda', label: 'Vivienda' },
  { value: 'mercado', label: 'Mercado' },
  { value: 'transporte', label: 'Transporte' },
  { value: 'tecnologia', label: 'Tecnologia' },
  { value: 'salud', label: 'Salud' },
  { value: 'educacion', label: 'Educacion' },
  { value: 'ocio', label: 'Ocio y Entretenimiento' },
  { value: 'suscripciones', label: 'Suscripciones' },
  { value: 'deudas', label: 'Deudas' },
  { value: 'otro', label: 'Otro' },
];

// Categorias de INGRESO (para el modal de ingresos)
export const CATEGORIAS_INGRESO: { value: string; label: string }[] = [
  { value: 'sueldo', label: 'Sueldo' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'ventas', label: 'Ventas' },
  { value: 'regalos', label: 'Regalos' },
  { value: 'inversiones', label: 'Inversiones' },
  { value: 'reembolsos', label: 'Reembolsos' },
  { value: 'prestamos', label: 'Prestamos' },
  { value: 'otros', label: 'Otros ingresos' },
];

// ============================================================================
// Helpers
// ============================================================================

export function formatCurrency(amount: number): string {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  const formatted = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    currencyDisplay: 'symbol',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(absAmount);

  // Normalize spaces: e.g., "$ 3.250.000" -> "$3.250.000"
  const clean = formatted.replace(/\s+/g, '');
  return isNegative ? `-${clean}` : clean;
}

export function formatPercentage(rate: number): string {
  return `${rate >= 0 ? '+' : ''}${rate.toFixed(1)}%`;
}