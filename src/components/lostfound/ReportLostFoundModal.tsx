import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import { realtimeStore } from '../../lib/storage';
import { LostFoundItem } from '../../types';
import { X, Package, CheckCircle2 } from 'lucide-react';

interface ReportLostFoundModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ReportLostFoundModal: React.FC<ReportLostFoundModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const { currentLocation } = useLocation();

  const [itemType, setItemType] = useState<'lost' | 'found'>('lost');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<LostFoundItem['category']>('electronics');
  const [locationName, setLocationName] = useState('Sagar Vihar Promenade, Sector 8, Vashi');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [contactPhone, setContactPhone] = useState(user.phone || '+1 (555) 234-8901');
  const [contactEmail, setContactEmail] = useState(user.email);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      realtimeStore.saveLostFoundItem({
        item_type: itemType,
        title,
        category,
        location_name: locationName,
        description,
        date_lost_or_found: date,
        reporter_name: user.full_name,
        reporter_id: user.id,
        contact_phone: contactPhone,
        contact_email: contactEmail,
        latitude: currentLocation.lat,
        longitude: currentLocation.lng,
        image_url:
          category === 'electronics'
            ? 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&auto=format&fit=crop&q=60'
            : category === 'passport/docs'
            ? 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=60'
            : 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&auto=format&fit=crop&q=60',
      });

      setIsSubmitting(false);
      setIsDone(true);
      setTimeout(() => {
        setIsDone(false);
        if (onSuccess) onSuccess();
        onClose();
      }, 1000);
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
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-base">
                Report {itemType === 'lost' ? 'Lost Item' : 'Found Property'}
              </h2>
              <p className="text-xs text-slate-400">Logged to Central Tourist Lost & Found Registry</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isDone ? (
          <div className="p-10 text-center">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Item Registered Successfully!</h3>
            <p className="text-xs text-slate-600">
              Your item is now indexed and searchable across the national network.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Type selector */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setItemType('lost')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                  itemType === 'lost'
                    ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                I LOST SOMETHING
              </button>
              <button
                type="button"
                onClick={() => setItemType('found')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                  itemType === 'found'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                I FOUND AN ITEM
              </button>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Item Name / Summary *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Black Sony A7 Camera, Blue Samsonite bag..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Category & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as LostFoundItem['category'])}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  <option value="electronics">Electronics / Gadgets</option>
                  <option value="passport/docs">Passport & Travel Documents</option>
                  <option value="wallet/money">Wallet / Cash / Cards</option>
                  <option value="luggage">Luggage / Backpacks</option>
                  <option value="jewelry">Jewelry / Watches</option>
                  <option value="keys">Keys / Access Cards</option>
                  <option value="other">Other Items</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Location Lost / Found</label>
              <input
                type="text"
                required
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="e.g. Vashi Railway Station Gate 2, Seawoods Mall Plaza, Sagar Vihar"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Distinct Features / Details</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Color, stickers, brand, serial number or contents inside..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Contact Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone *</label>
                <input
                  type="tel"
                  required
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Contact Email</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
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
                {isSubmitting ? 'Registering...' : 'Register Item'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
