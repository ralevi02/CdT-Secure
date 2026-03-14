"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { armZones, disarmAllZones } from "@/lib/actions";
import type { Zone } from "@/lib/supabase";
import { ShieldCheck, ShieldOff, Shield, Volume2, VolumeX, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = { zones: Zone[] };

export function ArmPanel({ zones }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isArming, startArm] = useTransition();
  const [isDisarming, startDisarm] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleArmAll = () => {
    setError(null);
    startArm(async () => {
      const result = await armZones("all", []);
      if (!result.success) setError(result.error ?? "Error");
    });
  };

  const handleArmSelected = () => {
    setError(null);
    startArm(async () => {
      const result = await armZones("selected", Array.from(selected));
      if (!result.success) setError(result.error ?? "Error");
    });
  };

  const handleDisarm = () => {
    setError(null);
    startDisarm(async () => {
      const result = await disarmAllZones();
      if (!result.success) setError(result.error ?? "Error");
    });
  };

  const armedCount = zones.filter((z) => z.is_enabled).length;
  const isPending = isArming || isDisarming;

  return (
    <div className="flex flex-col gap-4 rounded-xl border bg-card p-4 shadow-sm">
      {/* Status summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className={cn("h-5 w-5", armedCount > 0 ? "text-primary" : "text-muted-foreground")} />
          <div>
            <p className="text-sm font-semibold">Estado de la Alarma</p>
            <p className="text-xs text-muted-foreground">
              {armedCount === 0
                ? "Sin zonas armadas"
                : armedCount === zones.length
                ? "Todas las zonas armadas"
                : `${armedCount} de ${zones.length} zonas armadas`}
            </p>
          </div>
        </div>
        <span className={cn(
          "rounded-full px-2.5 py-0.5 text-xs font-semibold",
          armedCount > 0
            ? "bg-primary/10 text-primary"
            : "bg-muted text-muted-foreground"
        )}>
          {armedCount > 0 ? "ARMADA" : "DESARMADA"}
        </span>
      </div>

      {/* Zone selection grid */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {zones.map((zone) => {
          const isSelected = selected.has(zone.id);
          return (
            <button
              key={zone.id}
              onClick={() => toggleSelect(zone.id)}
              className={cn(
                "flex flex-col gap-1 rounded-lg border-2 p-3 text-left transition-all",
                isSelected
                  ? "border-primary bg-primary/10"
                  : "border-border bg-muted/30 hover:border-primary/40",
                zone.is_enabled && !isSelected && "border-primary/30 bg-primary/5"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground">#{zone.zone_number}</span>
                {zone.trigger_local_alarm ? (
                  <Volume2 className="h-3 w-3 text-amber-500" />
                ) : (
                  <VolumeX className="h-3 w-3 text-muted-foreground/30" />
                )}
              </div>
              <p className="text-xs font-medium leading-tight">{zone.name}</p>
              <span className={cn(
                "mt-1 self-start rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                zone.is_enabled
                  ? "bg-primary/15 text-primary"
                  : "bg-muted text-muted-foreground"
              )}>
                {zone.is_enabled ? "Armada" : "Desarmada"}
              </span>
            </button>
          );
        })}
      </div>

      {selected.size > 0 && (
        <p className="text-xs text-muted-foreground text-center">
          {selected.size} zona{selected.size !== 1 ? "s" : ""} seleccionada{selected.size !== 1 ? "s" : ""}
        </p>
      )}

      {error && <p className="text-xs text-destructive text-center">{error}</p>}

      {/* Action buttons */}
      <div className="grid grid-cols-3 gap-2">
        <Button
          size="sm"
          onClick={handleArmAll}
          disabled={isPending}
          className="gap-1.5 col-span-1"
        >
          {isArming ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShieldCheck className="h-3.5 w-3.5" />}
          Armar todo
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleArmSelected}
          disabled={isPending || selected.size === 0}
          className="gap-1.5 col-span-1"
        >
          {isArming ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Shield className="h-3.5 w-3.5" />}
          Selección
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleDisarm}
          disabled={isPending}
          className="gap-1.5 col-span-1 text-muted-foreground hover:text-destructive hover:border-destructive/50"
        >
          {isDisarming ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShieldOff className="h-3.5 w-3.5" />}
          Desarmar
        </Button>
      </div>
    </div>
  );
}
