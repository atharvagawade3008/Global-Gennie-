import React from 'react';
import { SafetyMap } from '../components/map/SafetyMap';
import { useLocation } from '../context/LocationContext';
import { GeofenceAlertBanner } from '../components/safety/GeofenceAlertBanner';
import { RiskBadge } from '../components/common/Badge';
import { Phone, Crosshair, MapPin } from 'lucide-react';

export const SafetyMapPage: React.FC = () => {
  const { activeZones, nearbyServices, simulateLocation } = useLocation();

  return (
    <div id="tour-safety-map" className="space-y-6 pb-24 lg:pb-12 animate-fade-in-up">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mb-1">
          <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span>Navi Mumbai, Maharashtra, India</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Navi Mumbai Safety Map</h1>
        <p className="text-sm text-slate-500 mt-1">
          Live incident markers, geofenced safety zones, and emergency hospital & police services near you.
        </p>
      </div>

      {/* Geofence Alert */}
      <GeofenceAlertBanner />

      {/* Map */}
      <div className="rounded-3xl overflow-hidden border border-slate-200 shadow-sm">
        <SafetyMap heightClass="h-[480px]" />
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Safety Zones */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900">Safety & Hazard Zones</h3>
              <p className="text-xs text-slate-400 mt-0.5">{activeZones.length} monitored Navi Mumbai zones</p>
            </div>
          </div>

          <div className="space-y-3">
            {activeZones.map((zone) => (
              <div
                key={zone.id}
                className="p-4 rounded-2xl border border-slate-100 hover:bg-slate-50/80 transition-colors shadow-2xs"
              >
                <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`w-2.5 h-2.5 rounded-full shrink-0 aspect-square ${
                        zone.risk_level === 'danger' ? 'bg-rose-500' :
                        zone.risk_level === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                    />
                    <h4 className="font-bold text-sm text-slate-900 truncate">{zone.name}</h4>
                  </div>
                  <RiskBadge level={zone.risk_level} />
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-3">{zone.warning_message}</p>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                  <span className="text-slate-500">Radius: <strong className="text-slate-800 font-bold">{zone.radius_meters}m</strong></span>
                  <button
                    onClick={() => simulateLocation(zone.center_lat, zone.center_lng)}
                    className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-bold transition-colors"
                  >
                    <Crosshair className="w-3.5 h-3.5" />
                    <span>Test Jump</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency Services */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900">Emergency Services</h3>
              <p className="text-xs text-slate-400 mt-0.5">24/7 verified police & trauma centers</p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              Live Verified
            </span>
          </div>

          <div className="space-y-3">
            {nearbyServices.slice(0, 4).map((srv) => (
              <div
                key={srv.id}
                className="p-4 rounded-2xl border border-slate-100 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-3 shadow-2xs"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200/60 px-2.5 py-0.5 rounded-full shrink-0">
                      {srv.category.replace('_', ' ')}
                    </span>
                    {srv.distance_km !== undefined && (
                      <span className="text-xs text-slate-400 font-semibold">
                        {srv.distance_km < 1 ? `${Math.round(srv.distance_km * 1000)}m` : `${srv.distance_km.toFixed(1)} km`}
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 truncate">{srv.name}</h4>
                  <p className="text-xs text-slate-500 truncate mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span className="truncate">{srv.address}</span>
                  </p>
                </div>

                <a
                  href={`tel:${srv.phone}`}
                  className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors shrink-0 shadow-xs"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
