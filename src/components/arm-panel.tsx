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
      {/* ── Zone glass widget ───────────────────────────── */}
      <div className="rounded-[22px] border bg-card overflow-hidden relative">
        {/* Top shine */}
        <div className="absolute top-px left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent pointer-events-none" />

        {/* Status header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/[0.04] relative overflow-hidden">
          <div className="absolute inset-x-[10%] top-0 h-full bg-[radial-gradient(ellipse_at_top,rgba(34,197,94,0.03),transparent_80%)]" />
          <div className="flex items-center gap-3 relative z-10">
            <div className={cn(
              "flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[12px]",
              "border relative overflow-hidden",
              armedCount > 0
                ? "bg-emerald-500/10 border-emerald-500/18 border-t-emerald-400/28"
                : "bg-white/[0.04] border-white/[0.06] border-t-white/[0.09]"
            )}>
              <div className="absolute inset-x-[10%] top-0 h-1/2 bg-[radial-gradient(ellipse_at_top,rgba(134,239,172,0.1),transparent)]" />
              <Shield className={cn("h-4 w-4 relative z-10", armedCount > 0 ? "text-emerald-400" : "text-muted-foreground")} />
            </div>
            <div>
              <p className="text-sm font-medium">Estado de la alarma</p>
              <p className="text-[11px] text-muted-foreground">
                {armedCount === 0
                  ? "0 de " + zones.length + " armadas"
                  : armedCount === zones.length
                  ? "Todas las zonas armadas"
                  : `${armedCount} de ${zones.length} armadas`}
              </p>
            </div>
          </div>
          {/* Armar todo — glass green button */}
          <button
            onClick={handleArmAll}
            disabled={isPending}
            className="glass-btn-green flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isArming ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShieldCheck className="h-3.5 w-3.5" />}
            Armar todo
          </button>
        </div>

        {/* Zone list */}
        <div className="flex flex-col gap-1.5 p-3">
          {zones.map((zone) => {
            const isSelected = selected.has(zone.id);
            return (
              <button
                key={zone.id}
                onClick={() => toggleSelect(zone.id)}
                disabled={isPending}
                className={cn(
                  "relative flex items-center gap-3 rounded-[14px] border p-3 text-left transition-all duration-150 focus:outline-none",
                  isSelected
                    ? "bg-white/[0.04] border-white/[0.07] border-t-white/[0.1]"
                    : "bg-white/[0.015] border-white/[0.04] border-t-white/[0.06] hover:bg-white/[0.03]"
                )}
              >
                {/* Top shine inner */}
                <div className="absolute top-px left-2.5 right-2.5 h-px bg-gradient-to-r from-transparent via-white/[0.035] to-transparent pointer-events-none" />

                {/* Toggle visual */}
                <div className={cn(
                  "w-[44px] h-[26px] rounded-[13px] relative flex-shrink-0 transition-colors",
                  isSelected ? "bg-emerald-500" : "bg-white/10"
                )}>
                  <div className={cn(
                    "w-[22px] h-[22px] rounded-full absolute top-[2px] transition-all",
                    isSelected ? "right-[2px] bg-white" : "left-[2px] bg-white/30"
                  )} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className={cn(
                    "text-[13px] font-medium truncate",
                    isSelected ? "text-foreground" : "text-foreground/40"
                  )}>
                    #{zone.zone_number} {zone.name}
                  </div>
                  <div className={cn(
                    "text-[11px]",
                    isSelected ? "text-muted-foreground" : "text-foreground/20"
                  )}>
                    {zone.is_enabled ? "Armada" : "Desarmada"}
                    {zone.trigger_local_alarm && " · 🔊"}
                  </div>
                </div>

                {isSelected && <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" strokeWidth={2.5} />}
              </button>
            );
          })}
        </div>

        {/* Bottom action buttons */}
        <div className="flex gap-2 p-3 pt-0">
          <button
            onClick={handleArmSelected}
            disabled={isPending || selected.size === 0}
            className={cn("glass-btn-green flex-1 flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed")}
          >
            {isArming ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Shield className="h-3.5 w-3.5" />}
            {selected.size > 0 ? `Armar seleccionadas (${selected.size})` : "Armar seleccionadas"}
          </button>
          <button
            onClick={handleDisarm}
            disabled={isPending || armedCount === 0}
            className="glass-btn-red flex-1 flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isDisarming ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShieldOff className="h-3.5 w-3.5" />}
            Desarmar todo
          </button>
        </div>
      </div>

      {error && (
        <p className="rounded-xl border border-red-500/20 bg-red-500/[0.06] px-3 py-2 text-xs text-red-400">
          {error}
        </p>
      )}
    </>
  );
}
