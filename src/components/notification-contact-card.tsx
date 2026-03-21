"use client";

import { useTransition, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toggleContact, deleteContact } from "@/lib/actions";
import type { NotificationContact } from "@/lib/supabase";
import { Trash2, Loader2, MessageCircle, Send, Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = { contact: NotificationContact };

type TestState = "idle" | "sending" | "ok" | "error";

export function NotificationContactCard({ contact }: Props) {
  const [enabled, setEnabled] = useState(contact.is_enabled);
  const [isToggling, startToggle] = useTransition();
  const [isDeleting, startDelete] = useTransition();
  const [testState, setTestState] = useState<TestState>("idle");
  const [testError, setTestError] = useState<string | null>(null);

  const handleToggle = (checked: boolean) => {
    setEnabled(checked);
    startToggle(async () => { await toggleContact(contact.id, checked); });
  };

  const handleDelete = () => {
    if (!confirm(`¿Eliminar el contacto "${contact.name}"?`)) return;
    startDelete(async () => { await deleteContact(contact.id); });
  };

  const handleTest = async () => {
    setTestState("sending");
    setTestError(null);
    try {
      const res = await fetch("/api/test-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact_id: contact.id }),
      });
      if (res.ok) {
        setTestState("ok");
        setTimeout(() => setTestState("idle"), 3000);
      } else {
        const data = await res.json();
        setTestState("error");
        setTestError(data.error ?? "Error al enviar");
        setTimeout(() => { setTestState("idle"); setTestError(null); }, 4000);
      }
    } catch {
      setTestState("error");
      setTestError("Error de red");
      setTimeout(() => { setTestState("idle"); setTestError(null); }, 4000);
    }
  };

  return (
    <div data-glass="card" className="flex flex-col gap-0 rounded-xl border bg-card shadow-sm overflow-hidden relative">
      {/* Main row */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
          enabled ? "bg-emerald-100 dark:bg-emerald-900/40" : "bg-muted"
        )}>
          <MessageCircle className={cn(
            "h-4 w-4",
            enabled ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
          )} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{contact.name}</p>
          <p className="text-xs text-muted-foreground truncate">{contact.phone_number}</p>
        </div>

        {/* Test button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleTest}
          disabled={testState === "sending" || isDeleting}
          className={cn(
            "h-8 gap-1.5 text-xs transition-all shrink-0",
            testState === "ok" && "text-emerald-600 dark:text-emerald-400",
            testState === "error" && "text-destructive"
          )}
        >
          {testState === "sending" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {testState === "ok"      && <Check className="h-3.5 w-3.5" />}
          {testState === "error"   && <AlertCircle className="h-3.5 w-3.5" />}
          {testState === "idle"    && <Send className="h-3.5 w-3.5" />}
          {testState === "sending" ? "Enviando…" : testState === "ok" ? "Enviado" : testState === "error" ? "Error" : "Test"}
        </Button>

        <Switch
          checked={enabled}
          onCheckedChange={handleToggle}
          disabled={isToggling}
          aria-label="Activar notificaciones"
        />

        <Button
          variant="ghost"
          size="icon"
          onClick={handleDelete}
          disabled={isDeleting}
          className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        >
          {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        </Button>
      </div>

      {/* Test error message */}
      {testState === "error" && testError && (
        <div className="border-t bg-red-50 dark:bg-red-950/30 px-4 py-2">
          <p className="text-xs text-red-600 dark:text-red-400">{testError}</p>
        </div>
      )}

      {/* Test success message */}
      {testState === "ok" && (
        <div className="border-t bg-emerald-50 dark:bg-emerald-950/30 px-4 py-2">
          <p className="text-xs text-emerald-700 dark:text-emerald-400">
            Mensaje de prueba enviado a {contact.phone_number}
          </p>
        </div>
      )}
    </div>
  );
}
