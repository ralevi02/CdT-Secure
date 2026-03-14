"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { updateConfig } from "@/lib/actions";
import type { Config } from "@/lib/supabase";
import { Check, Loader2, Bell, BellOff } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = { config: Config };

export function ConfigForm({ config }: Props) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(config.notifications_enabled ?? false);
  const [heartbeatTimeout, setHeartbeatTimeout] = useState(config.heartbeat_timeout_mins ?? 5);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    setError(null);
    const fd = new FormData();
    fd.set("notifications_enabled", String(notificationsEnabled));
    fd.set("heartbeat_timeout_mins", String(heartbeatTimeout));

    startTransition(async () => {
      const result = await updateConfig(fd);
      if (result.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        setError(result.error ?? "Error al guardar");
      }
    });
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl border bg-card p-4 shadow-sm">
      {/* Notifications master toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {notificationsEnabled ? (
            <Bell className="h-4 w-4 text-primary" />
          ) : (
            <BellOff className="h-4 w-4 text-muted-foreground" />
          )}
          <div>
            <p className="text-sm font-medium">Notificaciones WhatsApp</p>
            <p className="text-xs text-muted-foreground">
              {notificationsEnabled ? "Activadas globalmente" : "Silenciadas globalmente"}
            </p>
          </div>
        </div>
        <Switch checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
      </div>

      {/* Heartbeat */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Timeout Heartbeat</p>
          <p className="text-xs text-muted-foreground">Minutos sin señal para marcar Offline</p>
        </div>
        <Input
          type="number"
          min={1}
          max={60}
          value={heartbeatTimeout}
          onChange={(e) => setHeartbeatTimeout(Number(e.target.value))}
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
        {isPending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : saved ? (
          <><Check className="h-3.5 w-3.5" /> Guardado</>
        ) : "Guardar"}
      </Button>
    </div>
  );
}
