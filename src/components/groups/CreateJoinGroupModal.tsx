import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { realtimeStore } from '../../lib/storage';
import { Users, Plus, KeyRound, X, CheckCircle2 } from 'lucide-react';

interface CreateJoinGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreateJoinGroupModal: React.FC<CreateJoinGroupModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [mode, setMode] = useState<'join' | 'create'>('join');

  // Join State
  const [joinCode, setJoinCode] = useState('');
  const [joinMessage, setJoinMessage] = useState<{ success: boolean; text: string } | null>(null);

  // Create State
  const [groupName, setGroupName] = useState('');
  const [agencyName, setAgencyName] = useState('');
  const [description, setDescription] = useState('');
  const [guidePhone, setGuidePhone] = useState(user.phone || '+91 98450 12345');
  const [createdCode, setCreatedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;

    const result = realtimeStore.joinGroupByCode(joinCode, {
      user_id: user.id,
      name: `${user.full_name} (You)`,
      phone: user.phone,
    });

    setJoinMessage({ success: result.success, text: result.message });
    if (result.success) {
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1200);
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) return;

    const newGroup = realtimeStore.createGroup(
      groupName,
      user.full_name,
      description,
      guidePhone
    );

    // Auto-join creator
    realtimeStore.joinGroupByCode(newGroup.group_code, {
      user_id: user.id,
      name: `${user.full_name} (Tour Leader)`,
      phone: user.phone,
    });

    setCreatedCode(newGroup.group_code);
    setTimeout(() => {
      if (onSuccess) onSuccess();
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="bg-slate-900 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-xl">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-base">Tourist Travel Group</h2>
              <p className="text-xs text-slate-400">Coordinate safety & check-ins with companions</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="p-2 bg-slate-100 flex items-center gap-1 border-b border-slate-200">
          <button
            type="button"
            onClick={() => setMode('join')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
              mode === 'join' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Join with Group Code
          </button>
          <button
            type="button"
            onClick={() => setMode('create')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
              mode === 'create' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Create New Group
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {mode === 'join' ? (
            <form onSubmit={handleJoin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Enter 6-Digit Group Invitation Code
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="e.g. GT-9421"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 font-mono text-center tracking-widest text-base font-bold uppercase focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Obtain code from your Tour Guide, Hotel Desk, or Travel Companion.
                </p>
              </div>

              {joinMessage && (
                <div
                  className={`p-3 rounded-xl text-xs font-medium ${
                    joinMessage.success
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {joinMessage.text}
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20"
                >
                  Join Group
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleCreate} className="space-y-4">
              {createdCode ? (
                <div className="text-center py-4 space-y-2">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                  <h4 className="font-bold text-slate-900 text-base">Group Created Successfully!</h4>
                  <p className="text-xs text-slate-500">Share this code with your members:</p>
                  <div className="p-3 bg-slate-100 rounded-xl font-mono text-xl font-black tracking-widest text-blue-600">
                    {createdCode}
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Group Name *</label>
                    <input
                      type="text"
                      required
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      placeholder="e.g. Himalayas Trekking Group Alpha"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tour Agency / Host (Optional)</label>
                    <input
                      type="text"
                      value={agencyName}
                      onChange={(e) => setAgencyName(e.target.value)}
                      placeholder="e.g. Golden Triangle Tours"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Leader Emergency Phone</label>
                    <input
                      type="tel"
                      value={guidePhone}
                      onChange={(e) => setGuidePhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20"
                    >
                      Create Group Code
                    </button>
                  </div>
                </>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
