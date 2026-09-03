import React, { useState } from 'react';
import { useIncidents } from '../../context/IncidentContext';
import { useLocation } from '../../context/LocationContext';
import { SafetyMap } from '../map/SafetyMap';
import { IncidentTriageTable } from './IncidentTriageTable';
import { AuthorityAnalytics } from './AuthorityAnalytics';
import { LostFoundGrid } from '../lostfound/LostFoundGrid';
import { ZoneManagementModal } from './ZoneManagementModal';
import {
  ShieldAlert,
  AlertOctagon,
  Ambulance,
  MapPin,
  BarChart3,
  ListFilter,
  Plus,
  Package,
  Radio,
} from 'lucide-react';

export const AuthorityCommandCenter: React.FC = () => {
  const { incidents, responders } = useIncidents();
  const { activeZones } = useLocation();

  const [activeTab, setActiveTab] = useState<'triage' | 'map' | 'analytics' | 'lostfound'>('triage');
  const [isZoneModalOpen, setIsZoneModalOpen] = useState(false);

  const activeSosCount = incidents.filter((i) => i.is_sos && i.status !== 'resolved' && i.status !== 'cancelled').length;
  const activeCasesCount = incidents.filter((i) => i.status !== 'resolved' && i.status !== 'cancelled').length;
  const availableRespondersCount = responders.filter((r) => r.status === 'available').length;

  const tabs = [
    { id: 'triage', label: 'Triage & Dispatch', count: activeCasesCount, icon: ListFilter },
    { id: 'map', label: 'Live Map', icon: MapPin },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'lostfound', label: 'Lost & Found', icon: Package },
  ] as const;

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Command Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <span className="flex items-center gap-1.5 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              LIVE
            </span>
            <span className="text-xs text-slate-400">Navi Mumbai, Maharashtra, India</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Command Center</h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time incident triage, emergency dispatch, and geofence management.
          </p>
        </div>

        <button
          onClick={() => setIsZoneModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-md shadow-blue-500/20 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Safety Zone
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-100 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-slate-500">Critical SOS</p>
            <AlertOctagon className={`w-4 h-4 ${activeSosCount > 0 ? 'text-rose-500 animate-pulse' : 'text-slate-300'}`} />
          </div>
          <p className={`text-3xl font-bold ${activeSosCount > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
            {activeSosCount}
          </p>
          <p className="text-xs text-slate-400 mt-1">Active signals</p>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-slate-500">Active Incidents</p>
            <ShieldAlert className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-3xl font-bold text-slate-900">{activeCasesCount}</p>
          <p className="text-xs text-slate-400 mt-1">Under review</p>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-slate-500">Available Units</p>
            <Ambulance className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-3xl font-bold text-emerald-600">{availableRespondersCount}</p>
          <p className="text-xs text-slate-400 mt-1">of {responders.length} total</p>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-slate-500">Safety Zones</p>
            <MapPin className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-blue-600">{activeZones.length}</p>
          <p className="text-xs text-slate-400 mt-1">Active geofences</p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === (tab.id as typeof activeTab);
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all shrink-0 ${
                isActive
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {'count' in tab && tab.count !== undefined && tab.count > 0 && (
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in-up">
        {activeTab === 'triage' && <IncidentTriageTable />}
        {activeTab === 'map' && (
          <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
            <SafetyMap heightClass="h-[560px]" />
          </div>
        )}
        {activeTab === 'analytics' && <AuthorityAnalytics />}
        {activeTab === 'lostfound' && <LostFoundGrid />}
      </div>

      <ZoneManagementModal
        isOpen={isZoneModalOpen}
        onClose={() => setIsZoneModalOpen(false)}
      />
    </div>
  );
};
