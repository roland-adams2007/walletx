"use client";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { useAlert } from "../lib/alert-context";
import "./css/alert.css";

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

export default function AlertContainer() {
  const { alerts, dismissAlert } = useAlert();

  if (alerts.length === 0) return null;

  return (
    <div className="alert-stack">
      {alerts.map((alert) => {
        const Icon = ICONS[alert.type];
        return (
          <div key={alert.id} className={`alert-item alert-${alert.type}`}>
            <Icon className="w-5 h-5 shrink-0" />
            <p className="text-sm flex-1">{alert.message}</p>
            <button
              onClick={() => dismissAlert(alert.id)}
              aria-label="Dismiss"
              className="alert-dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
