-- Migration: Increase zoom_level limit for better component focusing
-- Created: 2025-08-22
-- Purpose: Allow zoom levels up to 20x (2000%) for detailed component inspection

-- Remove existing zoom constraints
ALTER TABLE saved_views 
DROP CONSTRAINT IF EXISTS saved_views_zoom_level_check;

ALTER TABLE provisional_views 
DROP CONSTRAINT IF EXISTS provisional_views_zoom_level_check;

-- Add new constraints allowing zoom from 0.1x to 20.0x
ALTER TABLE saved_views 
ADD CONSTRAINT saved_views_zoom_level_check 
CHECK (zoom_level >= 0.1 AND zoom_level <= 20.0);

ALTER TABLE provisional_views 
ADD CONSTRAINT provisional_views_zoom_level_check 
CHECK (zoom_level >= 0.1 AND zoom_level <= 20.0);

-- Update column comments for documentation
COMMENT ON COLUMN saved_views.zoom_level IS 'Zoom level from 0.1x (10%) to 20.0x (2000%)';
COMMENT ON COLUMN provisional_views.zoom_level IS 'Zoom level from 0.1x (10%) to 20.0x (2000%)';