-- Sir Green App Database Schema
-- Run this in Supabase SQL Editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT UNIQUE NOT NULL,
  full_name TEXT,
  area TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Services table
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  icon_key TEXT,
  starting_price_label TEXT,
  estimated_duration_minutes INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Addresses table
CREATE TABLE IF NOT EXISTS addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  line1 TEXT NOT NULL,
  line2 TEXT,
  city TEXT NOT NULL,
  postcode TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id),
  address_id UUID REFERENCES addresses(id),
  scheduled_at TIMESTAMPTZ NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'confirmed', 'completed', 'canceled')),
  cancel_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_bookings_user_scheduled ON bookings(user_id, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_services_is_active ON services(is_active);
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON addresses(user_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Services policies (public read for active services)
CREATE POLICY "Anyone can view active services"
  ON services FOR SELECT
  USING (is_active = true);

-- Addresses policies
CREATE POLICY "Users can view their own addresses"
  ON addresses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own addresses"
  ON addresses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own addresses"
  ON addresses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own addresses"
  ON addresses FOR DELETE
  USING (auth.uid() = user_id);

-- Bookings policies
CREATE POLICY "Users can view their own bookings"
  ON bookings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bookings"
  ON bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings"
  ON bookings FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- SEED DATA - Initial Services
-- ============================================

INSERT INTO services (slug, name, description, category, icon_key, starting_price_label, estimated_duration_minutes) VALUES
  ('lawn-mowing', 'Lawn Mowing', 'Professional lawn mowing service to keep your grass looking pristine all year round.', 'Landscaping', 'lawn', 'from £35', 60),
  ('hedge-trimming', 'Hedge Trimming', 'Expert hedge cutting and shaping to maintain clean, professional boundaries.', 'Landscaping', 'hedge', 'from £50', 90),
  ('garden-clearance', 'Garden Clearance', 'Complete garden clearing including waste removal. Transform overgrown spaces.', 'Landscaping', 'garden', 'from £150', 180),
  ('tree-pruning', 'Tree Pruning', 'Professional tree trimming and pruning to promote healthy growth and appearance.', 'Landscaping', 'tree', 'from £80', 120),
  ('patio-cleaning', 'Patio Cleaning', 'High-pressure jet washing to restore your patio, driveway, and outdoor surfaces.', 'Maintenance', 'patio', 'from £75', 90),
  ('fence-repair', 'Fence Repair', 'Quality fence repairs and panel replacements to secure your garden boundaries.', 'Maintenance', 'fence', 'from £60', 120),
  ('planting-service', 'Planting Service', 'Expert planting of flowers, shrubs, and trees to beautify your garden.', 'Garden Design', 'planting', 'from £45', 90),
  ('garden-design', 'Garden Design', 'Full garden design consultation and planning to create your dream outdoor space.', 'Garden Design', 'garden', 'from £200', 120)
ON CONFLICT (slug) DO NOTHING;
