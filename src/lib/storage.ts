import {
  Incident,
  SafetyZone,
  Responder,
  LostFoundItem,
  TouristGroup,
  GroupMember,
  AppNotification,
  IncidentStatus,
  IncidentPriority,
  IncidentCategory,
} from '../types';
import {
  INITIAL_INCIDENTS,
  MOCK_SAFETY_ZONES,
  MOCK_RESPONDERS,
  INITIAL_LOST_FOUND,
  INITIAL_TOURIST_GROUPS,
  INITIAL_GROUP_MEMBERS,
  INITIAL_NOTIFICATIONS,
} from './mockData';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const STORAGE_KEYS = {
  INCIDENTS: 'globalgennie_incidents_v2',
  ZONES: 'globalgennie_safety_zones_v2',
  RESPONDERS: 'globalgennie_responders_v2',
  LOST_FOUND: 'globalgennie_lost_found_v2',
  GROUPS: 'globalgennie_groups_v2',
  GROUP_MEMBERS: 'globalgennie_group_members_v2',
  NOTIFICATIONS: 'globalgennie_notifications_v2',
};

// Cross-tab broadcast channel for local real-time synchronization
const broadcastChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('globalgennie_realtime_events')
  : null;

class LocalRealtimeStore {
  private listeners: Set<(event: string, payload: unknown) => void> = new Set();

  constructor() {
    this.initDefaults();
    if (broadcastChannel) {
      broadcastChannel.onmessage = (event) => {
        const { type, payload } = event.data;
        this.notifyListeners(type, payload, false);
      };
    }
  }

