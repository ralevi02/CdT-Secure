import { createClient } from "@supabase/supabase-js";
import { ZoneCard } from "@/components/zone-card";
import { ConfigForm } from "@/components/config-form";
import { Separator } from "@/components/ui/separator";
import type { Zone, Config } from "@/lib/supabase";
import { Settings, Layers } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const revalidate = 0;

async function getConfigData() {
  const [zonesRes, configRes] = await Promise.all([
    supabase
      .from("zones")
      .select("*")
      .order("zone_number", { ascending: true }),
    supabase
      .from("config")
      .select("*")
      .eq("id", 1)
      .single(),
  ]);

  const zones: Zone[] = zonesRes.data ?? [];
  const config: Config = configRes.data ?? {
    id: 1,
    phone_number: "",
    callmebot_api_key: "",
    notifications_enabled: false,
    heartbeat_timeout_mins: 5,
  };

  return { zones, config };
}

export default async function ConfigPage() {
  const { zones, config } = await getConfigData();

  return (
    <div className="flex flex-col gap-8">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold">Configuración</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Gestiona zonas y ajustes del sistema
        </p>
      </div>

      {/* Zones Section */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-semibold">Editor de Zonas</h2>
        </div>
        {zones.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
            No hay zonas. Créalas desde la página{" "}
            <a href="/zones" className="underline text-primary">Zonas</a>.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {zones.map((zone) => (
              <ZoneCard key={zone.id} zone={zone} />
            ))}
          </div>
        )}
      </section>

      <Separator />

      {/* Global Settings Section */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Settings className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-semibold">Ajustes Globales</h2>
        </div>
        <ConfigForm config={config} />
      </section>
    </div>
  );
}
