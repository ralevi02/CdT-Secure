"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { armZones, disarmAllZones } from "@/lib/actions";
import type { Zone } from "@/lib/supabase";
import { ShieldCheck, ShieldOff, Shield, Volume2, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = { zones: Zone[] };

export function ArmPanel({ zones }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isArming, startArm] = useTransition();
  const [isDisarming, startDisarm] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const toggleSelect = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const handleArmAll = () => {
    setError(null);
    startArm(async () => {
      const r = await armZones("all", []);
      if (!r.success) setError(r.error ?? "Error");
      else setSelected(new Set());
    });
  };

  const handleArmSelected = () => {
    setError(null);
    startArm(async () => {
      const r = await armZones("selected", Array.from(selected));
      if (!r.success) setError(r.error ?? "Error");
      else setSelected(new Set());
    });
  };

  const handleDisarm = () => {
    setError(null);
    startDisarm(async () => {
      const r = await disarmAllZones();
      if (!r.success) setError(r.error ?? "Error");
      else setSelected(new Set());
    });
  };

  const armedCount = zones.filter((z) => z.is_enabled).length;
  const allArmed = armedCount === zones.length && zones.length > 0;
  const isPending = isArming || isDisarming;

  return (
    <div className="flex flex-col gap-4 rounded-xl border bg-card p-5 shadow-sm">

      {/* ── Status badge ─────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={cn(
            "flex h-9 w-9 items-center justify-center rounded-full",
            armedCount > 0 ? "bg-blue-100 dark:bg-blue-900/40" : "bg-slate-100 dark:bg-slate-800"
          )}>
            <Shield className={cn(
              "h-4 w-4",
              armedCount > 0 ? "text-blue-600 dark:text-blue-400" : "text-slate-400"
            )} />
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight">Estado de la Alarma</p>
            <p className="text-xs text-muted-foreground">
              {armedCount === 0
                ? "Sin zonas armadas"
                : allArmed
                ? "Todas las zonas armadas"
                : `${armedCount} de ${zones.length} zonas armadas`}
            </p>
          </div>
        </div>
        <span className={cn(
          "rounded-full px-3 py-1 text-xs font-bold tracking-wide",
          armedCount > 0
            ? "bg-blue-600 text-white"
            : "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
        )}>
          {armedCount > 0 ? "ARMADA" : "DESARMADA"}
        </span>
      </div>

      {/* ── Zone grid ────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {zones.map((zone) => {
          const isSelected = selected.has(zone.id);
          return (
            <button
              key={zone.id}
              onClick={() => toggleSelect(zone.id)}
              disabled={isPending}
              className={cn(
                "relative flex flex-col gap-1.5 rounded-lg border-2 p-3 text-left transition-all duration-150 focus:outline-none",
                isSelected
                  ? "border-blue-500 bg-blue-100 dark:bg-blue-950/60 shadow-sm"
                  : zone.is_enabled
                  ? "border-blue-300 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20 hover:border-blue-400"
                  : "border-border bg-card hover:border-slate-300 dark:hover:border-slate-600"
              )}
            >
              {/* Checkmark overlay */}
              <span className={cn(
                "absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full border-2 transition-all",
                isSelected
                  ? "border-blue-500 bg-blue-500"
                  : "border-slate-300 dark:border-slate-600 bg-white dark:bg-transparent"
              )}>
                {isSelected && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />}
              </span>

              <div className="flex items-center gap-1 pr-5">
                <span className="text-xs font-bold text-muted-foreground">#{zone.zone_number}</span>
                {zone.trigger_local_alarm && (
                  <Volume2 className="h-3 w-3 text-amber-500" />
                )}
              </div>
              <p className="text-xs font-semibold leading-tight pr-5">{zone.name}</p>
              <span className={cn(
                "self-start rounded-full px-2 py-0.5 text-[10px] font-semibold",
                zone.is_enabled
                  ? "bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
              )}>
                {zone.is_enabled ? "Armada" : "Desarmada"}
              </span>
            </button>
          );
        })}
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 px-3 py-2 text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {/* ── Action buttons ───────────────────────────── */}
      <div className="flex flex-col gap-2">
        {/* Primary row */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={handleArmAll}
            disabled={isPending}
            className="gap-2 font-semibold"
          >
            {isArming ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ShieldCheck className="h-4 w-4" />
            )}
            Armar todo
          </Button>
          <Button
            variant={selected.size > 0 ? "default" : "outline"}
            onClick={handleArmSelected}
            disabled={isPending || selected.size === 0}
            className={cn(
              "gap-2 font-semibold transition-all",
              selected.size > 0 && "bg-blue-500 hover:bg-blue-600 text-white border-blue-500"
            )}
          >
            {isArming ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Shield className="h-4 w-4" />
            )}
            {selected.size > 0 ? `Armar (${selected.size})` : "Armar selección"}
          </Button>
        </div>

        {/* Disarm — secondary */}
        <Button
          variant="outline"
          onClick={handleDisarm}
          disabled={isPending || armedCount === 0}
          className="w-full gap-2 text-muted-foreground hover:text-red-600 hover:border-red-300 dark:hover:border-red-800 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
        >
          {isDisarming ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ShieldOff className="h-4 w-4" />
          )}
          Desarmar todo
        </Button>
      </div>
    </div>
  );
}
