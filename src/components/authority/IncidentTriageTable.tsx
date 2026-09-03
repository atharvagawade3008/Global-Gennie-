import React, { useState } from 'react';
import { Incident, IncidentStatus, IncidentPriority } from '../../types';
import { useIncidents } from '../../context/IncidentContext';
import { StatusBadge, PriorityBadge } from '../common/Badge';
import {
  Search,
  Filter,
  Ambulance,
  CheckCircle2,
  AlertOctagon,
  Clock,
  MapPin,
  Eye,
  FileText,
} from 'lucide-react';
import { AssignResponderModal } from './AssignResponderModal';

interface IncidentTriageTableProps {
  onSelectIncident?: (incident: Incident) => void;
}

export const IncidentTriageTable: React.FC<IncidentTriageTableProps> = ({ onSelectIncident }) => {
  const { incidents, updateIncidentStatus, resolveIncident } = useIncidents();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [dispatchIncident, setDispatchIncident] = useState<Incident | null>(null);
  const [resolveIncidentItem, setResolveIncidentItem] = useState<Incident | null>(null);
  const [resolutionNote, setResolutionNote] = useState('Matter handled on scene. Tourist safely escorted.');

  const filteredIncidents = incidents.filter((inc) => {
    if (statusFilter !== 'all' && inc.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && inc.priority !== priorityFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        inc.incident_code.toLowerCase().includes(q) ||
        inc.title.toLowerCase().includes(q) ||
        inc.reporter_name.toLowerCase().includes(q) ||
        (inc.address && inc.address.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolveIncidentItem) return;
    resolveIncident(resolveIncidentItem.id, resolutionNote, 'Inspector Rajiv Shinde (Authority Desk)');
    setResolveIncidentItem(null);
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by code, keyword, reporter or address..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 w-full md:w-auto scrollbar-none">
          {[
            { id: 'all', label: 'All Cases' },
            { id: 'received', label: 'Received' },
            { id: 'reviewing', label: 'Reviewing' },
            { id: 'assigned', label: 'Assigned' },
            { id: 'response_en_route', label: 'En Route' },
            { id: 'resolved', label: 'Resolved' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === tab.id
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Triage Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[11px] tracking-wider">
              <tr>
                <th className="px-4 py-3.5">Incident / Code</th>
                <th className="px-4 py-3.5">Category & Title</th>
                <th className="px-4 py-3.5">Priority</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Assigned Responder</th>
                <th className="px-4 py-3.5">Time Logged</th>
                <th className="px-4 py-3.5 text-right">Quick Triage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {filteredIncidents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    No incidents matching current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredIncidents.map((inc) => {
                  const isSos = inc.is_sos || inc.priority === 'critical';
                  const isResolved = inc.status === 'resolved';

                  return (
                    <tr
                      key={inc.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSos && !isResolved ? 'bg-rose-50/30' : ''
                      }`}
                    >
                      {/* Code */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          {isSos && <AlertOctagon className="w-4 h-4 text-rose-600 animate-pulse shrink-0" />}
                          <span className="font-mono font-bold text-slate-900">{inc.incident_code}</span>
                        </div>
                      </td>

                      {/* Title & Reporter */}
                      <td className="px-4 py-3.5 max-w-xs">
                        <div className="font-bold text-slate-900 text-xs sm:text-sm truncate">{inc.title}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5 truncate">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{inc.address || 'GPS Coordinates'}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Reporter: {inc.reporter_name}
                        </div>
                      </td>

                      {/* Priority */}
                      <td className="px-4 py-3.5">
                        <PriorityBadge priority={inc.priority} />
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <StatusBadge status={inc.status} />
                      </td>

                      {/* Responder */}
                      <td className="px-4 py-3.5 text-xs">
                        {inc.responder_name ? (
                          <div className="text-blue-700 font-semibold flex items-center gap-1">
                            <span>{inc.responder_name}</span>
                            {inc.eta_minutes && (
                              <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded">
                                ~{inc.eta_minutes}m
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>

                      {/* Time */}
                      <td className="px-4 py-3.5 text-[11px] text-slate-500 whitespace-nowrap">
                        {new Date(inc.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>

                      {/* Action buttons */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {inc.status === 'received' && (
                            <button
                              onClick={() => updateIncidentStatus(inc.id, 'reviewing', 'Inspector Sharma', 'authority', 'Reviewing sector CCTV and dispatching')}
                              className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-lg text-xs transition-colors"
                            >
                              Review
                            </button>
                          )}

                          {!inc.responder_id && !isResolved && (
                            <button
                              onClick={() => setDispatchIncident(inc)}
                              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs shadow-xs transition-colors flex items-center gap-1"
                            >
                              <Ambulance className="w-3.5 h-3.5" />
                              <span>Dispatch</span>
                            </button>
                          )}

                          {!isResolved && inc.status !== 'received' && (
                            <button
                              onClick={() => setResolveIncidentItem(inc)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-xs transition-colors flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Resolve</span>
                            </button>
                          )}

                          {onSelectIncident && (
                            <button
                              onClick={() => onSelectIncident(inc)}
                              className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                              title="View Full Incident File"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dispatch Modal */}
      <AssignResponderModal
        incident={dispatchIncident}
        isOpen={Boolean(dispatchIncident)}
        onClose={() => setDispatchIncident(null)}
      />

      {/* Resolve Incident Dialog */}
      {resolveIncidentItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setResolveIncidentItem(null)} />

          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 border border-slate-200 animate-in fade-in zoom-in-95">
            <h3 className="font-bold text-base text-slate-900 mb-1">
              Mark Incident {resolveIncidentItem.incident_code} as Resolved
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter official closing notes for the record and notify the tourist.
            </p>

            <form onSubmit={handleResolveSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Resolution Summary</label>
                <textarea
                  rows={3}
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setResolveIncidentItem(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20"
                >
                  Confirm Resolution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
