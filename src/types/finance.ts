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
// NOVA v0.3 — Tipos para Firestore (Espanol)
// ============================================================================
// Estos tipos representan el modelo de datos que se persiste en Firestore.
// Conviven temporalmente con los tipos mock (Transaction, BudgetCategory, etc.)
// que seran migrados progresivamente en las fases 03.2 -> 03.4.

/**
 * Tipo de movimiento financiero que un usuario puede registrar.
 * - ingreso: dinero que entra (salario, rendimientos, ventas, etc.)
 * - gasto: dinero que sale (compras, servicios, etc.)
 * - transferencia: movimiento entre cuentas propias
 * - inversion: dinero destinado a inversion (no es gasto, es traslado)
 */
export type TipoMovimiento = 'ingreso' | 'gasto' | 'transferencia' | 'inversion';

/**
 * Monedas soportadas por NOVA. COP es la moneda por defecto.
 * Se prepara el sistema para futuras conversiones multi-moneda.
 */
export type Moneda = 'COP' | 'USD' | 'EUR' | 'GBP';

/**
 * Medio de pago utilizado en un movimiento.
 * Permite analisis detallados por tipo de pago en fases posteriores.
 */
export type MedioPago =
  | 'efectivo'
  | 'tarjeta_debito'
  | 'tarjeta_credito'
  | 'transferencia'
  | 'nequi'
  | 'daviplata'
  | 'paypal'
  | 'otro';

/**
 * Categorias financieras predefinidas para clasificar movimientos.
 * Reemplazan a las categorias en ingles del modelo mock (Housing, Groceries, etc.).
 */
export type CategoriaFinanciera =
  | 'vivienda'
  | 'mercado'
  | 'transporte'
  | 'tecnologia'
  | 'salud'
  | 'educacion'
  | 'ocio'
  | 'inversiones'
  | 'suscripciones'
  | 'deudas'
  | 'ahorro'
  | 'otro';

/**
 * Transaccion financiera persistida en Firestore.
 * Ruta: /users/{userId}/transactions/{transactionId}
 *
 * El campo `fecha` se guarda como string ISO 8601 (ej. "2026-10-01T14:30:00.000Z")
 * para mantener consistencia con PerfilUsuario.
 */
export interface Transaccion {
  id?: string;
  userId: string;
  tipo: TipoMovimiento;
  monto: number; // siempre positivo
  moneda: Moneda;
  categoria: CategoriaFinanciera;
  descripcion: string;
  fecha: string; // ISO 8601
  medioPago?: MedioPago;
  tarjetaId?: string;
  tarjetaNombre?: string;
  tipoInversion?: string; // "Renta fija", "Acciones", "Cripto", etc.
  contraparte?: string; // para transferencias
  nota?: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

/**
 * Tarjeta financiera del usuario (debito, credito, etc.).
 * Ruta: /users/{userId}/cards/{cardId}
 */
export interface Tarjeta {
  id?: string;
  userId: string;
  nombre: string; // ej. "Visa Debito Bancolombia"
  tipo: 'debito' | 'credito';
  ultimos4: string; // 4 digitos (nunca el numero completo)
  banco: string; // ej. "Bancolombia", "Nu", "Davivienda"
  cupoTotal?: number; // solo para credito
  cupoDisponible?: number; // solo para credito
  activa: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Fin de tipos para Firestore
// ============================================================================