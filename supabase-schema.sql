-- ============================================================
-- CdT Secure – Supabase Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

-- 1. Zones
CREATE TABLE IF NOT EXISTS zones (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_number         INT UNIQUE NOT NULL,
  name                TEXT NOT NULL,
  is_enabled          BOOLEAN NOT NULL DEFAULT true,
  trigger_local_alarm BOOLEAN NOT NULL DEFAULT false,
  created_at          TIMESTAMPTZ DEFAULT now()
);

-- 2. Sensor Logs
CREATE TABLE IF NOT EXISTS sensor_logs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id    UUID NOT NULL REFERENCES zones(id) ON DELETE CASCADE,
  status     BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sensor_logs_zone_created
  ON sensor_logs(zone_id, created_at DESC);

-- 3. Config (single row, id = 1)
CREATE TABLE IF NOT EXISTS config (
  id                     INT PRIMARY KEY DEFAULT 1,
  phone_number           TEXT NOT NULL DEFAULT '',
  callmebot_api_key      TEXT NOT NULL DEFAULT '',
  notifications_enabled  BOOLEAN NOT NULL DEFAULT false,
  heartbeat_timeout_mins INT NOT NULL DEFAULT 5,
  CONSTRAINT config_single_row CHECK (id = 1)
);

-- Insert default config row
INSERT INTO config (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- 4. Device Status (single row, id = 1)
CREATE TABLE IF NOT EXISTS device_status (
  id        INT PRIMARY KEY DEFAULT 1,
  last_seen TIMESTAMPTZ,
  is_online BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT device_status_single_row CHECK (id = 1)
);

INSERT INTO device_status (id, is_online) VALUES (1, false)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Las zonas se crean desde la interfaz web (página /zones)
-- ============================================================

-- ============================================================
-- Row Level Security (RLS) — recommended for production
-- ============================================================
-- Enable RLS on all tables
ALTER TABLE zones          ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensor_logs    ENABLE ROW LEVEL SECURITY;
ALTER TABLE config         ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_status  ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (used by server-side Next.js)
-- The anon key should NOT have direct access in production.
-- If you want the dashboard to work with anon key for reads, add:
-- CREATE POLICY "Allow read zones"        ON zones         FOR SELECT USING (true);
-- CREATE POLICY "Allow read sensor_logs"  ON sensor_logs   FOR SELECT USING (true);
-- CREATE POLICY "Allow read device_status" ON device_status FOR SELECT USING (true);
-- CREATE POLICY "Allow read config"       ON config        FOR SELECT USING (true);
-- But since we use service_role on the server, RLS is bypassed server-side.
