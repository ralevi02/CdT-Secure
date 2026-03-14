import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Zone = {
  id: string;
  zone_number: number;
  name: string;
  is_enabled: boolean;
  trigger_local_alarm: boolean;
};

export type SensorLog = {
  id: string;
  zone_id: string;
  status: boolean;
  created_at: string;
};

export type Config = {
  id: number;
  phone_number: string;
  callmebot_api_key: string;
  notifications_enabled: boolean;
  heartbeat_timeout_mins: number;
};

export type DeviceStatus = {
  id: string;
  last_seen: string;
  is_online: boolean;
};
