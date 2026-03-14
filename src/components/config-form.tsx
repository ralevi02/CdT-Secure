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
  const [phone, setPhone] = useState(config.phone_number ?? "");
  const [apiKey, setApiKey] = useState(config.callmebot_api_key ?? "");
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    config.notifications_enabled ?? false
  );
  const [heartbeatTimeout, setHeartbeatTimeout] = useState(
    config.heartbeat_timeout_mins ?? 5
  );
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    setError(null);
    setSaved(false);
    const fd = new FormData();
    fd.set("phone_number", phone);
    fd.set("callmebot_api_key", apiKey);
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
    <div className="flex flex-col gap-6">
      {/* WhatsApp */}
      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          WhatsApp (CallMeBot)
        </h3>
        <div className="grid gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="phone_number">Número de teléfono</Label>
            <Input
              id="phone_number"
              placeholder="+56912345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="callmebot_api_key">API Key de CallMeBot</Label>
            <Input
              id="callmebot_api_key"
              type="password"
              placeholder="••••••••"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Notificaciones */}
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="flex items-center gap-3">
          {notificationsEnabled ? (
            <Bell className="h-4 w-4 text-primary" />
          ) : (
            <BellOff className="h-4 w-4 text-muted-foreground" />
          )}
          <div>
            <p className="text-sm font-medium">Notificaciones</p>
            <p className="text-xs text-muted-foreground">
              {notificationsEnabled ? "Activas" : "Silenciadas"}
            </p>
          </div>
        </div>
        <Switch
          checked={notificationsEnabled}
          onCheckedChange={setNotificationsEnabled}
        />
      </div>

      {/* Heartbeat */}
      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Dispositivo
        </h3>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="heartbeat_timeout">
            Tiempo de timeout Heartbeat (minutos)
          </Label>
          <Input
            id="heartbeat_timeout"
            type="number"
            min={1}
            max={60}
            value={heartbeatTimeout}
            onChange={(e) => setHeartbeatTimeout(Number(e.target.value))}
            className="max-w-[120px]"
          />
          <p className="text-xs text-muted-foreground">
            El dispositivo se marcará Offline si no hay señal en este tiempo.
          </p>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button
        onClick={handleSave}
        disabled={isPending}
        className={cn(
          "self-start transition-all",
          saved && "bg-emerald-600 hover:bg-emerald-600"
        )}
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : saved ? (
          <>
            <Check className="h-4 w-4" /> Guardado
          </>
        ) : (
          "Guardar configuración"
        )}
      </Button>
    </div>
  );
}
