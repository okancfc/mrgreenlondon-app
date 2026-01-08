-- Migration: Add company column to addresses table
-- Date: 2026-01-08
-- Description: Adds an optional company field to the addresses table for business addresses

ALTER TABLE addresses 
ADD COLUMN IF NOT EXISTS company TEXT;
