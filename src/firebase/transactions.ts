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
import { Transaccion, TipoMovimiento, Moneda, CategoriaFinanciera } from '../types/finance';

// ============================================================================
// NOVA v0.3 - Servicio de transacciones en Firestore
// ============================================================================
// Todas las funciones trabajan sobre la coleccion:
//   /users/{userId}/transactions/{transactionId}
//
// Reglas:
// - Requieren usuario autenticado.
// - Validan los datos antes de escribir.
// - Cada usuario solo accede a sus propias transacciones.
// - Errores en espanol.
//
// Orden: por fecha descendente, con desempate por createdAt descendente.
// Esto garantiza que la ultima transaccion agregada siempre aparezca primero,
// incluso si tiene la misma fecha que otras.

const TIPOS_VALIDOS: TipoMovimiento[] = ['ingreso', 'gasto', 'transferencia', 'inversion'];
const MONEDAS_VALIDAS: Moneda[] = ['COP', 'USD', 'EUR', 'GBP'];
const CATEGORIAS_VALIDAS: CategoriaFinanciera[] = [
  // Gastos
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
  // Ingresos
  'sueldo',
  'freelance',
  'ventas',
  'regalos',
  'inversiones',
  'reembolsos',
  'prestamos',
  'otros',
  // Ahorro
  'ahorro',
];

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

function transaccionesRef(uid: string) {
  return collection(db, 'users', uid, 'transactions');
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

function validarTransaccion(
  datos: Omit<Transaccion, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): void {
  if (!datos.descripcion || datos.descripcion.trim().length === 0) {
    throw new Error('La descripcion es obligatoria.');
  }
  if (typeof datos.monto !== 'number' || datos.monto <= 0) {
    throw new Error('El monto debe ser un numero mayor a cero.');
  }
  if (!TIPOS_VALIDOS.includes(datos.tipo)) {
    throw new Error('El tipo de movimiento no es valido.');
  }
  if (!MONEDAS_VALIDAS.includes(datos.moneda)) {
    throw new Error('La moneda no es valida.');
  }
  if (!CATEGORIAS_VALIDAS.includes(datos.categoria)) {
    throw new Error('La categoria no es valida.');
  }
  if (!datos.fecha) {
    throw new Error('La fecha es obligatoria.');
  }
}

// ----------------------------------------------------------------------------
// API publica
// ----------------------------------------------------------------------------

/**
 * Crea una nueva transaccion para el usuario autenticado.
 * Devuelve el ID del documento creado.
 */
export async function crearTransaccion(
  datos: Omit<Transaccion, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const uid = obtenerUidActual();
  validarTransaccion(datos);

  const ahora = new Date().toISOString();
  const payload = limpiarUndefined({
    ...datos,
    userId: uid,
    createdAt: ahora,
    updatedAt: ahora,
  });

  try {
    const ref = await addDoc(transaccionesRef(uid), payload);
    return ref.id;
  } catch (error) {
    console.error('Error al crear transaccion:', error);
    throw new Error('No se pudo guardar la transaccion. Intenta de nuevo.');
  }
}

/**
 * Obtiene todas las transacciones del usuario autenticado,
 * ordenadas por fecha descendente, con desempate por createdAt.
 */
export async function obtenerTransacciones(): Promise<Transaccion[]> {
  const uid = obtenerUidActual();
  try {
    const q = query(
      transaccionesRef(uid),
      orderBy('fecha', 'desc'),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Transaccion, 'id'>),
    }));
  } catch (error) {
    console.error('Error al obtener transacciones:', error);
    throw new Error('No se pudieron cargar las transacciones.');
  }
}

/**
 * Obtiene una transaccion especifica por su ID.
 * Devuelve null si no existe.
 */
export async function obtenerTransaccionPorId(id: string): Promise<Transaccion | null> {
  const uid = obtenerUidActual();
  try {
    const ref = doc(db, 'users', uid, 'transactions', id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return { id: snap.id, ...(snap.data() as Omit<Transaccion, 'id'>) };
  } catch (error) {
    console.error('Error al obtener transaccion:', error);
    throw new Error('No se pudo cargar la transaccion.');
  }
}

/**
 * Actualiza campos de una transaccion existente.
 * Siempre actualiza updatedAt.
 */
export async function actualizarTransaccion(
  id: string,
  datos: Partial<Omit<Transaccion, 'id' | 'userId' | 'createdAt'>>
): Promise<void> {
  const uid = obtenerUidActual();
  try {
    const ref = doc(db, 'users', uid, 'transactions', id);
    await updateDoc(
      ref,
      limpiarUndefined({
        ...datos,
        updatedAt: new Date().toISOString(),
      })
    );
  } catch (error) {
    console.error('Error al actualizar transaccion:', error);
    throw new Error('No se pudo actualizar la transaccion.');
  }
}

/**
 * Elimina una transaccion por su ID.
 */
export async function eliminarTransaccion(id: string): Promise<void> {
  const uid = obtenerUidActual();
  try {
    const ref = doc(db, 'users', uid, 'transactions', id);
    await deleteDoc(ref);
  } catch (error) {
    console.error('Error al eliminar transaccion:', error);
    throw new Error('No se pudo eliminar la transaccion.');
  }
}

/**
 * Observa en tiempo real las transacciones del usuario.
 * Ordenadas por fecha descendente, con desempate por createdAt.
 * Devuelve una funcion para cancelar la suscripcion.
 */
export function observarTransacciones(
  callback: (transacciones: Transaccion[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const uid = obtenerUidActual();
  const q = query(
    transaccionesRef(uid),
    orderBy('fecha', 'desc'),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const transacciones: Transaccion[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Transaccion, 'id'>),
      }));
      callback(transacciones);
    },
    (error) => {
      console.error('Error en observador de transacciones:', error);
      if (onError) {
        onError(new Error('No se pudieron sincronizar las transacciones en tiempo real.'));
      }
    }
  );
}