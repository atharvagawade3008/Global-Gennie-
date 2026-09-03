import React, { useState } from 'react';
import { useIncidents } from '../../context/IncidentContext';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge, PriorityBadge } from '../common/Badge';
import { StatusTimeline } from '../common/StatusTimeline';
import {
  Ambulance,
  Phone,
  Navigation,
  CheckCircle2,
  AlertOctagon,
  Clock,
  MapPin,
  HeartPulse,
  Radio,
  FileCheck,
} from 'lucide-react';

export const ResponderDashboard: React.FC = () => {
  const { user } = useAuth();
  const { incidents, updateIncidentStatus, resolveIncident } = useIncidents();

  const [responderStatus, setResponderStatus] = useState<'available' | 'dispatched' | 'offline'>('available');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [selectedIncidentForResolve, setSelectedIncidentForResolve] = useState<string | null>(null);

  // Active assigned calls
  const assignedIncidents = incidents.filter(
    (i) => (i.status === 'assigned' || i.status === 'response_en_route' || i.status === 'on_scene')
  );

  const handleUpdateStatus = (incidentId: string, status: 'response_en_route' | 'on_scene', notes?: string) => {
    updateIncidentStatus(
      incidentId,
      status,
      user.full_name || 'Officer Vikram Patil',
      'responder',
      notes || `Responder status updated to ${status.replace(/_/g, ' ')}`
    );
  };

  const handleResolve = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIncidentForResolve) return;
    resolveIncident(
      selectedIncidentForResolve,
      resolutionNotes || 'First aid administered & safety confirmed. Case closed.',
      user.full_name || 'Unit Alpha-1'
    );
    setSelectedIncidentForResolve(null);
    setResolutionNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="flex items-center gap-1.5 bg-blue-500/30 text-blue-300 font-extrabold text-xs px-2.5 py-0.5 rounded-full border border-blue-400/40">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>FIELD FIRST RESPONDER TERMINAL</span>
            </span>
            <span className="text-xs text-slate-300">Unit Alpha-1 (Badge #TP-7712)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Emergency Dispatch & Field Response Console
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Accept dispatches, navigate to tourist GPS, update transit status, and file resolution reports.
          </p>
        </div>

        {/* Status Toggle */}
        <div className="flex items-center gap-2 bg-slate-950/60 p-1.5 rounded-2xl border border-slate-700/60 self-start md:self-auto">
          <button
            onClick={() => setResponderStatus('available')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              responderStatus === 'available'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            AVAILABLE
          </button>
          <button
            onClick={() => setResponderStatus('dispatched')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              responderStatus === 'dispatched'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            DISPATCHED
          </button>
          <button
            onClick={() => setResponderStatus('offline')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              responderStatus === 'offline'
                ? 'bg-slate-700 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            OFFLINE
          </button>
        </div>
      </div>

      {/* Active Dispatches Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-extrabold text-slate-900 text-base sm:text-lg">
            Active Assigned Calls ({assignedIncidents.length})
          </h2>
          <span className="text-xs font-bold text-slate-500">Live GPS Priority Queue</span>
        </div>

        {assignedIncidents.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 shadow-2xs">
            <Ambulance className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800 text-base mb-1">No Active Calls Assigned</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Your unit is on standby for the next emergency dispatch alert from Command.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {assignedIncidents.map((inc) => {
              const isSos = inc.is_sos || inc.priority === 'critical';

              return (
                <div
                  key={inc.id}
                  className={`bg-white rounded-3xl border shadow-sm p-6 space-y-4 transition-all ${
                    isSos ? 'border-rose-300 ring-2 ring-rose-500/10' : 'border-slate-200'
                  }`}
                >
                  {/* Call Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      {isSos ? (
                        <div className="p-2 bg-rose-100 text-rose-600 rounded-xl">
                          <AlertOctagon className="w-5 h-5 animate-pulse" />
                        </div>
                      ) : (
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                          <Ambulance className="w-5 h-5" />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-slate-900">{inc.incident_code}</span>
                          <PriorityBadge priority={inc.priority} />
                          <StatusBadge status={inc.status} />
                        </div>
                        <h3 className="font-bold text-base text-slate-900 mt-0.5">{inc.title}</h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {inc.reporter_phone && (
                        <a
                          href={`tel:${inc.reporter_phone}`}
                          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-xs transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Call Tourist ({inc.reporter_name})</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Description & Location */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-2">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-rose-600" />
                        <span>Incident Scene Address:</span>
                      </div>
                      <p className="text-slate-700 font-medium">{inc.address || 'GPS Coordinates Attached'}</p>
                      <p className="text-slate-500 font-mono text-[11px]">
                        Coordinates: {inc.latitude.toFixed(5)}, {inc.longitude.toFixed(5)}
                      </p>
                    </div>

                    <div className="bg-blue-50/60 p-3.5 rounded-2xl border border-blue-100 space-y-2">
                      <div className="font-bold text-blue-950 flex items-center gap-1.5">
                        <HeartPulse className="w-4 h-4 text-purple-600" />
                        <span>Triage & Medical Context:</span>
                      </div>
                      <p className="text-blue-900 font-medium">{inc.description || 'No additional notes logged.'}</p>
                      {inc.responder_notes && (
                        <p className="text-xs text-blue-700 italic">Command Note: {inc.responder_notes}</p>
                      )}
                    </div>
                  </div>

                  {/* Multi-Stage Timeline */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <StatusTimeline
                      currentStatus={inc.status}
                      responderName={inc.responder_name}
                      etaMinutes={inc.eta_minutes}
                    />
                  </div>

                  {/* Action Transition Controls */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
                    <span className="text-xs text-slate-400 font-medium">Field Unit Status Progression:</span>

                    <div className="flex items-center gap-2 flex-wrap">
                      {inc.status === 'assigned' && (
                        <button
                          onClick={() => handleUpdateStatus(inc.id, 'response_en_route', 'Patrol motor unit en route with emergency siren')}
                          className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition-colors"
                        >
                          Mark EN ROUTE
                        </button>
                      )}

                      {inc.status === 'response_en_route' && (
                        <button
                          onClick={() => handleUpdateStatus(inc.id, 'on_scene', 'Arrived on scene, assessing tourist')}
                          className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition-colors"
                        >
                          Mark ON SCENE
                        </button>
                      )}

                      {(inc.status === 'on_scene' || inc.status === 'response_en_route' || inc.status === 'assigned') && (
                        <button
                          onClick={() => setSelectedIncidentForResolve(inc.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Close & Resolve Case</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Resolution Dialog */}
      {selectedIncidentForResolve && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setSelectedIncidentForResolve(null)} />

          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 border border-slate-200 animate-in fade-in zoom-in-95">
            <h3 className="font-bold text-base text-slate-900 mb-1">
              Complete Field Resolution Report
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Provide summary of aid provided, FIR number (if theft), or medical hospital transfer.
            </p>

            <form onSubmit={handleResolve} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Field Summary Notes *</label>
                <textarea
                  required
                  rows={3}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="e.g. Tourist provided Ventolin inhaler. Vitals stable. Escorted back to hotel."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedIncidentForResolve(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20"
                >
                  Confirm & Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
