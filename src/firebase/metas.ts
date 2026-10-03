import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  query,
  orderBy,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db, auth, assertFirebaseConfigured } from './config';
import { MetaAhorro } from '../types/finance';

// ============================================================================
// NOVA v0.4.3 - Servicio de metas de ahorro en Firestore
// ============================================================================
// Ruta: /users/{userId}/goals/{goalId}
//
// Sistema de soft delete:
// - Al "eliminar" una meta, se marca activa: false.
// - El documento NO se borra, solo se oculta de la UI.
// - El usuario tiene 7 dias para "restaurarla".

const DIAS_RECUPERACION = 7;

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

// ----------------------------------------------------------------------------
// CRUD
// ----------------------------------------------------------------------------

/**
 * Crea una nueva meta de ahorro para el usuario autenticado.
 */
export async function crearMeta(
  datos: Omit<
    MetaAhorro,
    'id' | 'userId' | 'createdAt' | 'updatedAt' | 'activa' | 'desactivadaEn'
  >
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
    activa: true,
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

/**
 * Obtiene todas las metas del usuario.
 */
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

/**
 * Actualiza una meta existente.
 */
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

/**
 * Soft delete: marca la meta como inactiva.
 */
export async function eliminarMeta(id: string): Promise<void> {
  const uid = obtenerUidActual();
  try {
    const ref = doc(db, 'users', uid, 'goals', id);
    await updateDoc(ref, {
      activa: false,
      desactivadaEn: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error al eliminar meta:', error);
    throw new Error('No se pudo eliminar la meta.');
  }
}

/**
 * Restaura una meta soft-deleted.
 */
export async function restaurarMeta(id: string): Promise<void> {
  const uid = obtenerUidActual();
  try {
    const ref = doc(db, 'users', uid, 'goals', id);
    await updateDoc(ref, {
      activa: true,
      desactivadaEn: null,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error al restaurar meta:', error);
    throw new Error('No se pudo restaurar la meta.');
  }
}

/**
 * Observa en tiempo real las metas del usuario.
 */
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

// ----------------------------------------------------------------------------
// Helpers de recuperacion
// ----------------------------------------------------------------------------

/**
 * Devuelve las metas eliminadas que aun estan en la ventana de recuperacion.
 */
export function obtenerMetasRecuperables(metas: MetaAhorro[]): MetaAhorro[] {
  const ahora = new Date();
  const msEnUnaSemana = DIAS_RECUPERACION * 24 * 60 * 60 * 1000;

  return metas.filter((m) => {
    if (m.activa !== false) return false;
    if (!m.desactivadaEn) return false;
    const desactivada = new Date(m.desactivadaEn);
    const diff = ahora.getTime() - desactivada.getTime();
    return diff < msEnUnaSemana;
  });
}

/**
 * Devuelve los dias restantes para recuperar una meta.
 */
export function diasRestantesRecuperacionMeta(meta: MetaAhorro): number {
  if (!meta.desactivadaEn) return 0;
  const ahora = new Date();
  const desactivada = new Date(meta.desactivadaEn);
  const msEnUnaSemana = DIAS_RECUPERACION * 24 * 60 * 60 * 1000;
  const diff = ahora.getTime() - desactivada.getTime();
  const restante = msEnUnaSemana - diff;
  return Math.max(0, Math.ceil(restante / (24 * 60 * 60 * 1000)));
}