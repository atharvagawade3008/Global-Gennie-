import React, { useState } from 'react';
import { useIncidents } from '../../context/IncidentContext';
import { Incident } from '../../types';
import { X, Ambulance, ShieldCheck, Clock, MapPin } from 'lucide-react';

interface AssignResponderModalProps {
  incident: Incident | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AssignResponderModal: React.FC<AssignResponderModalProps> = ({
  incident,
  isOpen,
  onClose,
}) => {
  const { responders, assignResponder } = useIncidents();
  const [selectedResponderId, setSelectedResponderId] = useState<string>(
    responders.find((r) => r.status === 'available')?.id || responders[0]?.id || ''
  );
  const [etaMinutes, setEtaMinutes] = useState<number>(5);
  const [dispatchNotes, setDispatchNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !incident) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResponderId) return;

    setIsSubmitting(true);
    setTimeout(() => {
      assignResponder(incident.id, selectedResponderId, etaMinutes, dispatchNotes);
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="bg-slate-900 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-xl">
              <Ambulance className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">Dispatch Emergency Responder</h3>
              <p className="text-xs text-slate-400">Incident Code: {incident.incident_code}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Incident brief */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">{incident.title}</span>
              <span className="bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded uppercase text-[10px]">
                {incident.priority}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600">
              <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span>{incident.address || 'GPS Coordinates Attached'}</span>
            </div>
            <p className="text-slate-500">Reporter: {incident.reporter_name} ({incident.reporter_phone || 'No phone'})</p>
          </div>

          {/* Responder selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Select Available Unit / Patrol *
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {responders.map((resp) => {
                const isSelected = selectedResponderId === resp.id;
                const isAvail = resp.status === 'available';

                return (
                  <div
                    key={resp.id}
                    onClick={() => setSelectedResponderId(resp.id)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-blue-50 border-blue-600 ring-2 ring-blue-500/20 text-blue-900 font-semibold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold block">{resp.name}</span>
                        <span className="text-slate-500 text-[11px]">{resp.agency_name} (Badge: {resp.badge_number})</span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isAvail ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {resp.status.toUpperCase()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ETA Estimation */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Estimated Arrival (Minutes)</label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={etaMinutes}
                  onChange={(e) => setEtaMinutes(Number(e.target.value))}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Priority Override</label>
              <input
                type="text"
                disabled
                value={incident.priority.toUpperCase()}
                className="w-full px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs sm:text-sm font-bold text-slate-700"
              />
            </div>
          </div>

          {/* Dispatch instructions */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Dispatcher Radio Notes (Optional)</label>
            <input
              type="text"
              value={dispatchNotes}
              onChange={(e) => setDispatchNotes(e.target.value)}
              placeholder="e.g. Approach with emergency siren via Palm Beach Road north lane..."
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedResponderId}
              className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all"
            >
              {isSubmitting ? 'Dispatching...' : 'Dispatch Responder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
