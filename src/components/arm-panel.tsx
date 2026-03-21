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
      {/* ── Main widget card ─────────────────────────────── */}
      <div className={cn(
        "rounded-xl border bg-card shadow-sm overflow-hidden",
        "dark:glass-panel dark:shadow-none dark:rounded-[22px]"
      )}>
        {/* Status header */}
        <div className={cn(
          "flex items-center justify-between px-4 py-3.5 border-b",
          "dark:border-white/[0.04]"
        )}>
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex h-9 w-9 items-center justify-center rounded-[10px]",
              "dark:bg-emerald-500/10 dark:border dark:border-emerald-500/20 dark:border-t-emerald-400/32",
              "bg-primary/10 relative overflow-hidden"
            )}>
              <div className="absolute inset-0 bg-gradient-to-b from-emerald-300/10 to-transparent" />
              <Shield className={cn(
                "relative z-10 h-4 w-4",
                armedCount > 0 ? "text-primary" : "text-muted-foreground"
              )} />
            </div>
            <div>
              <p className="text-sm font-medium dark:text-[#E2E8F0]">Estado de la Alarma</p>
              <p className="text-xs dark:text-[#475569] text-muted-foreground">
                {armedCount === 0
                  ? "0 de " + zones.length + " armadas"
                  : armedCount === zones.length
                  ? "Todas armadas"
                  : `${armedCount} de ${zones.length} armadas`}
              </p>
            </div>
          </div>

          {/* Armar todo button in header */}
          <button
            onClick={handleArmAll}
            disabled={isPending}
            className={cn(
              "px-4 py-2 text-xs font-semibold rounded-[10px] transition-all active:scale-95",
              "bg-emerald-500 text-white hover:bg-emerald-600",
              "dark:glass-green dark:text-emerald-300 dark:hover:bg-emerald-500/15",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {isArming ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Armar todo"}
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
                  "relative flex items-center gap-3 rounded-[14px] p-3 text-left transition-all duration-150 focus:outline-none",
                  /* Light mode */
                  isSelected
                    ? "border-2 border-blue-400 bg-blue-50 ring-2 ring-blue-300/20"
                    : zone.is_enabled
                    ? "border border-emerald-200 bg-emerald-50/60 hover:border-emerald-300"
                    : "border border-slate-200 bg-white hover:border-slate-300",
                  /* Dark mode */
                  isSelected
                    ? "dark:bg-white/[0.05] dark:border dark:border-white/[0.12]"
                    : zone.is_enabled
                    ? "dark:glass-item dark:border-emerald-500/15"
                    : "dark:glass-item dark:opacity-50"
                )}
              >
                {/* Toggle visual (like the mockup) */}
                <div className={cn(
                  "relative h-6 w-11 shrink-0 rounded-full transition-all",
                  zone.is_enabled
                    ? "bg-emerald-500"
                    : "dark:bg-white/[0.10] bg-slate-200"
                )}>
                  <div className={cn(
                    "absolute top-1 h-4 w-4 rounded-full transition-all",
                    zone.is_enabled
                      ? "right-1 bg-white"
                      : "left-1 dark:bg-white/30 bg-white"
                  )} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold dark:text-[#475569] text-muted-foreground">
                      #{zone.zone_number}
                    </span>
                    {zone.trigger_local_alarm && (
                      <Volume2 className="h-3 w-3 text-amber-500" />
                    )}
                  </div>
                  <p className={cn(
                    "text-sm font-medium truncate",
                    zone.is_enabled
                      ? "dark:text-[#E2E8F0] text-foreground"
                      : "dark:text-[#475569] text-muted-foreground"
                  )}>
                    {zone.name}
                  </p>
                </div>

                {/* Selection indicator */}
                <div className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all",
                  isSelected
                    ? "border-blue-500 bg-blue-500"
                    : "dark:border-white/[0.12] border-slate-300 bg-transparent"
                )}>
                  {isSelected && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Bottom action row */}
        <div className={cn(
          "flex gap-2 px-3 pb-3"
        )}>
          <button
            onClick={handleArmSelected}
            disabled={isPending || selected.size === 0}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-[12px] py-2.5 text-sm font-semibold transition-all active:scale-95",
              selected.size > 0
                ? "dark:glass-green dark:text-emerald-300 bg-emerald-500 text-white hover:bg-emerald-600"
                : "dark:glass-item dark:text-[#64748B] bg-slate-100 text-slate-400 cursor-not-allowed",
              "disabled:opacity-60"
            )}
          >
            <Shield className="h-3.5 w-3.5" />
            {selected.size > 0 ? `Armar selección (${selected.size})` : "Armar selección"}
          </button>

          <button
            onClick={handleDisarm}
            disabled={isPending || armedCount === 0}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-[12px] py-2.5 text-sm font-semibold transition-all active:scale-95",
              armedCount > 0
                ? "dark:glass-red dark:text-red-300 bg-red-500 text-white hover:bg-red-600"
                : "dark:glass-item dark:text-[#64748B] bg-slate-100 text-slate-400 cursor-not-allowed",
              "disabled:opacity-60"
            )}
          >
            {isDisarming ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <ShieldOff className="h-3.5 w-3.5" />
            )}
            Desarmar todo
          </button>
        </div>
      </div>

      {error && (
        <p className={cn(
          "rounded-lg border px-3 py-2 text-xs",
          "border-red-200 bg-red-50 text-red-600",
          "dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300"
        )}>
          {error}
        </p>
      )}
    </>
  );
}
