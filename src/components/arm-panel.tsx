"use client";

import { useTransition, useState } from "react";
import { armZones, disarmAllZones, toggleZoneArm } from "@/lib/actions";
import type { Zone } from "@/lib/supabase";
import { Shield, ShieldCheck, ShieldOff, Volume2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = { zones: Zone[] };

export function ArmPanel({ zones }: Props) {
  const [isArming, startArm] = useTransition();
  const [isDisarming, startDisarm] = useTransition();
  const [isToggling, startToggle] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleArmAll = () => {
    setError(null);
    startArm(async () => { const r = await armZones("all", []); if (!r.success) setError(r.error ?? "Error"); });
  };
  const handleDisarm = () => {
    setError(null);
    startDisarm(async () => { const r = await disarmAllZones(); if (!r.success) setError(r.error ?? "Error"); });
  };
  const handleToggleZone = (zone: Zone) => {
    startToggle(async () => { await toggleZoneArm(zone.id, !zone.is_enabled); });
  };

  const armedCount = zones.filter((z) => z.is_enabled).length;
  const isPending = isArming || isDisarming || isToggling;

  return (
    <>
      <div data-glass="card" className="relative overflow-hidden rounded-[22px] border bg-card">
        {/* Header */}
        <div className="flex items-center gap-3 px-[18px] py-[14px] border-b border-border/50 relative overflow-hidden">
          <div className={cn("flex h-[38px] w-[38px] items-center justify-center rounded-[12px] shrink-0", "bg-emerald-50 dark:bg-emerald-500/10")}>
            <Shield className={cn("h-4 w-4", armedCount > 0 ? "text-emerald-600 dark:text-[#22C55E]" : "text-muted-foreground")} />
          </div>
          <div>
            <p className="text-sm font-medium">Estado de la alarma</p>
            <p className="text-[11px] text-muted-foreground">{armedCount} de {zones.length} armadas</p>
          </div>
        </div>

        {/* Zone list */}
        <div className="flex flex-col gap-[6px] px-4 py-[10px]">
          {zones.map((zone) => (
            <div
              key={zone.id}
              data-glass={zone.is_enabled ? "item" : "item-dim"}
              className="relative overflow-hidden flex items-center gap-3 rounded-[14px] p-[11px_14px] border bg-card"
            >
              <button
                onClick={(e) => { e.stopPropagation(); handleToggleZone(zone); }}
                disabled={isPending}
                data-glass={zone.is_enabled ? undefined : "toggle-track"}
                className={cn("relative h-[26px] w-[44px] rounded-full shrink-0 transition-all cursor-pointer", zone.is_enabled ? "bg-emerald-500" : "")}
              >
                <div
                  data-glass={zone.is_enabled ? undefined : "toggle-thumb"}
                  className={cn("absolute top-[2px] h-[22px] w-[22px] rounded-full transition-all", zone.is_enabled ? "right-[2px] bg-white shadow-sm" : "left-[2px]")}
                />
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className={cn("text-[13px] font-medium truncate", !zone.is_enabled && "dark:text-white/[0.35] text-muted-foreground")}>
                    #{zone.zone_number} {zone.name}
                  </span>
                  {zone.trigger_local_alarm && <Volume2 className="h-3 w-3 text-amber-500 shrink-0" />}
                </div>
                <p className={cn("text-[11px]", zone.is_enabled ? "text-muted-foreground" : "dark:text-white/[0.10] text-muted-foreground/50")}>
                  {zone.is_enabled ? "Armada" : "Desarmada"}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Action buttons — iOS style */}
        <div className="grid grid-cols-2 gap-2 px-4 pb-3">
          <button
            data-glass="btn"
            onClick={handleArmAll}
            disabled={isPending}
            className="relative overflow-hidden flex flex-col items-center justify-center gap-1.5 rounded-2xl py-4 transition-all active:scale-[0.96] disabled:opacity-50"
          >
            <span className="relative z-10">
              {isArming
                ? <Loader2 className="h-5 w-5 text-emerald-500 animate-spin" />
                : <ShieldCheck className="h-5 w-5 text-emerald-500" />}
            </span>
            <span className="relative z-10 text-[12px] font-semibold text-foreground/80">
              {isArming ? "Armando…" : "Armar todo"}
            </span>
          </button>
          <button
            data-glass="btn"
            onClick={handleDisarm}
            disabled={isPending || armedCount === 0}
            className="relative overflow-hidden flex flex-col items-center justify-center gap-1.5 rounded-2xl py-4 transition-all active:scale-[0.96] disabled:opacity-40"
          >
            <span className="relative z-10">
              {isDisarming
                ? <Loader2 className="h-5 w-5 text-red-500 animate-spin" />
                : <ShieldOff className="h-5 w-5 text-red-500" />}
            </span>
            <span className="relative z-10 text-[12px] font-semibold text-foreground/80">
              {isDisarming ? "Desarmando…" : "Desarmar"}
            </span>
          </button>
        </div>
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 px-3 py-2 text-xs text-red-600 dark:text-red-300">{error}</p>
      )}
    </>
  );
}
