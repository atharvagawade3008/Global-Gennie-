import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from '../../context/LocationContext';
import { useIncidents } from '../../context/IncidentContext';
import { SafetyZone, Incident, ServiceLocation } from '../../types';
import L from 'leaflet';
import {
  Layers,
  Shield,
  AlertTriangle,
  HeartPulse,
  Navigation2,
  Crosshair,
  Maximize2,
} from 'lucide-react';

interface SafetyMapProps {
  heightClass?: string;
  selectedIncidentId?: string;
  onSelectIncident?: (incident: Incident) => void;
  showZoneControls?: boolean;
}

export const SafetyMap: React.FC<SafetyMapProps> = ({
  heightClass = 'h-[500px]',
  selectedIncidentId,
  onSelectIncident,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  const { currentLocation, activeZones, nearbyServices, simulateLocation, resetToDeviceLocation } = useLocation();
  const { incidents } = useIncidents();

  // Layer Visibility Toggles
  const [showIncidents, setShowIncidents] = useState(true);
  const [showZones, setShowZones] = useState(true);
  const [showServices, setShowServices] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'safe' | 'warning' | 'emergency'>('all');

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [currentLocation.lat, currentLocation.lng],
        zoom: 14,
        zoomControl: false,
      });

      // OpenStreetMap Standard Tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      L.control.zoom({ position: 'topright' }).addTo(map);

      const layers = L.layerGroup().addTo(map);
      layerGroupRef.current = layers;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Layers & Markers when state changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layers = layerGroupRef.current;
    if (!map || !layers) return;

    layers.clearLayers();

    // 1. Tourist's Current Location Marker (Blue pulsing circle)
    const touristIcon = L.divIcon({
      className: 'custom-tourist-marker',
      html: `
        <div style="position: relative; width: 24px; height: 24px;">
          <div style="position: absolute; inset: -6px; border-radius: 9999px; background-color: rgba(37, 99, 235, 0.35); animation: pulse-safe 2s infinite;"></div>
          <div style="width: 24px; height: 24px; border-radius: 9999px; background-color: #2563eb; border: 3px solid #ffffff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3);"></div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    const userMarker = L.marker([currentLocation.lat, currentLocation.lng], { icon: touristIcon }).addTo(layers);
    userMarker.bindPopup(`
      <div style="padding: 4px; font-family: inherit;">
        <strong style="color: #2563eb; font-size: 13px;">📍 You are here</strong>
        <p style="margin: 4px 0 0 0; font-size: 11px; color: #475569;">
          Lat: ${currentLocation.lat.toFixed(5)}<br/>Lng: ${currentLocation.lng.toFixed(5)} (Navi Mumbai)
        </p>
      </div>
    `);

    // 2. Safety Zones & Geofences
    if (showZones) {
      activeZones.forEach((zone) => {
        if (!zone.is_active) return;
        if (activeFilter === 'safe' && zone.risk_level !== 'safe') return;
        if (activeFilter === 'warning' && zone.risk_level !== 'warning') return;
        if (activeFilter === 'emergency' && zone.risk_level !== 'danger') return;

        const isDanger = zone.risk_level === 'danger';
        const isWarning = zone.risk_level === 'warning';
        const isSafe = zone.risk_level === 'safe';

        const color = isDanger ? '#dc2626' : isWarning ? '#d97706' : isSafe ? '#16a34a' : '#2563eb';
        const fillColor = isDanger ? '#ef4444' : isWarning ? '#f59e0b' : isSafe ? '#22c55e' : '#3b82f6';

        const circle = L.circle([zone.center_lat, zone.center_lng], {
          radius: zone.radius_meters,
          color,
          weight: 2,
          fillColor,
          fillOpacity: isDanger ? 0.22 : 0.14,
        }).addTo(layers);

        circle.bindPopup(`
          <div style="font-family: inherit; max-width: 220px;">
            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
              <span style="display: inline-block; width: 8px; height: 8px; border-radius: 999px; background: ${color};"></span>
              <strong style="font-size: 13px; color: #0f172a;">${zone.name}</strong>
            </div>
            <p style="margin: 0 0 6px 0; font-size: 11px; color: #475569;">${zone.warning_message}</p>
            <span style="font-size: 10px; font-weight: bold; padding: 2px 8px; border-radius: 999px; background: ${color}15; color: ${color};">
              Radius: ${zone.radius_meters}m
            </span>
          </div>
        `);
      });
    }

    // 3. Incidents Markers (SOS Pulsing Red Radar & Standard Icons)
    if (showIncidents) {
      incidents.forEach((inc) => {
        if (inc.status === 'resolved' || inc.status === 'cancelled') return;
        if (activeFilter === 'safe') return;

        const isSos = inc.is_sos || inc.priority === 'critical';

        const iconHtml = isSos
          ? `
            <div style="position: relative; width: 32px; height: 32px;">
              <div style="position: absolute; inset: -10px; border-radius: 9999px; background-color: rgba(220, 38, 38, 0.4); animation: pulse-sos 1.8s infinite;"></div>
              <div style="width: 32px; height: 32px; border-radius: 9999px; background-color: #dc2626; border: 3px solid #ffffff; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
                🚨
              </div>
            </div>
          `
          : `
            <div style="width: 28px; height: 28px; border-radius: 9999px; background-color: #d97706; border: 2px solid #ffffff; display: flex; align-items: center; justify-content: center; color: white; font-size: 13px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
              ⚠️
            </div>
          `;

        const markerIcon = L.divIcon({
          className: 'custom-incident-marker',
          html: iconHtml,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const m = L.marker([inc.latitude, inc.longitude], { icon: markerIcon }).addTo(layers);

        m.on('click', () => {
          if (onSelectIncident) onSelectIncident(inc);
        });

        m.bindPopup(`
          <div style="font-family: inherit; min-width: 180px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
              <strong style="color: ${isSos ? '#dc2626' : '#d97706'}; font-size: 12px;">${inc.incident_code}</strong>
              <span style="font-size: 10px; font-weight: 700; text-transform: uppercase;">${inc.status.replace(/_/g, ' ')}</span>
            </div>
            <p style="font-weight: 600; font-size: 12px; margin: 0 0 4px 0;">${inc.title}</p>
            <p style="font-size: 11px; color: #64748b; margin: 0 0 6px 0;">${inc.address || 'Navi Mumbai'}</p>
            ${inc.responder_name ? `<p style="font-size: 10px; color: #2563eb; font-weight: 600;">🚔 ${inc.responder_name}</p>` : ''}
          </div>
        `);
      });
    }

    // 4. Nearby Medical & Police Service Stations
    if (showServices) {
      nearbyServices.slice(0, 8).forEach((srv) => {
        const isHospital = srv.category === 'hospital';
        const isTouristPolice = srv.category === 'tourist_police';

        const srvHtml = `
          <div style="width: 24px; height: 24px; border-radius: 9999px; background-color: ${isHospital ? '#e11d48' : isTouristPolice ? '#4f46e5' : '#0284c7'}; border: 2px solid #ffffff; display: flex; align-items: center; justify-content: center; color: white; font-size: 11px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
            ${isHospital ? '🏥' : isTouristPolice ? '👮' : '🚓'}
          </div>
        `;

        const srvIcon = L.divIcon({
          className: 'custom-service-marker',
          html: srvHtml,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const sm = L.marker([srv.latitude, srv.longitude], { icon: srvIcon }).addTo(layers);
        sm.bindPopup(`
          <div style="font-family: inherit; min-width: 170px;">
            <strong style="font-size: 12px; color: #0f172a;">${srv.name}</strong>
            <p style="font-size: 11px; color: #475569; margin: 3px 0;">${srv.address}</p>
            <a href="tel:${srv.phone}" style="display: inline-block; font-size: 11px; font-weight: bold; color: #2563eb; text-decoration: none; margin-top: 4px;">
              📞 Call ${srv.phone}
            </a>
          </div>
        `);
      });
    }
  }, [
    currentLocation,
    activeZones,
    incidents,
    nearbyServices,
    showIncidents,
    showZones,
    showServices,
    activeFilter,
    onSelectIncident,
  ]);

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([currentLocation.lat, currentLocation.lng], 15, {
        animate: true,
      });
    }
  };

  return (
    <div className={`relative w-full ${heightClass} rounded-3xl overflow-hidden border border-slate-200 shadow-md`}>
      {/* Map Target Div */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Top Map Layer Filter Pills */}
      <div className="absolute top-3 left-3 z-20 flex flex-wrap items-center gap-1.5 bg-white/90 backdrop-blur-md p-1.5 rounded-2xl shadow-md border border-slate-200 text-xs">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1 rounded-xl font-bold transition-all ${
            activeFilter === 'all' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All Layers
        </button>
        <button
          onClick={() => setActiveFilter('safe')}
          className={`px-3 py-1 rounded-xl font-bold transition-all ${
            activeFilter === 'safe' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Safe Corridors
        </button>
        <button
          onClick={() => setActiveFilter('warning')}
          className={`px-3 py-1 rounded-xl font-bold transition-all ${
            activeFilter === 'warning' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Advisory Zones
        </button>
        <button
          onClick={() => setActiveFilter('emergency')}
          className={`px-3 py-1 rounded-xl font-bold transition-all ${
            activeFilter === 'emergency' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Emergency SOS
        </button>
      </div>

      {/* Quick Simulation Shortcuts (Navi Mumbai Geofences) */}
      <div className="absolute bottom-3 left-3 z-20 hidden sm:flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md text-white px-3 py-1.5 rounded-2xl text-[11px] shadow-lg border border-slate-700">
        <span className="text-slate-400 font-extrabold">TEST GEOFENCE:</span>
        <button
          onClick={() => simulateLocation(19.0748, 72.9978)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-lg font-bold transition-colors shadow-xs"
          title="Teleport to Vashi Sector 17 Safe Corridor"
        >
          Vashi Safe
        </button>
        <button
          onClick={() => simulateLocation(19.0520, 73.0720)}
          className="bg-amber-600 hover:bg-amber-700 text-white px-2.5 py-1 rounded-lg font-bold transition-colors shadow-xs"
          title="Teleport to Kharghar Hills Monsoon Warning Zone"
        >
          Kharghar Warning
        </button>
        <button
          onClick={() => simulateLocation(18.9500, 72.9500)}
          className="bg-rose-600 hover:bg-rose-700 text-white px-2.5 py-1 rounded-lg font-bold transition-colors shadow-xs"
          title="Teleport to JNPT Transit Danger Zone"
        >
          JNPT Caution
        </button>
        <button
          onClick={resetToDeviceLocation}
          className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-2.5 py-1 rounded-lg font-bold transition-colors"
          title="Reset to Device GPS"
        >
          Reset GPS
        </button>
      </div>

      {/* Recenter & Map Controls Button */}
      <div className="absolute bottom-3 right-3 z-20 flex flex-col gap-2">
        <button
          onClick={handleRecenter}
          className="p-2.5 bg-white text-slate-700 hover:text-blue-600 rounded-2xl shadow-lg border border-slate-200 hover:bg-slate-50 transition-all shrink-0 aspect-square"
          title="Center on My Location"
        >
          <Crosshair className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
