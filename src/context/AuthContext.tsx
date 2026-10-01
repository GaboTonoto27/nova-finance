import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from 'firebase/auth';
import {
  observarSesion,
  iniciarSesionConEmail,
  registrarConEmail,
  iniciarSesionConGoogle,
  cerrarSesion as authCerrarSesion,
  enviarRecuperacionPassword,
  actualizarNombreUsuario,
  traducirErrorFirebase,
} from '../firebase/auth';
import {
  PerfilUsuario,
  asegurarDocumentoUsuario,
  obtenerPerfilUsuario,
} from '../firebase/users';
import { isFirebaseConfigured } from '../firebase/config';

export interface AuthContextType {
  usuario: User | null;
  perfil: PerfilUsuario | null;
  cargando: boolean;
  error: string | null;
  isConfigured: boolean;
  iniciarSesionEmail: (email: string, pass: string) => Promise<void>;
  registrarEmail: (nombre: string, email: string, pass: string) => Promise<void>;
  iniciarSesionGoogle: () => Promise<void>;
  cerrarSesion: () => Promise<void>;
  enviarRecuperacion: (email: string) => Promise<void>;
  limpiarError: () => void;
  obtenerIniciales: () => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [usuario, setUsuario] = useState<User | null>(null);
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const limpiarError = () => setError(null);

