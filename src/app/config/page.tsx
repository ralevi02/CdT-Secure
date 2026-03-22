import { createClient } from "@supabase/supabase-js";
import { HeartbeatForm } from "@/components/config-form";
import { ThemeToggle } from "@/components/theme-toggle";
import type { Config } from "@/lib/supabase";
import { Timer, Palette, Info } from "lucide-react";
import { CdtLogo } from "@/components/cdt-logo";

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
        <p className="text-sm text-muted-foreground mt-0.5">Ajustes del sistema</p>
      </div>

      {/* Appearance */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Palette className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Apariencia</h2>
        </div>
        <div data-glass="card" className="flex items-center justify-between rounded-xl border bg-card px-4 py-3 shadow-sm relative">
          <div>
            <p className="text-sm font-medium">Modo de color</p>
            <p className="text-xs text-muted-foreground">Claro, oscuro o según el sistema</p>
          </div>
          <ThemeSelector />
        </div>
      </section>

      {/* Heartbeat */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Timer className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Dispositivo</h2>
        </div>
        <HeartbeatForm config={config} />
      </section>

      {/* App info */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Información</h2>
        </div>
        <div data-glass="card" className="rounded-xl border bg-card shadow-sm overflow-hidden relative">
          <div className="flex items-center gap-3 px-4 py-4 border-b">
            <CdtLogo className="h-10 w-10" />
            <div>
              <p className="font-semibold text-sm">CdT Secure</p>
              <p className="text-xs text-muted-foreground">Sistema de Alarma IoT Serverless</p>
            </div>
            <span className="ml-auto text-xs font-mono bg-muted px-2 py-0.5 rounded-full text-muted-foreground">v2.0</span>
          </div>
          {[
            ["Stack",       "Next.js 16 · Supabase · Vercel"],
            ["Hardware",    "ESP32 + sensores magnéticos"],
            ["Notificaciones", "WhatsApp vía CallMeBot API"],
            ["Repositorio", "github.com/ralevi02/CdT-Secure"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between px-4 py-2.5 border-b last:border-0">
              <span className="text-xs text-muted-foreground">{label}</span>
              <span className="text-xs font-medium text-right max-w-[55%]">{value}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/* Client component for theme selector */
function ThemeSelector() {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground hidden sm:block">Cambiar tema</span>
      <ThemeToggle />
    </div>
  );
}
