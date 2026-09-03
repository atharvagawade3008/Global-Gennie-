import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Phone,
  HeartPulse,
  Building2,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  FileCheck,
  Compass,
  RotateCcw,
} from 'lucide-react';

interface ProfilePageProps {
  onStartTour?: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onStartTour }) => {
  const {
    user,
    touristProfile,
    emergencyContacts,
    updateTouristProfile,
    addEmergencyContact,
    removeEmergencyContact,
  } = useAuth();

  const [hotelName, setHotelName] = useState(touristProfile.hotel_name || 'The Park Navi Mumbai (CBD Belapur)');
  const [roomNo, setRoomNo] = useState(touristProfile.hotel_room_no || 'Suite 402');
  const [tourAgency, setTourAgency] = useState(touristProfile.tour_operator_name || 'Navi Mumbai Coastal & Heritage Expeditions');
  const [bloodGroup, setBloodGroup] = useState(touristProfile.blood_group || 'O+');
  const [allergies, setAllergies] = useState(touristProfile.allergies || 'Penicillin, Peanuts');
  const [medicalConditions, setMedicalConditions] = useState(touristProfile.medical_conditions || 'Mild Asthma, Carries Ventolin Inhaler');

  const [contactName, setContactName] = useState('');
  const [contactRelation, setContactRelation] = useState('Family / Relative');
  const [contactPhone, setContactPhone] = useState('');
  const [showAddContact, setShowAddContact] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateTouristProfile({
      hotel_name: hotelName,
      hotel_room_no: roomNo,
      tour_operator_name: tourAgency,
      blood_group: bloodGroup,
      allergies,
      medical_conditions: medicalConditions,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleAddContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactPhone) return;
    addEmergencyContact({
      name: contactName,
      relationship: contactRelation,
      phone: contactPhone,
      is_primary: emergencyContacts.length === 0,
    });
    setContactName('');
    setContactPhone('');
    setShowAddContact(false);
  };

  return (
    <div id="tour-profile" className="max-w-3xl mx-auto space-y-6 pb-24 lg:pb-12 animate-fade-in-up">
      {/* Profile Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center gap-5 shadow-xl">
        <div className="relative shrink-0">
          <img
            src={user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
            alt="Profile"
            className="w-20 h-20 rounded-2xl object-cover border-2 border-white/20 shrink-0 aspect-square"
          />
          <span className="absolute -bottom-1.5 -right-1.5 bg-emerald-500 p-1 rounded-full border-2 border-slate-900 shrink-0 aspect-square">
            <ShieldCheck className="w-3.5 h-3.5 text-white" />
          </span>
        </div>

        <div>
          <div className="flex items-center gap-2.5 flex-wrap mb-1">
            <h1 className="text-xl font-extrabold text-white">{user.full_name}</h1>
            <span className="flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full border border-emerald-400/30 shrink-0">
              <FileCheck className="w-3.5 h-3.5" />
              Identity Verified
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">{user.email}</p>
          <div className="flex items-center gap-4 mt-2 text-xs text-slate-400 flex-wrap">
            <span>Nationality: <strong className="text-slate-200">{user.nationality || 'Canada'}</strong></span>
            <span>Passport: <strong className="text-slate-200 font-mono">{user.passport_or_id_number || 'CA-9823411'}</strong></span>
          </div>
        </div>
      </div>

      {/* Accommodation Form */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-6 shadow-2xs">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center shrink-0 aspect-square">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Accommodation Details</h3>
              <p className="text-xs text-slate-400 mt-0.5">Used for hotel & local concierge emergency dispatch</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Hotel / Resort Name</label>
              <input
                type="text"
                value={hotelName}
                onChange={(e) => setHotelName(e.target.value)}
                placeholder="e.g. The Park Navi Mumbai"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-slate-50 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Room / Suite Number</label>
              <input
                type="text"
                value={roomNo}
                onChange={(e) => setRoomNo(e.target.value)}
                placeholder="e.g. Suite 402"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-slate-50 font-medium"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Tour Agency / Operator</label>
              <input
                type="text"
                value={tourAgency}
                onChange={(e) => setTourAgency(e.target.value)}
                placeholder="e.g. Navi Mumbai Coastal & Heritage Expeditions"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-slate-50 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Medical Info */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-6 shadow-2xs">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-rose-50 rounded-2xl flex items-center justify-center shrink-0 aspect-square">
              <HeartPulse className="w-5 h-5 text-rose-500" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Medical & Allergen Information</h3>
              <p className="text-xs text-slate-400 mt-0.5">Transmitted automatically to paramedics during SOS</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Blood Group</label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-slate-50"
              >
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Known Allergies</label>
              <input
                type="text"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                placeholder="e.g. Penicillin, Peanuts"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-slate-50 font-medium"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Medical Conditions & Medications</label>
              <textarea
                rows={2}
                value={medicalConditions}
                onChange={(e) => setMedicalConditions(e.target.value)}
                placeholder="e.g. Mild asthma — carries Ventolin inhaler"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-slate-50 resize-none font-medium"
              />
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="flex items-center justify-end gap-3">
          {saveSuccess && (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 animate-fade-in-up">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              Saved successfully!
            </span>
          )}
          <button
            type="submit"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-md shadow-blue-500/20 transition-all"
          >
            <Save className="w-4 h-4" />
            Save Profile
          </button>
        </div>
      </form>

      {/* Emergency Contacts */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-6 shadow-2xs">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center shrink-0 aspect-square">
              <Phone className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Emergency Contacts</h3>
              <p className="text-xs text-slate-400 mt-0.5">Auto-notified when SOS is triggered</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAddContact(true)}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-black text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-colors shrink-0 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Contact</span>
          </button>
        </div>

        <div className="space-y-2.5">
          {emergencyContacts.map((contact) => (
            <div
              key={contact.id}
              className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 hover:bg-slate-50/80 transition-colors"
            >
              <div>
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900">{contact.name}</h4>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full font-semibold border border-slate-200">
                    {contact.relationship}
                  </span>
                  {contact.is_primary && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-0.5 rounded-full">
                      Primary
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 font-mono">{contact.phone}</p>
              </div>

              <button
                onClick={() => removeEmergencyContact(contact.id)}
                className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors shrink-0"
                title="Remove contact"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {emergencyContacts.length === 0 && !showAddContact && (
            <div className="text-center py-6 text-xs text-slate-400">
              No emergency contacts added yet.
            </div>
          )}
        </div>

        {showAddContact && (
          <form onSubmit={handleAddContactSubmit} className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-700">New Emergency Contact</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="e.g. David Rostova"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Relationship</label>
                <input
                  type="text"
                  value={contactRelation}
                  onChange={(e) => setContactRelation(e.target.value)}
                  placeholder="e.g. Spouse"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+1 (555) 890-1234"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddContact(false)}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs"
              >
                Add Contact
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Website Tour & Help Settings Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0 aspect-square">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                Interactive Website Tour & Onboarding
              </h3>
              <p className="text-xs text-slate-400">
                Need a refresher on Navi Mumbai safety features, SOS triggers, and emergency maps?
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          {onStartTour && (
            <button
              onClick={onStartTour}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-blue-500/20 transition-all"
            >
              <Compass className="w-4 h-4" />
              <span>Launch Guided Product Tour</span>
            </button>
          )}

          <button
            onClick={() => {
              localStorage.removeItem('globalgennie_first_visit_seen');
              localStorage.removeItem('globalgennie_tour_completed');
              window.location.reload();
            }}
            className="flex items-center gap-2 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold px-3.5 py-2.5 rounded-xl transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset First-Visit Dialog</span>
          </button>
        </div>
      </div>
    </div>
  );
};

