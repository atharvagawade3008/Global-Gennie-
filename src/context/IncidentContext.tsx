import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Incident, IncidentStatus, IncidentCategory, IncidentPriority, AppNotification, Responder } from '../types';
import { realtimeStore } from '../lib/storage';
import { soundEngine } from '../lib/sound';
import confetti from 'canvas-confetti';

interface IncidentContextType {
  incidents: Incident[];
  activeSosIncident: Incident | null;
  responders: Responder[];
  notifications: AppNotification[];
  unreadNotificationCount: number;
  isTriggeringSos: boolean;
  sosCountdown: number | null;
  startSosCountdown: () => void;
  cancelSosCountdown: () => void;
  triggerSosEmergency: (location: { lat: number; lng: number; address?: string }, reporter: { name: string; phone?: string; id?: string }, medicalNotes?: string) => Incident;
  reportIncident: (params: {
    title: string;
    description?: string;
    category: IncidentCategory;
    priority: IncidentPriority;
    latitude: number;
    longitude: number;
    address?: string;
    reporter_name: string;
    reporter_phone?: string;
    reporter_id?: string;
    photo_urls?: string[];
  }) => Incident;
  updateIncidentStatus: (
    incidentId: string,
    newStatus: IncidentStatus,
    updaterName: string,
    updaterRole: 'tourist' | 'authority' | 'responder' | 'hotel_operator',
    notes?: string,
    responderInfo?: { responder_id?: string; responder_name?: string; eta_minutes?: number }
  ) => void;
  assignResponder: (incidentId: string, responderId: string, etaMinutes?: number, notes?: string) => void;
  resolveIncident: (incidentId: string, resolutionNotes: string, resolverName: string) => void;
  cancelIncident: (incidentId: string, reason: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  refreshIncidents: () => void;
}

const IncidentContext = createContext<IncidentContextType | undefined>(undefined);

export const IncidentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [incidents, setIncidents] = useState<Incident[]>(() => realtimeStore.getIncidents());
  const [responders, setResponders] = useState<Responder[]>(() => realtimeStore.getResponders());
  const [notifications, setNotifications] = useState<AppNotification[]>(() => realtimeStore.getNotifications());
  const [isTriggeringSos, setIsTriggeringSos] = useState(false);
  const [sosCountdown, setSosCountdown] = useState<number | null>(null);

  // Sync state from realtime store
  const refreshIncidents = useCallback(() => {
    setIncidents(realtimeStore.getIncidents());
    setResponders(realtimeStore.getResponders());
    setNotifications(realtimeStore.getNotifications());
  }, []);

  useEffect(() => {
    const unsubscribe = realtimeStore.subscribe((event, payload) => {
      refreshIncidents();
      if (event === 'NOTIFICATION_RECEIVED') {
        const notif = payload as AppNotification;
        if (notif.type === 'sos_alert') {
          soundEngine.playEmergencySiren(2);
        } else {
          soundEngine.playNotificationPing();
        }
      }
    });
    return unsubscribe;
  }, [refreshIncidents]);

  // Find active SOS for current user if any
  const activeSosIncident = incidents.find(
    (i) => i.is_sos && (i.status === 'received' || i.status === 'reviewing' || i.status === 'assigned' || i.status === 'response_en_route' || i.status === 'on_scene')
  ) || null;

  const startSosCountdown = () => {
    setIsTriggeringSos(true);
    setSosCountdown(3);
  };

  const cancelSosCountdown = () => {
    setIsTriggeringSos(false);
    setSosCountdown(null);
  };

