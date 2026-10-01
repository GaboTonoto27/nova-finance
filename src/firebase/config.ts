import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

export interface FirebaseEnvConfig {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}

export const firebaseConfig: FirebaseEnvConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Verifica si las variables obligatorias de Firebase están configuradas
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey.trim() !== '' &&
  firebaseConfig.projectId &&
  firebaseConfig.projectId.trim() !== ''
);

export function assertFirebaseConfigured(): void {
  if (!isFirebaseConfigured) {
    throw new Error(
      'Faltan las credenciales de Firebase en el archivo .env. Por favor completa los valores de VITE_FIREBASE_API_KEY, VITE_FIREBASE_PROJECT_ID, etc.'
    );
  }
}

// Inicialización de la aplicación de Firebase
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

if (getApps().length > 0) {
  app = getApp();
} else if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig as Record<string, string>);
} else {
  // Inicialización de respaldo temporal para que la UI cargue limpiamente
  // mientras el usuario completa sus credenciales en .env
  app = initializeApp({
    apiKey: 'dummy-api-key',
    authDomain: 'nova-finance.firebaseapp.com',
    projectId: 'nova-finance-placeholder',
    appId: '1:00000000000:web:0000000000000',
  });
}

auth = getAuth(app);
db = getFirestore(app);

export { app, auth, db };
