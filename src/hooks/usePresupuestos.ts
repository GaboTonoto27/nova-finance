import { useEffect, useState } from 'react';
import { observarPresupuestos } from '../firebase/presupuestos';
import { Presupuesto } from '../types/finance';

// ============================================================================
// NOVA v0.3.4 - Hook usePresupuestos
// ============================================================================
// Se suscribe en tiempo real a los presupuestos del usuario en Firestore.

export interface UsePresupuestosResult {
  presupuestos: Presupuesto[];
  cargando: boolean;
  error: string | null;
}

export function usePresupuestos(uid: string | null): UsePresupuestosResult {
  const [presupuestos, setPresupuestos] = useState<Presupuesto[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) {
      setPresupuestos([]);
      setCargando(false);
      setError(null);
      return;
    }

    setCargando(true);
    setError(null);

    let unsub: (() => void) | undefined;

    try {
      unsub = observarPresupuestos(
        (items) => {
          setPresupuestos(items);
          setCargando(false);
        },
        (err) => {
          console.error('Error en usePresupuestos:', err);
          setError(err.message);
          setCargando(false);
        }
      );
    } catch (err) {
      console.error('Error al suscribirse a presupuestos:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar presupuestos.');
      setCargando(false);
    }

    return () => {
      if (unsub) unsub();
    };
  }, [uid]);

  return { presupuestos, cargando, error };
}