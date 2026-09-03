import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useIncidents } from '../../context/IncidentContext';
import globalGennieLogo from '../../assets/logo.png';
import {
  Bell,
  Sparkles,
  AlertOctagon,
  Map,
  FileText,
  Package,
  Users,
  User,
  PhoneCall,
  Menu,
  X,
  ChevronRight,
  Shield,
  Compass,
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenSos: () => void;
  onOpenAi: () => void;
  onOpenNotifications: () => void;
  onStartTour?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenSos,
  onOpenAi,
  onOpenNotifications,
  onStartTour,
}) => {
  const { role } = useAuth();
  const { activeSosIncident, unreadNotificationCount } = useIncidents();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const touristNavItems = [
    { id: 'home', label: 'Safety Hub', icon: Shield },
    { id: 'map', label: 'Map', icon: Map },
    { id: 'incidents', label: 'Incidents', icon: FileText },
    { id: 'lostfound', label: 'Lost & Found', icon: Package },
    { id: 'groups', label: 'Groups', icon: Users },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const authorityNavItems = [
    { id: 'command', label: 'Command', icon: Shield },
    { id: 'incidents', label: 'Incidents', icon: FileText },
    { id: 'map', label: 'Live Map', icon: Map },
    { id: 'lostfound', label: 'Lost & Found', icon: Package },
    { id: 'analytics', label: 'Analytics', icon: Users },
  ];

  const responderNavItems = [
    { id: 'responder', label: 'Field Response', icon: Shield },
    { id: 'map', label: 'Emergency Map', icon: Map },
  ];

  const hotelNavItems = [
    { id: 'hotel', label: 'Hotel Portal', icon: Shield },
    { id: 'map', label: 'Zone Map', icon: Map },
  ];

  const navItems =
    role === 'authority'
      ? authorityNavItems
      : role === 'responder'
      ? responderNavItems
      : role === 'hotel_operator'
      ? hotelNavItems
      : touristNavItems;

  const homeTab =
    role === 'authority'
      ? 'command'
      : role === 'responder'
      ? 'responder'
      : role === 'hotel_operator'
      ? 'hotel'
      : 'home';

  const handleNavClick = (tabId: string) => {
    onSelectTab(tabId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand — Official Global Gennie Logo */}
            <button
              onClick={() => handleNavClick(homeTab)}
              className="flex items-center group text-left shrink-0 py-1"
              title="Global Gennie Home"
            >
              <img
                src={globalGennieLogo}
                alt="Global Gennie - AI Smart Tourist Companion"
                className="h-8 sm:h-9 w-auto max-w-[150px] xs:max-w-[180px] sm:max-w-[220px] object-contain transition-transform group-hover:scale-105"
              />
            </button>

            {/* Desktop Nav Links */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2">
              {/* Product Tour Trigger Button */}
              {onStartTour && (
                <button
                  onClick={onStartTour}
                  className="hidden xl:flex items-center gap-1.5 text-slate-700 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 border border-slate-200/70 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs"
                  title="Take Website Tour"
                >
                  <Compass className="w-3.5 h-3.5 text-blue-600" />
                  <span>Tour</span>
                </button>
              )}

              {/* AI Button */}
              <button
                id="tour-ai-button"
                onClick={onOpenAi}
                className="hidden sm:flex items-center gap-1.5 text-violet-700 bg-violet-50 hover:bg-violet-100 border border-violet-200/70 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Guide</span>
              </button>

              {/* Notifications */}
              <button
                id="tour-notifications"
                onClick={onOpenNotifications}
                className="relative p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadNotificationCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center shrink-0 aspect-square">
                    {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                  </span>
                )}
              </button>

              {/* Emergency Helpline */}
              <a
                href="tel:112"
                className="hidden md:flex items-center gap-1.5 text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                <span>112</span>
              </a>

              {/* SOS Button (Tourist role only) */}
              {role === 'tourist' &&
                (activeSosIncident ? (
                  <button
                    id="tour-navbar-sos"
                    onClick={() => handleNavClick('incidents')}
                    className="flex items-center gap-1.5 bg-rose-500 hover:bg-rose-600 text-white px-3.5 py-1.5 rounded-xl font-bold text-xs animate-pulse shadow-md shadow-rose-500/30"
                  >
                    <AlertOctagon className="w-4 h-4 shrink-0" />
                    <span>SOS ACTIVE</span>
                  </button>
                ) : (
                  <button
                    id="tour-navbar-sos"
                    onClick={onOpenSos}
                    className="flex items-center gap-1.5 bg-rose-500 hover:bg-rose-600 active:scale-95 text-white px-3.5 py-1.5 rounded-xl font-extrabold text-xs shadow-md shadow-rose-500/25 transition-all"
                  >
                    <AlertOctagon className="w-4 h-4 shrink-0" />
                    <span>SOS</span>
                  </button>
                ))}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Slide-down Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-100 bg-white shadow-xl animate-fade-in-up">
            <div className="max-w-7xl mx-auto px-4 py-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-colors ${
                      isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </button>
                );
              })}

              <div className="pt-2 border-t border-slate-100 space-y-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onOpenAi();
                      setMobileMenuOpen(false);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 bg-violet-50 text-violet-700 border border-violet-200/70 py-2.5 rounded-xl text-xs font-bold"
                  >
                    <Sparkles className="w-4 h-4" />
                    AI Safety Guide
                  </button>

                  {onStartTour && (
                    <button
                      onClick={() => {
                        onStartTour();
                        setMobileMenuOpen(false);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-50 text-blue-700 border border-blue-200/70 py-2.5 rounded-xl text-xs font-bold"
                    >
                      <Compass className="w-4 h-4" />
                      Take Tour
                    </button>
                  )}
                </div>

                {role === 'tourist' && !activeSosIncident && (
                  <button
                    onClick={() => {
                      onOpenSos();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-rose-500 text-white py-2.5 rounded-xl text-xs font-bold shadow-md shadow-rose-500/25"
                  >
                    <AlertOctagon className="w-4 h-4" />
                    SOS Emergency
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Bottom Tab Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-lg">
        <div className="flex items-center justify-around px-2 py-1.5">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors min-w-0 ${
                  isActive ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : ''}`} />
                <span className={`text-[10px] font-semibold truncate ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
                  {item.label}
                </span>
                {isActive && <span className="w-1 h-1 bg-blue-600 rounded-full mt-0.5 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
