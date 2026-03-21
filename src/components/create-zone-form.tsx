"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createZone } from "@/lib/actions";
import { Plus, Loader2 } from "lucide-react";

export function CreateZoneForm() {
  const [zoneNumber, setZoneNumber] = useState("");
  const [name, setName] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const fd = new FormData();
    fd.set("zone_number", zoneNumber);
    fd.set("name", name);

    startTransition(async () => {
      const result = await createZone(fd);
      if (result.success) {
        setZoneNumber("");
        setName("");
      } else {
        setError(result.error ?? "Error al crear zona");
      }
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      data-glass="card"
      className="flex flex-col gap-3 rounded-xl border bg-card p-4 relative"
    >
      <p className="text-sm font-semibold">Nueva zona</p>
      <div className="flex gap-3">
        <div className="flex flex-col gap-1.5 w-24">
          <Label htmlFor="zone_number" className="text-xs">ID</Label>
          <Input
            id="zone_number"
            type="number"
            min={1}
            max={99}
            placeholder="1"
            value={zoneNumber}
            onChange={(e) => setZoneNumber(e.target.value)}
            required
            className="h-9"
          />
        </div>
        <div className="flex flex-col gap-1.5 flex-1">
          <Label htmlFor="zone_name" className="text-xs">Nombre</Label>
          <Input
            id="zone_name"
            placeholder="Ej: Puerta Principal"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="h-9"
          />
        </div>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <Button type="submit" size="sm" disabled={isPending} className="self-end">
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <Plus className="h-4 w-4" /> Agregar zona
          </>
        )}
      </Button>
    </form>
  );
}
