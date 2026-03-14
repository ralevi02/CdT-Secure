import { createClient } from "@supabase/supabase-js";
import { DashboardClient, type RecentLog } from "@/components/dashboard-client";
import type { Zone, DeviceStatus, Config } from "@/lib/supabase";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const revalidate = 0;

async function getDashboardData() {
  const [zonesRes, deviceRes, configRes] = await Promise.all([
    supabase.from("zones").select("*").order("zone_number", { ascending: true }),
    supabase.from("device_status").select("*").eq("id", 1).single(),
    supabase.from("config").select("heartbeat_timeout_mins").eq("id", 1).single(),
  ]);

  const zones: Zone[]              = zonesRes.data ?? [];
  const device: DeviceStatus | null = deviceRes.data ?? null;
  const config: Partial<Config>    = configRes.data ?? {};

  const { data: rawLogs } = await supabase
    .from("sensor_logs")
    .select("id, zone_id, status, created_at, zones(name, zone_number)")
    .in("zone_id", zones.length > 0 ? zones.map((z) => z.id) : [""])
    .order("created_at", { ascending: false })
    .limit(20);

  const logs: RecentLog[] = (rawLogs ?? []).map((l) => {
    const z = (Array.isArray(l.zones) ? l.zones[0] : l.zones) as { name: string; zone_number: number } | null;
    return {
      id: l.id,
      zone_id: l.zone_id,
      status: l.status,
      created_at: l.created_at,
      zone_name: z?.name ?? "Zona desconocida",
      zone_number: z?.zone_number ?? 0,
    };
  });

  return { zones, device, logs, heartbeatTimeout: config.heartbeat_timeout_mins ?? 5 };
}

export default async function DashboardPage() {
  const { zones, device, logs, heartbeatTimeout } = await getDashboardData();

  return (
    <DashboardClient
      initialZones={zones}
      initialDevice={device}
      initialLogs={logs}
      heartbeatTimeout={heartbeatTimeout}
    />
  );
}
