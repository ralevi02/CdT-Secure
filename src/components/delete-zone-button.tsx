"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { deleteZone } from "@/lib/actions";
import { Trash2, Loader2 } from "lucide-react";

type Props = { id: string; zoneName: string };

export function DeleteZoneButton({ id, zoneName }: Props) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm(`¿Eliminar la zona "${zoneName}"? Se borrarán también todos sus registros.`)) return;
    startTransition(async () => { await deleteZone(id); });
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleDelete}
      disabled={isPending}
      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
      aria-label={`Eliminar ${zoneName}`}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
    </Button>
  );
}
