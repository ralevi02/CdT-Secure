"use client";

import { useState, useEffect, useTransition } from "react";
import { Bell, BellRing, Loader2, Check, Smartphone } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  registerServiceWorker,
  subscribeToPush,
  unsubscribeFromPush,
  getExistingSubscription,
  isPushSupported,
} from "@/lib/push";

export function PushNotificationToggle() {
  const [supported, setSupported] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!isPushSupported()) {
      setLoading(false);
      return;
    }
    setSupported(true);

    registerServiceWorker().then(async (reg) => {
      if (!reg) { setLoading(false); return; }
      const sub = await getExistingSubscription(reg);
      setSubscribed(!!sub);
      setLoading(false);
    });
  }, []);

  const handleToggle = (checked: boolean) => {
    setSubscribed(checked);
    startTransition(async () => {
      try {
        const reg = await registerServiceWorker();
        if (!reg) return;

        if (checked) {
          const permission = await Notification.requestPermission();
          if (permission !== "granted") {
            setSubscribed(false);
            return;
          }
          const sub = await subscribeToPush(reg);
          await fetch("/api/push-subscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ subscription: sub.toJSON() }),
          });
        } else {
          const sub = await getExistingSubscription(reg);
          if (sub) {
            await fetch("/api/push-subscribe", {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ endpoint: sub.endpoint }),
            });
          }
          await unsubscribeFromPush(reg);
        }
        setSaved(true);
        setTimeout(() => setSaved(false), 1500);
      } catch {
        setSubscribed(!checked);
      }
    });
  };

  if (!supported) return null;

  return (
    <div data-glass="card" className="flex items-center justify-between rounded-xl border bg-card px-4 py-3 shadow-sm relative">
      <div className="flex items-center gap-3">
        <Smartphone className={cn("h-4 w-4", subscribed ? "text-primary" : "text-muted-foreground")} />
        <div>
          <p className="text-sm font-medium">Notificaciones push</p>
          <p className="text-xs text-muted-foreground">
            {loading
              ? "Comprobando…"
              : subscribed
              ? "Activas en este dispositivo"
              : "Recibe alertas directas en tu celular"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {saved && <Check className="h-3.5 w-3.5 text-emerald-500" />}
        {(isPending || loading) && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
        <Switch
          checked={subscribed}
          onCheckedChange={handleToggle}
          disabled={isPending || loading}
        />
      </div>
    </div>
  );
}
