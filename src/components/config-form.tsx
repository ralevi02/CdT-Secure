"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { updateConfig } from "@/lib/actions";
import type { Config } from "@/lib/supabase";
import { Check, Loader2, Bell, BellOff, Timer } from "lucide-react";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────────
   NotificationsToggleForm
   Used in /notifications — only the master on/off switch
───────────────────────────────────────────────────────────── */
export function NotificationsToggleForm({ config }: { config: Config }) {
  const [enabled, setEnabled] = useState(config.notifications_enabled ?? false);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const save = (value: boolean) => {
    setEnabled(value);
    const fd = new FormData();
    fd.set("notifications_enabled", String(value));
    fd.set("heartbeat_timeout_mins", String(config.heartbeat_timeout_mins ?? 5));
    startTransition(async () => {
      const r = await updateConfig(fd);
      if (r.success) { setSaved(true); setTimeout(() => setSaved(false), 1500); }
    });
  };

  return (
    <div className="flex items-center justify-between rounded-xl border bg-card px-4 py-3 shadow-sm">
      <div className="flex items-center gap-3">
        {enabled
          ? <Bell className="h-4 w-4 text-primary" />
          : <BellOff className="h-4 w-4 text-muted-foreground" />}
        <div>
          <p className="text-sm font-medium">Notificaciones WhatsApp</p>
          <p className="text-xs text-muted-foreground">
            {enabled ? "Activas globalmente" : "Silenciadas globalmente"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {saved && <Check className="h-3.5 w-3.5 text-emerald-500" />}
        {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
        <Switch checked={enabled} onCheckedChange={save} disabled={isPending} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   HeartbeatForm
   Used in /config — only the heartbeat timeout
───────────────────────────────────────────────────────────── */
export function HeartbeatForm({ config }: { config: Config }) {
  const [minutes, setMinutes] = useState(config.heartbeat_timeout_mins ?? 5);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    setError(null);
    const fd = new FormData();
    fd.set("notifications_enabled", String(config.notifications_enabled ?? false));
    fd.set("heartbeat_timeout_mins", String(minutes));
    startTransition(async () => {
      const r = await updateConfig(fd);
      if (r.success) { setSaved(true); setError(null); globalThis.setTimeout(() => setSaved(false), 1500); }
      else setError(r.error ?? "Error");
    });
  };

  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Timer className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Timeout Heartbeat</p>
            <p className="text-xs text-muted-foreground">Minutos sin señal para marcar Offline</p>
          </div>
        </div>
        <Input
          type="number"
          min={1}
          max={60}
          value={minutes}
          onChange={(e) => setMinutes(Number(e.target.value))}
          className="h-8 w-20 text-center"
        />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <Button
        size="sm"
        onClick={handleSave}
        disabled={isPending}
        className={cn("self-end gap-1.5 transition-all", saved && "bg-emerald-600 hover:bg-emerald-600")}
      >
        {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : saved ? <><Check className="h-3.5 w-3.5" /> Guardado</> : "Guardar"}
      </Button>
    </div>
  );
}
