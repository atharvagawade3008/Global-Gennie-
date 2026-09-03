import React, { useState, useEffect } from 'react';
import { TouristGroup, GroupMember } from '../../types';
import { realtimeStore } from '../../lib/storage';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import {
  Users,
  ShieldCheck,
  AlertTriangle,
  Plus,
  Phone,
  Clock,
  MapPin,
  Share2,
  Copy,
  Check,
} from 'lucide-react';
import { CreateJoinGroupModal } from './CreateJoinGroupModal';

export const GroupHub: React.FC = () => {
  const { user } = useAuth();
  const { currentLocation } = useLocation();

  const [groups, setGroups] = useState<TouristGroup[]>(() => realtimeStore.getGroups());
  const [selectedGroupId, setSelectedGroupId] = useState<string>(() => groups[0]?.id || '');
  const [members, setMembers] = useState<GroupMember[]>(() => realtimeStore.getGroupMembers(selectedGroupId));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [justCheckedIn, setJustCheckedIn] = useState(false);

  const activeGroup = groups.find((g) => g.id === selectedGroupId) || groups[0];

  useEffect(() => {
    const unsub = realtimeStore.subscribe((event) => {
      if (event === 'GROUPS_UPDATED' || event === 'GROUP_MEMBERS_UPDATED') {
        const gList = realtimeStore.getGroups();
        setGroups(gList);
        if (!selectedGroupId && gList.length > 0) {
          setSelectedGroupId(gList[0].id);
        }
        setMembers(realtimeStore.getGroupMembers(selectedGroupId || gList[0]?.id));
      }
    });
    return unsub;
  }, [selectedGroupId]);

  const handleSafeCheckIn = () => {
    realtimeStore.updateMemberSafety(user.id, true, currentLocation.lat, currentLocation.lng);
    setJustCheckedIn(true);
    setMembers(realtimeStore.getGroupMembers(selectedGroupId));
    setTimeout(() => setJustCheckedIn(false), 2500);
  };

  const handleGroupAlert = () => {
    if (window.confirm('Send urgent safety broadcast alert to all group members?')) {
      realtimeStore.updateMemberSafety(user.id, false, currentLocation.lat, currentLocation.lng);
      realtimeStore.addNotification({
        title: `⚠️ GROUP SAFETY ALERT: ${user.full_name}`,
        message: `${user.full_name} reported they may need assistance in ${activeGroup?.name || 'your group'}.`,
        type: 'group_alert',
      });
      setMembers(realtimeStore.getGroupMembers(selectedGroupId));
    }
  };

  const copyGroupCode = () => {
    if (activeGroup) {
      navigator.clipboard.writeText(activeGroup.group_code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div id="tour-groups" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Tourist Group Safety Coordination
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time group safety check-ins, certified guide contacts, and companion tracking across Navi Mumbai.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Join / Create Group</span>
        </button>
      </div>

      {activeGroup ? (
        <div className="space-y-6">
          {/* Active Group Banner */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white p-6 rounded-3xl shadow-lg border border-slate-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-700/80">
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="bg-blue-500/20 text-blue-300 text-xs font-bold px-3 py-1 rounded-full border border-blue-400/30">
                    ACTIVE TRAVEL GROUP
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {members.length} Registered Members
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-black tracking-tight">{activeGroup.name}</h3>
                {activeGroup.description && (
                  <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">{activeGroup.description}</p>
                )}
              </div>

              {/* Group Code Card */}
              <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 flex items-center justify-between gap-4 shrink-0">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-extrabold tracking-widest block">
                    GROUP CODE
                  </span>
                  <span className="font-mono text-lg font-black tracking-wider text-white">
                    {activeGroup.group_code}
                  </span>
                </div>
                <button
                  onClick={copyGroupCode}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors shrink-0"
                  title="Copy Code"
                >
                  {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Guide & Safety Quick Controls */}
            <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Guide Profile with guaranteed TRUE CIRCLE avatar */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-sm shrink-0 aspect-square border-2 border-white/20 shadow-xs">
                  {activeGroup.guide_name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] text-slate-400 block font-medium">Certified Guide / Leader</span>
                  <span className="font-bold text-sm text-white truncate block">{activeGroup.guide_name}</span>
                </div>
                {activeGroup.guide_phone && (
                  <a
                    href={`tel:${activeGroup.guide_phone}`}
                    className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs shrink-0"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Call</span>
                  </a>
                )}
              </div>

              {/* Instant Check-In Buttons */}
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                <button
                  onClick={handleSafeCheckIn}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md shrink-0 ${
                    justCheckedIn
                      ? 'bg-emerald-500 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{justCheckedIn ? 'CHECKED IN (SAFE)!' : 'I AM SAFE (CHECK-IN)'}</span>
                </button>
                <button
                  onClick={handleGroupAlert}
                  className="flex items-center gap-1.5 bg-rose-600/90 hover:bg-rose-600 text-white px-3 py-2 rounded-xl text-xs font-bold transition-colors shrink-0"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Alert Group</span>
                </button>
              </div>
            </div>
          </div>

          {/* Members Grid */}
          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-3">Group Members Status Roster</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {members.map((m) => (
                <div
                  key={m.id}
                  className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Member avatar: guaranteed TRUE CIRCLE */}
                    <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs shrink-0 aspect-square">
                      {m.member_name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <h5 className="font-bold text-slate-900 text-xs truncate">{m.member_name}</h5>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">
                          Checked in {new Date(m.last_checkin_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[11px] font-bold px-3 py-1 rounded-full shrink-0 flex items-center gap-1.5 ${
                      m.is_safe
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 aspect-square ${m.is_safe ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    <span>{m.is_safe ? 'Safe' : 'Needs Help'}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 shadow-2xs">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 text-base mb-1">No Active Tourist Group Joined</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            Join your tour leader's group code to enable group check-ins and emergency broadcast pings.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs"
          >
            Join with Code
          </button>
        </div>
      )}

      {/* Modal */}
      <CreateJoinGroupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          const gList = realtimeStore.getGroups();
          setGroups(gList);
          if (gList.length > 0) {
            setSelectedGroupId(gList[0].id);
            setMembers(realtimeStore.getGroupMembers(gList[0].id));
          }
        }}
      />
    </div>
  );
};
