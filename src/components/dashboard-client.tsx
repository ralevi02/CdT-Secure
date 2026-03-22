"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import { DeviceStatusBadge } from "@/components/device-status-badge";
import { ArmPanel } from "@/components/arm-panel";
import { Activity, ShieldCheck, ArrowRight, Wifi, Phone } from "lucide-react";
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
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[#25D366]/10 border border-[#25D366]/20">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          </div>
          <div>
            <p className="text-[13px] font-medium">WhatsApp</p>
            <p className="text-[11px] text-muted-foreground">Notificaciones</p>
          </div>
        </Link>
        <Link href="/llamadas" data-glass="widget" className="relative overflow-hidden flex items-center gap-3 rounded-[18px] p-3.5 border bg-card hover:bg-muted/40 transition-colors">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-blue-500/10 border border-blue-500/20">
            <Phone className="h-4 w-4 text-blue-500" />
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
  if (logs.length === 0) return null;
  const visible = logs.slice(0, PREVIEW_COUNT);
  const hasMore = logs.length > PREVIEW_COUNT;

  return (
    <div data-glass="activity" className={cn("relative overflow-hidden rounded-[18px] p-4 border bg-card transition-all duration-300", pulse && "ring-1 ring-primary/20")}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-[13px] font-medium">Actividad reciente</span>
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
            <Link href="/activity" data-glass="btn" className="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-all active:scale-[0.97] relative overflow-hidden">
              Ver todo <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
