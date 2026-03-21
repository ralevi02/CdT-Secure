"use client";

import { useState, useTransition } from "react";
import { armZones, disarmAllZones } from "@/lib/actions";
import type { Zone } from "@/lib/supabase";
import { Shield, Volume2, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = { zones: Zone[] };

export function ArmPanel({ zones }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isArming, startArm]    = useTransition();
  const [isDisarming, startDisarm] = useTransition();
  const [error, setError]       = useState<string | null>(null);

  const toggleSelect = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

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

  const armedCount = zones.filter((z) => z.is_enabled).length;
  const isPending  = isArming || isDisarming;

  return (
    <>
      {/* ── Glass card widget ────────────────────── */}
      <div data-glass="card"
        className="relative overflow-hidden rounded-[22px] border bg-card dark:bg-transparent dark:border-transparent">

        {/* ── Header: Estado + Armar todo ────────── */}
        <div className="flex items-center justify-between px-[18px] py-[14px] border-b border-slate-100 dark:border-white/[0.04] relative overflow-hidden">
          {/* Green glow */}
          <div className="absolute top-0 left-[10%] w-[80%] h-full bg-[radial-gradient(ellipse_at_top,rgba(34,197,94,0.03),transparent_80%)]" />

          <div className="flex items-center gap-3 relative z-10">
            {/* Glass icon */}
            <div className="flex h-[38px] w-[38px] items-center justify-center rounded-[12px] relative overflow-hidden
              bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200
              dark:border-emerald-500/[0.18] dark:border-t-emerald-400/[0.28]">
              <div className="absolute top-0 left-[10%] w-[80%] h-[50%] bg-[radial-gradient(ellipse_at_top,rgba(134,239,172,0.12),transparent)]" />
              <Shield className="relative z-10 h-4 w-4 text-emerald-600 dark:text-[#22C55E]" />
            </div>
            <div>
              <p className="text-sm font-medium dark:text-[#E2E8F0]">Estado de la alarma</p>
              <p className="text-[11px] dark:text-[#475569] text-muted-foreground">
                {armedCount} de {zones.length} armadas
              </p>
            </div>
          </div>

          {/* Armar todo button */}
          <button
            data-glass="green-strong"
            onClick={handleArmAll}
            disabled={isPending}
            className="relative overflow-hidden px-[18px] py-[9px] text-[13px] font-semibold z-10 transition-all active:scale-95
              bg-emerald-500 text-white rounded-[12px]
              dark:bg-transparent dark:text-[#86EFAC] dark:border-transparent
              disabled:opacity-50"
          >
            {isArming ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : (
              <span className="relative z-10">Armar todo</span>
            )}
          </button>
        </div>

        {/* ── Zone list ──────────────────────────── */}
        <div className="flex flex-col gap-[6px] px-4 py-[10px]">
          {zones.map((zone) => {
            const isSelected = selected.has(zone.id);
            return (
              <button
                key={zone.id}
                data-glass={zone.is_enabled ? "item" : "item-dim"}
                onClick={() => toggleSelect(zone.id)}
                disabled={isPending}
                className={cn(
                  "relative overflow-hidden flex items-center gap-3 rounded-[14px] p-[11px_14px] text-left transition-all border",
                  "bg-card dark:bg-transparent dark:border-transparent",
                  isSelected && "ring-1 ring-blue-400/40 dark:ring-blue-400/20"
                )}
              >
                {/* Toggle switch visual */}
                <div className={cn(
                  "relative h-[26px] w-[44px] rounded-full shrink-0 transition-all",
                  zone.is_enabled ? "bg-emerald-500" : "bg-slate-200 dark:bg-white/[0.10]"
                )}>
                  <div className={cn(
                    "absolute top-[2px] h-[22px] w-[22px] rounded-full transition-all shadow-sm",
                    zone.is_enabled ? "right-[2px] bg-white" : "left-[2px] bg-white dark:bg-white/30"
                  )} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={cn(
                      "text-[13px] font-medium truncate",
                      zone.is_enabled ? "dark:text-[#E2E8F0]" : "dark:text-white/[0.35] text-muted-foreground"
                    )}>
                      #{zone.zone_number} {zone.name}
                    </span>
                    {zone.trigger_local_alarm && <Volume2 className="h-3 w-3 text-amber-500 shrink-0" />}
                  </div>
                  <p className={cn(
                    "text-[11px]",
                    zone.is_enabled ? "dark:text-[#475569] text-muted-foreground" : "dark:text-white/[0.10] text-muted-foreground/50"
                  )}>
                    {zone.is_enabled ? "Armada" : "Desarmada"}
                  </p>
                </div>

                {/* Selection indicator */}
                {isSelected && (
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500">
                    <Check className="h-3 w-3 text-white" strokeWidth={3} />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Bottom buttons ─────────────────────── */}
        <div className="flex gap-2 px-4 pb-3">
          <button
            data-glass={selected.size > 0 ? "green" : "btn"}
            onClick={handleArmSelected}
            disabled={isPending || selected.size === 0}
            className={cn(
              "relative overflow-hidden flex-1 text-center rounded-[12px] py-[10px] text-[13px] font-semibold transition-all active:scale-95 border",
              "bg-card dark:bg-transparent dark:border-transparent",
              selected.size > 0
                ? "text-emerald-600 dark:text-[#86EFAC]"
                : "text-muted-foreground dark:text-[#64748B] cursor-not-allowed",
              "disabled:opacity-60"
            )}
          >
            <span className="relative z-10">
              Armar selección{selected.size > 0 ? ` (${selected.size})` : ""}
            </span>
          </button>

          <button
            data-glass="btn"
            onClick={handleDisarm}
            disabled={isPending || armedCount === 0}
            className={cn(
              "relative overflow-hidden flex-1 text-center rounded-[12px] py-[10px] text-[13px] font-semibold transition-all active:scale-95 border",
              "bg-card dark:bg-transparent dark:border-transparent",
              armedCount > 0
                ? "text-red-500 dark:text-[#FCA5A5]"
                : "text-muted-foreground dark:text-[#64748B] cursor-not-allowed",
              "disabled:opacity-60"
            )}
          >
            {isDisarming ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin mx-auto" />
            ) : (
              <span className="relative z-10">Desarmar todo</span>
            )}
          </button>
        </div>
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 px-3 py-2 text-xs text-red-600 dark:text-red-300">
          {error}
        </p>
      )}
    </>
  );
}
