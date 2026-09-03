import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import { useIncidents } from '../context/IncidentContext';
import { SafetyMap } from '../components/map/SafetyMap';
import { GeofenceAlertBanner } from '../components/safety/GeofenceAlertBanner';
import { SosButtonModal } from '../components/sos/SosButtonModal';
import { IncidentReportModal } from '../components/incidents/IncidentReportModal';
import {
  AlertOctagon,
  Shield,
  MapPin,
  Package,
  Users,
  Sparkles,
  Phone,
  ShieldCheck,
  ChevronRight,
  Plus,
  FileText,
} from 'lucide-react';

interface TouristHomeProps {
  onNavigateTab: (tab: string) => void;
  onOpenAi: () => void;
}

export const TouristHome: React.FC<TouristHomeProps> = ({ onNavigateTab, onOpenAi }) => {
  const { user } = useAuth();
  const { currentLocation, nearbyServices, isLoadingServices } = useLocation();
  const { activeSosIncident, incidents } = useIncidents();

  const [isSosModalOpen, setIsSosModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const recentIncidents = incidents.slice(0, 2);

  return (
    <div className="space-y-6 pb-24 lg:pb-12 animate-fade-in-up">
      {/* Geofence Alert */}
      <GeofenceAlertBanner />

      {/* Welcome Section */}
      <div id="tour-safety-hub" className="pt-1">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mb-1">
          <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span>Navi Mumbai, Maharashtra, India</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Welcome back, {user.full_name.split(' ')[0]} 👋
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-xl">
          Your safety network is active across Navi Mumbai. Emergency dispatch is on standby 24/7.
        </p>
      </div>

      {/* Active SOS State Card — compact and clean on mobile */}
      {activeSosIncident && (
        <div className="bg-rose-50 border border-rose-200 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm animate-fade-in-up">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 bg-rose-600 rounded-2xl flex items-center justify-center text-white shrink-0 aspect-square animate-pulse shadow-md shadow-rose-500/30">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-rose-950 text-xs sm:text-sm">SOS Emergency Active</span>
                <span className="font-mono text-xs font-bold text-rose-600 bg-rose-100/80 px-2 py-0.5 rounded-full">
                  {activeSosIncident.incident_code}
                </span>
              </div>
              <p className="text-rose-700 text-xs mt-0.5 truncate max-w-xs sm:max-w-md">
                {activeSosIncident.title}
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('incidents')}
            className="flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-all shrink-0 shadow-sm"
          >
            <span>Track Response</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Primary Action Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        {/* SOS Card */}
        <div
          id="tour-sos-button"
          className="lg:col-span-2 bg-slate-900 rounded-3xl p-6 sm:p-7 text-white relative overflow-hidden shadow-xl"
        >
          <div className="absolute -right-16 -top-16 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0 aspect-square" />
              <span className="text-[11px] font-extrabold text-emerald-400 tracking-widest uppercase">
                Safety Network Online
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white mb-1 tracking-tight">Emergency Response</h2>
            <p className="text-xs sm:text-sm text-slate-300 mb-6 max-w-md leading-relaxed">
              Instant Navi Mumbai police and medical dispatch with GPS coordinates. Average response under 4 minutes.
            </p>

            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              {/* SOS Button */}
              <button
                onClick={() => setIsSosModalOpen(true)}
                className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 active:scale-95 text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl font-black text-xs sm:text-sm shadow-lg shadow-rose-500/30 transition-all animate-pulse-sos shrink-0"
              >
                <AlertOctagon className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                <span>SOS Emergency</span>
              </button>

              {/* Report Incident */}
              <button
                onClick={() => setIsReportModalOpen(true)}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/15 text-white px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm transition-colors shrink-0"
              >
                <Plus className="w-4 h-4 shrink-0" />
                <span>Report Incident</span>
              </button>

              {/* Emergency Call */}
              <a
                href="tel:112"
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm transition-colors shrink-0"
              >
                <Phone className="w-4 h-4 shrink-0" />
                <span>Call 112</span>
              </a>
            </div>

            <div className="mt-5 pt-4 border-t border-white/10 flex items-center gap-2 text-xs text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="font-mono text-[11px]">
                {currentLocation.lat.toFixed(5)}, {currentLocation.lng.toFixed(5)} (Navi Mumbai)
              </span>
            </div>
          </div>
        </div>

        {/* AI Assistant Card */}
        <div
          onClick={onOpenAi}
          className="bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 border border-violet-200/70 rounded-3xl p-6 cursor-pointer hover:border-violet-300 hover:shadow-md transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 bg-violet-100 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-violet-200 transition-colors shrink-0 aspect-square">
              <Sparkles className="w-5 h-5 text-violet-600" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-base mb-1.5">AI Safety Guide</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Multilingual emergency phrases in 10 languages. Incident classification and safe Navi Mumbai route guidance.
            </p>
          </div>

          <div className="mt-5 flex items-center gap-2 text-xs sm:text-sm font-bold text-violet-700 group-hover:gap-3 transition-all">
            <span>Open AI Guide</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Quick Nav Access Grid */}
      <div>
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Quick Navigation</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {[
            { id: 'map', label: 'Safety Map', sub: 'Live zones & services', icon: MapPin, color: 'bg-blue-50 text-blue-600' },
            { id: 'incidents', label: 'Incidents', sub: 'Track active reports', icon: FileText, color: 'bg-amber-50 text-amber-600' },
            { id: 'lostfound', label: 'Lost & Found', sub: 'Search & claim items', icon: Package, color: 'bg-violet-50 text-violet-600' },
            { id: 'groups', label: 'Travel Groups', sub: 'Group check-ins', icon: Users, color: 'bg-teal-50 text-teal-600' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onNavigateTab(item.id)}
                className="bg-white border border-slate-200/80 rounded-3xl p-4 sm:p-5 text-left hover:border-slate-300 hover:shadow-md transition-all group shadow-2xs"
              >
                <div className={`w-10 h-10 rounded-2xl ${item.color} flex items-center justify-center mb-3 group-hover:scale-105 transition-transform shrink-0 aspect-square`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="font-bold text-sm text-slate-900">{item.label}</p>
                <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{item.sub}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Map Preview */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-900 text-base">Navi Mumbai Safety Map</h2>
            <p className="text-xs text-slate-400 mt-0.5">Live zones, incident markers & verified emergency stations</p>
          </div>
          <button
            onClick={() => onNavigateTab('map')}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-bold transition-colors"
          >
            <span>Full Map</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="rounded-3xl overflow-hidden border border-slate-200 shadow-sm">
          <SafetyMap heightClass="h-[320px]" />
        </div>
      </div>

      {/* Nearby Emergency Stations */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-900 text-base">Nearby Verified Emergency Services</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isLoadingServices ? 'Scanning area...' : `${nearbyServices.length} verified services in Navi Mumbai radius`}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {nearbyServices.slice(0, 3).map((srv) => (
            <div
              key={srv.id}
              className="bg-white border border-slate-200/80 rounded-3xl p-4 sm:p-5 hover:border-slate-300 hover:shadow-sm transition-all shadow-2xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200/60 px-2.5 py-1 rounded-full shrink-0">
                    {srv.category.replace('_', ' ')}
                  </span>
                  {srv.distance_km !== undefined && (
                    <span className="text-xs font-bold text-slate-500">
                      {srv.distance_km < 1 ? `${Math.round(srv.distance_km * 1000)}m` : `${srv.distance_km.toFixed(1)} km`}
                    </span>
                  )}
                </div>

                <h4 className="font-bold text-sm text-slate-900 line-clamp-1 mb-0.5">{srv.name}</h4>
                <p className="text-xs text-slate-500 line-clamp-1 mb-4">{srv.address}</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                  <span>24/7 Active</span>
                </span>
                <a
                  href={`tel:${srv.phone}`}
                  className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 transition-colors shadow-xs"
                >
                  <Phone className="w-3 h-3" />
                  <span>Call</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      {recentIncidents.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-900 text-base">Recent Incident Activity</h2>
            <button
              onClick={() => onNavigateTab('incidents')}
              className="text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2.5">
            {recentIncidents.map((inc) => (
              <button
                key={inc.id}
                onClick={() => onNavigateTab('incidents')}
                className="w-full bg-white border border-slate-200/80 rounded-2xl p-4 text-left hover:border-slate-300 hover:shadow-sm transition-all flex items-center justify-between gap-4 shadow-2xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-2.5 h-2.5 rounded-full shrink-0 aspect-square ${
                      inc.status === 'resolved'
                        ? 'bg-emerald-500'
                        : inc.priority === 'critical'
                        ? 'bg-rose-500 animate-pulse'
                        : 'bg-amber-500'
                    }`}
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-xs sm:text-sm text-slate-900 truncate">{inc.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">
                      {inc.incident_code} · {inc.status.replace(/_/g, ' ')}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <SosButtonModal
        isOpen={isSosModalOpen}
        onClose={() => setIsSosModalOpen(false)}
        onSuccess={() => onNavigateTab('incidents')}
      />
      <IncidentReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
    </div>
  );
};