  // SOS Countdown Timer
  useEffect(() => {
    if (sosCountdown === null) return;

    if (sosCountdown > 0) {
      soundEngine.playWarningTone();
      const timer = setTimeout(() => {
        setSosCountdown((prev) => (prev !== null ? prev - 1 : null));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [sosCountdown]);

  const triggerSosEmergency = (
    location: { lat: number; lng: number; address?: string },
    reporter: { name: string; phone?: string; id?: string },
    medicalNotes?: string
  ): Incident => {
    cancelSosCountdown();
    soundEngine.playEmergencySiren(4);

    const desc = medicalNotes
      ? `CRITICAL SOS TRIGGERED. Tourist Medical Alert: ${medicalNotes}. Emergency responder required.`
      : 'CRITICAL SOS EMERGENCY SIGNAL ACTIVATED. Tourist requires immediate first-responder assistance.';

    const incident = realtimeStore.createIncident({
      title: '🚨 CRITICAL SOS EMERGENCY ALERT',
      description: desc,
      category: 'medical_emergency',
      priority: 'critical',
      is_sos: true,
      latitude: location.lat,
      longitude: location.lng,
      address: location.address || 'GPS Coordinates',
      reporter_name: reporter.name,
      reporter_phone: reporter.phone,
      reporter_id: reporter.id,
    });

    refreshIncidents();
    return incident;
  };

  const reportIncident = (params: {
    title: string;
    description?: string;
    category: IncidentCategory;
    priority: IncidentPriority;
    latitude: number;
    longitude: number;
    address?: string;
    reporter_name: string;
    reporter_phone?: string;
    reporter_id?: string;
    photo_urls?: string[];
  }): Incident => {
    soundEngine.playSuccessChime();
    const incident = realtimeStore.createIncident({
      ...params,
      is_sos: false,
    });
    refreshIncidents();
    return incident;
  };

  const updateIncidentStatus = (
    incidentId: string,
    newStatus: IncidentStatus,
    updaterName: string,
    updaterRole: 'tourist' | 'authority' | 'responder' | 'hotel_operator',
    notes?: string,
    responderInfo?: { responder_id?: string; responder_name?: string; eta_minutes?: number }
  ) => {
    realtimeStore.updateIncidentStatus(incidentId, newStatus, updaterName, updaterRole, notes, responderInfo);
    refreshIncidents();
  };

  const assignResponder = (incidentId: string, responderId: string, etaMinutes = 6, notes?: string) => {
    const responder = responders.find((r) => r.id === responderId);
    const respName = responder ? `${responder.name} (${responder.agency_name})` : 'Dispatched Unit';

    realtimeStore.updateIncidentStatus(
      incidentId,
      'assigned',
      'Authority Command Desk',
      'authority',
      notes || `Dispatched ${respName}. Estimated arrival in ~${etaMinutes} mins.`,
      {
        responder_id: responderId,
        responder_name: respName,
        eta_minutes: etaMinutes,
      }
    );

    // Update responder status to dispatched
    realtimeStore.updateResponderStatus(responderId, 'dispatched');
    refreshIncidents();
  };

  const resolveIncident = (incidentId: string, resolutionNotes: string, resolverName: string) => {
    realtimeStore.updateIncidentStatus(incidentId, 'resolved', resolverName, 'authority', resolutionNotes);
    soundEngine.playSuccessChime();
    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch {
      //
    }
    refreshIncidents();
  };

  const cancelIncident = (incidentId: string, reason: string) => {
    realtimeStore.updateIncidentStatus(incidentId, 'cancelled', 'User / Operator', 'tourist', `Cancelled: ${reason}`);
    refreshIncidents();
  };

  const markNotificationRead = (id: string) => {
    realtimeStore.markNotificationAsRead(id);
    refreshIncidents();
  };

  const markAllNotificationsRead = () => {
    realtimeStore.markAllNotificationsRead();
    refreshIncidents();
  };

  const unreadNotificationCount = notifications.filter((n) => !n.is_read).length;

  return (
    <IncidentContext.Provider
      value={{
        incidents,
        activeSosIncident,
        responders,
        notifications,
        unreadNotificationCount,
        isTriggeringSos,
        sosCountdown,
        startSosCountdown,
        cancelSosCountdown,
        triggerSosEmergency,
        reportIncident,
        updateIncidentStatus,
        assignResponder,
        resolveIncident,
        cancelIncident,
        markNotificationRead,
        markAllNotificationsRead,
        refreshIncidents,
      }}
    >
      {children}
    </IncidentContext.Provider>
  );
};

export const useIncidents = () => {
  const context = useContext(IncidentContext);
  if (!context) {
    throw new Error('useIncidents must be used within an IncidentProvider');
  }
  return context;
};
