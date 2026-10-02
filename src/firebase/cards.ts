import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db, auth, assertFirebaseConfigured } from './config';
import { Tarjeta } from '../types/finance';

// ============================================================================
// NOVA v0.3 - Servicio de tarjetas en Firestore
// ============================================================================
// Todas las funciones trabajan sobre la coleccion:
//   /users/{userId}/cards/{cardId}
//
// Reglas:
// - Requieren usuario autenticado.
// - Validan los datos antes de escribir.
// - Nunca almacenar el numero completo de la tarjeta, solo los ultimos 4.
// - Errores en espanol.

// ----------------------------------------------------------------------------
// Helpers internos
// ----------------------------------------------------------------------------

function obtenerUidActual(): string {
  assertFirebaseConfigured();
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Debes iniciar sesion para realizar esta accion.');
  }
  return user.uid;
}

function tarjetasRef(uid: string) {
  return collection(db, 'users', uid, 'cards');
}

/**
 * Elimina las propiedades con valor `undefined` de un objeto.
 * Firestore rechaza documentos que contienen campos undefined.
 */
function limpiarUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const limpio: Partial<T> = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key) && obj[key] !== undefined) {
      limpio[key] = obj[key];
    }
  }
  return limpio;
}

function validarTarjeta(
  datos: Omit<Tarjeta, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): void {
  if (!datos.nombre || datos.nombre.trim().length === 0) {
    throw new Error('El nombre de la tarjeta es obligatorio.');
  }
  if (datos.tipo !== 'debito' && datos.tipo !== 'credito') {
    throw new Error('El tipo de tarjeta debe ser debito o credito.');
  }
  if (!datos.ultimos4 || !/^\d{4}$/.test(datos.ultimos4)) {
    throw new Error('Los ultimos 4 digitos deben ser exactamente 4 numeros.');
  }
  if (!datos.banco || datos.banco.trim().length === 0) {
    throw new Error('El banco es obligatorio.');
  }
  if (datos.tipo === 'credito') {
    if (typeof datos.cupoTotal !== 'number' || datos.cupoTotal <= 0) {
      throw new Error('Las tarjetas de credito requieren un cupo total mayor a cero.');
    }
  }
}

// ----------------------------------------------------------------------------
// API publica
// ----------------------------------------------------------------------------

/**
 * Crea una nueva tarjeta para el usuario autenticado.
 * Devuelve el ID del documento creado.
 */
export async function crearTarjeta(
  datos: Omit<Tarjeta, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const uid = obtenerUidActual();
  validarTarjeta(datos);

  const ahora = new Date().toISOString();
  const payload = limpiarUndefined({
    ...datos,
    userId: uid,
    activa: datos.activa ?? true,
    createdAt: ahora,
    updatedAt: ahora,
  });

  try {
    const ref = await addDoc(tarjetasRef(uid), payload);
    return ref.id;
  } catch (error) {
    console.error('Error al crear tarjeta:', error);
    throw new Error('No se pudo guardar la tarjeta. Intenta de nuevo.');
  }
}

/**
 * Obtiene todas las tarjetas del usuario autenticado,
 * ordenadas por fecha de creacion descendente.
 */
export async function obtenerTarjetas(): Promise<Tarjeta[]> {
  const uid = obtenerUidActual();
  try {
    const q = query(tarjetasRef(uid), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Tarjeta, 'id'>),
    }));
  } catch (error) {
    console.error('Error al obtener tarjetas:', error);
    throw new Error('No se pudieron cargar las tarjetas.');
  }
}

/**
 * Obtiene una tarjeta especifica por su ID.
 * Devuelve null si no existe.
 */
export async function obtenerTarjetaPorId(id: string): Promise<Tarjeta | null> {
  const uid = obtenerUidActual();
  try {
    const ref = doc(db, 'users', uid, 'cards', id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return { id: snap.id, ...(snap.data() as Omit<Tarjeta, 'id'>) };
  } catch (error) {
    console.error('Error al obtener tarjeta:', error);
    throw new Error('No se pudo cargar la tarjeta.');
  }
}

/**
 * Actualiza campos de una tarjeta existente.
 * Siempre actualiza updatedAt.
 */
export async function actualizarTarjeta(
  id: string,
  datos: Partial<Omit<Tarjeta, 'id' | 'userId' | 'createdAt'>>
): Promise<void> {
  const uid = obtenerUidActual();
  try {
    const ref = doc(db, 'users', uid, 'cards', id);
    await updateDoc(
      ref,
      limpiarUndefined({
        ...datos,
        updatedAt: new Date().toISOString(),
      })
    );
  } catch (error) {
    console.error('Error al actualizar tarjeta:', error);
    throw new Error('No se pudo actualizar la tarjeta.');
  }
}

/**
 * Elimina una tarjeta por su ID.
 */
export async function eliminarTarjeta(id: string): Promise<void> {
  const uid = obtenerUidActual();
  try {
    const ref = doc(db, 'users', uid, 'cards', id);
    await deleteDoc(ref);
  } catch (error) {
    console.error('Error al eliminar tarjeta:', error);
    throw new Error('No se pudo eliminar la tarjeta.');
  }
}

/**
 * Observa en tiempo real las tarjetas del usuario.
 * Devuelve una funcion para cancelar la suscripcion.
 */
export function observarTarjetas(
  callback: (tarjetas: Tarjeta[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const uid = obtenerUidActual();
  const q = query(tarjetasRef(uid), orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const tarjetas: Tarjeta[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Tarjeta, 'id'>),
      }));
      callback(tarjetas);
    },
    (error) => {
      console.error('Error en observador de tarjetas:', error);
      if (onError) {
        onError(new Error('No se pudieron sincronizar las tarjetas en tiempo real.'));
      }
    }
  );
}