  private initDefaults() {
    if (typeof window === 'undefined') return;
    if (!localStorage.getItem(STORAGE_KEYS.INCIDENTS)) {
      localStorage.setItem(STORAGE_KEYS.INCIDENTS, JSON.stringify(INITIAL_INCIDENTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ZONES)) {
      localStorage.setItem(STORAGE_KEYS.ZONES, JSON.stringify(MOCK_SAFETY_ZONES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.RESPONDERS)) {
      localStorage.setItem(STORAGE_KEYS.RESPONDERS, JSON.stringify(MOCK_RESPONDERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.LOST_FOUND)) {
      localStorage.setItem(STORAGE_KEYS.LOST_FOUND, JSON.stringify(INITIAL_LOST_FOUND));
    }
    if (!localStorage.getItem(STORAGE_KEYS.GROUPS)) {
      localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(INITIAL_TOURIST_GROUPS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.GROUP_MEMBERS)) {
      localStorage.setItem(STORAGE_KEYS.GROUP_MEMBERS, JSON.stringify(INITIAL_GROUP_MEMBERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
    }
  }

  public subscribe(callback: (event: string, payload: unknown) => void) {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners(event: string, payload: unknown, broadcast = true) {
    this.listeners.forEach((cb) => {
      try {
        cb(event, payload);
      } catch (err) {
        console.error('Realtime listener error:', err);
      }
    });
    if (broadcast && broadcastChannel) {
      broadcastChannel.postMessage({ type: event, payload });
    }
  }

  // --- INCIDENTS ---
  public getIncidents(): Incident[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.INCIDENTS);
      return data ? JSON.parse(data) : INITIAL_INCIDENTS;
    } catch {
      return INITIAL_INCIDENTS;
    }
  }

  public saveIncident(incident: Incident): Incident {
    const list = this.getIncidents();
    const existingIndex = list.findIndex((i) => i.id === incident.id);
    let updated: Incident[];
    if (existingIndex >= 0) {
      updated = [...list];
      updated[existingIndex] = incident;
    } else {
      updated = [incident, ...list];
    }
    localStorage.setItem(STORAGE_KEYS.INCIDENTS, JSON.stringify(updated));
    this.notifyListeners('INCIDENT_UPDATED', incident);

    // If Supabase is connected, push asynchronously
    if (isSupabaseConfigured) {
      supabase.from('incidents').upsert(incident as any).then(({ error }) => {
        if (error) console.warn('Supabase incident upsert notice:', error);
      });
    }

    return incident;
  }

  public createIncident(params: {
    title: string;
    description?: string;
    category: IncidentCategory;
    priority: IncidentPriority;
    is_sos: boolean;
    latitude: number;
    longitude: number;
    address?: string;
    reporter_name: string;
    reporter_phone?: string;
    reporter_id?: string;
    photo_urls?: string[];
  }): Incident {
    const newId = 'inc-' + Math.random().toString(36).substring(2, 9);
    const code = 'INC-' + Math.floor(1000 + Math.random() * 9000);
    const now = new Date().toISOString();

    const incident: Incident = {
      id: newId,
      incident_code: code,
      reporter_id: params.reporter_id,
      reporter_name: params.reporter_name,
      reporter_phone: params.reporter_phone,
      is_sos: params.is_sos,
      category: params.category,
      priority: params.priority,
      status: 'received',
      title: params.title,
      description: params.description,
      latitude: params.latitude,
      longitude: params.longitude,
      address: params.address || 'GPS Coordinates Provided',
      photo_urls: params.photo_urls || [],
      created_at: now,
      updated_at: now,
      updates: [
        {
          id: 'upd-' + Math.random().toString(36).substring(2, 7),
          incident_id: newId,
          updater_name: params.reporter_name,
          updater_role: 'tourist',
          new_status: 'received',
          notes: params.is_sos ? 'SOS Emergency Signal Activated' : 'Incident report submitted',
          created_at: now,
        },
      ],
    };

    this.saveIncident(incident);

    // Auto-create notification for authorities & tourist
    this.addNotification({
      title: params.is_sos ? `🚨 CRITICAL SOS: ${incident.incident_code}` : `New Incident: ${incident.incident_code}`,
      message: `${params.title} reported at ${params.address || 'current location'}.`,
      type: params.is_sos ? 'sos_alert' : 'status_update',
      related_incident_id: newId,
    });

    return incident;
  }

  public updateIncidentStatus(
    incidentId: string,
    newStatus: IncidentStatus,
    updaterName: string,
    updaterRole: 'tourist' | 'authority' | 'responder' | 'hotel_operator',
    notes?: string,
    responderInfo?: { responder_id?: string; responder_name?: string; eta_minutes?: number }
  ): Incident | null {
    const list = this.getIncidents();
    const item = list.find((i) => i.id === incidentId);
    if (!item) return null;

    const prevStatus = item.status;
    const now = new Date().toISOString();

    const updateRecord = {
      id: 'upd-' + Math.random().toString(36).substring(2, 7),
      incident_id: incidentId,
      updater_name: updaterName,
      updater_role: updaterRole,
      previous_status: prevStatus,
      new_status: newStatus,
      notes: notes || `Status changed to ${newStatus.replace(/_/g, ' ')}`,
      created_at: now,
    };

    const updatedIncident: Incident = {
      ...item,
      status: newStatus,
      updated_at: now,
      ...(responderInfo?.responder_id ? { responder_id: responderInfo.responder_id } : {}),
      ...(responderInfo?.responder_name ? { responder_name: responderInfo.responder_name } : {}),
      ...(responderInfo?.eta_minutes !== undefined ? { eta_minutes: responderInfo.eta_minutes } : {}),
      ...(notes && updaterRole === 'responder' ? { responder_notes: notes } : {}),
      ...(newStatus === 'resolved' ? { resolved_at: now, resolution_notes: notes } : {}),
      updates: [...(item.updates || []), updateRecord],
    };

    this.saveIncident(updatedIncident);

    // Create tracking notification
    this.addNotification({
      title: `Incident ${item.incident_code} Status: ${newStatus.toUpperCase().replace(/_/g, ' ')}`,
      message: notes || `Incident updated by ${updaterName}`,
      type: 'status_update',
      related_incident_id: incidentId,
    });

    return updatedIncident;
  }

  // --- SAFETY ZONES ---
  public getSafetyZones(): SafetyZone[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ZONES);
      return data ? JSON.parse(data) : MOCK_SAFETY_ZONES;
    } catch {
      return MOCK_SAFETY_ZONES;
    }
  }

  public saveSafetyZone(zone: SafetyZone): SafetyZone {
    const list = this.getSafetyZones();
    const existingIndex = list.findIndex((z) => z.id === zone.id);
    let updated: SafetyZone[];
    if (existingIndex >= 0) {
      updated = [...list];
      updated[existingIndex] = zone;
    } else {
      updated = [zone, ...list];
    }
    localStorage.setItem(STORAGE_KEYS.ZONES, JSON.stringify(updated));
    this.notifyListeners('ZONES_UPDATED', updated);
    return zone;
  }

  public deleteSafetyZone(zoneId: string): void {
    const list = this.getSafetyZones().filter((z) => z.id !== zoneId);
    localStorage.setItem(STORAGE_KEYS.ZONES, JSON.stringify(list));
    this.notifyListeners('ZONES_UPDATED', list);
  }

  // --- RESPONDERS ---
  public getResponders(): Responder[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RESPONDERS);
      return data ? JSON.parse(data) : MOCK_RESPONDERS;
    } catch {
      return MOCK_RESPONDERS;
    }
  }

