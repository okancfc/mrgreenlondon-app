-- Migration: Add gender column to profiles table
-- Date: 2026-01-08
-- Description: Adds an optional gender field to the profiles table for user registration

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS gender TEXT;
