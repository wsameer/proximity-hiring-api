-- PostGIS geometry column for user_location table
-- Run this after the initial migration

-- Add geometry column for spatial queries
ALTER TABLE user_location
ADD COLUMN IF NOT EXISTS location geometry(Point, 4326);

-- Create spatial index
CREATE INDEX IF NOT EXISTS user_location_geom_idx
ON user_location USING GIST (location);

-- Function to auto-update geometry from lat/lng
CREATE OR REPLACE FUNCTION update_user_location_geometry()
RETURNS TRIGGER AS $$
BEGIN
  NEW.location = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to keep geometry in sync
DROP TRIGGER IF EXISTS trg_update_user_location_geometry ON user_location;
CREATE TRIGGER trg_update_user_location_geometry
  BEFORE INSERT OR UPDATE ON user_location
  FOR EACH ROW
  EXECUTE FUNCTION update_user_location_geometry();
