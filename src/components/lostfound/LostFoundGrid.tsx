import React, { useState, useEffect } from 'react';
import { LostFoundItem } from '../../types';
import { realtimeStore } from '../../lib/storage';
import { useAuth } from '../../context/AuthContext';
import { LostFoundBadge } from '../common/Badge';
import {
  Search,
  Plus,
  MapPin,
  Calendar,
  Phone,
  Mail,
  CheckCircle2,
  Package,
  Eye,
  X,
  ShieldCheck,
} from 'lucide-react';
import { ReportLostFoundModal } from './ReportLostFoundModal';

export const LostFoundGrid: React.FC = () => {
  const { user, role } = useAuth();
  const [items, setItems] = useState<LostFoundItem[]>(() => realtimeStore.getLostFound());
  const [filterType, setFilterType] = useState<'all' | 'lost' | 'found'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedItemForClaim, setSelectedItemForClaim] = useState<LostFoundItem | null>(null);
  const [claimDetails, setClaimDetails] = useState('');
  const [claimSuccess, setClaimSuccess] = useState(false);

  useEffect(() => {
    const unsub = realtimeStore.subscribe((event) => {
      if (event === 'LOST_FOUND_UPDATED') {
        setItems(realtimeStore.getLostFound());
      }
    });
    return unsub;
  }, []);

  const filteredItems = items.filter((item) => {
    if (filterType === 'lost' && item.item_type !== 'lost') return false;
    if (filterType === 'found' && item.item_type !== 'found') return false;
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.location_name.toLowerCase().includes(q) ||
        item.item_code.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForClaim) return;

    realtimeStore.updateLostFoundStatus(
      selectedItemForClaim.id,
      'claimed',
      user.id,
      claimDetails
    );

    setClaimSuccess(true);
    setTimeout(() => {
      setClaimSuccess(false);
      setSelectedItemForClaim(null);
      setClaimDetails('');
      setItems(realtimeStore.getLostFound());
    }, 1200);
  };

  const handleMarkReturned = (itemId: string) => {
    realtimeStore.updateLostFoundStatus(itemId, 'returned');
    setItems(realtimeStore.getLostFound());
  };

  return (
    <div id="tour-lostfound" className="space-y-6">
      {/* Header & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Lost & Found Central Registry
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Official tourist property recovery hub connected to transit police, airport desks, and hotels.
          </p>
        </div>
        <button
          onClick={() => setIsReportModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Report Lost / Found Property</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search box */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by keywords, item code, location..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Type tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full md:w-auto">
            <button
              onClick={() => setFilterType('all')}
              className={`flex-1 md:flex-none px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterType === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({items.length})
            </button>
            <button
              onClick={() => setFilterType('lost')}
              className={`flex-1 md:flex-none px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterType === 'lost' ? 'bg-amber-500 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Lost
            </button>
            <button
              onClick={() => setFilterType('found')}
              className={`flex-1 md:flex-none px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterType === 'found' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Found
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
          {[
            { id: 'all', label: 'All Categories' },
            { id: 'electronics', label: '📱 Electronics' },
            { id: 'passport/docs', label: '🛂 Passports & Docs' },
            { id: 'wallet/money', label: '👛 Wallets & Cards' },
            { id: 'luggage', label: '🧳 Luggage' },
            { id: 'jewelry', label: '💍 Jewelry' },
            { id: 'keys', label: '🔑 Keys' },
            { id: 'other', label: '📦 Other' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Items */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 text-base mb-1">No property matching your criteria</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            Try adjusting your search terms or register a new lost item notification.
          </p>
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="text-xs font-bold text-blue-600 hover:underline"
          >
            + Register New Item Report
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
            >
              {/* Card Image Banner */}
              <div className="relative h-40 bg-slate-100 overflow-hidden">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <Package className="w-12 h-12" />
                  </div>
                )}
                {/* Status pill overlay */}
                <div className="absolute top-2.5 left-2.5">
                  <LostFoundBadge status={item.status} />
                </div>
                <div className="absolute top-2.5 right-2.5">
                  <span className="bg-slate-950/70 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded-md">
                    {item.item_code}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-1 mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
                    {item.description}
                  </p>

                  <div className="space-y-1 text-[11px] text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{item.location_name}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{item.date_lost_or_found}</span>
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="text-[11px] text-slate-500">
                    <span>Reported by: <strong>{item.reporter_name}</strong></span>
                  </div>

                  {item.status === 'reported_found' && (
                    <button
                      onClick={() => setSelectedItemForClaim(item)}
                      className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow-xs transition-colors"
                    >
                      Claim Item
                    </button>
                  )}

                  {role === 'authority' && item.status === 'claimed' && (
                    <button
                      onClick={() => handleMarkReturned(item.id)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-2.5 py-1.5 rounded-xl shadow-xs transition-colors"
                    >
                      Mark Returned
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Report Modal */}
      <ReportLostFoundModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSuccess={() => setItems(realtimeStore.getLostFound())}
      />

      {/* Claim Coordination Modal */}
      {selectedItemForClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setSelectedItemForClaim(null)} />

          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-base text-slate-900">Claim Property Verification</h3>
              </div>
              <button
                onClick={() => setSelectedItemForClaim(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {claimSuccess ? (
              <div className="text-center py-6">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-2 animate-bounce" />
                <h4 className="font-bold text-slate-900 text-base">Claim Request Logged!</h4>
                <p className="text-xs text-slate-600 mt-1">
                  The handling desk and reporter have been notified. Please bring valid identity proof.
                </p>
              </div>
            ) : (
              <form onSubmit={handleClaimSubmit} className="space-y-4">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                  <p className="font-bold text-slate-900">{selectedItemForClaim.title}</p>
                  <p className="text-slate-500">Ref Code: {selectedItemForClaim.item_code}</p>
                  <p className="text-slate-500">Found At: {selectedItemForClaim.location_name}</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Proof of Ownership / Identifying Markers *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={claimDetails}
                    onChange={(e) => setClaimDetails(e.target.value)}
                    placeholder="Describe specific contents, lockscreen wallpaper, serial number or purchase receipt details..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-xs text-blue-900">
                  <p className="font-semibold mb-0.5">Collection Assistance Desk:</p>
                  <p>📞 Phone: {selectedItemForClaim.contact_phone}</p>
                  {selectedItemForClaim.contact_email && <p>✉️ Email: {selectedItemForClaim.contact_email}</p>}
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedItemForClaim(null)}
                    className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20"
                  >
                    Submit Claim Request
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
