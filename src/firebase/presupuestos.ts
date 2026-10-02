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
import { Presupuesto } from '../types/finance';

// ============================================================================
// NOVA v0.3.4 - Servicio de presupuestos en Firestore
// ============================================================================
// Ruta: /users/{userId}/budgets/{budgetId}

function obtenerUidActual(): string {
  assertFirebaseConfigured();
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Debes iniciar sesion para realizar esta accion.');
  }
  return user.uid;
}

function presupuestosRef(uid: string) {
  return collection(db, 'users', uid, 'budgets');
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

export async function crearPresupuesto(
  datos: Omit<Presupuesto, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const uid = obtenerUidActual();

  if (typeof datos.limite !== 'number' || datos.limite < 0) {
    throw new Error('El limite debe ser un numero mayor o igual a cero.');
  }

  const ahora = new Date().toISOString();
  const payload = limpiarUndefined({
    ...datos,
    userId: uid,
    createdAt: ahora,
    updatedAt: ahora,
  });

  try {
    const ref = await addDoc(presupuestosRef(uid), payload);
    return ref.id;
  } catch (error) {
    console.error('Error al crear presupuesto:', error);
    throw new Error('No se pudo guardar el presupuesto. Intenta de nuevo.');
  }
}

export async function obtenerPresupuestos(): Promise<Presupuesto[]> {
  const uid = obtenerUidActual();
  try {
    const q = query(presupuestosRef(uid), orderBy('createdAt', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Presupuesto, 'id'>),
    }));
  } catch (error) {
    console.error('Error al obtener presupuestos:', error);
    throw new Error('No se pudieron cargar los presupuestos.');
  }
}

export async function actualizarPresupuesto(
  id: string,
  datos: Partial<Omit<Presupuesto, 'id' | 'userId' | 'createdAt'>>
): Promise<void> {
  const uid = obtenerUidActual();
  try {
    const ref = doc(db, 'users', uid, 'budgets', id);
    await updateDoc(
      ref,
      limpiarUndefined({
        ...datos,
        updatedAt: new Date().toISOString(),
      })
    );
  } catch (error) {
    console.error('Error al actualizar presupuesto:', error);
    throw new Error('No se pudo actualizar el presupuesto.');
  }
}

export async function eliminarPresupuesto(id: string): Promise<void> {
  const uid = obtenerUidActual();
  try {
    const ref = doc(db, 'users', uid, 'budgets', id);
    await deleteDoc(ref);
  } catch (error) {
    console.error('Error al eliminar presupuesto:', error);
    throw new Error('No se pudo eliminar el presupuesto.');
  }
}

export function observarPresupuestos(
  callback: (presupuestos: Presupuesto[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const uid = obtenerUidActual();
  const q = query(presupuestosRef(uid), orderBy('createdAt', 'asc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const presupuestos: Presupuesto[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Presupuesto, 'id'>),
      }));
      callback(presupuestos);
    },
    (error) => {
      console.error('Error en observador de presupuestos:', error);
      if (onError) {
        onError(new Error('No se pudieron sincronizar los presupuestos.'));
      }
    }
  );
}

/**
 * Crea la plantilla inicial de presupuestos para un usuario nuevo.
 * Se llama una sola vez cuando el usuario se registra.
 */
export async function crearPresupuestosIniciales(): Promise<void> {
  const uid = obtenerUidActual();

  const plantilla: Omit<Presupuesto, 'id' | 'userId' | 'createdAt' | 'updatedAt'>[] = [
    { categoria: 'vivienda', limite: 0, gastado: 0, color: '#0D9488', iconName: 'Home' },
    { categoria: 'mercado', limite: 0, gastado: 0, color: '#3B82F6', iconName: 'ShoppingBag' },
    { categoria: 'transporte', limite: 0, gastado: 0, color: '#F59E0B', iconName: 'Car' },
    { categoria: 'tecnologia', limite: 0, gastado: 0, color: '#8B5CF6', iconName: 'Laptop' },
    { categoria: 'salud', limite: 0, gastado: 0, color: '#10B981', iconName: 'HeartPulse' },
    { categoria: 'ocio', limite: 0, gastado: 0, color: '#EC4899', iconName: 'Utensils' },
    { categoria: 'educacion', limite: 0, gastado: 0, color: '#6366F1', iconName: 'BookOpen' },
    { categoria: 'suscripciones', limite: 0, gastado: 0, color: '#14B8A6', iconName: 'Repeat' },
    { categoria: 'deudas', limite: 0, gastado: 0, color: '#EF4444', iconName: 'CreditCard' },
    { categoria: 'otro', limite: 0, gastado: 0, color: '#64748B', iconName: 'MoreHorizontal' },
  ];

  try {
    await Promise.all(
      plantilla.map((p) =>
        addDoc(presupuestosRef(uid), {
          ...p,
          userId: uid,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
      )
    );
  } catch (error) {
    console.error('Error al crear presupuestos iniciales:', error);
    throw new Error('No se pudieron crear los presupuestos iniciales.');
  }
}