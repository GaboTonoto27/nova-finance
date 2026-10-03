import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  X,
  TrendingDown,
  TrendingUp,
  Wallet,
  Target,
  PiggyBank,
} from 'lucide-react';
import { useAlert, AlertType } from '../../context/AlertContext';

// ============================================================================
// NOVA v0.4.2.7 - Toast notifications (rediseñado v2)
// ============================================================================
// Sistema de notificaciones temporales con estilo premium, visible y amigable.
// Inspirado en fintech modernas (fondo solido, sombras notorias, bordes limpios).

type CustomIcon = 'gasto' | 'ingreso' | 'presupuesto' | 'meta' | 'ahorro';

interface ToastConfig {
  bg: string;
  border: string;
  accentBar: string;
  iconBg: string;
  iconColor: string;
  titleColor: string;
  messageColor: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TYPE_STYLES: Record<AlertType, ToastConfig> = {
  success: {
    bg: 'bg-white dark:bg-[#0F1E1C]',
    border: 'border-emerald-300 dark:border-emerald-500/60',
    accentBar: 'bg-emerald-500',
    iconBg: 'bg-emerald-500',
    iconColor: 'text-white',
    titleColor: 'text-emerald-900 dark:text-emerald-100',
    messageColor: 'text-emerald-800 dark:text-emerald-200',
    icon: CheckCircle2,
  },
  error: {
    bg: 'bg-white dark:bg-[#1E0F11]',
    border: 'border-rose-300 dark:border-rose-500/60',
    accentBar: 'bg-rose-500',
    iconBg: 'bg-rose-500',
    iconColor: 'text-white',
    titleColor: 'text-rose-900 dark:text-rose-100',
    messageColor: 'text-rose-800 dark:text-rose-200',
    icon: XCircle,
  },
  warning: {
    bg: 'bg-white dark:bg-[#1F1608]',
    border: 'border-amber-300 dark:border-amber-500/60',
    accentBar: 'bg-amber-500',
    iconBg: 'bg-amber-500',
    iconColor: 'text-white',
    titleColor: 'text-amber-900 dark:text-amber-100',
    messageColor: 'text-amber-800 dark:text-amber-200',
    icon: AlertTriangle,
  },
  info: {
    bg: 'bg-white dark:bg-[#140F1F]',
    border: 'border-purple-300 dark:border-purple-500/60',
    accentBar: 'bg-purple-600',
    iconBg: 'bg-purple-600',
    iconColor: 'text-white',
    titleColor: 'text-purple-900 dark:text-purple-100',
    messageColor: 'text-purple-800 dark:text-purple-200',
    icon: Info,
  },
};

const CUSTOM_ICONS: Record<CustomIcon, React.ComponentType<{ className?: string }>> = {
  gasto: TrendingDown,
  ingreso: TrendingUp,
  presupuesto: Wallet,
  meta: Target,
  ahorro: PiggyBank,
};

export const AlertToast: React.FC = () => {
  const { alerts, dismissAlert } = useAlert();

  if (alerts.length === 0) return null;

  return (
    <div
      className="fixed top-4 right-4 z-[100] flex flex-col gap-3 max-w-md w-[calc(100%-2rem)] pointer-events-none"
      aria-live="polite"
      aria-atomic="true"
    >
      {alerts.map((alert) => {
        const style = TYPE_STYLES[alert.type];
        const Icon = (alert as { icon?: CustomIcon }).icon
          ? CUSTOM_ICONS[(alert as { icon: CustomIcon }).icon]
          : style.icon;

        return (
          <div
            key={alert.id}
            className={`pointer-events-auto relative overflow-hidden flex items-start gap-3.5 p-4 pr-11 rounded-2xl border-2 shadow-2xl transition-all animate-in slide-in-from-right-full fade-in duration-300 ${style.bg} ${style.border}`}
            role="alert"
            style={{
              boxShadow:
                '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.08)',
            }}
          >
            {/* Barra lateral de color */}
            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${style.accentBar}`} />

            {/* Icono circular con fondo sólido */}
            <div
              className={`shrink-0 w-11 h-11 rounded-full flex items-center justify-center shadow-md ${style.iconBg}`}
            >
              <Icon className={`w-5 h-5 stroke-[2.5] ${style.iconColor}`} />
            </div>

            {/* Contenido */}
            <div className="flex-1 min-w-0 pt-1">
              <p className={`text-sm font-bold leading-tight ${style.titleColor}`}>
                {alert.title}
              </p>
              {alert.message && (
                <p className={`text-xs mt-1.5 leading-relaxed whitespace-pre-line ${style.messageColor}`}>
                  {alert.message}
                </p>
              )}
            </div>

            {/* Boton cerrar */}
            <button
              onClick={() => dismissAlert(alert.id)}
              className={`absolute top-3 right-3 p-1.5 rounded-full transition-colors ${
                alert.type === 'success'
                  ? 'text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10'
                  : alert.type === 'error'
                  ? 'text-rose-700 dark:text-rose-300 hover:bg-rose-500/10'
                  : alert.type === 'warning'
                  ? 'text-amber-700 dark:text-amber-300 hover:bg-amber-500/10'
                  : 'text-purple-700 dark:text-purple-300 hover:bg-purple-500/10'
              }`}
              type="button"
              aria-label="Cerrar notificacion"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        );
      })}
    </div>
  );
};