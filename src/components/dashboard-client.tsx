"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import { DeviceStatusBadge } from "@/components/device-status-badge";
import { ArmPanel } from "@/components/arm-panel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, ShieldCheck, DoorOpen, DoorClosed, ArrowRight, Wifi } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { Zone, DeviceStatus } from "@/lib/supabase";

const PREVIEW_COUNT = 5;

export type RecentLog = {
  id: string;
  zone_id: string;
  status: boolean;
  created_at: string;
  zone_name: string;
  zone_number: number;
};

type Props = {
  initialZones: Zone[];
  initialDevice: DeviceStatus | null;
  initialLogs: RecentLog[];
  heartbeatTimeout: number;
};

export function DashboardClient({
  initialZones,
  initialDevice,
  initialLogs,
  heartbeatTimeout,
}: Props) {
  const [zones, setZones]   = useState<Zone[]>(initialZones);
  const [device, setDevice] = useState<DeviceStatus | null>(initialDevice);
  const [logs, setLogs]     = useState<RecentLog[]>(initialLogs);
  const [pulse, setPulse]   = useState(false); // flash on new event
  const zonesRef            = useRef(zones);
  zonesRef.current          = zones;

  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const channel = supabase
      .channel("dashboard-realtime")

      // New sensor event
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "sensor_logs" },
        (payload) => {
          const row = payload.new as { id: string; zone_id: string; status: boolean; created_at: string };
          const zone = zonesRef.current.find((z) => z.id === row.zone_id);
          const newLog: RecentLog = {
            id: row.id,
            zone_id: row.zone_id,
            status: row.status,
            created_at: row.created_at,
            zone_name: zone?.name ?? "Zona desconocida",
            zone_number: zone?.zone_number ?? 0,
          };
          setLogs((prev) => [newLog, ...prev].slice(0, 20));
          // brief pulse animation
          setPulse(true);
          setTimeout(() => setPulse(false), 800);
        }
      )

      // Device status update
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "device_status" },
        (payload) => {
          setDevice((prev) => ({ ...(prev ?? { id: "1", is_online: false, last_seen: null }), ...payload.new }) as DeviceStatus);
        }
      )

      // Zone arm/disarm update
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "zones" },
        (payload) => {
          setZones((prev) =>
            prev.map((z) => (z.id === payload.new.id ? { ...z, ...payload.new } : z))
          );
        }
      )

      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const activeAlerts = zones.filter((z) => {
    const latest = logs.find((l) => l.zone_id === z.id);
    return z.is_enabled && latest?.status === true;
  });

  return (
    <div className="flex flex-col gap-6 pb-28 md:pb-0">

      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">Dashboard</h1>
            {/* Realtime indicator */}
            <span className="flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
              <Wifi className="h-2.5 w-2.5" />
              En vivo
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">Estado en tiempo real</p>
        </div>
        <DeviceStatusBadge
          lastSeen={device?.last_seen ?? null}
          heartbeatTimeoutMins={heartbeatTimeout}
        />
      </div>

      {/* ── Alert banner ───────────────────────────────── */}
      <div className={cn("transition-all duration-300", pulse && "scale-[1.01]")}>
        {activeAlerts.length > 0 ? (
          <div className="flex items-center gap-3 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/50 p-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-500">
              <Activity className="h-4 w-4 text-white animate-pulse" />
            </div>
            <div>
              <p className="text-sm font-semibold text-red-800 dark:text-red-200">
                {activeAlerts.length === 1 ? "¡Sensor abierto!" : `${activeAlerts.length} sensores abiertos`}
              </p>
              <p className="text-xs text-red-600 dark:text-red-400">
                {activeAlerts.map((z) => z.name).join(", ")}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 p-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500">
              <ShieldCheck className="h-4 w-4 text-white" />
            </div>
            <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
              Todos los sensores en estado normal
            </p>
          </div>
        )}
      </div>

      {/* ── Arm panel ──────────────────────────────────── */}
      {zones.length > 0 && <ArmPanel zones={zones} />}

      {/* ── Recent activity preview ─────────────────── */}
      <RecentActivityPreview logs={logs} pulse={pulse} />
    </div>
  );
}

/* ─── Recent Activity Preview ───────────────────────────── */
function RecentActivityPreview({ logs, pulse }: { logs: RecentLog[]; pulse: boolean }) {
  const [expanded, setExpanded] = useState(false);
  if (logs.length === 0) return null;

  const visible   = expanded ? logs : logs.slice(0, PREVIEW_COUNT);
  const hasMore   = logs.length > PREVIEW_COUNT && !expanded;

  return (
    <Card className={cn("transition-all duration-300", pulse && "ring-2 ring-primary/30")}>
      <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm">Actividad Reciente</CardTitle>
        <Link
          href="/activity"
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          Ver todo <ArrowRight className="h-3 w-3" />
        </Link>
      </CardHeader>

      <CardContent className="p-0">
        <div className="relative">
          <div className="flex flex-col divide-y divide-border px-4">
            {visible.map((log, i) => {
              const d    = new Date(log.created_at);
              const time = d.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" });
              const date = d.toLocaleDateString("es-CL", { day: "2-digit", month: "2-digit" });

              return (
                <div
                  key={log.id}
                  className={cn(
                    "flex items-center gap-2.5 py-2.5 transition-all",
                    i === 0 && pulse && "animate-pulse-once"
                  )}
                >
                  <div className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                    log.status
                      ? "bg-red-100 dark:bg-red-900/40"
                      : "bg-emerald-100 dark:bg-emerald-900/40"
                  )}>
                    {log.status
                      ? <DoorOpen  className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                      : <DoorClosed className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    }
                  </div>
                  <span className="flex-1 text-sm truncate">{log.zone_name}</span>
                  <span className={cn(
                    "text-xs font-medium",
                    log.status ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"
                  )}>
                    {log.status ? "Abierto" : "Cerrado"}
                  </span>
                  <span className="text-xs text-muted-foreground tabular-nums shrink-0">
                    {time} {date}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Fade + Ver más */}
          {hasMore && (
            <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center justify-end pb-3 pt-10 bg-gradient-to-t from-card via-card/80 to-transparent rounded-b-xl">
              <button
                onClick={() => setExpanded(true)}
                className="flex items-center gap-1.5 rounded-full border bg-card px-4 py-1.5 text-xs font-semibold shadow-sm hover:bg-muted transition-colors"
              >
                Ver más ({logs.length - PREVIEW_COUNT} más)
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          )}

          {/* Spacer when faded */}
          {hasMore && <div className="h-12" />}
        </div>
      </CardContent>
    </Card>
  );
}
