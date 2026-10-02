export type NavigationRoute =
  | 'dashboard'
  | 'transactions'
  | 'budgets'
  | 'goals'
  | 'analytics'
  | 'insights'
  | 'settings';

export type CurrencyCode = 'COP' | 'USD' | 'EUR' | 'GBP';

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  description: string;
  merchant: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
  paymentMethod: string;
  status: 'completed' | 'pending';
  notes?: string;
}

export interface BudgetCategory {
  id: string;
  name: string;
  allocated: number;
  spent: number;
  color: string;
  iconName: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  category: string;
  color: string;
}

export interface CashFlowMonth {
  month: string;
  income: number;
  expenses: number;
  savings: number;
}

export interface FinancialInsight {
  id: string;
  title: string;
  description: string;
  category: 'savings' | 'spending' | 'budget' | 'recurring';
  type: 'positive' | 'attention' | 'neutral';
  impactAmount?: number;
  date: string;
}

export interface FinancialSummary {
  currentBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
  incomeChangePercentage: number;
  expensesChangePercentage: number;
  balanceChangePercentage: number;
}

// ============================================================================
// NOVA v0.3 - Tipos para Firestore (Espanol)
// ============================================================================

export type TipoMovimiento = 'ingreso' | 'gasto' | 'transferencia' | 'inversion';

export type Moneda = 'COP' | 'USD' | 'EUR' | 'GBP';

export type MedioPago =
  | 'efectivo'
  | 'tarjeta_debito'
  | 'tarjeta_credito'
  | 'transferencia'
  | 'nequi'
  | 'daviplata'
  | 'paypal'
  | 'otro';

// Categorias para GASTOS
export type CategoriaGasto =
  | 'vivienda'
  | 'mercado'
  | 'transporte'
  | 'tecnologia'
  | 'salud'
  | 'educacion'
  | 'ocio'
  | 'suscripciones'
  | 'deudas'
  | 'otro';

// Categorias para INGRESOS
export type CategoriaIngreso =
  | 'sueldo'
  | 'freelance'
  | 'ventas'
  | 'regalos'
  | 'inversiones'
  | 'reembolsos'
  | 'prestamos'
  | 'otros';

// Union de todas las categorias
export type CategoriaFinanciera = CategoriaGasto | CategoriaIngreso | 'ahorro';

export interface Transaccion {
  id?: string;
  userId: string;
  tipo: TipoMovimiento;
  monto: number;
  moneda: Moneda;
  categoria: CategoriaFinanciera;
  descripcion: string;
  fecha: string;
  medioPago?: MedioPago;
  tarjetaId?: string;
  tarjetaNombre?: string;
  tipoInversion?: string;
  contraparte?: string;
  nota?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Tarjeta {
  id?: string;
  userId: string;
  nombre: string;
  tipo: 'debito' | 'credito';
  ultimos4: string;
  banco: string;
  cupoTotal?: number;
  cupoDisponible?: number;
  activa: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SaldoInicialConfig {
  monto: number;
  moneda: string;
  configurado: boolean;
  actualizadoEn: string;
}

// ============================================================================
// Tipos para Presupuestos y Metas (Firestore)
// ============================================================================

/**
 * Presupuesto mensual por categoria.
 * Ruta: /users/{userId}/budgets/{budgetId}
 */
export interface Presupuesto {
  id?: string;
  userId: string;
  categoria: CategoriaGasto;
  limite: number;
  gastado: number;
  color: string;
  iconName: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Meta de ahorro personalizada.
 * Ruta: /users/{userId}/goals/{goalId}
 */
export interface MetaAhorro {
  id?: string;
  userId: string;
  nombre: string;
  montoObjetivo: number;
  montoActual: number;
  fechaObjetivo: string;
  categoria: 'seguridad' | 'inversion' | 'viaje' | 'compra' | 'otro';
  color: string;
  iconName: string;
  completada: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Fin de tipos para Firestore
// ============================================================================