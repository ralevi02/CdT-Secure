"use client";

import { useState, useTransition } from "react";
import { armZones, disarmAllZones } from "@/lib/actions";
import type { Zone } from "@/lib/supabase";
import {
  ShieldCheck,
  ShieldOff,
  Shield,
  Volume2,
  Check,
  Loader2,
} from "lucide-react";
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
  const isPending = isArming || isDisarming;

  return (
    <>
      {/* ── Zone grid card ─────────────────────────────── */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        {/* Status header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2.5">
            <Shield className={cn(
              "h-4 w-4",
              armedCount > 0 ? "text-primary" : "text-muted-foreground"
            )} />
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
            "rounded-full px-3 py-1 text-xs font-bold tracking-wide",
            armedCount > 0
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"
              : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
          )}>
            {armedCount > 0 ? "ARMADA" : "DESARMADA"}
          </span>
        </div>

        {/* Zone grid */}
        <div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-3">
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
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/40 ring-2 ring-blue-400/30"
                    : zone.is_enabled
                    ? "border-emerald-200 dark:border-emerald-700 bg-emerald-50/60 dark:bg-emerald-950/20 hover:border-emerald-300"
                    : "border-slate-200 dark:border-slate-700 bg-white dark:bg-card hover:border-slate-300"
                )}
              >
                {/* Checkbox */}
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
                  {zone.trigger_local_alarm && <Volume2 className="h-3 w-3 text-amber-500" />}
                </div>
                <p className="text-xs font-semibold leading-tight pr-5">{zone.name}</p>
                <span className={cn(
                  "self-start rounded-full px-2 py-0.5 text-[10px] font-semibold",
                  zone.is_enabled
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300"
                    : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                )}>
                  {zone.is_enabled ? "Armada" : "Desarmada"}
                </span>
              </button>
            );
          })}
        </div>

        {selected.size > 0 && (
          <p className="text-center text-xs text-muted-foreground pb-3">
            {selected.size} zona{selected.size !== 1 ? "s" : ""} seleccionada{selected.size !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/40 px-3 py-2 text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {/* ── Action bar — fixed on mobile, sticky on desktop ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-4 pt-2 md:sticky md:bottom-0 md:left-auto md:right-auto md:z-30 md:-mx-4 md:px-4 bg-gradient-to-t from-background via-background/95 to-transparent">
        <div className="flex gap-2 rounded-2xl border bg-card/95 backdrop-blur-md p-2 shadow-xl shadow-black/15 md:shadow-lg md:shadow-black/10">
          {/* Armar todo */}
          <button
            onClick={handleArmAll}
            disabled={isPending}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all",
              "bg-emerald-500 text-white hover:bg-emerald-600 active:scale-95",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {isArming ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ShieldCheck className="h-4 w-4" />
            )}
            Armar todo
          </button>

          {/* Armar selección */}
          <button
            onClick={handleArmSelected}
            disabled={isPending || selected.size === 0}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all active:scale-95",
              selected.size > 0
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed",
              "disabled:opacity-60"
            )}
          >
            {isArming ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Shield className="h-4 w-4" />
            )}
            {selected.size > 0 ? `Armar (${selected.size})` : "Selección"}
          </button>

          {/* Desarmar */}
          <button
            onClick={handleDisarm}
            disabled={isPending || armedCount === 0}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all active:scale-95",
              armedCount > 0
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed",
              "disabled:opacity-60"
            )}
          >
            {isDisarming ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ShieldOff className="h-4 w-4" />
            )}
            Desarmar
          </button>
        </div>
      </div>
    </>
  );
}
