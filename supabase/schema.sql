-- ==============================================================================
-- TOURIST SAFETY, ASSISTANCE & INCIDENT RESPONSE PLATFORM (PU PS 1 - Tourism)
-- Supabase PostgreSQL Database Schema with RLS, Realtime & Realistic Seed Data
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ENUMS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('tourist', 'authority', 'responder', 'hotel_operator');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE incident_category AS ENUM (
        'medical_emergency',
        'theft',
        'lost_person',
        'lost_property',
        'accident',
        'harassment',
        'unsafe_area',
        'natural_hazard',
        'other'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE incident_priority AS ENUM ('low', 'medium', 'high', 'critical');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE incident_status AS ENUM (
        'received',
        'reviewing',
        'assigned',
        'response_en_route',
        'on_scene',
        'resolved',
        'cancelled'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE zone_risk_level AS ENUM ('safe', 'advisory', 'warning', 'danger', 'restricted');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE lost_found_status AS ENUM ('reported_lost', 'reported_found', 'claimed', 'returned', 'closed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE verification_status AS ENUM ('unverified', 'pending', 'verified', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. USERS & PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role user_role DEFAULT 'tourist' NOT NULL,
    phone TEXT,
    nationality TEXT,
    passport_or_id_number TEXT,
    avatar_url TEXT,
    verification_status verification_status DEFAULT 'unverified' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TOURIST EXTENDED PROFILES
CREATE TABLE IF NOT EXISTS public.tourist_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
    hotel_name TEXT,
    hotel_room_no TEXT,
    tour_operator_name TEXT,
    primary_language TEXT DEFAULT 'en',
    blood_group TEXT,
    medical_conditions TEXT,
    allergies TEXT,
    itinerary_notes TEXT,
    last_known_lat DOUBLE PRECISION,
    last_known_lng DOUBLE PRECISION,
    last_location_updated_at TIMESTAMPTZ,
    is_safe_status BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. EMERGENCY CONTACTS
CREATE TABLE IF NOT EXISTS public.emergency_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    relationship TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. RESPONDERS / EMERGENCY SERVICES
CREATE TABLE IF NOT EXISTS public.responders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    agency_name TEXT NOT NULL,
    agency_type TEXT NOT NULL,
    badge_number TEXT,
    phone TEXT NOT NULL,
    status TEXT DEFAULT 'available',
    current_lat DOUBLE PRECISION,
    current_lng DOUBLE PRECISION,
    current_assigned_incident_id UUID,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. INCIDENTS (SOS & REPORTED)
CREATE TABLE IF NOT EXISTS public.incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_code TEXT UNIQUE NOT NULL,
    reporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reporter_name TEXT NOT NULL,
    reporter_phone TEXT,
    is_sos BOOLEAN DEFAULT false NOT NULL,
    category incident_category NOT NULL,
    priority incident_priority DEFAULT 'medium' NOT NULL,
    status incident_status DEFAULT 'received' NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    address TEXT,
    landmark TEXT,
    photo_urls TEXT[] DEFAULT '{}',
    audio_note_url TEXT,
    responder_id UUID REFERENCES public.responders(id) ON DELETE SET NULL,
    responder_name TEXT,
    responder_notes TEXT,
    resolution_notes TEXT,
    eta_minutes INTEGER,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    resolved_at TIMESTAMPTZ
);

-- 7. INCIDENT STATUS UPDATES & AUDIT TRAIL
CREATE TABLE IF NOT EXISTS public.incident_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID REFERENCES public.incidents(id) ON DELETE CASCADE NOT NULL,
    updater_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    updater_name TEXT NOT NULL,
    updater_role user_role NOT NULL,
    previous_status incident_status,
    new_status incident_status NOT NULL,
    notes TEXT,
    location_lat DOUBLE PRECISION,
    location_lng DOUBLE PRECISION,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. SAFETY ZONES & GEOFENCES
CREATE TABLE IF NOT EXISTS public.safety_zones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    zone_type TEXT NOT NULL,
    risk_level zone_risk_level DEFAULT 'safe' NOT NULL,
    center_lat DOUBLE PRECISION NOT NULL,
    center_lng DOUBLE PRECISION NOT NULL,
    radius_meters INTEGER NOT NULL DEFAULT 500,
    warning_message TEXT NOT NULL,
    instructions TEXT,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. SERVICE LOCATIONS
CREATE TABLE IF NOT EXISTS public.service_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    is_24_7 BOOLEAN DEFAULT true,
    languages_spoken TEXT[] DEFAULT '{"English"}',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. LOST & FOUND REGISTRY
CREATE TABLE IF NOT EXISTS public.lost_found (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_code TEXT UNIQUE NOT NULL,
    item_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    location_name TEXT NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    date_lost_or_found DATE NOT NULL,
    image_url TEXT,
    reporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reporter_name TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    contact_email TEXT,
    status lost_found_status DEFAULT 'reported_lost' NOT NULL,
    claimed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    claim_details TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. TOURIST GROUPS
CREATE TABLE IF NOT EXISTS public.tourist_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    group_code TEXT UNIQUE NOT NULL,
    guide_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    guide_name TEXT NOT NULL,
    guide_phone TEXT,
    hotel_or_agency TEXT,
    description TEXT,
    max_members INTEGER DEFAULT 50,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 12. GROUP MEMBERS
CREATE TABLE IF NOT EXISTS public.group_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID REFERENCES public.tourist_groups(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    member_name TEXT NOT NULL,
    member_phone TEXT,
    is_safe BOOLEAN DEFAULT true,
    share_location BOOLEAN DEFAULT true,
    last_lat DOUBLE PRECISION,
    last_lng DOUBLE PRECISION,
    last_checkin_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    joined_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(group_id, user_id)
);

-- 13. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    broadcast_role user_role,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    is_read BOOLEAN DEFAULT false,
    related_incident_id UUID REFERENCES public.incidents(id) ON DELETE CASCADE,
    action_url TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 14. IDENTITY VERIFICATION RECORDS
CREATE TABLE IF NOT EXISTS public.verification_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    document_type TEXT NOT NULL,
    document_number_masked TEXT NOT NULL,
    document_image_url TEXT,
    status verification_status DEFAULT 'pending' NOT NULL,
    reviewer_notes TEXT,
    reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    submitted_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    verified_at TIMESTAMPTZ
);

-- 15. INDEXES
CREATE INDEX IF NOT EXISTS idx_incidents_status ON public.incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_priority ON public.incidents(priority);
CREATE INDEX IF NOT EXISTS idx_incidents_category ON public.incidents(category);
CREATE INDEX IF NOT EXISTS idx_incidents_reporter ON public.incidents(reporter_id);
CREATE INDEX IF NOT EXISTS idx_incidents_created_at ON public.incidents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_incident_updates_incident_id ON public.incident_updates(incident_id);
CREATE INDEX IF NOT EXISTS idx_safety_zones_active ON public.safety_zones(is_active);
CREATE INDEX IF NOT EXISTS idx_lost_found_status ON public.lost_found(status);
CREATE INDEX IF NOT EXISTS idx_lost_found_category ON public.lost_found(category);
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON public.group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
