import React from 'react';
import globalGennieLogoWhite from '../../assets/logo_white.png';
import { PhoneCall, Lock, Globe } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 mt-16 pb-20 lg:pb-0 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand — Official Global Gennie Logo (White Text on Dark Background) */}
          <div className="md:col-span-1">
            <div className="mb-3.5">
              <img
                src={globalGennieLogoWhite}
                alt="Global Gennie"
                className="h-9 sm:h-10 w-auto max-w-[200px] object-contain"
              />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Integrated Tourist Safety, Geofence Advisory & Emergency Incident Response Platform.
              24/7 multi-agency coordination across Navi Mumbai and visitor corridors.
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                RLS Secured
              </span>
              <span className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-blue-400" />
                OpenStreetMap Geodata
              </span>
            </div>
          </div>

          {/* Emergency Numbers */}
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-4">
              Emergency Helplines
            </h4>
            <div className="space-y-2.5">
              {[
                { label: 'Universal Emergency Helpline', number: '112', color: 'text-rose-400' },
                { label: 'Navi Mumbai Tourist Police', number: '1363 / +91 22 2757 8888', color: 'text-blue-400' },
                { label: 'Apollo Ambulance / Trauma', number: '102 / +91 22 6280 6280', color: 'text-emerald-400' },
              ].map((item) => (
                <div key={item.number} className="flex items-center gap-2 text-xs">
                  <PhoneCall className={`w-3.5 h-3.5 shrink-0 ${item.color}`} />
                  <span className="text-slate-400">{item.label}:</span>
                  <a
                    href={`tel:${item.number.split('/')[0].trim()}`}
                    className="text-white font-bold hover:text-blue-300 transition-colors"
                  >
                    {item.number}
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Platform Info */}
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-4">
              Platform
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              React · TypeScript · Tailwind CSS · Supabase Realtime · Leaflet Maps · Navi Mumbai
            </p>
            <span className="inline-block bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold px-3 py-1.5 rounded-xl">
              24/7 Active Sentinel
            </span>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>© {new Date().getFullYear()} Global Gennie Tourism Safety Network</span>
          <span>Navi Mumbai Safety Hub</span>
        </div>
      </div>
    </footer>
  );
};
