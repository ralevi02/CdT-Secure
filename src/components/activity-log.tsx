"use client";

import { useTransition } from "react";

function fmtTime(iso: string) {
  const d  = new Date(iso);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

function fmtDateLabel(iso: string) {
  const d   = new Date(iso);
  const day = d.getDate();
  const mo  = d.toLocaleString("es", { month: "long" });
  const yr  = d.getFullYear();
  const wd  = d.toLocaleString("es", { weekday: "long" });
  return `${wd}, ${day} de ${mo} de ${yr}`;
}
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DoorOpen, DoorClosed, ChevronLeft, ChevronRight, Loader2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

type ZoneRef = { id: string; zone_number: number; name: string };

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
};

export function ActivityLog({ initialLogs, zones, currentZone, currentPage, hasMore }: Props) {
  const router   = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  // Navigate keeping filter + page in URL — server re-fetches correctly
  const navigate = (newZone: string, newPage: number) => {
    const params = new URLSearchParams();
    if (newZone !== "all") params.set("zone", newZone);
    if (newPage > 1) params.set("page", String(newPage));
    const qs = params.size ? "?" + params.toString() : "";
    startTransition(() => router.push(`${pathname}${qs}`));
  };

  // Refresh: revalidate server component data for CURRENT page/filter
  const handleRefresh = () => {
    startTransition(() => router.refresh());
  };

  const groupByDate = (entries: Log[]) => {
    const groups: Record<string, Log[]> = {};
    for (const log of entries) {
      const label = fmtDateLabel(log.created_at);
      if (!groups[label]) groups[label] = [];
      groups[label].push(log);
    }
    return groups;
  };

  const grouped = groupByDate(initialLogs);

  return (
    <div className="flex flex-col gap-4">

      {/* ── Filters + refresh bar ─────────────────────── */}
      <div className="flex items-start gap-2">
        <div className="flex gap-1.5 flex-wrap flex-1">
          <button
            onClick={() => navigate("all", 1)}
            data-glass={currentZone === "all" ? "green-strong" : "btn"}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-all active:scale-[0.97] relative overflow-hidden",
              currentZone === "all"
                ? "text-emerald-700 dark:text-emerald-300"
                : "text-muted-foreground"
            )}
          >
            Todas
          </button>
          {zones.map((z) => (
            <button
              key={z.id}
              onClick={() => navigate(z.id, 1)}
              data-glass={currentZone === z.id ? "green-strong" : "btn"}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-all active:scale-[0.97] relative overflow-hidden",
                currentZone === z.id
                  ? "text-emerald-700 dark:text-emerald-300"
                  : "text-muted-foreground"
              )}
            >
              #{z.zone_number} {z.name}
            </button>
          ))}
        </div>

        {/* Refresh — only revalidates, never clears history */}
        <button
          onClick={handleRefresh}
          disabled={isPending}
          title="Recargar eventos actuales"
          data-glass="btn"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-muted-foreground hover:text-foreground transition-all active:scale-[0.95] disabled:opacity-50 relative overflow-hidden"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", isPending && "animate-spin")} />
        </button>
      </div>

      {/* ── Pending overlay hint ──────────────────────── */}
      {isPending && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Cargando…
        </div>
      )}

      {/* ── Log list ─────────────────────────────────── */}
      {initialLogs.length === 0 ? (
        <div data-glass="item-dim" className="flex flex-col items-center gap-2 rounded-xl border border-dashed py-12 text-center relative">
          <p className="text-sm text-muted-foreground">No hay eventos registrados</p>
          {currentZone !== "all" && (
            <button onClick={() => navigate("all", 1)} className="text-xs text-primary underline underline-offset-4">
              Ver todas las zonas
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {Object.entries(grouped).map(([dateLabel, entries]) => (
            <div key={dateLabel} className="flex flex-col gap-1">
              {/* Date separator */}
              <div className="flex items-center gap-3 py-1">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs font-medium text-muted-foreground capitalize whitespace-nowrap">
                  {dateLabel}
                </span>
                <div className="h-px flex-1 bg-border" />
              </div>

              {/* Entry rows */}
              <div data-glass="card" className="rounded-xl border bg-card shadow-sm overflow-hidden relative">
                {entries.map((log, i) => {
                  const time = fmtTime(log.created_at);
                  return (
                    <div
                      key={log.id}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors",
                        i !== entries.length - 1 && "border-b"
                      )}
                    >
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

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {log.zones?.name ?? "Zona desconocida"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Zona #{log.zones?.zone_number}
                        </p>
                      </div>

                      <span className={cn(
                        "rounded-full px-2.5 py-0.5 text-xs font-semibold shrink-0",
                        log.status
                          ? "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300"
                          : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"
                      )}>
                        {log.status ? "Abierto" : "Cerrado"}
                      </span>

                      <span suppressHydrationWarning className="text-xs text-muted-foreground font-mono tabular-nums shrink-0">
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

      {/* ── Pagination ────────────────────────────────── */}
      {(currentPage > 1 || hasMore) && (
        <div className="flex items-center justify-between">
          <Button
            variant="outline" size="sm"
            onClick={() => navigate(currentZone, currentPage - 1)}
            disabled={currentPage <= 1 || isPending}
            className="gap-1.5"
          >
            <ChevronLeft className="h-4 w-4" /> Anterior
          </Button>
          <span className="text-xs text-muted-foreground">Página {currentPage}</span>
          <Button
            variant="outline" size="sm"
            onClick={() => navigate(currentZone, currentPage + 1)}
            disabled={!hasMore || isPending}
            className="gap-1.5"
          >
            Siguiente <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
