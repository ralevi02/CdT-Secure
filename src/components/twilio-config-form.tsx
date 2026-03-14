"use client";

import { useState, useTransition } from "react";
import { updateTwilioConfig } from "@/lib/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PhoneCall, Save, Eye, EyeOff, CheckCircle2, AlertCircle, ToggleLeft, ToggleRight } from "lucide-react";
import type { Config } from "@/lib/supabase";
import { cn } from "@/lib/utils";

type Props = { config: Partial<Config> };

export function TwilioConfigForm({ config }: Props) {
  const [isPending, startTransition] = useTransition();
  const [callsEnabled, setCallsEnabled] = useState(config.calls_enabled ?? false);
  const [showToken, setShowToken] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("calls_enabled", String(callsEnabled));
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
    <Card>
      <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <PhoneCall className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-sm">Credenciales Twilio</CardTitle>
        </div>
        {/* Master toggle */}
        <button
          type="button"
          onClick={() => setCallsEnabled((v) => !v)}
          className="flex items-center gap-1.5 text-xs font-medium"
        >
          {callsEnabled
            ? <ToggleRight className="h-5 w-5 text-emerald-500" />
            : <ToggleLeft  className="h-5 w-5 text-muted-foreground" />
          }
          <span className={callsEnabled ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}>
            Llamadas {callsEnabled ? "activadas" : "desactivadas"}
          </span>
        </button>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Account SID */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Account SID</label>
            <input
              name="twilio_account_sid"
              defaultValue={config.twilio_account_sid ?? ""}
              placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Auth Token */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Auth Token</label>
            <div className="relative">
              <input
                name="twilio_auth_token"
                type={showToken ? "text" : "password"}
                defaultValue={config.twilio_auth_token ?? ""}
                placeholder="••••••••••••••••••••••••••••••••"
                className="w-full rounded-md border bg-background px-3 py-2 pr-10 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary"
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

          {/* From Number */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Número origen (Twilio)</label>
            <input
              name="twilio_from_number"
              defaultValue={config.twilio_from_number ?? ""}
              placeholder="+15551234567"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-[11px] text-muted-foreground">
              El número de Twilio que aparece como origen de la llamada (formato E.164).
            </p>
          </div>

          {/* Footer */}
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
      </CardContent>
    </Card>
  );
}
