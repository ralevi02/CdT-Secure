import { createClient } from "@supabase/supabase-js";
import { DeviceStatusBadge } from "@/components/device-status-badge";
import { ZoneStatusCard } from "@/components/zone-status-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Zone, SensorLog, DeviceStatus, Config } from "@/lib/supabase";
import { Activity, ShieldCheck } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const revalidate = 30;

async function getDashboardData() {
  const [zonesRes, deviceRes, configRes] = await Promise.all([
    supabase
      .from("zones")
      .select("*")
      .order("zone_number", { ascending: true }),
    supabase
      .from("device_status")
      .select("*")
      .eq("id", 1)
      .single(),
    supabase
      .from("config")
      .select("heartbeat_timeout_mins, notifications_enabled")
      .eq("id", 1)
      .single(),
  ]);

  const zones: Zone[] = zonesRes.data ?? [];
  const device: DeviceStatus | null = deviceRes.data ?? null;
  const config: Partial<Config> = configRes.data ?? {};

  const logsRes = await Promise.all(
    zones.map((z) =>
      supabase
        .from("sensor_logs")
        .select("*")
        .eq("zone_id", z.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single()
    )
  );

  const latestLogs: Record<string, SensorLog | null> = {};
  zones.forEach((z, i) => {
    latestLogs[z.id] = logsRes[i].data ?? null;
  });

  return { zones, device, config, latestLogs };
}

export default async function DashboardPage() {
  const { zones, device, config, latestLogs } = await getDashboardData();

  const heartbeatTimeout = config.heartbeat_timeout_mins ?? 5;
  const activeAlerts = zones.filter(
    (z) => z.is_enabled && latestLogs[z.id]?.status === true
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Estado en tiempo real del sistema
          </p>
        </div>
        <DeviceStatusBadge
          lastSeen={device?.last_seen ?? null}
          heartbeatTimeoutMins={heartbeatTimeout}
        />
      </div>

      {/* Alert Banner */}
      {activeAlerts.length > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-red-500/50 bg-red-50 dark:bg-red-950/30 p-4">
          <Activity className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 animate-pulse" />
          <div>
            <p className="text-sm font-semibold text-red-700 dark:text-red-300">
              {activeAlerts.length === 1
                ? "¡Sensor abierto detectado!"
                : `${activeAlerts.length} sensores abiertos`}
            </p>
            <p className="text-xs text-red-600/80 dark:text-red-400/80">
              {activeAlerts.map((z) => z.name).join(", ")}
            </p>
          </div>
        </div>
      )}

      {activeAlerts.length === 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 p-4">
          <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
            Todos los sensores en estado normal
          </p>
        </div>
      )}

      {/* Zones */}
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Zonas ({zones.length})
        </h2>
        {zones.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              No hay zonas configuradas. Agrega zonas desde la base de datos.
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-2">
            {zones.map((zone) => (
              <ZoneStatusCard
                key={zone.id}
                zone={zone}
                latestLog={latestLogs[zone.id]}
              />
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <RecentActivitySection zones={zones} />
    </div>
  );
}

async function RecentActivitySection({ zones }: { zones: Zone[] }) {
  if (zones.length === 0) return null;

  const zoneIds = zones.map((z) => z.id);
  const { data: recentLogs } = await supabase
    .from("sensor_logs")
    .select("*, zones(name, zone_number)")
    .in("zone_id", zoneIds)
    .order("created_at", { ascending: false })
    .limit(10);

  if (!recentLogs || recentLogs.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Actividad Reciente</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        {recentLogs.map((log) => {
          const zone = log.zones as { name: string; zone_number: number } | null;
          const date = new Date(log.created_at);
          return (
            <div
              key={log.id}
              className="flex items-center justify-between py-2 border-b last:border-0"
            >
              <div className="flex items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full ${
                    log.status ? "bg-red-500" : "bg-emerald-500"
                  }`}
                />
                <span className="text-sm">
                  {zone ? `${zone.name}` : "Zona desconocida"}
                </span>
                <span
                  className={`text-xs font-medium ${
                    log.status
                      ? "text-red-600 dark:text-red-400"
                      : "text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  {log.status ? "Abierto" : "Cerrado"}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {date.toLocaleTimeString("es-CL", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                {date.toLocaleDateString("es-CL", {
                  day: "2-digit",
                  month: "2-digit",
                })}
              </span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
