// ============================================================================
// NOVA - Utilidades de formato
// ============================================================================

/**
 * Formatea un numero como moneda colombiana (COP).
 * Ejemplos:
 *   formatCurrency(50000)     -> "$50.000"
 *   formatCurrency(-1500)     -> "-$1.500"
 *   formatCurrency(0)         -> "$0"
 */
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

/**
 * Formatea un porcentaje con signo.
 * Ejemplos:
 *   formatPercentage(54.5)   -> "+54.5%"
 *   formatPercentage(-2.8)   -> "-2.8%"
 */
export function formatPercentage(rate: number): string {
  return `${rate >= 0 ? '+' : ''}${rate.toFixed(1)}%`;
}