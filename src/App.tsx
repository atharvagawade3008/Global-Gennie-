import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { UserRole } from './types';
import { LocationProvider } from './context/LocationContext';
import { IncidentProvider, useIncidents } from './context/IncidentContext';
import { RoleSwitcher } from './components/layout/RoleSwitcher';
import { Navbar } from './components/layout/Navbar';
import { NotificationDrawer } from './components/layout/NotificationDrawer';
import { Footer } from './components/layout/Footer';
import { SosActiveBanner } from './components/sos/SosActiveBanner';
import { SosButtonModal } from './components/sos/SosButtonModal';
import { IncidentReportModal } from './components/incidents/IncidentReportModal';
import { AIAssistantDrawer } from './components/ai/AIAssistantDrawer';
import { FirstVisitModal } from './components/common/FirstVisitModal';
import { InteractiveTour } from './components/common/InteractiveTour';

// Pages
import { TouristHome } from './pages/TouristHome';
import { IncidentsPage } from './pages/IncidentsPage';
import { SafetyMapPage } from './pages/SafetyMapPage';
import { ProfilePage } from './pages/ProfilePage';
import { LostFoundGrid } from './components/lostfound/LostFoundGrid';
import { GroupHub } from './components/groups/GroupHub';
import { AuthorityCommandCenter } from './components/authority/AuthorityCommandCenter';
import { AuthorityAnalytics } from './components/authority/AuthorityAnalytics';
import { ResponderDashboard } from './components/responder/ResponderDashboard';
import { HotelPortal } from './components/hotel/HotelPortal';

const AppContent: React.FC = () => {
  const { role } = useAuth();
  const { activeSosIncident } = useIncidents();

  // Tab State
  const [currentTab, setCurrentTab] = useState<string>(() => {
    return role === 'authority'
      ? 'command'
      : role === 'responder'
      ? 'responder'
      : role === 'hotel_operator'
      ? 'hotel'
      : 'home';
  });

  // Modal / Drawer States
  const [isSosModalOpen, setIsSosModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState(false);

  // First Visit Emergency / Tour Modal & Interactive Product Tour States
  const [isFirstVisitModalOpen, setIsFirstVisitModalOpen] = useState<boolean>(() => {
    return !localStorage.getItem('globalgennie_first_visit_seen');
  });
  const [isTourActive, setIsTourActive] = useState<boolean>(false);

  const handleTabChange = (tab: string) => {
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectFirstVisitEmergency = () => {
    localStorage.setItem('globalgennie_first_visit_seen', 'true');
    setIsFirstVisitModalOpen(false);
    setIsSosModalOpen(true);
    handleTabChange('home');
  };

  const handleStartTour = () => {
    localStorage.setItem('globalgennie_first_visit_seen', 'true');
    setIsFirstVisitModalOpen(false);
    setIsTourActive(true);
  };

  const handleDismissFirstVisit = () => {
    localStorage.setItem('globalgennie_first_visit_seen', 'true');
    setIsFirstVisitModalOpen(false);
  };

  // Sync default tab if role switches
  React.useEffect(() => {
    if (role === 'authority') setCurrentTab('command');
    else if (role === 'responder') setCurrentTab('responder');
    else if (role === 'hotel_operator') setCurrentTab('hotel');
    else setCurrentTab('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [role]);

  // Protected tab sets per role
  const PROTECTED_TABS: Record<string, UserRole[]> = {
    command: ['authority'],
    analytics: ['authority'],
    responder: ['responder'],
    hotel: ['hotel_operator'],
  };

  const renderActiveView = () => {
    // Check if the current tab is protected and the user's role is not allowed
    const allowedRoles = PROTECTED_TABS[currentTab];
    if (allowedRoles && !allowedRoles.includes(role as UserRole)) {
      // Redirect silently to home
      return <TouristHome onNavigateTab={handleTabChange} onOpenAi={() => setIsAiDrawerOpen(true)} />;
    }

    switch (currentTab) {
      // Tourist Views
      case 'home':
        return <TouristHome onNavigateTab={handleTabChange} onOpenAi={() => setIsAiDrawerOpen(true)} />;
      case 'map':
        return <SafetyMapPage />;
      case 'incidents':
        return <IncidentsPage />;
      case 'lostfound':
        return <div className="pb-24 lg:pb-12"><LostFoundGrid /></div>;
      case 'groups':
        return <div className="pb-24 lg:pb-12"><GroupHub /></div>;
      case 'profile':
        return <ProfilePage onStartTour={handleStartTour} />;

      // Authority Views
      case 'command':
        return <div className="pb-12"><AuthorityCommandCenter /></div>;
      case 'analytics':
        return <div className="pb-12"><AuthorityAnalytics /></div>;

      // Responder Views
      case 'responder':
        return <div className="pb-12"><ResponderDashboard /></div>;

      // Hotel Operator Views
      case 'hotel':
        return <div className="pb-12"><HotelPortal /></div>;

      default:
        return <TouristHome onNavigateTab={handleTabChange} onOpenAi={() => setIsAiDrawerOpen(true)} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f7f9] flex flex-col font-sans text-slate-900">
      {/* Top Demo Perspective Switcher */}
      <RoleSwitcher onRoleSelect={() => {}} />

      {/* Main Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={handleTabChange}
        onOpenSos={() => setIsSosModalOpen(true)}
        onOpenAi={() => setIsAiDrawerOpen(true)}
        onOpenNotifications={() => setIsNotifDrawerOpen(true)}
        onStartTour={handleStartTour}
      />

      {/* Pinned SOS Banner when active */}
      {role === 'tourist' && (
        <SosActiveBanner onViewDetails={() => handleTabChange('incidents')} />
      )}

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {renderActiveView()}
      </main>

      {/* Footer */}
      <Footer />

      {/* Global Modals & Drawers */}
      <SosButtonModal
        isOpen={isSosModalOpen}
        onClose={() => setIsSosModalOpen(false)}
        onSuccess={() => handleTabChange('incidents')}
      />

      <IncidentReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />

      <AIAssistantDrawer
        isOpen={isAiDrawerOpen}
        onClose={() => setIsAiDrawerOpen(false)}
        onTriggerSosFromAi={() => setIsSosModalOpen(true)}
        onOpenReportFromAi={() => setIsReportModalOpen(true)}
      />

      <NotificationDrawer
        isOpen={isNotifDrawerOpen}
        onClose={() => setIsNotifDrawerOpen(false)}
        onSelectIncident={() => handleTabChange('incidents')}
      />

      {/* First-Visit Emergency vs Tour Choice Modal */}
      <FirstVisitModal
        isOpen={isFirstVisitModalOpen}
        onSelectEmergency={handleSelectFirstVisitEmergency}
        onStartTour={handleStartTour}
        onDismiss={handleDismissFirstVisit}
      />

      {/* Interactive Step-by-Step Product Tour */}
      <InteractiveTour
        isActive={isTourActive}
        onClose={() => setIsTourActive(false)}
        onNavigateTab={handleTabChange}
      />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <LocationProvider>
        <IncidentProvider>
          <AppContent />
        </IncidentProvider>
      </LocationProvider>
    </AuthProvider>
  );
}

export default App;
