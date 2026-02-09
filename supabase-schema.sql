-- =============================================
-- SiPola Database Schema for Supabase
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. Profiles table (extends auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'Rupam I',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. QR Locations table
CREATE TABLE qr_locations (
    id SERIAL PRIMARY KEY,
    location_name TEXT NOT NULL,
    qr_code TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Apel Records table
CREATE TABLE apel_records (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    user_name TEXT NOT NULL,
    shift TEXT NOT NULL CHECK (shift IN ('Pagi', 'Siang', 'Malam')),
    total INTEGER NOT NULL DEFAULT 0,
    date DATE NOT NULL,
    time TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Activities table
CREATE TABLE activities (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    user_name TEXT NOT NULL,
    time TEXT NOT NULL,
    subject_name TEXT NOT NULL,
    description TEXT,
    images TEXT[] DEFAULT '{}',
    date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Scan Records table
CREATE TABLE scan_records (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    user_name TEXT NOT NULL,
    location_id INTEGER REFERENCES qr_locations(id) ON DELETE SET NULL,
    location_name TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Aman', 'Rawan', 'Waspada', 'Bahaya')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Row Level Security (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE apel_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_records ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read all, update own
CREATE POLICY "Profiles are viewable by authenticated users" ON profiles
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE TO authenticated USING (auth.uid() = id);

-- QR Locations: all authenticated can read, only admin can insert/update/delete
CREATE POLICY "QR Locations are viewable by authenticated" ON qr_locations
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Only admin can manage QR locations" ON qr_locations
    FOR ALL TO authenticated 
    USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Super Admin')
    );

-- Apel Records: all authenticated can read and insert
CREATE POLICY "Apel records are viewable by authenticated" ON apel_records
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert apel records" ON apel_records
    FOR INSERT TO authenticated WITH CHECK (true);

-- Activities: all authenticated can read and insert
CREATE POLICY "Activities are viewable by authenticated" ON activities
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert activities" ON activities
    FOR INSERT TO authenticated WITH CHECK (true);

-- Scan Records: all authenticated can read and insert
CREATE POLICY "Scan records are viewable by authenticated" ON scan_records
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert scan records" ON scan_records
    FOR INSERT TO authenticated WITH CHECK (true);

-- =============================================
-- Create trigger for new user signup
-- =============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, name, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        COALESCE(NEW.raw_user_meta_data->>'role', 'Rupam I')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- Insert initial QR locations
-- =============================================

INSERT INTO qr_locations (location_name, qr_code) VALUES
    ('Pos Depan', 'QR_POS_DEPAN'),
    ('Blok A Lt.1', 'QR_BLOK_A_LT1'),
    ('Blok A Lt.2', 'QR_BLOK_A_LT2'),
    ('Blok B Lt.1', 'QR_BLOK_B_LT1'),
    ('Blok B Lt.2', 'QR_BLOK_B_LT2'),
    ('Dapur', 'QR_DAPUR'),
    ('Klinik', 'QR_KLINIK'),
    ('Aula', 'QR_AULA');

-- =============================================
-- Create Storage bucket for images
-- Run this separately in Supabase Dashboard > Storage
-- =============================================
-- 1. Create bucket named 'activity-images' 
-- 2. Set it to public
-- 3. Add policy: authenticated users can upload
