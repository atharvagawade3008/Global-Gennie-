import React, { useState } from 'react';
import { useIncidents } from '../context/IncidentContext';
import { StatusBadge, PriorityBadge } from '../components/common/Badge';
import { StatusTimeline } from '../components/common/StatusTimeline';
import { IncidentReportModal } from '../components/incidents/IncidentReportModal';
import {
  FileText,
  Plus,
  AlertOctagon,
  MapPin,
  Clock,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Activity,
  Layers,
} from 'lucide-react';

export const IncidentsPage: React.FC = () => {
  const { incidents } = useIncidents();

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [expandedIncidentId, setExpandedIncidentId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedIncidentId((prev) => (prev === id ? null : id));
  };

  const activeIncidents = incidents.filter((i) => i.status !== 'resolved' && i.status !== 'cancelled');
  const resolvedIncidents = incidents.filter((i) => i.status === 'resolved');

  return (
    <div id="tour-incidents" className="space-y-6 pb-24 lg:pb-12 animate-fade-in-up">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Incident Tracker</h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time status updates and responder assignments for all reported incidents in Navi Mumbai.
          </p>
        </div>
        <button
          onClick={() => setIsReportModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md shadow-blue-500/20 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Report Incident</span>
        </button>
      </div>

      {/* Incident Statistics Cards (Responsive Clean Grid / Stack) */}
      {incidents.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-semibold mb-0.5">Total Incidents</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">{incidents.length}</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 aspect-square">
              <Layers className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-semibold mb-0.5">Active Cases</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-amber-600">{activeIncidents.length}</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 aspect-square">
              <Activity className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-semibold mb-0.5">Resolved Cases</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600">{resolvedIncidents.length}</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 aspect-square">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {incidents.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center shadow-2xs">
          <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3 text-slate-400 shrink-0 aspect-square">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-base mb-1">No incidents logged</h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mb-5">
            If you experience any emergency, theft, lost property or safety hazard, file a report immediately.
          </p>
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-colors"
          >
            File First Report
          </button>
        </div>
      )}

      {/* Active Incidents */}
      {activeIncidents.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Active & In Progress ({activeIncidents.length})
          </h2>

          <div className="space-y-3">
            {activeIncidents.map((inc) => {
              const isExpanded = expandedIncidentId === inc.id;
              const isSos = inc.is_sos || inc.priority === 'critical';

              return (
                <div
                  key={inc.id}
                  className={`bg-white rounded-2xl border shadow-2xs overflow-hidden transition-all ${
                    isSos ? 'border-rose-200 ring-1 ring-rose-500/20' : 'border-slate-200/80'
                  }`}
                >
                  {isSos && (
                    <div className="bg-rose-50 border-b border-rose-200 px-4 py-2 flex items-center gap-2">
                      <AlertOctagon className="w-4 h-4 text-rose-600 animate-pulse shrink-0" />
                      <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">
                        Critical Emergency — SOS Active
                      </span>
                    </div>
                  )}

                  <button
                    onClick={() => toggleExpand(inc.id)}
                    className="w-full p-4 sm:p-5 text-left hover:bg-slate-50/60 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        {/* Badges Row — Perfectly aligned */}
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200 shrink-0">
                            {inc.incident_code}
                          </span>
                          <PriorityBadge priority={inc.priority} />
                          <StatusBadge status={inc.status} />
                        </div>

                        <h3 className="font-bold text-sm sm:text-base text-slate-900 truncate">{inc.title}</h3>

                        <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500 flex-wrap">
                          <span className="flex items-center gap-1 min-w-0 truncate">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{inc.address || 'GPS Attached'}</span>
                          </span>
                          <span className="flex items-center gap-1 shrink-0">
                            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{new Date(inc.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0 text-slate-400 p-1">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-slate-100 p-4 sm:p-5 space-y-4 bg-slate-50/50">
                      <StatusTimeline
                        currentStatus={inc.status}
                        isSos={inc.is_sos}
                        responderName={inc.responder_name}
                        etaMinutes={inc.eta_minutes}
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 space-y-1">
                          <p className="font-bold text-slate-800">Incident Details</p>
                          <p className="text-slate-600 leading-relaxed">{inc.description || 'No detailed description provided.'}</p>
                        </div>
                        <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 space-y-1">
                          <p className="font-bold text-slate-800">Reporter Information</p>
                          <p className="text-slate-700 font-semibold">{inc.reporter_name}</p>
                          <p className="text-slate-500">{inc.reporter_phone || 'Phone not provided'}</p>
                          <p className="font-mono text-slate-400">{inc.latitude.toFixed(5)}, {inc.longitude.toFixed(5)}</p>
                        </div>
                      </div>

                      {inc.updates && inc.updates.length > 0 && (
                        <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 space-y-2">
                          <p className="font-bold text-xs text-slate-800">Status Audit Trail</p>
                          <div className="space-y-2">
                            {inc.updates.map((upd) => (
                              <div key={upd.id} className="flex items-start gap-2.5 text-xs">
                                <span className="w-2 h-2 rounded-full bg-blue-500 mt-1 shrink-0 aspect-square" />
                                <div className="min-w-0">
                                  <span className="font-bold text-slate-800 capitalize">
                                    {upd.new_status.replace(/_/g, ' ')}
                                  </span>
                                  <span className="text-slate-400 ml-2">
                                    {new Date(upd.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                  <p className="text-slate-500 mt-0.5">{upd.notes} · {upd.updater_name}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Resolved Incidents */}
      {resolvedIncidents.length > 0 && (
        <div className="space-y-3 pt-2">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Resolved Cases ({resolvedIncidents.length})</span>
          </h2>

          <div className="space-y-3">
            {resolvedIncidents.map((inc) => {
              const isExpanded = expandedIncidentId === inc.id;
              return (
                <div
                  key={inc.id}
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden opacity-85 hover:opacity-100 transition-opacity"
                >
                  <button
                    onClick={() => toggleExpand(inc.id)}
                    className="w-full p-4 sm:p-5 text-left hover:bg-slate-50/60 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200 shrink-0">
                            {inc.incident_code}
                          </span>
                          <StatusBadge status={inc.status} />
                        </div>
                        <h3 className="font-bold text-sm text-slate-800 truncate">{inc.title}</h3>
                      </div>
                      <div className="shrink-0 text-slate-300 p-1">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </button>

                  {isExpanded && inc.resolution_notes && (
                    <div className="border-t border-slate-100 p-4 bg-slate-50/50 text-xs">
                      <p className="font-bold text-slate-700 mb-1">Official Resolution Report</p>
                      <p className="text-slate-600 leading-relaxed">{inc.resolution_notes}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <IncidentReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
    </div>
  );
};
