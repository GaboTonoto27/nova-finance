import React, { useState } from 'react';
import { Mail, AlertCircle, CheckCircle2, ArrowLeft, ArrowRight, Sun, Moon } from 'lucide-react';
import { NovaLogo } from '../components/common/NovaLogo';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface RecuperarPasswordViewProps {
  onBackToLogin: () => void;
}

export const RecuperarPasswordView: React.FC<RecuperarPasswordViewProps> = ({
  onBackToLogin,
}) => {
  const { enviarRecuperacion, error, cargando, limpiarError } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [email, setEmail] = useState('');
  const [enviadoExitoso, setEnviadoExitoso] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    limpiarError();

    if (!email.trim() || !email.includes('@')) {
      setLocalError('Por favor ingresa un correo electrónico válido.');
      return;
    }

    try {
      await enviarRecuperacion(email);
      setEnviadoExitoso(true);
    } catch {
      // Error manejado en AuthContext
    }
  };

  const errorMessage = localError || error;

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col justify-center items-center px-4 py-8 relative selection:bg-teal-500/20 selection:text-teal-400 transition-colors">
      {/* Theme switcher floating in top-right */}
      <div className="absolute top-4 right-4">
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border-subtle)] rounded-full transition-all"
          aria-label={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
          title={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-300" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700" />
          )}
        </button>
      </div>

      <div className="w-full max-w-md">
        {/* Logo and Brand */}
        <div className="flex flex-col items-center mb-8">
          <NovaLogo size="lg" showSubtitle={true} />
        </div>

        {/* Card */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 sm:p-8 shadow-xl shadow-black/5 dark:shadow-black/20 transition-all">
          <button
            type="button"
            onClick={onBackToLogin}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text)] mb-5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver a iniciar sesión</span>
          </button>

          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text)]">
              Recuperar contraseña
            </h1>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1.5 font-normal">
              Ingresa el correo con el que te registraste y te enviaremos un enlace para restablecerla.
            </p>
          </div>

          {enviadoExitoso ? (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-4 bg-teal-500/10 border border-teal-500/20 rounded-xl text-teal-600 dark:text-teal-400 text-xs flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <strong className="block text-sm font-semibold">
                    ¡Correo de recuperación enviado!
                  </strong>
                  <p className="leading-relaxed">
                    Hemos enviado un enlace a <strong className="text-[var(--color-text)]">{email}</strong>. Revisa tu bandeja de entrada o la carpeta de spam para restablecer tu contraseña.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onBackToLogin}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm transition-all duration-150 cursor-pointer shadow-md shadow-teal-500/20"
              >
                <span>Ir al inicio de sesión</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-600 dark:text-rose-400 text-xs flex items-start gap-2.5 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="leading-relaxed font-medium">{errorMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">
                  Correo electrónico registrado
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--color-text-muted)]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@correo.com"
                    autoComplete="email"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-subtle)] text-[var(--color-text)] placeholder-[var(--color-text-muted)] text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={cargando}
                className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-teal-500 hover:bg-teal-400 active:bg-teal-600 text-slate-950 font-bold text-sm transition-all duration-150 shadow-md shadow-teal-500/20 disabled:opacity-60 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
              >
                {cargando ? (
                  <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Enviar enlace de recuperación</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-6 pt-5 border-t border-[var(--color-border)] text-center text-xs text-[var(--color-text-secondary)]">
            ¿Recordaste tu clave?{' '}
            <button
              type="button"
              onClick={onBackToLogin}
              className="font-bold text-teal-500 hover:text-teal-400 transition-colors focus-visible:outline-none cursor-pointer"
            >
              Iniciar sesión
            </button>
          </div>
        </div>

        <p className="text-center text-[11px] text-[var(--color-text-muted)] mt-6">
          NOVA · Tu dinero, simple y claro
        </p>
      </div>
    </div>
  );
};
