export type UserRole = 'tourist' | 'authority' | 'responder' | 'hotel_operator';

export type IncidentCategory =
  | 'medical_emergency'
  | 'theft'
  | 'lost_person'
  | 'lost_property'
  | 'accident'
  | 'harassment'
  | 'unsafe_area'
  | 'natural_hazard'
  | 'other';

export type IncidentPriority = 'low' | 'medium' | 'high' | 'critical';

export type IncidentStatus =
  | 'received'
  | 'reviewing'
  | 'assigned'
  | 'response_en_route'
  | 'on_scene'
  | 'resolved'
  | 'cancelled';

export type ZoneRiskLevel = 'safe' | 'advisory' | 'warning' | 'danger' | 'restricted';

export type LostFoundStatus = 'reported_lost' | 'reported_found' | 'claimed' | 'returned' | 'closed';

export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  nationality?: string;
  passport_or_id_number?: string;
  avatar_url?: string;
  verification_status: VerificationStatus;
  created_at?: string;
}

export interface TouristProfile {
  id?: string;
  user_id: string;
  hotel_name?: string;
  hotel_room_no?: string;
  tour_operator_name?: string;
  primary_language?: string;
  blood_group?: string;
  medical_conditions?: string;
  allergies?: string;
  itinerary_notes?: string;
  last_known_lat?: number;
  last_known_lng?: number;
  is_safe_status?: boolean;
}

export interface EmergencyContact {
  id: string;
  user_id: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  is_primary: boolean;
}

export interface Responder {
  id: string;
  user_id?: string;
  name: string;
  agency_name: string;
  agency_type: 'police' | 'medical' | 'tourist_police' | 'fire' | 'disaster';
  badge_number: string;
  phone: string;
  status: 'available' | 'dispatched' | 'offline';
  current_lat?: number;
  current_lng?: number;
  current_assigned_incident_id?: string;
}

export interface IncidentUpdate {
  id: string;
  incident_id: string;
  updater_id?: string;
  updater_name: string;
  updater_role: UserRole;
  previous_status?: IncidentStatus;
  new_status: IncidentStatus;
  notes?: string;
  created_at: string;
}

export interface Incident {
  id: string;
  incident_code: string;
  reporter_id?: string;
  reporter_name: string;
  reporter_phone?: string;
  is_sos: boolean;
  category: IncidentCategory;
  priority: IncidentPriority;
  status: IncidentStatus;
  title: string;
  description?: string;
  latitude: number;
  longitude: number;
  address?: string;
  landmark?: string;
  photo_urls?: string[];
  audio_note_url?: string;
  responder_id?: string;
  responder_name?: string;
  responder_notes?: string;
  resolution_notes?: string;
  eta_minutes?: number;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  updates?: IncidentUpdate[];
}

export interface SafetyZone {
  id: string;
  name: string;
  description: string;
  zone_type: 'safe_haven' | 'tourist_corridor' | 'hazard_zone' | 'high_crime' | 'curfew_zone';
  risk_level: ZoneRiskLevel;
  center_lat: number;
  center_lng: number;
  radius_meters: number;
  warning_message: string;
  instructions?: string;
  is_active: boolean;
}

export interface ServiceLocation {
  id: string;
  name: string;
  category: 'hospital' | 'police' | 'tourist_police' | 'consulate' | 'pharmacy' | 'fire_station';
  phone: string;
  address: string;
  latitude: number;
  longitude: number;
  is_24_7: boolean;
  languages_spoken?: string[];
  notes?: string;
  distance_km?: number;
}

export interface LostFoundItem {
  id: string;
  item_code: string;
  item_type: 'lost' | 'found';
  title: string;
  description: string;
  category: 'passport/docs' | 'electronics' | 'wallet/money' | 'luggage' | 'jewelry' | 'keys' | 'other';
  location_name: string;
  latitude?: number;
  longitude?: number;
  date_lost_or_found: string;
  image_url?: string;
  reporter_id?: string;
  reporter_name: string;
  contact_phone: string;
  contact_email?: string;
  status: LostFoundStatus;
  claimed_by?: string;
  claim_details?: string;
  created_at: string;
}

export interface TouristGroup {
  id: string;
  name: string;
  group_code: string;
  guide_id?: string;
  guide_name: string;
  guide_phone?: string;
  hotel_or_agency?: string;
  description?: string;
  max_members: number;
  created_at: string;
  members_count?: number;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  member_name: string;
  member_phone?: string;
  is_safe: boolean;
  share_location: boolean;
  last_lat?: number;
  last_lng?: number;
  last_checkin_at: string;
  joined_at: string;
}

export interface AppNotification {
  id: string;
  user_id?: string;
  broadcast_role?: UserRole;
  title: string;
  message: string;
  type: 'sos_alert' | 'status_update' | 'zone_warning' | 'group_alert' | 'general';
  is_read: boolean;
  related_incident_id?: string;
  action_url?: string;
  created_at: string;
}
