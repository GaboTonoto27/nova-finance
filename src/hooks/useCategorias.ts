import { useEffect, useMemo, useState } from 'react';
import { observarCategorias, obtenerCategoriasRecuperables } from '../firebase/categorias';
import { Categoria } from '../types/finance';

// ============================================================================
// NOVA v0.4.2 - Hook useCategorias
// ============================================================================
// Se suscribe en tiempo real a las categorias del usuario en Firestore.

export interface UseCategoriasResult {
  categorias: Categoria[];
  categoriasGasto: Categoria[];
  categoriasIngreso: Categoria[];
  categoriasRecuperables: Categoria[];
  cargando: boolean;
  error: string | null;
}

export function useCategorias(uid: string | null): UseCategoriasResult {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) {
      setCategorias([]);
      setCargando(false);
      setError(null);
      return;
    }

    setCargando(true);
    setError(null);

    let unsub: (() => void) | undefined;

    try {
      unsub = observarCategorias(
        (items) => {
          setCategorias(items);
          setCargando(false);
        },
        (err) => {
          console.error('Error en useCategorias:', err);
          setError(err.message);
          setCargando(false);
        }
      );
    } catch (err) {
      console.error('Error al suscribirse a categorias:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar categorias.');
      setCargando(false);
    }

    return () => {
      if (unsub) unsub();
    };
  }, [uid]);

  const categoriasActivas = useMemo(
    () => categorias.filter((c) => c.activa),
    [categorias]
  );

  const categoriasGasto = useMemo(
    () => categoriasActivas.filter((c) => c.tipo === 'gasto'),
    [categoriasActivas]
  );

  const categoriasIngreso = useMemo(
    () => categoriasActivas.filter((c) => c.tipo === 'ingreso'),
    [categoriasActivas]
  );

  const categoriasRecuperables = useMemo(
    () => obtenerCategoriasRecuperables(categorias),
    [categorias]
  );

  return {
    categorias,
    categoriasGasto,
    categoriasIngreso,
    categoriasRecuperables,
    cargando,
    error,
  };
}