  public updateResponderStatus(responderId: string, status: 'available' | 'dispatched' | 'offline'): void {
    const list = this.getResponders().map((r) => (r.id === responderId ? { ...r, status } : r));
    localStorage.setItem(STORAGE_KEYS.RESPONDERS, JSON.stringify(list));
    this.notifyListeners('RESPONDERS_UPDATED', list);
  }

  // --- LOST & FOUND ---
  public getLostFound(): LostFoundItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LOST_FOUND);
      return data ? JSON.parse(data) : INITIAL_LOST_FOUND;
    } catch {
      return INITIAL_LOST_FOUND;
    }
  }

  public saveLostFoundItem(item: Omit<LostFoundItem, 'id' | 'item_code' | 'created_at' | 'status'> & { status?: LostFoundItem['status'] }): LostFoundItem {
    const newId = 'lf-' + Math.random().toString(36).substring(2, 9);
    const code = 'LF-' + Math.floor(3000 + Math.random() * 7000);
    const fullItem: LostFoundItem = {
      ...item,
      id: newId,
      item_code: code,
      status: item.status || (item.item_type === 'lost' ? 'reported_lost' : 'reported_found'),
      created_at: new Date().toISOString(),
    };
    const list = [fullItem, ...this.getLostFound()];
    localStorage.setItem(STORAGE_KEYS.LOST_FOUND, JSON.stringify(list));
    this.notifyListeners('LOST_FOUND_UPDATED', list);
    return fullItem;
  }

  public updateLostFoundStatus(itemId: string, status: LostFoundItem['status'], claimedBy?: string, claimDetails?: string): void {
    const list = this.getLostFound().map((item) => {
      if (item.id === itemId) {
        return {
          ...item,
          status,
          ...(claimedBy ? { claimed_by: claimedBy } : {}),
          ...(claimDetails ? { claim_details: claimDetails } : {}),
        };
      }
      return item;
    });
    localStorage.setItem(STORAGE_KEYS.LOST_FOUND, JSON.stringify(list));
    this.notifyListeners('LOST_FOUND_UPDATED', list);
  }

  // --- TOURIST GROUPS ---
  public getGroups(): TouristGroup[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.GROUPS);
      return data ? JSON.parse(data) : INITIAL_TOURIST_GROUPS;
    } catch {
      return INITIAL_TOURIST_GROUPS;
    }
  }

  public getGroupMembers(groupId?: string): GroupMember[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.GROUP_MEMBERS);
      const all: GroupMember[] = data ? JSON.parse(data) : INITIAL_GROUP_MEMBERS;
      return groupId ? all.filter((m) => m.group_id === groupId) : all;
    } catch {
      return INITIAL_GROUP_MEMBERS;
    }
  }

  public createGroup(name: string, guideName: string, description?: string, guidePhone?: string): TouristGroup {
    const code = 'GRP-' + Math.floor(1000 + Math.random() * 9000);
    const newGroup: TouristGroup = {
      id: 'grp-' + Math.random().toString(36).substring(2, 9),
      name,
      group_code: code,
      guide_name: guideName,
      guide_phone: guidePhone,
      description,
      max_members: 30,
      members_count: 1,
      created_at: new Date().toISOString(),
    };
    const groups = [newGroup, ...this.getGroups()];
    localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(groups));
    this.notifyListeners('GROUPS_UPDATED', groups);
    return newGroup;
  }

  public joinGroupByCode(code: string, member: { user_id: string; name: string; phone?: string }): { success: boolean; message: string; group?: TouristGroup } {
    const groups = this.getGroups();
    const group = groups.find((g) => g.group_code.toUpperCase() === code.trim().toUpperCase());
    if (!group) {
      return { success: false, message: 'Invalid group invitation code. Please check with your tour leader.' };
    }

    const members = this.getGroupMembers();
    const exists = members.some((m) => m.group_id === group.id && m.user_id === member.user_id);
    if (exists) {
      return { success: true, message: 'You are already a registered member of this group!', group };
    }

    const newMember: GroupMember = {
      id: 'gm-' + Math.random().toString(36).substring(2, 9),
      group_id: group.id,
      user_id: member.user_id,
      member_name: member.name,
      member_phone: member.phone,
      is_safe: true,
      share_location: true,
      last_checkin_at: new Date().toISOString(),
      joined_at: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEYS.GROUP_MEMBERS, JSON.stringify([...members, newMember]));
    this.notifyListeners('GROUP_MEMBERS_UPDATED', group.id);
    return { success: true, message: `Successfully joined ${group.name}!`, group };
  }

  public updateMemberSafety(userId: string, isSafe: boolean, lat?: number, lng?: number): void {
    const members = this.getGroupMembers().map((m) => {
      if (m.user_id === userId) {
        return {
          ...m,
          is_safe: isSafe,
          last_lat: lat ?? m.last_lat,
          last_lng: lng ?? m.last_lng,
          last_checkin_at: new Date().toISOString(),
        };
      }
      return m;
    });
    localStorage.setItem(STORAGE_KEYS.GROUP_MEMBERS, JSON.stringify(members));
    this.notifyListeners('GROUP_MEMBERS_UPDATED', null);
  }

  // --- NOTIFICATIONS ---
  public getNotifications(): AppNotification[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      return data ? JSON.parse(data) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  }

  public addNotification(notification: Omit<AppNotification, 'id' | 'is_read' | 'created_at'>): AppNotification {
    const fullNotif: AppNotification = {
      ...notification,
      id: 'notif-' + Math.random().toString(36).substring(2, 9),
      is_read: false,
      created_at: new Date().toISOString(),
    };
    const list = [fullNotif, ...this.getNotifications()];
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
    this.notifyListeners('NOTIFICATION_RECEIVED', fullNotif);
    return fullNotif;
  }

  public markNotificationAsRead(id: string): void {
    const list = this.getNotifications().map((n) => (n.id === id ? { ...n, is_read: true } : n));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
    this.notifyListeners('NOTIFICATIONS_UPDATED', list);
  }

  public markAllNotificationsRead(): void {
    const list = this.getNotifications().map((n) => ({ ...n, is_read: true }));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
    this.notifyListeners('NOTIFICATIONS_UPDATED', list);
  }
}

export const realtimeStore = new LocalRealtimeStore();
