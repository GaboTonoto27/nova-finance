import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db, auth, assertFirebaseConfigured } from './config';

export interface PerfilUsuario {
  uid: string;
  nombre: string;
  email: string;
  moneda: string;
  idioma: string;
  createdAt: string;
  updatedAt: string;
  fotoURL?: string;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const currentUser = auth?.currentUser;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentUser?.uid ?? null,
      email: currentUser?.email ?? null,
      emailVerified: currentUser?.emailVerified ?? null,
      isAnonymous: currentUser?.isAnonymous ?? null,
      tenantId: currentUser?.tenantId ?? null,
      providerInfo:
        currentUser?.providerData?.map((p) => ({
          providerId: p.providerId,
          email: p.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Obtiene el perfil de un usuario desde la colección /users/{uid} en Firestore
 */
export async function obtenerPerfilUsuario(uid: string): Promise<PerfilUsuario | null> {
  assertFirebaseConfigured();
  const path = `users/${uid}`;
  try {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      return null;
    }
    return snap.data() as PerfilUsuario;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

/**
 * Asegura la existencia del documento /users/{uid} en Firestore.
 * Solo lo crea la primera vez con los valores por defecto (moneda: 'COP', idioma: 'es').
 * En sesiones posteriores únicamente lee el documento existente.
 */
export async function asegurarDocumentoUsuario(
  uid: string,
  datos: { nombre: string; email: string; fotoURL?: string }
): Promise<PerfilUsuario> {
  assertFirebaseConfigured();
  const path = `users/${uid}`;
  try {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);

    if (snap.exists()) {
      return snap.data() as PerfilUsuario;
    }

    // Creación por primera vez
    const now = new Date().toISOString();
    const nuevoPerfil: PerfilUsuario = {
      uid,
      nombre: datos.nombre.trim() || datos.email.split('@')[0] || 'Usuario',
      email: datos.email.trim().toLowerCase(),
      moneda: 'COP',
      idioma: 'es',
      createdAt: now,
      updatedAt: now,
      ...(datos.fotoURL ? { fotoURL: datos.fotoURL } : {}),
    };

    await setDoc(userRef, nuevoPerfil);
    return nuevoPerfil;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Actualiza campos específicos del perfil en Firestore
 */
export async function actualizarPerfilUsuario(
  uid: string,
  cambios: Partial<Pick<PerfilUsuario, 'nombre' | 'moneda' | 'idioma'>>
): Promise<void> {
  assertFirebaseConfigured();
  const path = `users/${uid}`;
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      ...cambios,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}
