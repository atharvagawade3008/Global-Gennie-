import React, { useState } from 'react';
import { useLocation } from '../../context/LocationContext';
import { useAuth } from '../../context/AuthContext';
import { useIncidents } from '../../context/IncidentContext';
import { IncidentCategory, IncidentPriority } from '../../types';
import { classifyIncidentText } from '../../lib/geminiAI';
import {
  X,
  MapPin,
  Sparkles,
  Camera,
  HeartPulse,
  ShieldAlert,
  UserX,
  Package,
  Car,
  AlertTriangle,
  HelpCircle,
  CheckCircle2,
} from 'lucide-react';

interface IncidentReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategory?: IncidentCategory;
}

export const IncidentReportModal: React.FC<IncidentReportModalProps> = ({
  isOpen,
  onClose,
  initialCategory = 'theft',
}) => {
  const { currentLocation } = useLocation();
  const { user } = useAuth();
  const { reportIncident } = useIncidents();

  const [category, setCategory] = useState<IncidentCategory>(initialCategory);
  const [priority, setPriority] = useState<IncidentPriority>('medium');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('Sector 17, Vashi, Navi Mumbai');
  const [landmark, setLandmark] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const categories: { key: IncidentCategory; label: string; icon: React.ComponentType<{ className?: string }>; desc: string }[] = [
    { key: 'medical_emergency', label: 'Medical Emergency', icon: HeartPulse, desc: 'Injury, illness, acute allergy' },
    { key: 'theft', label: 'Theft / Robbery', icon: ShieldAlert, desc: 'Pickpocketing, luggage, snatched purse' },
    { key: 'lost_person', label: 'Lost Person', icon: UserX, desc: 'Separated companion or child' },
    { key: 'lost_property', label: 'Lost Property', icon: Package, desc: 'Left items in transit, café, hotel' },
    { key: 'accident', label: 'Traffic / Accident', icon: Car, desc: 'Vehicle collision, slip & fall' },
    { key: 'harassment', label: 'Harassment', icon: AlertTriangle, desc: 'Aggressive touts, threats' },
    { key: 'unsafe_area', label: 'Unsafe Hazard', icon: AlertTriangle, desc: 'Flooding, unlit alley, danger' },
    { key: 'other', label: 'Other Support', icon: HelpCircle, desc: 'General safety assistance' },
  ];

  const handleDescriptionChange = (text: string) => {
    setDescription(text);
    if (text.length > 12) {
      const result = classifyIncidentText(text);
      if (result.category !== category || result.priority !== priority) {
        setAiSuggestion(`AI Auto-detected: ${result.extractedTitle} (${result.priority.toUpperCase()} priority). Click to apply.`);
      } else {
        setAiSuggestion(null);
      }
    } else {
      setAiSuggestion(null);
    }
  };

  const applyAiSuggestion = () => {
    if (!description) return;
    const result = classifyIncidentText(description);
    setCategory(result.category);
    setPriority(result.priority);
    if (!title) setTitle(result.extractedTitle);
    setAiSuggestion(null);
  };

  const handleAddSamplePhoto = () => {
    const samplePhotos = [
      'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=300&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=300&auto=format&fit=crop&q=60',
    ];
    setPhotos((prev) => [...prev, samplePhotos[prev.length % samplePhotos.length]]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      reportIncident({
        title,
        description,
        category,
        priority,
        latitude: currentLocation.lat,
        longitude: currentLocation.lng,
        address: landmark ? `${address} (Near ${landmark})` : address,
        reporter_name: user.full_name,
        reporter_phone: user.phone,
        reporter_id: user.id,
        photo_urls: photos,
      });

      setIsSubmitting(false);
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        onClose();
      }, 1200);
    }, 400);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 my-4 sm:my-8">
        {/* Header */}
        <div className="bg-slate-900 p-4 sm:p-5 text-white flex items-center justify-between">
          <div>
            <h2 className="font-bold text-base sm:text-lg">Report Safety Incident</h2>
            <p className="text-[11px] sm:text-xs text-slate-400">Direct transmission to Navi Mumbai Command Center</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {isSubmitted ? (
          <div className="p-8 text-center">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 animate-bounce shrink-0 aspect-square">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Incident Report Submitted!</h3>
            <p className="text-xs sm:text-sm text-slate-600">
              Your report has been logged with the Tourist Safety Authority and assigned a tracking ID.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 max-h-[82vh] overflow-y-auto">
            {/* Category Selector Grid */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Incident Category *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {categories.map((c) => {
                  const Icon = c.icon;
                  const isSelected = category === c.key;
                  return (
                    <button
                      key={c.key}
                      type="button"
                      onClick={() => setCategory(c.key)}
                      className={`p-2.5 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                        isSelected
                          ? 'bg-blue-50 border-blue-600 ring-2 ring-blue-500/20 text-blue-950 font-bold'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className={`w-4 h-4 mb-1 shrink-0 ${isSelected ? 'text-blue-600' : 'text-slate-500'}`} />
                      <span className="text-xs font-semibold leading-tight">{c.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* AI Assistant Suggestion Banner */}
            {aiSuggestion && (
              <div
                onClick={applyAiSuggestion}
                className="p-3 bg-purple-50 border border-purple-200 rounded-2xl flex items-center justify-between text-xs text-purple-900 cursor-pointer hover:bg-purple-100 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Sparkles className="w-4 h-4 text-purple-600 animate-pulse shrink-0" />
                  <span className="truncate">{aiSuggestion}</span>
                </div>
                <span className="font-bold text-purple-700 underline text-xs shrink-0 ml-2">Apply</span>
              </div>
            )}

            {/* Incident Summary / Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Incident Summary / Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Passport and purse stolen near marketplace"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Priority & Urgency */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Urgency Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as IncidentPriority)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="low">Low (General Query / Lost Item)</option>
                  <option value="medium">Medium (Standard Assistance)</option>
                  <option value="high">High (Immediate Response Needed)</option>
                  <option value="critical">Critical (Severe Emergency / SOS)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nearby Landmark (Optional)</label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="e.g. Inorbit Mall Gate 2, Vashi Station"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Description with SHORTENED placeholder for mobile */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">Detailed Description</label>
                <span className="text-[10px] sm:text-xs text-slate-400">AI auto-triage enabled</span>
              </div>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => handleDescriptionChange(e.target.value)}
                placeholder="Describe what happened..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Current Attached GPS & Address */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex items-center justify-between text-xs text-slate-700">
              <div className="flex items-center gap-2 min-w-0">
                <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                <div className="min-w-0">
                  <span className="font-semibold block truncate">GPS Location:</span>
                  <span className="text-slate-500 truncate block">
                    {currentLocation.lat.toFixed(5)}, {currentLocation.lng.toFixed(5)} ({address})
                  </span>
                </div>
              </div>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-1 rounded-full shrink-0">
                LOCKED
              </span>
            </div>

            {/* Photo Attachment */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Evidence Photos (Optional)</label>
              <div className="flex items-center gap-2.5 flex-wrap">
                {photos.map((photo, i) => (
                  <div key={i} className="relative w-14 h-14 rounded-xl overflow-hidden border border-slate-200 shrink-0 aspect-square">
                    <img src={photo} alt="evidence" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setPhotos((prev) => prev.filter((_, idx) => idx !== i))}
                      className="absolute top-0 right-0 bg-slate-900/80 text-white p-0.5 rounded-bl text-xs"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {photos.length < 3 && (
                  <button
                    type="button"
                    onClick={handleAddSamplePhoto}
                    className="w-14 h-14 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/50 flex flex-col items-center justify-center text-slate-500 text-xs transition-colors shrink-0 aspect-square"
                  >
                    <Camera className="w-4 h-4 mb-0.5" />
                    <span className="text-[9px] font-semibold">+ Photo</span>
                  </button>
                )}
              </div>
            </div>

            {/* Actions: Compact Submit Button */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5"
              >
                {isSubmitting ? (
                  <span>Submitting...</span>
                ) : (
                  <>
                    <ShieldAlert className="w-4 h-4" />
                    <span>Submit Report</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
