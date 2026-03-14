"use client";

import { useState, useTransition } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateZone } from "@/lib/actions";
import type { Zone } from "@/lib/supabase";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = { zone: Zone };

export function ZoneEditor({ zone }: Props) {
  const [name, setName] = useState(zone.name);
  const [triggerLocal, setTriggerLocal] = useState(zone.trigger_local_alarm);
  const [isEnabled, setIsEnabled] = useState(zone.is_enabled);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    setError(null);
    setSaved(false);
    const fd = new FormData();
    fd.set("id", zone.id);
    fd.set("name", name);
    fd.set("trigger_local_alarm", String(triggerLocal));
    fd.set("is_enabled", String(isEnabled));

    startTransition(async () => {
      const result = await updateZone(fd);
      if (result.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        setError(result.error ?? "Error al guardar");
      }
    });
  };

  return (
    <div className="flex flex-col gap-4 rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono text-muted-foreground">
          Zona {zone.zone_number}
        </span>
        <div className="flex items-center gap-2">
          <Label htmlFor={`enabled-${zone.id}`} className="text-xs text-muted-foreground">
            Activa
          </Label>
          <Switch
            id={`enabled-${zone.id}`}
            checked={isEnabled}
            onCheckedChange={setIsEnabled}
          />
        </div>
      </div>

      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nombre de la zona"
        className="h-8 text-sm"
      />

      <div className="flex items-center gap-3">
        <Switch
          id={`alarm-${zone.id}`}
          checked={triggerLocal}
          onCheckedChange={setTriggerLocal}
        />
        <Label htmlFor={`alarm-${zone.id}`} className="text-sm cursor-pointer">
          Activar parlante local
        </Label>
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <Button
        size="sm"
        onClick={handleSave}
        disabled={isPending}
        className={cn(
          "self-end transition-all",
          saved && "bg-emerald-600 hover:bg-emerald-600"
        )}
      >
        {isPending ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : saved ? (
          <>
            <Check className="h-3 w-3" /> Guardado
          </>
        ) : (
          "Guardar"
        )}
      </Button>
    </div>
  );
}
