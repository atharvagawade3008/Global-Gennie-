import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useIncidents } from '../../context/IncidentContext';
import { realtimeStore } from '../../lib/storage';
import {
  Building2,
  Users,
  ShieldCheck,
  Send,
  AlertTriangle,
  MapPin,
  Phone,
  CheckCircle2,
  BellRing,
} from 'lucide-react';

export const HotelPortal: React.FC = () => {
  const { user } = useAuth();
  const { incidents } = useIncidents();

  const [advisoryTitle, setAdvisoryTitle] = useState('');
  const [advisoryBody, setAdvisoryBody] = useState('');
  const [isSent, setIsSent] = useState(false);

  // Mock guest roster for Navi Mumbai
  const guestRoster = [
    {
      id: 'g-1',
      name: 'Elena Rostova',
      room: 'Suite 402',
      nationality: 'Canada',
      phone: '+1 (555) 234-8901',
      tourGroup: 'Navi Mumbai Coastal & Heritage Discovery',
      isSafe: true,
      lastCheckin: '12 mins ago',
    },
    {
      id: 'g-2',
      name: 'Thomas Weber',
      room: 'Room 310',
      nationality: 'Germany',
      phone: '+49 151 2345678',
      tourGroup: 'Navi Mumbai Coastal & Heritage Discovery',
      isSafe: true,
      lastCheckin: '45 mins ago',
    },
    {
      id: 'g-3',
      name: 'Sarah & Mark Jenkins',
      room: 'Suite 504',
      nationality: 'United Kingdom',
      phone: '+44 7700 900123',
      tourGroup: 'Independent Visitor',
      isSafe: true,
      lastCheckin: '2 hours ago',
    },
    {
      id: 'g-4',
      name: 'Aiko Tanaka',
      room: 'Room 214',
      nationality: 'Japan',
      phone: '+81 90 1234 5678',
      tourGroup: 'Navi Mumbai Coastal & Heritage Discovery',
      isSafe: true,
      lastCheckin: 'Just now',
    },
  ];

  const handleSendAdvisory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!advisoryTitle.trim() || !advisoryBody.trim()) return;

    realtimeStore.addNotification({
      title: `🏨 Hotel Advisory: ${advisoryTitle}`,
      message: `${user.full_name}: ${advisoryBody}`,
      type: 'group_alert',
    });

    setIsSent(true);
    setTimeout(() => {
      setIsSent(false);
      setAdvisoryTitle('');
      setAdvisoryBody('');
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-slate-900 text-white p-6 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="flex items-center gap-1.5 bg-teal-500/30 text-teal-300 font-extrabold text-xs px-2.5 py-0.5 rounded-full border border-teal-400/40">
              <Building2 className="w-3.5 h-3.5" />
              <span>HOTEL & TOUR CONCIERGE DESK</span>
            </span>
            <span className="text-xs text-slate-300">The Park Navi Mumbai (CBD Belapur)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Guest Safety & Tour Coordination Hub
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Monitor registered guest statuses, coordinate local assistance, and broadcast safety alerts across Navi Mumbai.
          </p>
        </div>
      </div>

      {/* Grid: Guest Roster & Broadcast form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Guest Roster Table */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900">Registered Hotel Guest Roster</h3>
              <p className="text-xs text-slate-500">Live safety check-in tracking for current in-house guests</p>
            </div>
            <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200 shrink-0">
              {guestRoster.length} Guests Active
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-3 py-2.5">Guest & Room</th>
                  <th className="px-3 py-2.5">Nationality</th>
                  <th className="px-3 py-2.5">Tour Group</th>
                  <th className="px-3 py-2.5">Last Check-In</th>
                  <th className="px-3 py-2.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {guestRoster.map((g) => (
                  <tr key={g.id} className="hover:bg-slate-50/60">
                    <td className="px-3 py-3">
                      <strong className="text-slate-900 block">{g.name}</strong>
                      <span className="text-slate-400 text-[11px]">{g.room} • {g.phone}</span>
                    </td>
                    <td className="px-3 py-3 text-slate-600">{g.nationality}</td>
                    <td className="px-3 py-3 text-slate-600 font-medium">{g.tourGroup}</td>
                    <td className="px-3 py-3 text-slate-500">{g.lastCheckin}</td>
                    <td className="px-3 py-3 text-right">
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200 shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 aspect-square" />
                        Safe
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Safety Advisory Broadcast Box */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BellRing className="w-5 h-5 text-teal-600 shrink-0" />
              <h3 className="font-bold text-base text-slate-900">Broadcast Safety Advisory</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Push real-time advisory notification to all registered guests and associated tour members.
            </p>

            {isSent ? (
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-sm text-emerald-900">Advisory Broadcasted!</h4>
                <p className="text-xs text-emerald-700">Notification delivered to all guest devices.</p>
              </div>
            ) : (
              <form onSubmit={handleSendAdvisory} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Advisory Headline *</label>
                  <input
                    type="text"
                    required
                    value={advisoryTitle}
                    onChange={(e) => setAdvisoryTitle(e.target.value)}
                    placeholder="e.g. Evening Tour Gathering at 6:30 PM"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Message Content *</label>
                  <textarea
                    rows={4}
                    required
                    value={advisoryBody}
                    onChange={(e) => setAdvisoryBody(e.target.value)}
                    placeholder="Provide specific safety details, designated meeting points, or weather precautions..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-teal-700 hover:bg-teal-800 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md shadow-teal-700/20 transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Advisory to Guests</span>
                </button>
              </form>
            )}
          </div>

          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs text-slate-600">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 mb-1">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Direct Authority Liaison</span>
            </div>
            <p>For urgent hotel emergencies, contact Navi Mumbai Tourist Police Desk: +91 22 2757 8888</p>
          </div>
        </div>
      </div>
    </div>
  );
};
