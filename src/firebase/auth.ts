import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  User,
  UserCredential,
  NextOrObserver,
} from 'firebase/auth';
import { auth, assertFirebaseConfigured, isFirebaseConfigured } from './config';

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

/**
 * Traduce los códigos de error de Firebase a mensajes claros y amables en español
 */
export function traducirErrorFirebase(codigo: string): string {
  switch (codigo) {
    case 'auth/invalid-email':
      return 'El formato del correo electrónico no es válido.';
    case 'auth/user-disabled':
      return 'Esta cuenta ha sido inhabilitada. Contacta a soporte.';
    case 'auth/user-not-found':
      return 'No encontramos una cuenta con este correo electrónico.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
    case 'auth/invalid-login-credentials':
      return 'Correo o contraseña incorrectos. Verifica tus datos.';
    case 'auth/email-already-in-use':
      return 'Este correo ya tiene una cuenta registrada. Intenta iniciar sesión.';
    case 'auth/weak-password':
      return 'La contraseña es muy débil. Debe tener al menos 6 caracteres.';
    case 'auth/popup-closed-by-user':
      return 'Cancelaste el inicio de sesión con Google.';
    case 'auth/popup-blocked':
      return 'Tu navegador bloqueó la ventana emergente de Google. Por favor permítela.';
    case 'auth/network-request-failed':
      return 'No se pudo conectar con el servidor. Revisa tu conexión a internet.';
    case 'auth/too-many-requests':
      return 'Demasiados intentos fallidos. Por seguridad, espera unos minutos antes de volver a intentar.';
    case 'auth/requires-recent-login':
      return 'Esta acción requiere que vuelvas a iniciar sesión.';
    default:
      return 'Ocurrió un error inesperado al autenticar. Intenta de nuevo.';
  }
}

/**
 * Registra un nuevo usuario con correo y contraseña
 */
export async function registrarConEmail(email: string, password: string): Promise<UserCredential> {
  assertFirebaseConfigured();
  return createUserWithEmailAndPassword(auth, email.trim(), password);
}

/**
 * Inicia sesión con correo y contraseña
 */
export async function iniciarSesionConEmail(email: string, password: string): Promise<UserCredential> {
  assertFirebaseConfigured();
  return signInWithEmailAndPassword(auth, email.trim(), password);
}

/**
 * Inicia sesión con cuenta de Google usando ventana emergente
 */
export async function iniciarSesionConGoogle(): Promise<UserCredential> {
  assertFirebaseConfigured();
  return signInWithPopup(auth, googleProvider);
}

/**
 * Cierra la sesión activa del usuario
 */
export async function cerrarSesion(): Promise<void> {
  if (!isFirebaseConfigured) return;
  return signOut(auth);
}

/**
 * Observa los cambios en el estado de autenticación
 */
export function observarSesion(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

/**
 * Envía un correo con el enlace de recuperación de contraseña
 */
export async function enviarRecuperacionPassword(email: string): Promise<void> {
  assertFirebaseConfigured();
  return sendPasswordResetEmail(auth, email.trim());
}

/**
 * Actualiza el nombre para mostrar del usuario en Firebase Auth
 */
export async function actualizarNombreUsuario(user: User, nombre: string): Promise<void> {
  return updateProfile(user, { displayName: nombre.trim() });
}
