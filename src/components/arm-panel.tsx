"use client";

import { useState, useTransition } from "react";
import { armZones, disarmAllZones, toggleZoneArm } from "@/lib/actions";
import type { Zone } from "@/lib/supabase";
import { Shield, Volume2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = { zones: Zone[] };

export function ArmPanel({ zones }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isArming, startArm] = useTransition();
  const [isDisarming, startDisarm] = useTransition();
  const [isToggling, startToggle] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleArmAll = () => {
    setError(null);
    startArm(async () => { const r = await armZones("all", []); if (!r.success) setError(r.error ?? "Error"); else setSelected(new Set()); });
  };
  const handleArmSelected = () => {
    setError(null);
    startArm(async () => { const r = await armZones("selected", Array.from(selected)); if (!r.success) setError(r.error ?? "Error"); else setSelected(new Set()); });
  };
  const handleDisarm = () => {
    setError(null);
    startDisarm(async () => { const r = await disarmAllZones(); if (!r.success) setError(r.error ?? "Error"); else setSelected(new Set()); });
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
        <div className="flex items-center justify-between px-[18px] py-[14px] border-b border-border/50 relative overflow-hidden">
          <div className="absolute top-0 left-[10%] w-[80%] h-full bg-[radial-gradient(ellipse_at_top,rgba(34,197,94,0.03),transparent_80%)]" />
          <div className="flex items-center gap-3 relative z-10">
            <div className={cn("flex h-[38px] w-[38px] items-center justify-center rounded-[12px] relative overflow-hidden", "bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/[0.18]")}>
              <div className="absolute top-0 left-[10%] w-[80%] h-[50%] bg-[radial-gradient(ellipse_at_top,rgba(134,239,172,0.12),transparent)]" />
              <Shield className={cn("relative z-10 h-4 w-4", armedCount > 0 ? "text-emerald-600 dark:text-[#22C55E]" : "text-muted-foreground")} />
            </div>
            <div>
              <p className="text-sm font-medium">Estado de la alarma</p>
              <p className="text-[11px] text-muted-foreground">{armedCount} de {zones.length} armadas</p>
            </div>
          </div>
          <button
            data-glass="green-strong"
            onClick={handleArmAll}
            disabled={isPending}
            className={cn("relative overflow-hidden px-[18px] py-[9px] text-[13px] font-semibold z-10 transition-all active:scale-95", "bg-emerald-500 text-white rounded-[12px] dark:text-[#86EFAC] disabled:opacity-50")}
          >
            <span className="relative z-10">{isArming ? "Armando…" : "Armar todo"}</span>
          </button>
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
                className={cn("relative h-[26px] w-[44px] rounded-full shrink-0 transition-all cursor-pointer", zone.is_enabled ? "bg-emerald-500" : "bg-slate-200 dark:bg-white/[0.10]")}
              >
                <div className={cn("absolute top-[2px] h-[22px] w-[22px] rounded-full transition-all shadow-sm", zone.is_enabled ? "right-[2px] bg-white" : "left-[2px] bg-white dark:bg-white/30")} />
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

        {/* Bottom buttons */}
        <div className="flex gap-2 px-4 pb-3">
          <button
            data-glass={selected.size > 0 ? "green" : "btn"}
            onClick={handleArmSelected}
            disabled={isPending || selected.size === 0}
            className={cn("relative overflow-hidden flex-1 text-center rounded-[12px] py-[10px] text-[13px] font-semibold transition-all active:scale-95 border bg-card disabled:opacity-60", selected.size > 0 ? "text-emerald-600 dark:text-[#86EFAC]" : "text-muted-foreground")}
          >
            <span className="relative z-10">Armar seleccionadas{selected.size > 0 ? ` (${selected.size})` : ""}</span>
          </button>
          <button
            data-glass="btn"
            onClick={handleDisarm}
            disabled={isPending || armedCount === 0}
            className={cn("relative overflow-hidden flex-1 text-center rounded-[12px] py-[10px] text-[13px] font-semibold transition-all active:scale-95 border bg-card disabled:opacity-60", armedCount > 0 ? "text-muted-foreground" : "text-muted-foreground/40")}
          >
            <span className="relative z-10">{isDisarming ? "Desarmando…" : "Desarmar todo"}</span>
          </button>
        </div>
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 px-3 py-2 text-xs text-red-600 dark:text-red-300">{error}</p>
      )}
    </>
  );
}
