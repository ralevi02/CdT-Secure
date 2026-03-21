"use client";

import { useState, useTransition } from "react";
import { toggleContactCall } from "@/lib/actions";
import { Phone, PhoneOff, PhoneCall, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NotificationContact } from "@/lib/supabase";

type Props = { contact: NotificationContact };

type CallStatus = "idle" | "calling" | "ok" | "error";

export function CallContactCard({ contact }: Props) {
  const [callEnabled, setCallEnabled]     = useState(contact.call_enabled);
  const [callStatus, setCallStatus]       = useState<CallStatus>("idle");
  const [callError, setCallError]         = useState<string | null>(null);
  const [isPending, startTransition]      = useTransition();

  function handleToggle() {
    const next = !callEnabled;
    setCallEnabled(next);
    startTransition(async () => {
      const res = await toggleContactCall(contact.id, next);
      if (!res.success) setCallEnabled(!next);
    });
  }

  async function handleTestCall() {
    setCallStatus("calling");
    setCallError(null);
    try {
      const res = await fetch("/api/test-call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact_id: contact.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setCallStatus("ok");
      } else {
        setCallStatus("error");
        setCallError(data.error ?? "Error desconocido");
      }
    } catch {
      setCallStatus("error");
      setCallError("Error de red");
    }
    setTimeout(() => { setCallStatus("idle"); setCallError(null); }, 5000);
  }

  return (
    <div data-glass="card" className="flex items-center gap-3 rounded-xl border bg-card p-3 shadow-sm relative">
      {/* Icon */}
      <div className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
        callEnabled
          ? "bg-blue-100 dark:bg-blue-900/40"
          : "bg-muted"
      )}>
        {callEnabled
          ? <Phone className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          : <PhoneOff className="h-4 w-4 text-muted-foreground" />
        }
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{contact.name}</p>
        <p className="text-xs text-muted-foreground font-mono">{contact.phone_number}</p>
      </div>

      {/* Test call button */}
      <button
        onClick={handleTestCall}
        disabled={callStatus === "calling" || !callEnabled}
        title={callEnabled ? "Llamada de prueba" : "Activa las llamadas para este contacto"}
        className={cn(
          "flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium border transition-colors",
          callEnabled
            ? "border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950/40"
            : "border-border text-muted-foreground cursor-not-allowed opacity-50",
          callStatus === "ok"    && "border-emerald-200 text-emerald-600 dark:border-emerald-800 dark:text-emerald-400",
          callStatus === "error" && "border-red-200 text-red-600 dark:border-red-800 dark:text-red-400"
        )}
      >
        {callStatus === "calling" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        {callStatus === "ok"      && <CheckCircle2 className="h-3.5 w-3.5" />}
        {callStatus === "error"   && <AlertCircle  className="h-3.5 w-3.5" />}
        {callStatus === "idle"    && <PhoneCall className="h-3.5 w-3.5" />}
        {callStatus === "calling" ? "Llamando…" :
         callStatus === "ok"      ? "Enviada" :
         callStatus === "error"   ? "Error" : "Test"}
      </button>

      {/* Toggle switch */}
      <button
        onClick={handleToggle}
        disabled={isPending}
        title={callEnabled ? "Desactivar llamadas para este contacto" : "Activar llamadas para este contacto"}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border-2 transition-colors focus:outline-none",
          callEnabled
            ? "bg-blue-500 border-blue-500"
            : "bg-muted border-border",
          isPending && "opacity-60 cursor-wait"
        )}
      >
        <span className={cn(
          "inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
          callEnabled ? "translate-x-5" : "translate-x-0.5"
        )} />
      </button>

      {/* Error tooltip */}
      {callStatus === "error" && callError && (
        <div className="absolute mt-12 z-10 rounded-md bg-destructive px-2 py-1 text-[11px] text-destructive-foreground shadow-md">
          {callError}
        </div>
      )}
    </div>
  );
}
