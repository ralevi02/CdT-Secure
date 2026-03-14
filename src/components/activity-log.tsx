"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
type ZoneRef = { id: string; zone_number: number; name: string };
import { DoorOpen, DoorClosed, ChevronLeft, ChevronRight, Loader2, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

type Log = {
  id: string;
  zone_id: string;
  status: boolean;
  created_at: string;
  zones: { name: string; zone_number: number } | null;
};

type Props = {
  initialLogs: Log[];
  zones: ZoneRef[];
  currentZone: string;
  currentPage: number;
  hasMore: boolean;
  pageSize: number;
};

const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function ActivityLog({ initialLogs, zones, currentZone, currentPage, hasMore }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [logs, setLogs]           = useState<Log[]>(initialLogs);
  const [zone, setZone]           = useState(currentZone);
  const [page, setPage]           = useState(currentPage);
  const [moreAvail, setMoreAvail] = useState(hasMore);
  const [isLoading, startLoad]    = useTransition();

  const navigate = (newZone: string, newPage: number) => {
    const params = new URLSearchParams();
    if (newZone !== "all") params.set("zone", newZone);
    if (newPage > 1) params.set("page", String(newPage));
    router.push(`${pathname}${params.size ? "?" + params.toString() : ""}`);
  };

  const handleZoneChange = (z: string) => {
    setZone(z);
    setPage(1);
    navigate(z, 1);
  };

  const handlePage = (dir: 1 | -1) => {
    const newPage = page + dir;
    setPage(newPage);
    navigate(zone, newPage);
  };

  const handleRefresh = () => {
    startLoad(async () => {
      let query = supabaseClient
        .from("sensor_logs")
        .select("id, zone_id, status, created_at, zones(name, zone_number)")
        .order("created_at", { ascending: false })
        .range(0, 29);

      if (zone !== "all") query = query.eq("zone_id", zone);
      const { data } = await query;
      if (data) {
        setLogs(data as unknown as Log[]);
        setPage(1);
        setMoreAvail(data.length === 30);
      }
    });
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return {
      time: d.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      date: d.toLocaleDateString("es-CL", { day: "2-digit", month: "2-digit", year: "numeric" }),
    };
  };

  const groupByDate = (entries: Log[]) => {
    const groups: Record<string, Log[]> = {};
    for (const log of entries) {
      const d = new Date(log.created_at).toLocaleDateString("es-CL", {
        weekday: "long", day: "numeric", month: "long", year: "numeric",
      });
      if (!groups[d]) groups[d] = [];
      groups[d].push(log);
    }
    return groups;
  };

  const grouped = groupByDate(logs);

  return (
    <div className="flex flex-col gap-4">
      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => handleZoneChange("all")}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              zone === "all"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            Todas
          </button>
          {zones.map((z) => (
            <button
              key={z.id}
              onClick={() => handleZoneChange(z.id)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                zone === z.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              #{z.zone_number} {z.name}
            </button>
          ))}
        </div>
        <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={isLoading} className="ml-auto h-7 gap-1 text-xs">
          {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : "↻"}
          Actualizar
        </Button>
      </div>

      {/* Log list */}
      {logs.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed py-12 text-center">
          <p className="text-sm text-muted-foreground">No hay eventos registrados</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {Object.entries(grouped).map(([dateLabel, entries]) => (
            <div key={dateLabel} className="flex flex-col gap-1">
              {/* Date group header */}
              <div className="flex items-center gap-3 py-1">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs font-medium text-muted-foreground capitalize whitespace-nowrap">
                  {dateLabel}
                </span>
                <div className="h-px flex-1 bg-border" />
              </div>

              {/* Entries */}
              <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                {entries.map((log, i) => {
                  const { time } = formatDate(log.created_at);
                  return (
                    <div
                      key={log.id}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/30",
                        i !== entries.length - 1 && "border-b"
                      )}
                    >
                      {/* Icon */}
                      <div className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                        log.status
                          ? "bg-red-100 dark:bg-red-900/40"
                          : "bg-emerald-100 dark:bg-emerald-900/40"
                      )}>
                        {log.status
                          ? <DoorOpen  className="h-4 w-4 text-red-600 dark:text-red-400" />
                          : <DoorClosed className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        }
                      </div>

                      {/* Zone info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {log.zones?.name ?? "Zona desconocida"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Zona #{log.zones?.zone_number}
                        </p>
                      </div>

                      {/* Status badge */}
                      <span className={cn(
                        "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                        log.status
                          ? "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300"
                          : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"
                      )}>
                        {log.status ? "Abierto" : "Cerrado"}
                      </span>

                      {/* Time */}
                      <span className="text-xs text-muted-foreground font-mono tabular-nums ml-1 shrink-0">
                        {time}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {(page > 1 || moreAvail) && (
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={() => handlePage(-1)} disabled={page <= 1 || isLoading} className="gap-1.5">
            <ChevronLeft className="h-4 w-4" /> Anterior
          </Button>
          <span className="text-xs text-muted-foreground">Página {page}</span>
          <Button variant="outline" size="sm" onClick={() => handlePage(1)} disabled={!moreAvail || isLoading} className="gap-1.5">
            Siguiente <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
