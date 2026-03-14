"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff } from "lucide-react";

type Props = {
  lastSeen: string | null;
  heartbeatTimeoutMins: number;
};

export function DeviceStatusBadge({ lastSeen, heartbeatTimeoutMins }: Props) {
  const [isOnline, setIsOnline] = useState(false);
  const [timeAgo, setTimeAgo] = useState<string>("");

  useEffect(() => {
    const compute = () => {
      if (!lastSeen) {
        setIsOnline(false);
        setTimeAgo("Sin datos");
        return;
      }
      const diffMs = Date.now() - new Date(lastSeen).getTime();
      const diffMins = diffMs / 60000;
      setIsOnline(diffMins < heartbeatTimeoutMins);

      if (diffMins < 1) setTimeAgo("Hace menos de 1 min");
      else if (diffMins < 60) setTimeAgo(`Hace ${Math.floor(diffMins)} min`);
      else setTimeAgo(`Hace ${Math.floor(diffMins / 60)} h`);
    };

    compute();
    const interval = setInterval(compute, 30000);
    return () => clearInterval(interval);
  }, [lastSeen, heartbeatTimeoutMins]);

  return (
    <div className="flex items-center gap-2">
      <Badge
        variant={isOnline ? "success" : "destructive"}
        className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold"
      >
        {isOnline ? (
          <>
            <Wifi className="h-3 w-3" />
            Online
          </>
        ) : (
          <>
            <WifiOff className="h-3 w-3" />
            Offline
          </>
        )}
      </Badge>
      {timeAgo && (
        <span className="text-xs text-muted-foreground">{timeAgo}</span>
      )}
    </div>
  );
}
