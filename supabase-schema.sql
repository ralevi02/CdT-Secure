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
  notifications_enabled  BOOLEAN NOT NULL DEFAULT false,
  heartbeat_timeout_mins INT NOT NULL DEFAULT 5,
  CONSTRAINT config_single_row CHECK (id = 1)
);

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

-- 5. Notification Contacts (multiple phone numbers with individual toggles)
CREATE TABLE IF NOT EXISTS notification_contacts (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT NOT NULL DEFAULT '',
  phone_number     TEXT NOT NULL,
  callmebot_api_key TEXT NOT NULL DEFAULT '',
  is_enabled       BOOLEAN NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- Twilio – columnas en config y call_enabled en contacts
-- (ejecutar solo si es primera vez; si ya existen, ignorar errores)
-- ============================================================
ALTER TABLE config ADD COLUMN IF NOT EXISTS twilio_account_sid  TEXT NOT NULL DEFAULT '';
ALTER TABLE config ADD COLUMN IF NOT EXISTS twilio_auth_token   TEXT NOT NULL DEFAULT '';
ALTER TABLE config ADD COLUMN IF NOT EXISTS twilio_from_number  TEXT NOT NULL DEFAULT '';
ALTER TABLE config ADD COLUMN IF NOT EXISTS calls_enabled       BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE notification_contacts ADD COLUMN IF NOT EXISTS call_enabled BOOLEAN NOT NULL DEFAULT false;

-- 6. Push Subscriptions (Web Push / PWA)
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint    TEXT UNIQUE NOT NULL,
  keys_p256dh TEXT NOT NULL,
  keys_auth   TEXT NOT NULL,
  vibration   TEXT NOT NULL DEFAULT 'normal',
  created_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon can read push_subscriptions"
  ON push_subscriptions FOR SELECT TO anon USING (true);

-- ============================================================
-- Zona por defecto (se pueden crear más desde /zones)
-- ============================================================
INSERT INTO zones (zone_number, name, is_enabled, trigger_local_alarm)
VALUES (1, 'Zona 1', true, false)
ON CONFLICT (zone_number) DO NOTHING;

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================
ALTER TABLE zones                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensor_logs            ENABLE ROW LEVEL SECURITY;
ALTER TABLE config                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_status          ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_contacts  ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Supabase Realtime – publicar cambios en tiempo real
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE sensor_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE device_status;
ALTER PUBLICATION supabase_realtime ADD TABLE zones;

-- ============================================================
-- RLS – Políticas de lectura pública (necesarias para Realtime)
-- Las escrituras solo ocurren vía service_role key (API routes)
-- ============================================================

-- zones
CREATE POLICY "anon can read zones"
  ON zones FOR SELECT TO anon USING (true);

-- sensor_logs
CREATE POLICY "anon can read sensor_logs"
  ON sensor_logs FOR SELECT TO anon USING (true);

-- device_status
CREATE POLICY "anon can read device_status"
  ON device_status FOR SELECT TO anon USING (true);

-- config
CREATE POLICY "anon can read config"
  ON config FOR SELECT TO anon USING (true);
