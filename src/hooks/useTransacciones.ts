import { useEffect, useState } from 'react';
import { observarTransacciones } from '../firebase/transactions';
import { Transaccion, Transaction, TipoMovimiento, CategoriaFinanciera } from '../types/finance';

// ============================================================================
// NOVA v0.3.3 - Hook useTransacciones
// ============================================================================
// Se suscribe en tiempo real a las transacciones del usuario en Firestore
// y las mapea al modelo Transaction (legacy) que consumen las vistas.
//
// IMPORTANTE: recibe el uid del usuario como parametro. Si es null,
// no intenta suscribirse (usuario no autenticado).

function tipoALegacy(tipo: TipoMovimiento): 'income' | 'expense' {
  return tipo === 'ingreso' ? 'income' : 'expense';
}

function categoriaALabel(cat: CategoriaFinanciera): string {
  const map: Record<CategoriaFinanciera, string> = {
    vivienda: 'Housing',
    mercado: 'Groceries',
    transporte: 'Transit & Mobility',
    tecnologia: 'Technology',
    salud: 'Health & Wellness',
    educacion: 'Education',
    ocio: 'Dining',
    inversiones: 'Investments',
    suscripciones: 'Utilities',
    deudas: 'General',
    ahorro: 'Investments',
    otro: 'General',
  };
  return map[cat] || 'General';
}

function medioPagoALabel(medioPago?: string, contraparte?: string): string {
  if (contraparte) return contraparte;
  if (!medioPago) return 'Otro';
  const map: Record<string, string> = {
    efectivo: 'Efectivo',
    tarjeta_debito: 'Tarjeta debito',
    tarjeta_credito: 'Tarjeta credito',
    transferencia: 'Transferencia',
    nequi: 'Nequi',
    daviplata: 'Daviplata',
    paypal: 'PayPal',
    otro: 'Otro',
  };
  return map[medioPago] || 'Otro';
}

function mapearTransaccion(t: Transaccion): Transaction {
  return {
    id: t.id || '',
    description: t.descripcion,
    merchant: t.contraparte || t.descripcion,
    amount: t.monto,
    type: tipoALegacy(t.tipo),
    category: categoriaALabel(t.categoria),
    date: t.fecha.split('T')[0], // YYYY-MM-DD
    paymentMethod: medioPagoALabel(t.medioPago, t.contraparte),
    status: 'completed',
    notes: t.nota,
  };
}

export interface UseTransaccionesResult {
  transacciones: Transaction[];
  cargando: boolean;
  error: string | null;
}

/**
 * Suscribe a las transacciones del usuario autenticado.
 * @param uid - UID del usuario (null si no esta autenticado)
 */
export function useTransacciones(uid: string | null): UseTransaccionesResult {
  const [transacciones, setTransacciones] = useState<Transaction[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Si no hay usuario, no hay nada que cargar
    if (!uid) {
      setTransacciones([]);
      setCargando(false);
      setError(null);
      return;
    }

    setCargando(true);
    setError(null);

    let unsub: (() => void) | undefined;

    try {
      unsub = observarTransacciones(
        (items) => {
          const mapeadas = items.map(mapearTransaccion);
          setTransacciones(mapeadas);
          setCargando(false);
        },
        (err) => {
          console.error('Error en useTransacciones:', err);
          setError(err.message);
          setCargando(false);
        }
      );
    } catch (err) {
      console.error('Error al suscribirse a transacciones:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar transacciones.');
      setCargando(false);
    }

    return () => {
      if (unsub) unsub();
    };
  }, [uid]);

  return { transacciones, cargando, error };
}