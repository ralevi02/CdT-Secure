"use client";

import { useTransition, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toggleContact, deleteContact } from "@/lib/actions";
import type { NotificationContact } from "@/lib/supabase";
import { Trash2, Loader2, MessageCircle } from "lucide-react";

type Props = { contact: NotificationContact };

export function NotificationContactCard({ contact }: Props) {
  const [enabled, setEnabled] = useState(contact.is_enabled);
  const [isToggling, startToggle] = useTransition();
  const [isDeleting, startDelete] = useTransition();

  const handleToggle = (checked: boolean) => {
    setEnabled(checked);
    startToggle(async () => { await toggleContact(contact.id, checked); });
  };

  const handleDelete = () => {
    if (!confirm(`¿Eliminar el contacto "${contact.name}"?`)) return;
    startDelete(async () => { await deleteContact(contact.id); });
  };

  return (
    <div className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3 shadow-sm">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${enabled ? "bg-emerald-100 dark:bg-emerald-900/40" : "bg-muted"}`}>
        <MessageCircle className={`h-4 w-4 ${enabled ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{contact.name}</p>
        <p className="text-xs text-muted-foreground truncate">{contact.phone_number}</p>
      </div>

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
        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
      >
        {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      </Button>
    </div>
  );
}
