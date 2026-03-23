"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Volume2, VolumeX, AlertTriangle, Radio, Check } from "lucide-react";

const PATTERNS = [
  {
    id: "normal",
    label: "Normal",
    description: "Vibración estándar",
    icon: Volume2,
    preview: [200, 100, 200, 100, 200],
  },
  {
    id: "urgente",
    label: "Urgente",
    description: "Vibración prolongada e intensa",
    icon: AlertTriangle,
    preview: [400, 100, 400, 100, 400, 100, 400],
  },
  {
    id: "sos",
    label: "SOS",
    description: "Patrón morse ··· ——— ···",
    icon: Radio,
    preview: [100, 50, 100, 50, 100, 200, 300, 50, 300, 50, 300, 200, 100, 50, 100, 50, 100],
  },
  {
    id: "silencio",
    label: "Silencioso",
    description: "Sin vibración (solo visual)",
    icon: VolumeX,
    preview: [],
  },
] as const;

const STORAGE_KEY = "cdt-vibration-pattern";

export function VibrationSelector() {
  const [selected, setSelected] = useState("normal");
  const [tested, setTested] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && PATTERNS.some((p) => p.id === stored)) {
      setSelected(stored);
    }
  }, []);

  const handleSelect = async (id: string) => {
    setSelected(id);
    localStorage.setItem(STORAGE_KEY, id);

    const pattern = PATTERNS.find((p) => p.id === id);
    if (pattern && pattern.preview.length > 0 && "vibrate" in navigator) {
      navigator.vibrate(pattern.preview);
    }
    setTested(id);
    setTimeout(() => setTested(null), 1500);

    if ("serviceWorker" in navigator) {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        fetch("/api/push-subscribe", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint, vibration: id }),
        }).catch(() => {});
      }
    }
  };

  return (
    <div className="grid grid-cols-2 gap-2">
      {PATTERNS.map((p) => {
        const Icon = p.icon;
        const isActive = selected === p.id;
        const justTested = tested === p.id;
        return (
          <button
            key={p.id}
            onClick={() => handleSelect(p.id)}
            data-glass={isActive ? "nav" : undefined}
            className={cn(
              "relative flex flex-col items-center gap-1.5 rounded-xl px-3 py-3 text-center transition-all active:scale-[0.97] overflow-hidden",
              isActive
                ? "bg-primary/10 text-foreground"
                : "bg-card text-muted-foreground hover:text-foreground border"
            )}
          >
            <div className="flex items-center gap-1.5">
              {justTested ? (
                <Check className="h-4 w-4 text-emerald-500" />
              ) : (
                <Icon className={cn("h-4 w-4", isActive && "text-primary")} />
              )}
            </div>
            <span className="text-xs font-semibold">{p.label}</span>
            <span className="text-[10px] text-muted-foreground leading-tight">{p.description}</span>
          </button>
        );
      })}
    </div>
  );
}
