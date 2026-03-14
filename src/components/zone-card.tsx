"use client";

import { useState, useTransition } from "react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { updateZone, deleteZone } from "@/lib/actions";
import type { Zone } from "@/lib/supabase";
import { Pencil, Trash2, ChevronUp, Loader2, Check, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = { zone: Zone };

export function ZoneCard({ zone }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [name, setName] = useState(zone.name);
  const [triggerLocal, setTriggerLocal] = useState(zone.trigger_local_alarm);

  const [isSaving, startSave] = useTransition();
  const [isDeleting, startDelete] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buildFormData = (overrideTrigger?: boolean) => {
    const fd = new FormData();
    fd.set("id", zone.id);
    fd.set("name", name);
    fd.set("trigger_local_alarm", String(overrideTrigger ?? triggerLocal));
    return fd;
  };

  const handleSave = () => {
    setError(null);
    startSave(async () => {
      const result = await updateZone(buildFormData());
      if (result.success) {
        setSaved(true);
        setTimeout(() => { setSaved(false); setExpanded(false); }, 1200);
      } else {
        setError(result.error ?? "Error al guardar");
      }
    });
  };

  const handleDelete = () => {
    if (!confirm(`¿Eliminar "${zone.name}"? Se borrarán todos sus registros.`)) return;
    startDelete(async () => { await deleteZone(zone.id); });
  };

  const handleSpeakerToggle = (checked: boolean) => {
    setTriggerLocal(checked);
    startSave(async () => { await updateZone(buildFormData(checked)); });
  };

  return (
    <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">
          {zone.zone_number}
        </span>
        <p className="flex-1 text-sm font-medium truncate">{name}</p>

        {/* Speaker toggle */}
        <div
          className="flex items-center gap-1.5"
          title={triggerLocal ? "Parlante activo" : "Parlante inactivo"}
        >
          {triggerLocal ? (
            <Volume2 className="h-4 w-4 text-amber-500" />
          ) : (
            <VolumeX className="h-4 w-4 text-muted-foreground/40" />
          )}
          <Switch
            checked={triggerLocal}
            onCheckedChange={handleSpeakerToggle}
            disabled={isSaving}
            aria-label="Activar parlante"
          />
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground"
          onClick={() => setExpanded((v) => !v)}
          aria-label="Editar"
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
        </Button>
      </div>

      {/* Edit panel */}
      {expanded && (
        <div className="flex flex-col gap-4 border-t bg-muted/30 px-4 py-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`name-${zone.id}`} className="text-xs">Nombre</Label>
            <Input
              id={`name-${zone.id}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-8 text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id={`speaker-edit-${zone.id}`}
              checked={triggerLocal}
              onCheckedChange={setTriggerLocal}
            />
            <Label htmlFor={`speaker-edit-${zone.id}`} className="text-sm cursor-pointer">
              Activar parlante local
            </Label>
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-1.5"
            >
              {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
              Eliminar
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className={cn("gap-1.5 transition-all", saved && "bg-emerald-600 hover:bg-emerald-600")}
            >
              {isSaving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : saved ? (
                <><Check className="h-3.5 w-3.5" /> Guardado</>
              ) : "Guardar"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
