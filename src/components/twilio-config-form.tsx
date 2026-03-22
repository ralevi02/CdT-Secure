"use client";

import { useState, useTransition } from "react";
import { updateTwilioConfig, updateCallsEnabled } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { PhoneCall, Save, Eye, EyeOff, CheckCircle2, AlertCircle, Check, Loader2 } from "lucide-react";
import type { Config } from "@/lib/supabase";
import { cn } from "@/lib/utils";

type Props = { config: Partial<Config> };

export function TwilioCallsToggle({ config }: Props) {
  const [enabled, setEnabled] = useState(config.calls_enabled ?? false);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const toggle = (value: boolean) => {
    setEnabled(value);
    startTransition(async () => {
      const r = await updateCallsEnabled(value);
      if (r.success) { setSaved(true); setTimeout(() => setSaved(false), 1500); }
    });
  };

  return (
    <div data-glass="card" className="flex items-center justify-between rounded-xl border bg-card px-4 py-3 shadow-sm relative">
      <div className="flex items-center gap-3">
        <PhoneCall className={cn("h-4 w-4", enabled ? "text-blue-500" : "text-muted-foreground")} />
        <div>
          <p className="text-sm font-medium">Llamadas automáticas</p>
          <p className="text-xs text-muted-foreground">
            {enabled ? "Activadas globalmente" : "Desactivadas globalmente"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {saved && <Check className="h-3.5 w-3.5 text-emerald-500" />}
        {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
        <Switch checked={enabled} onCheckedChange={toggle} disabled={isPending} />
      </div>
    </div>
  );
}

export function TwilioConfigForm({ config }: Props) {
  const [isPending, startTransition] = useTransition();
  const [showToken, setShowToken] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await updateTwilioConfig(fd);
      setResult(res.success
        ? { ok: true, msg: "Configuración guardada" }
        : { ok: false, msg: res.error ?? "Error al guardar" }
      );
      setTimeout(() => setResult(null), 3000);
    });
  }

  return (
    <div data-glass="card" className="flex flex-col rounded-xl border bg-card shadow-sm relative overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50">
        <PhoneCall className="h-4 w-4 text-muted-foreground" />
        <p className="text-sm font-semibold">Credenciales Twilio</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Account SID</label>
          <input
            name="twilio_account_sid"
            defaultValue={config.twilio_account_sid ?? ""}
            placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            data-glass="btn"
            className="w-full rounded-xl border bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Auth Token</label>
          <div className="relative">
            <input
              name="twilio_auth_token"
              type={showToken ? "text" : "password"}
              defaultValue={config.twilio_auth_token ?? ""}
              placeholder="••••••••••••••••••••••••••••••••"
              data-glass="btn"
              className="w-full rounded-xl border bg-background px-3 py-2 pr-10 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="button"
              onClick={() => setShowToken((v) => !v)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Número origen (Twilio)</label>
          <input
            name="twilio_from_number"
            defaultValue={config.twilio_from_number ?? ""}
            placeholder="+15551234567"
            data-glass="btn"
            className="w-full rounded-xl border bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <p className="text-[11px] text-muted-foreground">
            El número de Twilio que aparece como origen de la llamada (formato E.164).
          </p>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <Button type="submit" size="sm" disabled={isPending} className="gap-1.5">
            <Save className="h-3.5 w-3.5" />
            {isPending ? "Guardando…" : "Guardar"}
          </Button>

          {result && (
            <span className={cn(
              "flex items-center gap-1 text-xs font-medium",
              result.ok ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
            )}>
              {result.ok
                ? <CheckCircle2 className="h-3.5 w-3.5" />
                : <AlertCircle  className="h-3.5 w-3.5" />
              }
              {result.msg}
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
