"use client";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";

export type AlertType = "success" | "error" | "warning" | "info";

interface Alert {
  id: string;
  type: AlertType;
  message: string;
}

interface AlertContextValue {
  alerts: Alert[];
  showAlert: (type: AlertType, message: string) => void;
  dismissAlert: (id: string) => void;
}

const AlertContext = createContext<AlertContextValue | null>(null);

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const dismissAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const showAlert = useCallback(
    (type: AlertType, message: string) => {
      const id = crypto.randomUUID();
      setAlerts((prev) => [...prev, { id, type, message }]);
      setTimeout(() => dismissAlert(id), 5000);
    },
    [dismissAlert],
  );

  return (
    <AlertContext.Provider value={{ alerts, showAlert, dismissAlert }}>
      {children}
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error("useAlert must be used within an AlertProvider");
  return ctx;
}
