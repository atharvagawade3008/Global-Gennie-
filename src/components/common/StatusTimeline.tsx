import React from 'react';
import { IncidentStatus } from '../../types';
import { CheckCircle2, Clock, ShieldCheck, Truck, MapPin, AlertTriangle } from 'lucide-react';

interface StatusTimelineProps {
  currentStatus: IncidentStatus;
  isSos?: boolean;
  responderName?: string;
  etaMinutes?: number;
  className?: string;
}

export const StatusTimeline: React.FC<StatusTimelineProps> = ({
  currentStatus,
  responderName,
  etaMinutes,
  className = '',
}) => {
  const steps: { key: IncidentStatus; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'received', label: 'Received', icon: Clock },
    { key: 'reviewing', label: 'Reviewing', icon: ShieldCheck },
    { key: 'assigned', label: 'Assigned', icon: MapPin },
    { key: 'response_en_route', label: 'En Route', icon: Truck },
    { key: 'resolved', label: 'Resolved', icon: CheckCircle2 },
  ];

  const getStepIndex = (status: IncidentStatus): number => {
    switch (status) {
      case 'received':
        return 0;
      case 'reviewing':
        return 1;
      case 'assigned':
        return 2;
      case 'response_en_route':
      case 'on_scene':
        return 3;
      case 'resolved':
        return 4;
      case 'cancelled':
        return -1;
      default:
        return 0;
    }
  };

  const currentIndex = getStepIndex(currentStatus);
  const isCancelled = currentStatus === 'cancelled';

  if (isCancelled) {
    return (
      <div className={`p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-slate-500 ${className}`}>
        <AlertTriangle className="w-6 h-6 text-slate-400 mx-auto mb-1" />
        <span className="font-semibold text-sm">Incident Cancelled / Closed</span>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Mobile/Desktop step indicator */}
      <div className="relative flex items-center justify-between w-full">
        {/* Background track line */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 -z-0 rounded" />
        {/* Active progress fill */}
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-600 -z-0 rounded transition-all duration-500 ease-out"
          style={{ width: `${Math.max(0, (currentIndex / (steps.length - 1)) * 100)}%` }}
        />

        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isPassed = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const isPending = idx > currentIndex;

          return (
            <div key={step.key} className="flex flex-col items-center relative z-10">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-300 shrink-0 aspect-square ${
                  isPassed
                    ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                    : isCurrent
                    ? 'bg-white border-blue-600 text-blue-600 ring-4 ring-blue-100 shadow-md scale-110'
                    : 'bg-white border-slate-300 text-slate-400'
                }`}
              >
                {isPassed ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
              </div>
              <span
                className={`text-[11px] sm:text-xs mt-2 font-medium text-center whitespace-nowrap ${
                  isCurrent
                    ? 'text-blue-700 font-bold'
                    : isPassed
                    ? 'text-slate-800'
                    : 'text-slate-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Dynamic contextual detail block */}
      {(responderName || etaMinutes) && (currentStatus === 'assigned' || currentStatus === 'response_en_route' || currentStatus === 'on_scene') && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-between text-xs sm:text-sm text-blue-900">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-blue-600 animate-pulse" />
            <div>
              <span className="font-semibold">Responder: </span>
              <span>{responderName || 'Emergency Patrol Unit'}</span>
            </div>
          </div>
          {etaMinutes && (
            <span className="bg-blue-600 text-white font-bold px-2.5 py-1 rounded-lg text-xs">
              ETA ~ {etaMinutes} min
            </span>
          )}
        </div>
      )}
    </div>
  );
};
