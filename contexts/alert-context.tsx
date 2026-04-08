'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

export interface Alert {
  id: string;
  type: AlertType;
  title: string;
  message?: string;
  duration?: number;
}

interface AlertContextType {
  alerts: Alert[];
  showAlert: (type: AlertType, title: string, message?: string, duration?: number) => void;
  removeAlert: (id: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const removeAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  }, []);

  const showAlert = useCallback((
    type: AlertType,
    title: string,
    message?: string,
    duration = 5000
  ) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newAlert: Alert = { id, type, title, message, duration };

    setAlerts((prev) => [...prev, newAlert]);

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        removeAlert(id);
      }, duration);
    }
  }, [removeAlert]);

  const success = useCallback((title: string, message?: string, duration?: number) => {
    showAlert('success', title, message, duration);
  }, [showAlert]);

  const error = useCallback((title: string, message?: string, duration?: number) => {
    showAlert('error', title, message, duration);
  }, [showAlert]);

  const warning = useCallback((title: string, message?: string, duration?: number) => {
    showAlert('warning', title, message, duration);
  }, [showAlert]);

  const info = useCallback((title: string, message?: string, duration?: number) => {
    showAlert('info', title, message, duration);
  }, [showAlert]);

  return (
    <AlertContext.Provider value={{ alerts, showAlert, removeAlert, success, error, warning, info }}>
      {children}
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
}
