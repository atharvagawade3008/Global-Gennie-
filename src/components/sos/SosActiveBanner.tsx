import React from 'react';
import { useIncidents } from '../../context/IncidentContext';
import { AlertOctagon, Phone, ChevronRight, X, Clock, ShieldCheck } from 'lucide-react';

interface SosActiveBannerProps {
  onViewDetails: () => void;
}

export const SosActiveBanner: React.FC<SosActiveBannerProps> = ({ onViewDetails }) => {
  const { activeSosIncident, cancelIncident } = useIncidents();

  if (!activeSosIncident) return null;

  const statusLabel = activeSosIncident.status.replace(/_/g, ' ');

  return (
    <div className="bg-rose-700 text-white border-b border-rose-800 shadow-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          {/* Left / Top: Alert Status & Info */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0 aspect-square animate-pulse">
              <AlertOctagon className="w-4 h-4 text-white" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-xs tracking-wider uppercase bg-rose-950/60 px-2 py-0.5 rounded-md border border-rose-400/30">
                  SOS ACTIVE
                </span>
                <span className="font-mono text-xs text-rose-200 font-bold">
                  {activeSosIncident.incident_code}
                </span>
                <span className="bg-white/20 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full capitalize shrink-0">
                  {statusLabel}
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs text-rose-100 mt-0.5 flex-wrap">
                <span className="truncate max-w-[200px] sm:max-w-xs font-medium">
                  {activeSosIncident.title}
                </span>
                {activeSosIncident.responder_name && (
                  <span className="flex items-center gap-1 font-bold text-white bg-rose-900/60 px-2 py-0.5 rounded-md text-[11px] shrink-0">
                    <ShieldCheck className="w-3 h-3 text-rose-300" />
                    <span>{activeSosIncident.responder_name.split('(')[0]}</span>
                    {activeSosIncident.eta_minutes && (
                      <span className="text-rose-200 font-normal">· ETA ~{activeSosIncident.eta_minutes}m</span>
                    )}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right / Bottom: Actions Stack */}
          <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-1 sm:pt-0 border-t border-rose-600/50 sm:border-t-0">
            <div className="flex items-center gap-2">
              <a
                href="tel:112"
                className="flex items-center gap-1.5 bg-white text-rose-700 font-bold px-3 py-1.5 rounded-xl text-xs hover:bg-rose-50 transition-colors shadow-xs"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call 112</span>
              </a>

              <button
                onClick={onViewDetails}
                className="flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition-colors shadow-xs"
              >
                <span>Track</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={() => {
                if (window.confirm('Cancel this SOS emergency alert?')) {
                  cancelIncident(activeSosIncident.id, 'Cancelled by tourist');
                }
              }}
              className="p-1.5 text-rose-200 hover:text-white hover:bg-white/20 rounded-xl transition-colors shrink-0"
              title="Cancel SOS"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
