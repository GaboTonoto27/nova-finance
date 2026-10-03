import { useEffect, useMemo, useState } from 'react';
import { observarMetas, obtenerMetasRecuperables } from '../firebase/metas';
import { MetaAhorro } from '../types/finance';

// ============================================================================
// NOVA v0.4.3 - Hook useMetas
// ============================================================================
// Se suscribe en tiempo real a las metas del usuario en Firestore.
// Devuelve solo las metas activas + las recuperables por separado.

export interface UseMetasResult {
  metas: MetaAhorro[];
  metasRecuperables: MetaAhorro[];
  cargando: boolean;
  error: string | null;
}

export function useMetas(uid: string | null): UseMetasResult {
  const [todasLasMetas, setTodasLasMetas] = useState<MetaAhorro[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) {
      setTodasLasMetas([]);
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
          setTodasLasMetas(items);
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

  const metas = useMemo(
    () => todasLasMetas.filter((m) => m.activa !== false),
    [todasLasMetas]
  );

  const metasRecuperables = useMemo(
    () => obtenerMetasRecuperables(todasLasMetas),
    [todasLasMetas]
  );

  return { metas, metasRecuperables, cargando, error };
}