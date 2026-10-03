import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db, auth, assertFirebaseConfigured } from './config';
import { Categoria } from '../types/finance';

// ============================================================================
// NOVA v0.4.2 - Servicio de categorias en Firestore
// ============================================================================
// Ruta: /users/{userId}/categorias/{categoriaId}
//
// Sistema de soft delete:
// - Al "eliminar" una categoria, se marca activa: false.
// - El documento NO se borra, solo se oculta de la UI.
// - El usuario tiene 7 dias para "restaurarla".
// - Despues de 7 dias, se oculta del panel de recuperacion pero persiste.

const DIAS_RECUPERACION = 7;

function obtenerUidActual(): string {
  assertFirebaseConfigured();
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Debes iniciar sesion para realizar esta accion.');
  }
  return user.uid;
}

function categoriasRef(uid: string) {
  return collection(db, 'users', uid, 'categorias');
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

/**
 * Convierte un nombre a slug (minusculas, sin espacios, con guiones bajos).
 */
export function slugificar(nombre: string): string {
  return nombre
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
}

// ----------------------------------------------------------------------------
// Seed inicial
// ----------------------------------------------------------------------------

const CATEGORIAS_GASTO_SEED: { nombre: string; color: string; iconName: string }[] = [
  { nombre: 'Vivienda', color: '#0D9488', iconName: 'Home' },
  { nombre: 'Mercado', color: '#3B82F6', iconName: 'ShoppingBag' },
  { nombre: 'Transporte', color: '#F59E0B', iconName: 'Car' },
  { nombre: 'Tecnologia', color: '#8B5CF6', iconName: 'Laptop' },
  { nombre: 'Salud', color: '#10B981', iconName: 'HeartPulse' },
  { nombre: 'Educacion', color: '#6366F1', iconName: 'BookOpen' },
  { nombre: 'Ocio', color: '#EC4899', iconName: 'Utensils' },
  { nombre: 'Suscripciones', color: '#14B8A6', iconName: 'Repeat' },
  { nombre: 'Deudas', color: '#EF4444', iconName: 'CreditCard' },
  { nombre: 'Otro', color: '#64748B', iconName: 'MoreHorizontal' },
];

const CATEGORIAS_INGRESO_SEED: { nombre: string; color: string; iconName: string }[] = [
  { nombre: 'Sueldo', color: '#0D9488', iconName: 'Briefcase' },
  { nombre: 'Freelance', color: '#3B82F6', iconName: 'Laptop' },
  { nombre: 'Ventas', color: '#F59E0B', iconName: 'TrendingUp' },
  { nombre: 'Regalos', color: '#EC4899', iconName: 'Gift' },
  { nombre: 'Inversiones', color: '#10B981', iconName: 'TrendingUp' },
  { nombre: 'Reembolsos', color: '#6366F1', iconName: 'Repeat' },
  { nombre: 'Prestamos', color: '#8B5CF6', iconName: 'HandCoins' },
  { nombre: 'Otros ingresos', color: '#64748B', iconName: 'CircleDollarSign' },
];

/**
 * Crea las categorias predeterminadas para un usuario nuevo.
 * Se llama una sola vez cuando el usuario se registra.
 */
export async function crearCategoriasIniciales(): Promise<void> {
  const uid = obtenerUidActual();

  const ahora = new Date().toISOString();

  const categoriasGasto = CATEGORIAS_GASTO_SEED.map((c) => ({
    userId: uid,
    tipo: 'gasto' as const,
    nombre: c.nombre,
    slug: slugificar(c.nombre),
    color: c.color,
    iconName: c.iconName,
    esPredeterminada: true,
    activa: true,
    createdAt: ahora,
    updatedAt: ahora,
  }));

  const categoriasIngreso = CATEGORIAS_INGRESO_SEED.map((c) => ({
    userId: uid,
    tipo: 'ingreso' as const,
    nombre: c.nombre,
    slug: slugificar(c.nombre),
    color: c.color,
    iconName: c.iconName,
    esPredeterminada: true,
    activa: true,
    createdAt: ahora,
    updatedAt: ahora,
  }));

  try {
    await Promise.all(
      [...categoriasGasto, ...categoriasIngreso].map((c) =>
        addDoc(categoriasRef(uid), c)
      )
    );
  } catch (error) {
    console.error('Error al crear categorias iniciales:', error);
    throw new Error('No se pudieron crear las categorias iniciales.');
  }
}

// ----------------------------------------------------------------------------
// CRUD
// ----------------------------------------------------------------------------

/**
 * Crea una nueva categoria personalizada (custom) del usuario.
 */
export async function crearCategoria(datos: {
  tipo: 'gasto' | 'ingreso';
  nombre: string;
  color: string;
  iconName: string;
}): Promise<string> {
  const uid = obtenerUidActual();

  if (!datos.nombre || datos.nombre.trim().length < 2) {
    throw new Error('El nombre de la categoria debe tener al menos 2 caracteres.');
  }

  const ahora = new Date().toISOString();
  const payload = limpiarUndefined({
    userId: uid,
    tipo: datos.tipo,
    nombre: datos.nombre.trim(),
    slug: slugificar(datos.nombre),
    color: datos.color,
    iconName: datos.iconName,
    esPredeterminada: false,
    activa: true,
    createdAt: ahora,
    updatedAt: ahora,
  });

  try {
    const ref = await addDoc(categoriasRef(uid), payload);
    return ref.id;
  } catch (error) {
    console.error('Error al crear categoria:', error);
    throw new Error('No se pudo guardar la categoria. Intenta de nuevo.');
  }
}

/**
 * Actualiza una categoria existente.
 */
export async function actualizarCategoria(
  id: string,
  datos: Partial<Pick<Categoria, 'nombre' | 'color' | 'iconName'>>
): Promise<void> {
  const uid = obtenerUidActual();
  try {
    const ref = doc(db, 'users', uid, 'categorias', id);
    const updates: Record<string, unknown> = {
      ...datos,
      updatedAt: new Date().toISOString(),
    };
    if (datos.nombre) {
      updates.slug = slugificar(datos.nombre);
    }
    await updateDoc(ref, limpiarUndefined(updates));
  } catch (error) {
    console.error('Error al actualizar categoria:', error);
    throw new Error('No se pudo actualizar la categoria.');
  }
}

/**
 * Soft delete: marca la categoria como inactiva (no la borra).
 * Se guarda `desactivadaEn` para la ventana de recuperacion.
 */
export async function eliminarCategoria(id: string): Promise<void> {
  const uid = obtenerUidActual();
  try {
    const ref = doc(db, 'users', uid, 'categorias', id);
    await updateDoc(ref, {
      activa: false,
      desactivadaEn: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error al eliminar categoria:', error);
    throw new Error('No se pudo eliminar la categoria.');
  }
}

/**
 * Restaura una categoria soft-deleted.
 */
export async function restaurarCategoria(id: string): Promise<void> {
  const uid = obtenerUidActual();
  try {
    const ref = doc(db, 'users', uid, 'categorias', id);
    await updateDoc(ref, {
      activa: true,
      desactivadaEn: null,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error al restaurar categoria:', error);
    throw new Error('No se pudo restaurar la categoria.');
  }
}

/**
 * Elimina definitivamente una categoria (hard delete).
 * Solo se usa cuando el usuario ya no puede recuperarla (despues de 7 dias).
 */
export async function eliminarCategoriaDefinitiva(id: string): Promise<void> {
  const uid = obtenerUidActual();
  try {
    const { deleteDoc: deleteDocFn } = await import('firebase/firestore');
    const ref = doc(db, 'users', uid, 'categorias', id);
    await deleteDocFn(ref);
  } catch (error) {
    console.error('Error al eliminar definitivamente la categoria:', error);
    throw new Error('No se pudo eliminar la categoria.');
  }
}

/**
 * Observa en tiempo real las categorias del usuario.
 */
export function observarCategorias(
  callback: (categorias: Categoria[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const uid = obtenerUidActual();
  const q = query(categoriasRef(uid), orderBy('createdAt', 'asc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const categorias: Categoria[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Categoria, 'id'>),
      }));
      callback(categorias);
    },
    (error) => {
      console.error('Error en observador de categorias:', error);
      if (onError) {
        onError(new Error('No se pudieron sincronizar las categorias.'));
      }
    }
  );
}

// ----------------------------------------------------------------------------
// Helpers de recuperacion
// ----------------------------------------------------------------------------

/**
 * Devuelve las categorias eliminadas que aun estan en la ventana de recuperacion.
 */
export function obtenerCategoriasRecuperables(
  categorias: Categoria[]
): Categoria[] {
  const ahora = new Date();
  const msEnUnaSemana = DIAS_RECUPERACION * 24 * 60 * 60 * 1000;

  return categorias.filter((c) => {
    if (c.activa) return false;
    if (!c.desactivadaEn) return false;
    const desactivada = new Date(c.desactivadaEn);
    const diff = ahora.getTime() - desactivada.getTime();
    return diff < msEnUnaSemana;
  });
}

/**
 * Devuelve los dias restantes para recuperar una categoria.
 */
export function diasRestantesRecuperacion(categoria: Categoria): number {
  if (!categoria.desactivadaEn) return 0;
  const ahora = new Date();
  const desactivada = new Date(categoria.desactivadaEn);
  const msEnUnaSemana = DIAS_RECUPERACION * 24 * 60 * 60 * 1000;
  const diff = ahora.getTime() - desactivada.getTime();
  const restante = msEnUnaSemana - diff;
  return Math.max(0, Math.ceil(restante / (24 * 60 * 60 * 1000)));
}