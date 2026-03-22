import { createClient } from "@supabase/supabase-js";
import { ActivityLog } from "@/components/activity-log";
import { History } from "lucide-react";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const revalidate = 0;

const PAGE_SIZE = 30;

type LogRow = {
  id: string;
  zone_id: string;
  status: boolean;
  created_at: string;
  zones: { name: string; zone_number: number } | null;
};

type ZoneRef = { id: string; zone_number: number; name: string };

export default async function ActivityPage({
  searchParams,
}: {
  searchParams: Promise<{ zone?: string; page?: string }>;
}) {
  const params     = await searchParams;
  const page       = Math.max(1, Number(params.page ?? 1));
  const zoneFilter = params.zone ?? "all";
  const from       = (page - 1) * PAGE_SIZE;
  const to         = from + PAGE_SIZE - 1;

  // Build log query conditionally — no chained .then()
  let logQuery = supabase
    .from("sensor_logs")
    .select("id, zone_id, status, created_at, zones(name, zone_number)")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (zoneFilter !== "all") {
    logQuery = logQuery.eq("zone_id", zoneFilter);
  }

  const [zonesRes, logsRes] = await Promise.all([
    supabase
      .from("zones")
      .select("id, zone_number, name")
      .order("zone_number"),
    logQuery,
  ]);

  const zones: ZoneRef[]  = zonesRes.data ?? [];
  const logs: LogRow[]    = (logsRes.data ?? []) as unknown as LogRow[];
  const hasMore           = logs.length === PAGE_SIZE;

  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="flex items-center gap-3">
        <Link href="/" data-glass="item" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 relative">
          <History className="h-5 w-5 text-primary" />
        </Link>
        <div>
          <h1 className="text-xl font-bold">Actividad</h1>
          <p className="text-sm text-muted-foreground">Historial de eventos del sistema</p>
        </div>
      </div>

      <ActivityLog
        initialLogs={logs}
        zones={zones}
        currentZone={zoneFilter}
        currentPage={page}
        hasMore={hasMore}
      />
    </div>
  );
}
