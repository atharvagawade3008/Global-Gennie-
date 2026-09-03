import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from '../../context/LocationContext';
import { useAuth } from '../../context/AuthContext';
import { useIncidents } from '../../context/IncidentContext';
import { AlertOctagon, X, MapPin, ShieldAlert, Phone, HeartPulse, CheckCircle2 } from 'lucide-react';

interface SosButtonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const SosButtonModal: React.FC<SosButtonModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { currentLocation } = useLocation();
  const { user, touristProfile, emergencyContacts } = useAuth();
  const { triggerSosEmergency } = useIncidents();

  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [isTriggered, setIsTriggered] = useState(false);

  const holdIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setHoldProgress(0);
      setIsHolding(false);
      setIsCountingDown(false);
      setCountdown(3);
      setIsTriggered(false);
    }
  }, [isOpen]);

  // Hold-to-confirm progress logic (e.g. 1.2 seconds hold)
  const startHold = () => {
    setIsHolding(true);
    setHoldProgress(0);
    const startTime = Date.now();
    const duration = 1200; // 1.2s hold required

    holdIntervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, (elapsed / duration) * 100);
      setHoldProgress(progress);

      if (progress >= 100) {
        if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
        setIsHolding(false);
        startCountdown();
      }
    }, 30);
  };

  const cancelHold = () => {
    if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
    setIsHolding(false);
    setHoldProgress(0);
  };

  const startCountdown = () => {
    setIsCountingDown(true);
    setCountdown(3);
  };

  // 3-second abort countdown
  useEffect(() => {
    if (!isCountingDown) return;

    if (countdown > 0) {
      const t = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(t);
    } else if (countdown === 0) {
      // Execute SOS
      executeSos();
    }
  }, [isCountingDown, countdown]);

  const executeSos = () => {
    setIsCountingDown(false);
    setIsTriggered(true);

    const medicalContext = [
      touristProfile.blood_group ? `Blood: ${touristProfile.blood_group}` : null,
      touristProfile.allergies ? `Allergies: ${touristProfile.allergies}` : null,
      touristProfile.medical_conditions ? `Conditions: ${touristProfile.medical_conditions}` : null,
    ]
      .filter(Boolean)
      .join(' | ');

    triggerSosEmergency(
      {
        lat: currentLocation.lat,
        lng: currentLocation.lng,
        address: 'Navi Mumbai, Maharashtra, India',
      },
      {
        name: user.full_name,
        phone: user.phone,
        id: user.id,
      },
      medicalContext
    );

    setTimeout(() => {
      if (onSuccess) onSuccess();
      onClose();
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark Dim Backdrop */}
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="bg-rose-600 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-base">Emergency SOS</h2>
              <p className="text-xs text-rose-200">Instant police & medical dispatch</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-0">
          {isTriggered ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce shrink-0 aspect-square">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 mb-1">SOS BROADCASTED!</h3>
              <p className="text-sm text-slate-600">
                Authorities have received your emergency coordinates. Stand by for responder dispatch.
              </p>
            </div>
          ) : isCountingDown ? (
            /* Abort window countdown */
            <div className="text-center py-6">
              <div className="w-24 h-24 rounded-full bg-rose-50 border-4 border-rose-600 flex items-center justify-center mx-auto mb-4 animate-pulse">
                <span className="text-4xl font-extrabold text-rose-600">{countdown}</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Broadcasting Emergency Signal in {countdown}s</h3>
              <p className="text-xs text-slate-500 mb-6">
                Press cancel now if this was an accidental trigger.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsCountingDown(false)}
                  className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-sm transition-all"
                >
                  CANCEL NOW
                </button>
                <button
                  onClick={executeSos}
                  className="flex-1 py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-sm shadow-md transition-all"
                >
                  SEND IMMEDIATELY
                </button>
              </div>
            </div>
          ) : (
            /* Standard SOS Trigger View */
            <div className="space-y-5">
              {/* Location & Context Snapshot */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2 text-slate-800 font-semibold">
                  <MapPin className="w-4 h-4 text-rose-600" />
                  <span>GPS: {currentLocation.lat.toFixed(5)}, {currentLocation.lng.toFixed(5)}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <HeartPulse className="w-4 h-4 text-purple-600" />
                  <span>
                    Medical: {touristProfile.blood_group || 'O+'} | Allergies: {touristProfile.allergies || 'None'}
                  </span>
                </div>
                {emergencyContacts.length > 0 && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone className="w-4 h-4 text-blue-600" />
                    <span>Auto-alerting {emergencyContacts[0].name} ({emergencyContacts[0].phone})</span>
                  </div>
                )}
              </div>

              {/* Big Central SOS Hold Button */}
              <div className="flex flex-col items-center justify-center pt-2 pb-4">
                <div className="relative">
                  {/* Progress Ring Background */}
                  <svg className="w-40 h-40 -rotate-90">
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke="#f1f5f9"
                      strokeWidth="8"
                      fill="transparent"
                    />
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke="#dc2626"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={440}
                      strokeDashoffset={440 - (440 * holdProgress) / 100}
                      strokeLinecap="round"
                      className="transition-all duration-75"
                    />
                  </svg>

                  {/* Main Hold Button */}
                  <button
                    onMouseDown={startHold}
                    onMouseUp={cancelHold}
                    onMouseLeave={cancelHold}
                    onTouchStart={startHold}
                    onTouchEnd={cancelHold}
                    className={`absolute inset-5 rounded-full flex flex-col items-center justify-center text-white shadow-xl transition-all select-none py-3 ${
                      isHolding
                        ? 'bg-rose-700 scale-95 ring-8 ring-rose-300 shadow-rose-600/50'
                        : 'bg-rose-600 hover:bg-rose-700 active:scale-95 ring-4 ring-rose-200'
                    }`}
                  >
                    <AlertOctagon className="w-9 h-9 mb-1 animate-pulse" />
                    <span className="font-extrabold text-xl tracking-wider">HOLD SOS</span>
                    <span className="text-[10px] font-semibold text-rose-100 uppercase tracking-widest mt-0.5">
                      {isHolding ? 'HOLDING...' : 'PRESS & HOLD'}
                    </span>
                  </button>
                </div>
                <p className="text-xs text-slate-400 mt-4 text-center font-medium">
                  Press and hold for 1 second or tap below to start 3s countdown
                </p>
              </div>

              {/* Instant Tap Option */}
              <div className="border-t border-slate-100 pt-3 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-1/3 py-2.5 px-3 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={startCountdown}
                  className="w-2/3 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs shadow-sm transition-colors flex items-center justify-center gap-2"
                >
                  <AlertOctagon className="w-4 h-4 text-rose-400" />
                  <span>1-Tap SOS with Countdown</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
