// ============================================================================
// NOVA - Categorias financieras
// ============================================================================

/**
 * Categorias disponibles para GASTOS.
 * Usadas en: TransactionModal, PresupuestoModal, validaciones.
 */
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

/**
 * Categorias disponibles para INGRESOS.
 * Usadas en: TransactionModal (modo ingreso), validaciones.
 */
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