"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import { DeviceStatusBadge } from "@/components/device-status-badge";
import { ArmPanel } from "@/components/arm-panel";
import { Activity, ShieldCheck, ArrowRight, Wifi, Bell, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { Zone, DeviceStatus } from "@/lib/supabase";

const PREVIEW_COUNT = 5;

function fmtDateTime(iso: string) {
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  return { time: `${hh}:${mm}`, date: `${dd}/${mo}` };
}

export type RecentLog = {
  id: string; zone_id: string; status: boolean; created_at: string; zone_name: string; zone_number: number;
};

type Props = {
  initialZones: Zone[]; initialDevice: DeviceStatus | null; initialLogs: RecentLog[]; heartbeatTimeout: number;
};

export function DashboardClient({ initialZones, initialDevice, initialLogs, heartbeatTimeout }: Props) {
  const [zones, setZones] = useState<Zone[]>(initialZones);
  const [device, setDevice] = useState<DeviceStatus | null>(initialDevice);
  const [logs, setLogs] = useState<RecentLog[]>(initialLogs);
  const [pulse, setPulse] = useState(false);
  const [rtStatus, setRtStatus] = useState<"connecting" | "live" | "error">("connecting");
  const zonesRef = useRef(zones);
  zonesRef.current = zones;

  useEffect(() => {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    const channel = supabase
      .channel("dashboard-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "sensor_logs" }, (payload) => {
        const row = payload.new as { id: string; zone_id: string; status: boolean; created_at: string };
        const zone = zonesRef.current.find((z) => z.id === row.zone_id);
        setLogs((prev) => [{ id: row.id, zone_id: row.zone_id, status: row.status, created_at: row.created_at, zone_name: zone?.name ?? "Zona desconocida", zone_number: zone?.zone_number ?? 0 }, ...prev].slice(0, 20));
        setPulse(true); setTimeout(() => setPulse(false), 800);
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "device_status" }, (payload) => {
        setDevice((prev) => ({ ...(prev ?? { id: "1", is_online: false, last_seen: null }), ...payload.new }) as DeviceStatus);
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "zones" }, (payload) => {
        setZones((prev) => prev.map((z) => (z.id === payload.new.id ? { ...z, ...payload.new } : z)));
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") setRtStatus("live");
        else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") setRtStatus("error");
        else setRtStatus("connecting");
      });
    return () => { supabase.removeChannel(channel); };
  }, []);

  const activeAlerts = zones.filter((z) => {
    const latest = logs.find((l) => l.zone_id === z.id);
    return z.is_enabled && latest?.status === true;
  });

  return (
    <div className="flex flex-col gap-2.5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
            {rtStatus === "live" && (
              <span data-glass="green" className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 relative overflow-hidden">
                <Wifi className="h-2.5 w-2.5" /> En vivo
              </span>
            )}
            {rtStatus === "connecting" && (
              <span data-glass="btn" className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-300 relative overflow-hidden">
                <Wifi className="h-2.5 w-2.5 animate-pulse" /> Conectando…
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">Estado en tiempo real</p>
        </div>
        <DeviceStatusBadge lastSeen={device?.last_seen ?? null} heartbeatTimeoutMins={heartbeatTimeout} />
      </div>

      {/* Sensor banner */}
      <div className={cn("transition-all duration-300", pulse && "scale-[1.005]")}>
        {activeAlerts.length > 0 ? (
          <div data-glass="banner-alert" className="relative overflow-hidden flex items-center gap-3 rounded-[16px] p-3 border bg-red-50">
            <div className="absolute top-0 left-[15%] w-[70%] h-[60%] bg-[radial-gradient(ellipse_at_top,rgba(239,68,68,0.06),transparent_70%)]" />
            <Activity className="relative z-10 h-4 w-4 text-red-500 shrink-0 animate-pulse" />
            <div className="relative z-10">
              <p className="text-sm font-medium text-red-800 dark:text-[#FCA5A5]">{activeAlerts.length === 1 ? "¡Sensor abierto!" : `${activeAlerts.length} sensores abiertos`}</p>
              <p className="text-xs text-red-600 dark:text-[#F87171]">{activeAlerts.map((z) => z.name).join(", ")}</p>
            </div>
          </div>
        ) : (
          <div data-glass="banner-ok" className="relative overflow-hidden flex items-center gap-3 rounded-[16px] p-3 border bg-emerald-50">
            <div className="absolute top-0 left-[15%] w-[70%] h-[60%] bg-[radial-gradient(ellipse_at_top,rgba(34,197,94,0.05),transparent_70%)]" />
            <ShieldCheck className="relative z-10 h-4 w-4 text-emerald-600 dark:text-[#22C55E] shrink-0" />
            <span className="relative z-10 text-[13px] font-medium text-emerald-800 dark:text-[#86EFAC]">Todos los sensores en estado normal</span>
          </div>
        )}
      </div>

      {/* Arm panel */}
      {zones.length > 0 && <ArmPanel zones={zones} />}

      {/* Widget grid */}
      <div className="grid grid-cols-2 gap-2.5">
        <Link href="/notifications" data-glass="widget" className="relative overflow-hidden flex items-center gap-3 rounded-[18px] p-3.5 border bg-card hover:bg-muted/40 transition-colors">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-muted border border-border/50">
            <Bell className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <p className="text-[13px] font-medium">Notificaciones</p>
            <p className="text-[11px] text-muted-foreground">WhatsApp activo</p>
          </div>
        </Link>
        <Link href="/llamadas" data-glass="widget" className="relative overflow-hidden flex items-center gap-3 rounded-[18px] p-3.5 border bg-card hover:bg-muted/40 transition-colors">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-muted border border-border/50">
            <Phone className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <p className="text-[13px] font-medium">Llamadas</p>
            <p className="text-[11px] text-muted-foreground">Twilio</p>
          </div>
        </Link>
      </div>

      {/* Activity preview */}
      <RecentActivityPreview logs={logs} pulse={pulse} />
    </div>
  );
}

function RecentActivityPreview({ logs, pulse }: { logs: RecentLog[]; pulse: boolean }) {
  const [expanded, setExpanded] = useState(false);
  if (logs.length === 0) return null;
  const visible = expanded ? logs : logs.slice(0, PREVIEW_COUNT);
  const hasMore = logs.length > PREVIEW_COUNT && !expanded;

  return (
    <div data-glass="activity" className={cn("relative overflow-hidden rounded-[18px] p-4 border bg-card transition-all duration-300", pulse && "ring-1 ring-primary/20")}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-[13px] font-medium">Actividad reciente</span>
        <Link href="/activity" className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors">Ver todo <ArrowRight className="h-3 w-3" /></Link>
      </div>
      <div className="relative">
        <div className="flex flex-col">
          {visible.map((log, i) => {
            const { time } = fmtDateTime(log.created_at);
            return (
              <div key={log.id} className={cn("flex justify-between items-center py-[7px]", i !== visible.length - 1 && "border-b border-border/30", i === 0 && pulse && "animate-pulse-once")}>
                <div className="flex items-center gap-2">
                  <div className={cn("h-[5px] w-[5px] rounded-full shrink-0", log.status ? "bg-red-500" : "bg-emerald-500")} />
                  <span className="text-xs text-muted-foreground">{log.zone_name}</span>
                </div>
                <div className="flex gap-2 items-center">
                  <span className={cn("text-[11px]", log.status ? "text-red-500" : "text-emerald-500")}>{log.status ? "Abierto" : "Cerrado"}</span>
                  <span suppressHydrationWarning className="text-[11px] text-muted-foreground/30 tabular-nums">{time}</span>
                </div>
              </div>
            );
          })}
        </div>
        {hasMore && (
          <div className="flex justify-center pt-2">
            <button onClick={() => setExpanded(true)} data-glass="btn" className="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-all active:scale-[0.97] relative overflow-hidden">
              Ver más ({logs.length - PREVIEW_COUNT} más) <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
