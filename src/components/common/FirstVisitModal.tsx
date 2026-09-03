import React from 'react';
import globalGennieLogoWhite from '../../assets/logo_white.png';
import { AlertOctagon, Compass, X, ArrowRight, Sparkles } from 'lucide-react';

interface FirstVisitModalProps {
  isOpen: boolean;
  onSelectEmergency: () => void;
  onStartTour: () => void;
  onDismiss: () => void;
}

export const FirstVisitModal: React.FC<FirstVisitModalProps> = ({
  isOpen,
  onSelectEmergency,
  onStartTour,
  onDismiss,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Black Semi-Transparent Overlay */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-fade-in"
        onClick={onDismiss}
      />

      {/* Main Modal Card */}
      <div className="relative w-full max-w-xl bg-slate-900 text-white rounded-3xl shadow-2xl overflow-hidden border border-slate-700/80 animate-fade-in-up z-10 my-auto">
        {/* Glow accent */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top bar with Logo & Dismiss */}
        <div className="p-6 pb-4 sm:p-8 sm:pb-4 flex items-center justify-between relative border-b border-slate-800/80">
          <div>
            <img
              src={globalGennieLogoWhite}
              alt="Global Gennie"
              className="h-8 sm:h-9 w-auto max-w-[190px] sm:max-w-[220px] object-contain"
            />
          </div>
          <button
            onClick={onDismiss}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Dismiss & Explore"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Core Question Content */}
        <div className="p-6 sm:p-8 space-y-6 relative">
          <div className="text-center space-y-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest text-blue-400 bg-blue-500/15 border border-blue-400/30 px-3 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5" />
              Navi Mumbai Tourist Safety Network
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Are you here for an emergency?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
              We provide instantaneous police, medical, and rescue dispatch across Navi Mumbai, or a 1-minute guided overview of all safety features.
            </p>
          </div>

          {/* Primary Two Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Option 1: EMERGENCY */}
            <button
              onClick={onSelectEmergency}
              className="group relative flex flex-col justify-between p-6 rounded-2xl bg-gradient-to-b from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-left transition-all transform active:scale-95 shadow-xl shadow-rose-600/30 border border-rose-400/40"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white shrink-0 aspect-square shadow-inner">
                  <AlertOctagon className="w-6 h-6 animate-pulse" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-black/25 px-2.5 py-1 rounded-full text-rose-100">
                  Priority Action
                </span>
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-lg font-black tracking-tight text-white">
                    🚨 Emergency
                  </h3>
                </div>
                <p className="text-xs text-rose-100/90 mt-1 leading-relaxed">
                  I need urgent police, ambulance, or rescue dispatch right now.
                </p>
              </div>

              <div className="mt-5 pt-4 pb-1 border-t border-white/20 flex items-center justify-between text-xs font-extrabold text-white">
                <span>Trigger SOS Now</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            {/* Option 2: TAKE WEBSITE TOUR */}
            <button
              onClick={onStartTour}
              className="group relative flex flex-col justify-between p-5 rounded-2xl bg-gradient-to-b from-slate-800 to-slate-850 hover:from-slate-750 hover:to-slate-800 text-white text-left transition-all transform active:scale-95 shadow-xl shadow-slate-950/40 border border-slate-700/80 hover:border-blue-500/50"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 shrink-0 aspect-square shadow-inner">
                  <Compass className="w-6 h-6 group-hover:rotate-45 transition-transform duration-300" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-blue-500/20 px-2.5 py-1 rounded-full text-blue-300 border border-blue-400/30">
                  Interactive Guide
                </span>
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-lg font-black tracking-tight text-white">
                    🌍 Take Website Tour
                  </h3>
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Show me around the Safety Map, AI Guide, Lost & Found, and tools.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs font-extrabold text-blue-400 group-hover:text-blue-300">
                <span>Start Product Tour</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </div>

          {/* Footer dismiss note */}
          <div className="pt-2 text-center">
            <button
              onClick={onDismiss}
              className="text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors underline-offset-4 hover:underline"
            >
              Skip for now and explore the app directly
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
