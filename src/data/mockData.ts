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

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-001',
    description: 'Salario Senior Software Engineer',
    merchant: 'Nova Technologies Colombia',
    amount: 6800000,
    type: 'income',
    category: 'Income',
    date: '2026-09-28',
    paymentMethod: 'Transferencia ACH Bancolombia',
    status: 'completed',
  },
  {
    id: 'tx-002',
    description: 'Rendimientos Fondo Renta Fija',
    merchant: 'Fiducuenta / Renta Fija',
    amount: 750000,
    type: 'income',
    category: 'Investments',
    date: '2026-09-26',
    paymentMethod: 'Abono en Cuenta',
    status: 'completed',
  },
  {
    id: 'tx-003',
    description: 'Infraestructura Cloud & Servidores',
    merchant: 'AWS Cloud Services',
    amount: 280000,
    type: 'expense',
    category: 'Technology',
    date: '2026-09-27',
    paymentMethod: 'Visa Signature ···· 4821',
    status: 'completed',
  },
  {
    id: 'tx-004',
    description: 'Mercado Mensual & Despensa Orgánica',
    merchant: 'Supermercados Carulla',
    amount: 385000,
    type: 'expense',
    category: 'Groceries',
    date: '2026-09-26',
    paymentMethod: 'Apple Pay ···· 9104',
    status: 'completed',
  },
  {
    id: 'tx-005',
    description: 'Monitor de Estudio & Periféricos',
    merchant: 'K-Tronix Store',
    amount: 720000,
    type: 'expense',
    category: 'Equipment',
    date: '2026-09-24',
    paymentMethod: 'Mastercard Debit ···· 2099',
    status: 'completed',
  },
  {
    id: 'tx-006',
    description: 'Membresía Gimnasio & Bienestar',
    merchant: 'Bodytech Club',
    amount: 160000,
    type: 'expense',
    category: 'Health & Wellness',
    date: '2026-09-22',
    paymentMethod: 'Débito Automático ···· 4821',
    status: 'completed',
  },
  {
    id: 'tx-007',
    description: 'Internet Fibra Óptica 500 Mbps',
    merchant: 'ETB Fibra Óptica',
    amount: 115000,
    type: 'expense',
    category: 'Utilities',
    date: '2026-09-20',
    paymentMethod: 'Débito Automático ···· 4821',
    status: 'completed',
  },
  {
    id: 'tx-008',
    description: 'Café de Especialidad & Desayuno',
    merchant: 'Café San Alberto',
    amount: 28000,
    type: 'expense',
    category: 'Dining',
    date: '2026-09-20',
    paymentMethod: 'Apple Pay ···· 9104',
    status: 'completed',
  },
  {
    id: 'tx-009',
    description: 'Libros de Arquitectura de Software',
    merchant: 'Librería Lerner',
    amount: 95000,
    type: 'expense',
    category: 'Education',
    date: '2026-09-18',
    paymentMethod: 'Visa Débito ···· 2099',
    status: 'completed',
  },
  {
    id: 'tx-010',
    description: 'Canon de Arrendamiento - Septiembre',
    merchant: 'Inmobiliaria Residencial',
    amount: 1650000,
    type: 'expense',
    category: 'Housing',
    date: '2026-09-01',
    paymentMethod: 'Transferencia ACH',
    status: 'completed',
  },
];

export const INITIAL_BUDGETS: BudgetCategory[] = [
  {
    id: 'b-housing',
    name: 'Housing & Residence',
    allocated: 1700000,
    spent: 1650000,
    color: '#0D9488', // Teal
    iconName: 'Home',
  },
  {
    id: 'b-food',
    name: 'Groceries & Dining',
    allocated: 650000,
    spent: 413000,
    color: '#3B82F6', // Blue
    iconName: 'Utensils',
  },
  {
    id: 'b-tech',
    name: 'Technology & Cloud',
    allocated: 350000,
    spent: 280000,
    color: '#8B5CF6', // Purple
    iconName: 'Cpu',
  },
  {
    id: 'b-wellness',
    name: 'Health & Wellness',
    allocated: 200000,
    spent: 160000,
    color: '#10B981', // Emerald
    iconName: 'Activity',
  },
  {
    id: 'b-transport',
    name: 'Transit & Mobility',
    allocated: 250000,
    spent: 140000,
    color: '#F59E0B', // Amber
    iconName: 'Navigation',
  },
  {
    id: 'b-lifestyle',
    name: 'Culture & Equipment',
    allocated: 850000,
    spent: 815000,
    color: '#EC4899', // Pink
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
    color: '#10B981', // Emerald
  },
  {
    id: 'g-portfolio',
    name: 'Portafolio Renta Variable Global',
    targetAmount: 40000000,
    currentAmount: 31200000,
    targetDate: '2027-06-30',
    category: 'Wealth',
    color: '#0D9488', // Teal
  },
  {
    id: 'g-travel',
    name: 'Viaje Internacional Cultural',
    targetAmount: 10000000,
    currentAmount: 6800000,
    targetDate: '2027-04-15',
    category: 'Lifestyle',
    color: '#6366F1', // Indigo
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
    title: 'Aceleración en la Tasa de Ahorro',
    description: 'Tu tasa de ahorro del 54.5% supera el promedio histórico de los últimos 6 meses (50.2%). A este ritmo, tu fondo de reserva se completará 3 semanas antes de lo proyectado.',
    category: 'savings',
    type: 'positive',
    impactAmount: 4117000,
    date: '2026-09-29',
  },
  {
    id: 'ins-002',
    title: 'Optimización de Servicios Cloud',
    description: 'El gasto recurrente en infraestructura de servidores disminuyó un 18.5% tras la consolidación de instancias este trimestre.',
    category: 'recurring',
    type: 'positive',
    impactAmount: -85000,
    date: '2026-09-28',
  },
  {
    id: 'ins-003',
    title: 'Cultura & Equipamiento Cerca del Límite',
    description: 'La adquisición en hardware llevó esta categoría al 95.8% del techo presupuestal ($815.000 / $850.000). El saldo disponible para septiembre es de $35.000.',
    category: 'budget',
    type: 'attention',
    impactAmount: 815000,
    date: '2026-09-27',
  },
  {
    id: 'ins-004',
    title: 'Rendimientos de Inversión',
    description: 'La distribución trimestral del fondo generó $750.000, reinvertidos de forma automática en acumulación de capital.',
    category: 'spending',
    type: 'neutral',
    impactAmount: 750000,
    date: '2026-09-26',
  },
];

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

