import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db, auth, assertFirebaseConfigured } from './config';
import {
  PeriodoActualizacion,
  EntradaHistorialSaldo,
  SaldoInicialExtendido,
} from '../types/finance';

export interface PerfilUsuario {
  uid: string;
  nombre: string;
  email: string;
  moneda: string;
  idioma: string;
  createdAt: string;
  updatedAt: string;
  fotoURL?: string;
  saldoInicial?: SaldoInicialExtendido;
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

// ----------------------------------------------------------------------------
// Helpers de periodo
// ----------------------------------------------------------------------------

/**
 * Calcula la proxima fecha de actualizacion segun el periodo elegido.
 */
export function calcularProximaActualizacion(
  periodo: PeriodoActualizacion,
  desde: Date = new Date()
): string {
  const fecha = new Date(desde);

  if (periodo === 'mensual') {
    // Primer dia del proximo mes
    fecha.setMonth(fecha.getMonth() + 1, 1);
    fecha.setHours(0, 0, 0, 0);
    return fecha.toISOString();
  }

  if (periodo === 'quincenal') {
    // Si estamos antes del 15, la proxima es el 15 del mes actual
    // Si estamos despues del 15, la proxima es el 1° del proximo mes
    const diaActual = fecha.getDate();
    if (diaActual < 15) {
      fecha.setDate(15);
    } else {
      fecha.setMonth(fecha.getMonth() + 1, 1);
    }
    fecha.setHours(0, 0, 0, 0);
    return fecha.toISOString();
  }

  // Anual: 1 de enero del proximo ano
  fecha.setFullYear(fecha.getFullYear() + 1, 0, 1);
  fecha.setHours(0, 0, 0, 0);
  return fecha.toISOString();
}

/**
 * Devuelve el texto de la frase contextual segun el periodo.
 */
export function getFraseContextual(periodo: PeriodoActualizacion): string {
  switch (periodo) {
    case 'mensual':
      return 'Tu saldo se actualiza cada mes, como tu sueldo.';
    case 'quincenal':
      return 'Tu saldo se actualiza cada quincena, como tu pago.';
    case 'anual':
      return 'Tu saldo se actualiza cada ano, como tus impuestos.';
    default:
      return 'Tu saldo se actualiza periodicamente.';
  }
}

/**
 * Devuelve el texto correcto segun el periodo para "podes actualizar tu saldo..."
 */
export function getTextoActualizacion(periodo: PeriodoActualizacion): string {
  switch (periodo) {
    case 'mensual':
      return 'Podes actualizar tu saldo inicial de este mes';
    case 'quincenal':
      return 'Podes actualizar tu saldo inicial de esta quincena';
    case 'anual':
      return 'Podes actualizar tu saldo inicial de este ano';
    default:
      return 'Podes actualizar tu saldo inicial';
  }
}

// ----------------------------------------------------------------------------
// CRUD
// ----------------------------------------------------------------------------

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
 * Crea el documento /users/{uid} si no existe.
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
            saldoInicial: {
        monto: 0,
        moneda: 'COP',
        configurado: false,
        actualizadoEn: now,
        periodoActualizacion: 'mensual',
        proximaActualizacion: calcularProximaActualizacion('mensual'),
        ultimoCambioEn: now,
        historialSaldos: [],
        intentosUsados: 0,
        intentosRenovadosEn: now,
      },
    };

    await setDoc(userRef, nuevoPerfil);
    return nuevoPerfil;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

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

/**
 * Configura el saldo inicial por primera vez.
 * Incluye la eleccion del periodo de actualizacion.
 */
export async function configurarSaldoInicial(
  uid: string,
  monto: number,
  periodo: PeriodoActualizacion,
  moneda: string = 'COP'
): Promise<void> {
  assertFirebaseConfigured();
  const path = `users/${uid}`;
  try {
    const ahora = new Date().toISOString();
    const proxima = calcularProximaActualizacion(periodo);

    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      saldoInicial: {
        monto,
        moneda,
        configurado: true,
        actualizadoEn: ahora,
        periodoActualizacion: periodo,
        proximaActualizacion: proxima,
        ultimoCambioEn: ahora,
        historialSaldos: [
          {
            monto,
            fecha: ahora,
            periodo,
          },
        ],
        intentosUsados: 0, // Recien configurado: 0 intentos
        intentosRenovadosEn: ahora,
      },
      updatedAt: ahora,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Actualiza el saldo inicial respetando el historial.
 * Agrega una nueva entrada al historial.
 */
export async function actualizarSaldoInicial(
  uid: string,
  nuevoMonto: number,
  periodo: PeriodoActualizacion,
  moneda: string = 'COP',
  historialActual: EntradaHistorialSaldo[] = [],
  intentosUsadosActual: number = 0,
  intentosRenovadosEnActual: string = new Date().toISOString()
): Promise<void> {
  assertFirebaseConfigured();
  const path = `users/${uid}`;
  try {
    const ahora = new Date().toISOString();
    const proxima = calcularProximaActualizacion(periodo);

    const nuevaEntrada: EntradaHistorialSaldo = {
      monto: nuevoMonto,
      fecha: ahora,
      periodo,
    };

    const nuevosIntentos = intentosUsadosActual + 1;

    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      saldoInicial: {
        monto: nuevoMonto,
        moneda,
        configurado: true,
        actualizadoEn: ahora,
        periodoActualizacion: periodo,
        proximaActualizacion: proxima,
        ultimoCambioEn: ahora,
        historialSaldos: [...historialActual, nuevaEntrada],
        intentosUsados: nuevosIntentos,
        intentosRenovadosEn: intentosRenovadosEnActual,
      },
      updatedAt: ahora,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Deshace un cambio de saldo. Vuelve al monto anterior.
 */
export async function deshacerCambioSaldo(
  uid: string,
  montoAnterior: number,
  periodo: PeriodoActualizacion,
  moneda: string = 'COP',
  historialActual: EntradaHistorialSaldo[] = []
): Promise<void> {
  assertFirebaseConfigured();
  const path = `users/${uid}`;
  try {
    const ahora = new Date().toISOString();

    // Removemos la ultima entrada del historial (la que deshacemos)
    const historialLimpio = historialActual.slice(0, -1);

    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      saldoInicial: {
        monto: montoAnterior,
        moneda,
        configurado: true,
        actualizadoEn: ahora,
        periodoActualizacion: periodo,
        proximaActualizacion: calcularProximaActualizacion(periodo),
        ultimoCambioEn: ahora,
        historialSaldos: historialLimpio,
      },
      updatedAt: ahora,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}