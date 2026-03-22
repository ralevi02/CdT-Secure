"use client";

import { useEffect, useState } from "react";
import { Wifi, WifiOff, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  lastSeen: string | null;
  heartbeatTimeoutMins: number;
};

function fmtFullDate(iso: string) {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${dd}/${mm}/${yy} ${hh}:${mi}:${ss}`;
}

export function DeviceStatusBadge({ lastSeen, heartbeatTimeoutMins }: Props) {
  const [isOnline, setIsOnline] = useState(false);
  const [timeAgo, setTimeAgo] = useState("");
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const compute = () => {
      if (!lastSeen) {
        setIsOnline(false);
        setTimeAgo("Sin datos");
        return;
      }
      const diffMs = Date.now() - new Date(lastSeen).getTime();
      const diffMins = diffMs / 60000;
      setIsOnline(diffMins < heartbeatTimeoutMins);

      if (diffMins < 1) setTimeAgo("Hace menos de 1 min");
      else if (diffMins < 60) setTimeAgo(`Hace ${Math.floor(diffMins)} min`);
      else if (diffMins < 1440) setTimeAgo(`Hace ${Math.floor(diffMins / 60)} h`);
      else setTimeAgo(`Hace ${Math.floor(diffMins / 1440)} días`);
    };

    compute();
    const interval = setInterval(compute, 30000);
    return () => clearInterval(interval);
  }, [lastSeen, heartbeatTimeoutMins]);

  return (
    <div className="relative">
      <button
        onClick={() => setExpanded((v) => !v)}
        data-glass={isOnline ? "green" : "btn-red"}
        className={cn(
          "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all active:scale-[0.96] relative overflow-hidden cursor-pointer",
          isOnline ? "text-emerald-700 dark:text-emerald-300" : "text-red-700 dark:text-red-300"
        )}
      >
        {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
        {isOnline ? "Online" : "Offline"}
      </button>

      {expanded && (
        <div
          data-glass="popup"
          className="absolute right-0 top-full mt-2 z-30 w-56 rounded-2xl p-3 overflow-hidden"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">ESP32</span>
            <button onClick={() => setExpanded(false)} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="h-3 w-3" />
            </button>
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <div className={cn("h-2 w-2 rounded-full", isOnline ? "bg-emerald-500" : "bg-red-500")} />
              <span className="text-sm font-medium">{isOnline ? "Conectado" : "Desconectado"}</span>
            </div>
            <div className="text-[11px] text-muted-foreground">
              <p>Última señal: <span className="font-medium text-foreground/70">{timeAgo}</span></p>
              {lastSeen && (
                <p suppressHydrationWarning className="mt-0.5 font-mono tabular-nums">{fmtFullDate(lastSeen)}</p>
              )}
              {!lastSeen && <p className="mt-0.5">Nunca se ha conectado</p>}
            </div>
            <p className="text-[10px] text-muted-foreground/60 mt-1">
              Timeout: {heartbeatTimeoutMins} min
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