  // Calcula las iniciales del nombre del perfil (ej. "Gabriel Múnera" -> "GM")
  const obtenerIniciales = (): string => {
    const nombre = perfil?.nombre || usuario?.displayName || 'Usuario';
    const partes = nombre.trim().split(/\s+/).filter(Boolean);
    if (partes.length === 0) return 'U';
    if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
    return (partes[0][0] + partes[1][0]).toUpperCase();
  };

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setCargando(false);
      return;
    }

    const unsuscribe = observarSesion(async (firebaseUser) => {
      if (firebaseUser) {
        setUsuario(firebaseUser);
        try {
          let userProfile = await obtenerPerfilUsuario(firebaseUser.uid);
          if (!userProfile) {
            userProfile = await asegurarDocumentoUsuario(firebaseUser.uid, {
              nombre: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuario',
              email: firebaseUser.email || '',
              fotoURL: firebaseUser.photoURL || undefined,
            });
          }
          setPerfil(userProfile);
        } catch (err) {
          console.error('Error al sincronizar perfil en Firestore:', err);
          // Fallback a datos de auth si Firestore tiene latencia o reglas en proceso
          setPerfil({
            uid: firebaseUser.uid,
            nombre: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuario',
            email: firebaseUser.email || '',
            moneda: 'COP',
            idioma: 'es',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            fotoURL: firebaseUser.photoURL || undefined,
          });
        }
      } else {
        setUsuario(null);
        setPerfil(null);
      }
      setCargando(false);
    });

    return () => unsuscribe();
  }, []);

  const iniciarSesionEmail = async (email: string, pass: string): Promise<void> => {
    setError(null);
    if (!isFirebaseConfigured) {
      setError(
        'Faltan las credenciales de Firebase en el archivo .env. Por favor completa los valores de VITE_FIREBASE_* para habilitar la autenticación real.'
      );
      return;
    }

    try {
      setCargando(true);
      const cred = await iniciarSesionConEmail(email, pass);
      const user = cred.user;
      setUsuario(user);

      try {
        let userProfile = await obtenerPerfilUsuario(user.uid);
        if (!userProfile) {
          userProfile = await asegurarDocumentoUsuario(user.uid, {
            nombre: user.displayName || user.email?.split('@')[0] || 'Usuario',
            email: user.email || email,
          });
        }
        setPerfil(userProfile);
      } catch (err) {
        console.error('Error al leer perfil tras login:', err);
      }
    } catch (err: unknown) {
      const firebaseError = err as { code?: string; message?: string };
      const mensaje = firebaseError.code
        ? traducirErrorFirebase(firebaseError.code)
        : (firebaseError.message || 'Error al iniciar sesión.');
      setError(mensaje);
      throw new Error(mensaje);
    } finally {
      setCargando(false);
    }
  };

  const registrarEmail = async (nombre: string, email: string, pass: string): Promise<void> => {
    setError(null);
    if (!isFirebaseConfigured) {
      setError(
        'Faltan las credenciales de Firebase en el archivo .env. Por favor completa los valores de VITE_FIREBASE_* para habilitar el registro real.'
      );
      return;
    }

    try {
      setCargando(true);
      const cred = await registrarConEmail(email, pass);
      const user = cred.user;

      // Actualizar displayName en Auth
      if (nombre.trim()) {
        try {
          await actualizarNombreUsuario(user, nombre);
        } catch (e) {
          console.warn('No se pudo actualizar el nombre en Auth:', e);
        }
      }

      // Crear documento en Firestore /users/{uid}
      const nuevoPerfil = await asegurarDocumentoUsuario(user.uid, {
        nombre: nombre.trim() || 'Usuario',
        email: user.email || email,
      });

      setUsuario(user);
      setPerfil(nuevoPerfil);
    } catch (err: unknown) {
      const firebaseError = err as { code?: string; message?: string };
      const mensaje = firebaseError.code
        ? traducirErrorFirebase(firebaseError.code)
        : (firebaseError.message || 'Error al crear la cuenta.');
      setError(mensaje);
      throw new Error(mensaje);
    } finally {
      setCargando(false);
    }
  };

  const iniciarSesionGoogle = async (): Promise<void> => {
    setError(null);
    if (!isFirebaseConfigured) {
      setError(
        'Faltan las credenciales de Firebase en el archivo .env. Por favor completa los valores de VITE_FIREBASE_* para iniciar sesión con Google.'
      );
      return;
    }

    try {
      setCargando(true);
      const cred = await iniciarSesionConGoogle();
      const user = cred.user;
      setUsuario(user);

      const userProfile = await asegurarDocumentoUsuario(user.uid, {
        nombre: user.displayName || 'Usuario',
        email: user.email || '',
        fotoURL: user.photoURL || undefined,
      });
      setPerfil(userProfile);
    } catch (err: unknown) {
      const firebaseError = err as { code?: string; message?: string };
      // Si el usuario canceló la ventana emergente, no mostramos un error alarmante
      if (firebaseError.code === 'auth/popup-closed-by-user') {
        return;
      }
      const mensaje = firebaseError.code
        ? traducirErrorFirebase(firebaseError.code)
        : (firebaseError.message || 'Error al iniciar sesión con Google.');
      setError(mensaje);
      throw new Error(mensaje);
    } finally {
      setCargando(false);
    }
  };

  const cerrarSesion = async (): Promise<void> => {
    setError(null);
    try {
      await authCerrarSesion();
      setUsuario(null);
      setPerfil(null);
    } catch (err: unknown) {
      const firebaseError = err as { code?: string; message?: string };
      const mensaje = firebaseError.code
        ? traducirErrorFirebase(firebaseError.code)
        : 'Error al cerrar sesión.';
      setError(mensaje);
    }
  };

  const enviarRecuperacion = async (email: string): Promise<void> => {
    setError(null);
    if (!isFirebaseConfigured) {
      setError(
        'Faltan las credenciales de Firebase en el archivo .env. Por favor completa las variables VITE_FIREBASE_* para enviar el correo.'
      );
      return;
    }

    try {
      await enviarRecuperacionPassword(email);
    } catch (err: unknown) {
      const firebaseError = err as { code?: string; message?: string };
      const mensaje = firebaseError.code
        ? traducirErrorFirebase(firebaseError.code)
        : 'Error al enviar el enlace de recuperación.';
      setError(mensaje);
      throw new Error(mensaje);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        perfil,
        cargando,
        error,
        isConfigured: isFirebaseConfigured,
        iniciarSesionEmail,
        registrarEmail,
        iniciarSesionGoogle,
        cerrarSesion,
        enviarRecuperacion,
        limpiarError,
        obtenerIniciales,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};
