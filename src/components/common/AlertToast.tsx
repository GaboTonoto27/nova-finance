import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import { useAlert, AlertType } from '../../context/AlertContext';

// ============================================================================
// NOVA v0.4.1 - Toast notifications
// ============================================================================
// Contenedor de toasts que se muestran en la esquina superior derecha.

const TYPE_STYLES: Record<
  AlertType,
  {
    container: string;
    icon: React.ComponentType<{ className?: string }>;
    iconClass: string;
  }
> = {
  success: {
    container: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300',
    icon: CheckCircle2,
    iconClass: 'text-emerald-500',
  },
  error: {
    container: 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300',
    icon: XCircle,
    iconClass: 'text-rose-500',
  },
  warning: {
    container: 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300',
    icon: AlertTriangle,
    iconClass: 'text-amber-500',
  },
  info: {
    container: 'bg-teal-500/10 border-teal-500/30 text-teal-700 dark:text-teal-300',
    icon: Info,
    iconClass: 'text-teal-500',
  },
};

export const AlertToast: React.FC = () => {
  const { alerts, dismissAlert } = useAlert();

  if (alerts.length === 0) return null;

  return (
    <div
      className="fixed top-4 right-4 z-[100] flex flex-col gap-3 max-w-sm w-full pointer-events-none"
      aria-live="polite"
      aria-atomic="true"
    >
      {alerts.map((alert) => {
        const style = TYPE_STYLES[alert.type];
        const Icon = style.icon;

        return (
          <div
            key={alert.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-lg backdrop-blur-md transition-all animate-in slide-in-from-right duration-300 ${style.container}`}
            role="alert"
          >
            <Icon className={`w-5 h-5 shrink-0 mt-0.5 stroke-[2] ${style.iconClass}`} />

            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold leading-tight">{alert.title}</p>
              {alert.message && (
                <p className="text-xs mt-1 leading-relaxed opacity-90 whitespace-pre-line">
                  {alert.message}
                </p>
              )}
            </div>

            <button
              onClick={() => dismissAlert(alert.id)}
              className="shrink-0 p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors"
              type="button"
              aria-label="Cerrar notificacion"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};