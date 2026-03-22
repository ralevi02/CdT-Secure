"use client";

import { useTransition, useState, useOptimistic } from "react";
import { armZones, disarmAllZones, toggleZoneArm } from "@/lib/actions";
import type { Zone } from "@/lib/supabase";
import { Shield, ShieldCheck, ShieldOff, Volume2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = { zones: Zone[] };

export function ArmPanel({ zones }: Props) {
  const [optimisticZones, setOptimistic] = useOptimistic(
    zones,
    (state: Zone[], update: { type: "toggle"; id: string } | { type: "armAll" } | { type: "disarmAll" }) => {
      if (update.type === "toggle") return state.map((z) => z.id === update.id ? { ...z, is_enabled: !z.is_enabled } : z);
      if (update.type === "armAll") return state.map((z) => ({ ...z, is_enabled: true }));
      return state.map((z) => ({ ...z, is_enabled: false }));
    }
  );

  const [isArming, startArm] = useTransition();
  const [isDisarming, startDisarm] = useTransition();
  const [isToggling, startToggle] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleArmAll = () => {
    setError(null);
    startArm(async () => {
      setOptimistic({ type: "armAll" });
      const r = await armZones("all", []);
      if (!r.success) setError(r.error ?? "Error");
    });
  };
  const handleDisarm = () => {
    setError(null);
    startDisarm(async () => {
      setOptimistic({ type: "disarmAll" });
      const r = await disarmAllZones();
      if (!r.success) setError(r.error ?? "Error");
    });
  };
  const handleToggleZone = (zone: Zone) => {
    startToggle(async () => {
      setOptimistic({ type: "toggle", id: zone.id });
      await toggleZoneArm(zone.id, !zone.is_enabled);
    });
  };

  const armedCount = optimisticZones.filter((z) => z.is_enabled).length;
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
            <p className="text-[11px] text-muted-foreground">{armedCount} de {optimisticZones.length} armadas</p>
          </div>
        </div>

        {/* Zone grid */}
        <div className="grid grid-cols-2 gap-2 px-3 py-3">
          {optimisticZones.map((zone) => (
            <button
              key={zone.id}
              onClick={() => handleToggleZone(zone)}
              disabled={isPending}
              data-glass={zone.is_enabled ? "item" : "item-dim"}
              className={cn(
                "relative overflow-hidden flex flex-col items-center gap-2 rounded-[16px] p-3 border bg-card transition-all active:scale-[0.97] cursor-pointer text-center",
                isPending && "opacity-70"
              )}
            >
              {/* Toggle indicator */}
              <div className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
                zone.is_enabled
                  ? "bg-emerald-100 dark:bg-emerald-500/15"
                  : "bg-muted"
              )}>
                <Shield className={cn(
                  "h-4 w-4 transition-colors",
                  zone.is_enabled ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground/50"
                )} />
              </div>
              <div className="flex flex-col items-center gap-0.5 min-w-0 w-full">
                <span className={cn(
                  "text-[12px] font-semibold truncate w-full",
                  !zone.is_enabled && "text-muted-foreground"
                )}>
                  {zone.name}
                </span>
                <div className="flex items-center gap-1">
                  <span className={cn(
                    "text-[10px]",
                    zone.is_enabled ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground/50"
                  )}>
                    {zone.is_enabled ? "Armada" : "Desarmada"}
                  </span>
                  {zone.trigger_local_alarm && <Volume2 className="h-2.5 w-2.5 text-blue-500 shrink-0" />}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-2 px-3 pb-3">
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
