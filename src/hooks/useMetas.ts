import { useEffect, useState } from 'react';
import { observarMetas } from '../firebase/metas';
import { MetaAhorro } from '../types/finance';

// ============================================================================
// NOVA v0.3.4 - Hook useMetas
// ============================================================================
// Se suscribe en tiempo real a las metas de ahorro del usuario en Firestore.

export interface UseMetasResult {
  metas: MetaAhorro[];
  cargando: boolean;
  error: string | null;
}

export function useMetas(uid: string | null): UseMetasResult {
  const [metas, setMetas] = useState<MetaAhorro[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) {
      setMetas([]);
      setCargando(false);
      setError(null);
      return;
    }

    setCargando(true);
    setError(null);

    let unsub: (() => void) | undefined;

    try {
      unsub = observarMetas(
        (items) => {
          setMetas(items);
          setCargando(false);
        },
        (err) => {
          console.error('Error en useMetas:', err);
          setError(err.message);
          setCargando(false);
        }
      );
    } catch (err) {
      console.error('Error al suscribirse a metas:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar metas.');
      setCargando(false);
    }

    return () => {
      if (unsub) unsub();
    };
  }, [uid]);

  return { metas, cargando, error };
}