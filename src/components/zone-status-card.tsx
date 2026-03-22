import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Zone, SensorLog } from "@/lib/supabase";
import { DoorOpen, DoorClosed, Volume2, VolumeX, ShieldOff } from "lucide-react";

type Props = {
  zone: Zone;
  latestLog: SensorLog | null;
};

export function ZoneStatusCard({ zone, latestLog }: Props) {
  const isOpen = latestLog?.status === true;
  const isDisabled = !zone.is_enabled;

  return (
    <Card
      className={
        isDisabled
          ? "opacity-50"
          : isOpen
          ? "border-red-500/50 bg-red-50/50 dark:bg-red-950/20"
          : "border-emerald-500/30 bg-emerald-50/30 dark:bg-emerald-950/10"
      }
    >
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full ${
              isDisabled
                ? "bg-muted"
                : isOpen
                ? "bg-red-100 dark:bg-red-900/40"
                : "bg-emerald-100 dark:bg-emerald-900/40"
            }`}
          >
            {isDisabled ? (
              <ShieldOff className="h-5 w-5 text-muted-foreground" />
            ) : isOpen ? (
              <DoorOpen className="h-5 w-5 text-red-600 dark:text-red-400" />
            ) : (
              <DoorClosed className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            )}
          </div>
          <div>
            <p className="font-medium text-sm">{zone.name}</p>
            <p className="text-xs text-muted-foreground">Zona {zone.zone_number}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {zone.trigger_local_alarm ? (
            <Volume2 className="h-4 w-4 text-blue-500" aria-label="Activa parlante" />
          ) : (
            <VolumeX className="h-4 w-4 text-muted-foreground/40" aria-label="Sin parlante" />
          )}
          <Badge
            variant={isDisabled ? "secondary" : isOpen ? "destructive" : "success"}
            className="text-xs"
          >
            {isDisabled ? "Desact." : isOpen ? "Abierto" : "Cerrado"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
