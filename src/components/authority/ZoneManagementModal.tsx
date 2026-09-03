import React, { useState } from 'react';
import { SafetyZone, ZoneRiskLevel } from '../../types';
import { realtimeStore } from '../../lib/storage';
import { useLocation } from '../../context/LocationContext';
import { X, ShieldAlert, MapPin, CheckCircle2 } from 'lucide-react';

interface ZoneManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  zoneToEdit?: SafetyZone | null;
  onSuccess?: () => void;
}

export const ZoneManagementModal: React.FC<ZoneManagementModalProps> = ({
  isOpen,
  onClose,
  zoneToEdit,
  onSuccess,
}) => {
  const { currentLocation } = useLocation();

  const [name, setName] = useState(zoneToEdit?.name || '');
  const [description, setDescription] = useState(zoneToEdit?.description || '');
  const [zoneType, setZoneType] = useState<SafetyZone['zone_type']>(zoneToEdit?.zone_type || 'hazard_zone');
  const [riskLevel, setRiskLevel] = useState<ZoneRiskLevel>(zoneToEdit?.risk_level || 'warning');
  const [centerLat, setCenterLat] = useState<number>(zoneToEdit?.center_lat || currentLocation.lat);
  const [centerLng, setCenterLng] = useState<number>(zoneToEdit?.center_lng || currentLocation.lng);
  const [radiusMeters, setRadiusMeters] = useState<number>(zoneToEdit?.radius_meters || 500);
  const [warningMessage, setWarningMessage] = useState(zoneToEdit?.warning_message || '');
  const [instructions, setInstructions] = useState(zoneToEdit?.instructions || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !warningMessage.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const zone: SafetyZone = {
        id: zoneToEdit?.id || 'zone-' + Math.random().toString(36).substring(2, 9),
        name,
        description,
        zone_type: zoneType,
        risk_level: riskLevel,
        center_lat: centerLat,
        center_lng: centerLng,
        radius_meters: radiusMeters,
        warning_message: warningMessage,
        instructions,
        is_active: true,
      };

      realtimeStore.saveSafetyZone(zone);
      setIsSubmitting(false);
      if (onSuccess) onSuccess();
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 my-8">
        {/* Header */}
        <div className="bg-slate-900 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-xl">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">
                {zoneToEdit ? 'Edit Safety Zone' : 'Create New Geofenced Safety Zone'}
              </h3>
              <p className="text-xs text-slate-400">Configures real-time alerts for all nearby tourists</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Zone Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Kharghar Hills Monsoon Advisory Zone"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Zone Classification</label>
              <select
                value={zoneType}
                onChange={(e) => setZoneType(e.target.value as SafetyZone['zone_type'])}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <option value="safe_haven">Safe Haven / Tourist Corridor</option>
                <option value="hazard_zone">Hazard / Advisory Zone</option>
                <option value="high_crime">Caution / High Crowd Area</option>
                <option value="curfew_zone">Restricted / Curfew Zone</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Risk Warning Level *</label>
              <select
                value={riskLevel}
                onChange={(e) => setRiskLevel(e.target.value as ZoneRiskLevel)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <option value="safe" className="text-emerald-700 font-bold">Safe Haven (Green)</option>
                <option value="advisory" className="text-blue-700 font-bold">Advisory Notice (Blue)</option>
                <option value="warning" className="text-amber-700 font-bold">Warning / Caution (Amber)</option>
                <option value="danger" className="text-rose-700 font-bold">High Danger Alert (Red)</option>
              </select>
            </div>
          </div>

          {/* Coordinates & Radius */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Center Lat</label>
              <input
                type="number"
                step="any"
                required
                value={centerLat}
                onChange={(e) => setCenterLat(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Center Lng</label>
              <input
                type="number"
                step="any"
                required
                value={centerLng}
                onChange={(e) => setCenterLng(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Radius (Meters)</label>
              <input
                type="number"
                min={100}
                max={10000}
                required
                value={radiusMeters}
                onChange={(e) => setRadiusMeters(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
              />
            </div>
          </div>

          {/* Warning Message */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tourist Geofence Broadcast Message *
            </label>
            <input
              type="text"
              required
              value={warningMessage}
              onChange={(e) => setWarningMessage(e.target.value)}
              placeholder="e.g. Caution: High pickpocket density after 9 PM. Keep bags in front."
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Guidelines */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Recommended Action / Instructions</label>
            <textarea
              rows={2}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g. Use authorized taxi booths, avoid unlit alleyways..."
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
              disabled={isSubmitting}
              className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20"
            >
              {isSubmitting ? 'Saving Zone...' : 'Save Safety Zone'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
