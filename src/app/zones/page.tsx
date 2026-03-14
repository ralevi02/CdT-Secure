import { createClient } from "@supabase/supabase-js";
import { CreateZoneForm } from "@/components/create-zone-form";
import { DeleteZoneButton } from "@/components/delete-zone-button";
import { ZoneEditor } from "@/components/zone-editor";
import type { Zone } from "@/lib/supabase";
import { MapPin } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const revalidate = 0;

export default async function ZonesPage() {
  const { data } = await supabase
    .from("zones")
    .select("*")
    .order("zone_number", { ascending: true });

  const zones: Zone[] = data ?? [];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold">Zonas</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Administra las zonas del sistema
        </p>
      </div>

      {/* Create form */}
      <CreateZoneForm />

      {/* Zone list */}
      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Zonas configuradas ({zones.length})
        </p>

        {zones.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed p-10 text-center">
            <MapPin className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              No hay zonas. Crea la primera arriba.
            </p>
          </div>
        ) : (
          zones.map((zone) => (
            <div key={zone.id} className="relative">
              <ZoneEditor zone={zone} />
              <div className="absolute top-3 right-3">
                <DeleteZoneButton id={zone.id} zoneName={zone.name} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
