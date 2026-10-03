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

export type CategoriaGasto = string;
export type CategoriaIngreso = string;
export type CategoriaFinanciera = string;

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
  activa: boolean;
  desactivadaEn?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Tipos para Categorias (Firestore)
// ============================================================================

export interface Categoria {
  id?: string;
  userId: string;
  tipo: 'gasto' | 'ingreso';
  nombre: string;
  slug: string;
  color: string;
  iconName: string;
  esPredeterminada: boolean;
  activa: boolean;
  desactivadaEn?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Tipos para Saldo Inicial (con periodo configurable)
// ============================================================================

/**
 * Periodo de actualizacion del saldo inicial.
 * - mensual: el usuario puede actualizarlo el 1° de cada mes.
 * - quincenal: el usuario puede actualizarlo el 1° y 15 de cada mes.
 * - anual: el usuario puede actualizarlo el 1° de enero.
 */
export type PeriodoActualizacion = 'mensual' | 'quincenal' | 'anual';

export interface EntradaHistorialSaldo {
  monto: number;
  fecha: string;
  periodo: PeriodoActualizacion;
}

/**
 * Configuracion completa del saldo inicial del usuario.
 * Se guarda dentro del documento /users/{uid}.saldoInicial
 */
export interface SaldoInicialExtendido {
  monto: number;
  moneda: string;
  configurado: boolean;
  actualizadoEn: string;

  // Extension de v0.4.5.5
  periodoActualizacion: PeriodoActualizacion;
  proximaActualizacion: string; // ISO date
  ultimoCambioEn: string; // ISO date (para la ventana de 48h)
  historialSaldos: EntradaHistorialSaldo[];

  // Extension de v0.4.5.5b3 - Intentos de correccion
  intentosUsados: number; // 0-3 en el periodo actual
  intentosRenovadosEn: string; // ISO date del ultimo reset
}

/**
 * Maximo de intentos de correccion del saldo inicial por periodo.
 */
export const MAX_INTENTOS_SALDO_INICIAL = 3;

/**
 * Estado de edicion del saldo inicial.
 * - 'libre': puede editar sin restricciones (primeras 24h)
 * - 'confirmacion': puede editar pero requiere confirmacion (24-48h)
 * - 'bloqueado': bloqueado hasta proximaActualizacion
 */
export type EstadoEdicionSaldo = 'libre' | 'confirmacion' | 'bloqueado';

// ============================================================================
// Fin de tipos para Firestore
// ============================================================================