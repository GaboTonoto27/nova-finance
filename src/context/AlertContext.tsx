import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// ============================================================================
// NOVA v0.4.1 - Sistema de alertas (toasts)
// ============================================================================

export type AlertType = 'success' | 'error' | 'warning' | 'info';

export type CustomIcon =
  | 'gasto'
  | 'ingreso'
  | 'presupuesto'
  | 'meta'
  | 'ahorro';

export interface Alert {
  id: string;
  type: AlertType;
  title: string;
  message?: string;
  duration?: number;
  icon?: CustomIcon;
}

interface AlertContextType {
  alerts: Alert[];
  showAlert: (alert: Omit<Alert, 'id'>) => void;
  dismissAlert: (id: string) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const dismissAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const showAlert = useCallback(
    (alert: Omit<Alert, 'id'>) => {
      const id = `alert-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const newAlert: Alert = { ...alert, id };

      setAlerts((prev) => [...prev, newAlert]);

      const duration = alert.duration ?? 6000;
      if (duration > 0) {
        setTimeout(() => {
          dismissAlert(id);
        }, duration);
      }
    },
    [dismissAlert]
  );

  return (
    <AlertContext.Provider value={{ alerts, showAlert, dismissAlert }}>
      {children}
    </AlertContext.Provider>
  );
};

export const useAlert = (): AlertContextType => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert debe ser utilizado dentro de un AlertProvider');
  }
  return context;
};