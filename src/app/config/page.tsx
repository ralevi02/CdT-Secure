import { createClient } from "@supabase/supabase-js";
import { ConfigForm } from "@/components/config-form";
import type { Config } from "@/lib/supabase";
import { Settings } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const revalidate = 0;

export default async function ConfigPage() {
  const { data } = await supabase.from("config").select("*").eq("id", 1).single();

  const config: Config = data ?? {
    id: 1,
    notifications_enabled: false,
    heartbeat_timeout_mins: 5,
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold">Configuración</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Ajustes globales del sistema
        </p>
      </div>
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Settings className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-semibold text-sm">Sistema</h2>
        </div>
        <ConfigForm config={config} />
      </section>
    </div>
  );
}
