import { Presupuesto, Transaction, CategoriaGasto } from '../types/finance';

// ============================================================================
// NOVA v0.4.1 - Calculo automatico de gastado por presupuesto
// ============================================================================
// Suma las transacciones de tipo 'gasto' cuya categoria coincide con el
// presupuesto, y devuelve el total gastado en esa categoria.

/**
 * Mapea una categoria legacy (ingles) al tipo nuevo en espanol.
 * Se usa porque las transacciones vienen con categoria en ingles.
 */
const CATEGORIA_LEGACY_A_NUEVA: Record<string, CategoriaGasto> = {
  Housing: 'vivienda',
  Groceries: 'mercado',
  Technology: 'tecnologia',
  'Health & Wellness': 'salud',
  'Transit & Mobility': 'transporte',
  'Culture & Equipment': 'ocio',
  Dining: 'ocio',
  Education: 'educacion',
  Utilities: 'vivienda',
  Equipment: 'tecnologia',
  General: 'otro',
};

/**
 * Convierte una categoria de transaccion (ingles) a CategoriaGasto (espanol).
 */
function normalizarCategoria(categoria: string): CategoriaGasto | null {
  // Si ya esta en espanol, devolverla directo
  const categoriasEspanol: CategoriaGasto[] = [
    'vivienda',
    'mercado',
    'transporte',
    'tecnologia',
    'salud',
    'educacion',
    'ocio',
    'suscripciones',
    'deudas',
    'otro',
  ];
  if (categoriasEspanol.includes(categoria as CategoriaGasto)) {
    return categoria as CategoriaGasto;
  }
  // Si esta en ingles, mapear
  return CATEGORIA_LEGACY_A_NUEVA[categoria] || null;
}

/**
 * Calcula cuanto se ha gastado en la categoria del presupuesto,
 * a partir de las transacciones del usuario.
 */
export function calcularGastado(
  presupuesto: Presupuesto,
  transacciones: Transaction[]
): number {
  return transacciones
    .filter((tx) => {
      if (tx.type !== 'expense') return false;
      const categoriaTx = normalizarCategoria(tx.category);
      return categoriaTx === presupuesto.categoria;
    })
    .reduce((sum, tx) => sum + tx.amount, 0);
}

/**
 * Devuelve un nuevo array de presupuestos con el campo 'gastado' recalculado.
 */
export function recalcularPresupuestos(
  presupuestos: Presupuesto[],
  transacciones: Transaction[]
): Presupuesto[] {
  return presupuestos.map((p) => ({
    ...p,
    gastado: calcularGastado(p, transacciones),
  }));
}

/**
 * Devuelve un array con info de los presupuestos que estan excedidos.
 */
export interface PresupuestoExcedido {
  presupuesto: Presupuesto;
  exceso: number; // cuanto se paso del limite
  porcentaje: number; // % del limite usado
}

export function obtenerPresupuestosExcedidos(
  presupuestos: Presupuesto[]
): PresupuestoExcedido[] {
  return presupuestos
    .filter((p) => p.limite > 0 && p.gastado > p.limite)
    .map((p) => ({
      presupuesto: p,
      exceso: p.gastado - p.limite,
      porcentaje: Math.round((p.gastado / p.limite) * 100),
    }));
}