import React from 'react';
import { useLocation } from '../../context/LocationContext';
import { AlertTriangle, ShieldCheck, ShieldAlert, X } from 'lucide-react';

export const GeofenceAlertBanner: React.FC = () => {
  const { activeZoneAlert, dismissZoneAlert } = useLocation();

  if (!activeZoneAlert) return null;

  const isDanger = activeZoneAlert.risk_level === 'danger';
  const isWarning = activeZoneAlert.risk_level === 'warning';

  const styles = isDanger
    ? 'bg-rose-50 border-rose-200 text-rose-900'
    : isWarning
    ? 'bg-amber-50 border-amber-200 text-amber-900'
    : 'bg-emerald-50 border-emerald-200 text-emerald-900';

  const iconColor = isDanger ? 'text-rose-600' : isWarning ? 'text-amber-500' : 'text-emerald-600';

  const Icon = isDanger ? ShieldAlert : isWarning ? AlertTriangle : ShieldCheck;

  return (
    <div className={`flex items-start justify-between gap-4 p-4 rounded-2xl border ${styles} animate-fade-in-up`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${iconColor} ${isDanger ? 'animate-pulse' : ''}`} />
        <div>
          <p className="font-semibold text-sm">{activeZoneAlert.name}</p>
          <p className="text-xs mt-0.5 opacity-75 leading-relaxed">{activeZoneAlert.warning_message}</p>
          {activeZoneAlert.instructions && (
            <p className="text-xs mt-2 opacity-70">
              <strong>Advisory:</strong> {activeZoneAlert.instructions}
            </p>
          )}
        </div>
      </div>

      <button
        onClick={dismissZoneAlert}
        className="p-1.5 rounded-lg opacity-60 hover:opacity-100 transition-opacity shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
