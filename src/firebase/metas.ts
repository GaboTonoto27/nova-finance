import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db, auth, assertFirebaseConfigured } from './config';
import { MetaAhorro } from '../types/finance';

// ============================================================================
// NOVA v0.3.4 - Servicio de metas de ahorro en Firestore
// ============================================================================
// Ruta: /users/{userId}/goals/{goalId}

function obtenerUidActual(): string {
  assertFirebaseConfigured();
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Debes iniciar sesion para realizar esta accion.');
  }
  return user.uid;
}

function metasRef(uid: string) {
  return collection(db, 'users', uid, 'goals');
}

function limpiarUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const limpio: Partial<T> = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key) && obj[key] !== undefined) {
      limpio[key] = obj[key];
    }
  }
  return limpio;
}

export async function crearMeta(
  datos: Omit<MetaAhorro, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const uid = obtenerUidActual();

  if (!datos.nombre || datos.nombre.trim().length === 0) {
    throw new Error('El nombre de la meta es obligatorio.');
  }
  if (typeof datos.montoObjetivo !== 'number' || datos.montoObjetivo <= 0) {
    throw new Error('El monto objetivo debe ser mayor a cero.');
  }

  const ahora = new Date().toISOString();
  const payload = limpiarUndefined({
    ...datos,
    userId: uid,
    montoActual: datos.montoActual || 0,
    completada: false,
    createdAt: ahora,
    updatedAt: ahora,
  });

  try {
    const ref = await addDoc(metasRef(uid), payload);
    return ref.id;
  } catch (error) {
    console.error('Error al crear meta:', error);
    throw new Error('No se pudo guardar la meta. Intenta de nuevo.');
  }
}

export async function obtenerMetas(): Promise<MetaAhorro[]> {
  const uid = obtenerUidActual();
  try {
    const q = query(metasRef(uid), orderBy('createdAt', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<MetaAhorro, 'id'>),
    }));
  } catch (error) {
    console.error('Error al obtener metas:', error);
    throw new Error('No se pudieron cargar las metas.');
  }
}

export async function actualizarMeta(
  id: string,
  datos: Partial<Omit<MetaAhorro, 'id' | 'userId' | 'createdAt'>>
): Promise<void> {
  const uid = obtenerUidActual();
  try {
    const ref = doc(db, 'users', uid, 'goals', id);
    await updateDoc(
      ref,
      limpiarUndefined({
        ...datos,
        updatedAt: new Date().toISOString(),
      })
    );
  } catch (error) {
    console.error('Error al actualizar meta:', error);
    throw new Error('No se pudo actualizar la meta.');
  }
}

export async function eliminarMeta(id: string): Promise<void> {
  const uid = obtenerUidActual();
  try {
    const ref = doc(db, 'users', uid, 'goals', id);
    await deleteDoc(ref);
  } catch (error) {
    console.error('Error al eliminar meta:', error);
    throw new Error('No se pudo eliminar la meta.');
  }
}

export function observarMetas(
  callback: (metas: MetaAhorro[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const uid = obtenerUidActual();
  const q = query(metasRef(uid), orderBy('createdAt', 'asc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const metas: MetaAhorro[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<MetaAhorro, 'id'>),
      }));
      callback(metas);
    },
    (error) => {
      console.error('Error en observador de metas:', error);
      if (onError) {
        onError(new Error('No se pudieron sincronizar las metas.'));
      }
    }
  );
}