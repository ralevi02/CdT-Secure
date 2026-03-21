import { createClient } from "@supabase/supabase-js";
import { Phone } from "lucide-react";
import type { Config, NotificationContact } from "@/lib/supabase";
import { TwilioConfigForm } from "@/components/twilio-config-form";
import { CallContactCard } from "@/components/call-contact-card";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function LlamadasPage() {
  const [configRes, contactsRes] = await Promise.all([
    supabase
      .from("config")
      .select("twilio_account_sid, twilio_auth_token, twilio_from_number, calls_enabled")
      .eq("id", 1)
      .single(),
    supabase
      .from("notification_contacts")
      .select("id, name, phone_number, call_enabled")
      .order("created_at"),
  ]);

  const config: Partial<Config>         = configRes.data ?? {};
  const contacts: NotificationContact[] = (contactsRes.data ?? []) as NotificationContact[];

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div data-glass="item" className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/40 relative">
          <Phone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Llamadas</h1>
          <p className="text-sm text-muted-foreground">Alertas telefónicas vía Twilio</p>
        </div>
      </div>

      {/* Twilio credentials */}
      <TwilioConfigForm config={config} />

      {/* Contacts */}
      {contacts.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold">Contactos a llamar</p>
          <p className="text-xs text-muted-foreground -mt-2">
            Activa el teléfono icon para que ese contacto reciba la llamada automática.
            Los contactos se administran desde{" "}
            <a href="/notifications" className="text-primary underline underline-offset-4">Notificaciones</a>.
          </p>
          {contacts.map((c) => (
            <CallContactCard key={c.id} contact={c} />
          ))}
        </div>
      )}

      {contacts.length === 0 && (
        <div data-glass="item-dim" className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground relative">
          Agrega contactos en{" "}
          <a href="/notifications" className="text-primary underline underline-offset-4">
            Notificaciones
          </a>{" "}
          para activar llamadas.
        </div>
      )}

      {/* How-to */}
      <HowToGetTwilio />
    </div>
  );
}

function HowToGetTwilio() {
  return (
    <div data-glass="card" className="rounded-xl border bg-muted/30 p-4 flex flex-col gap-3 relative">
      <p className="text-sm font-semibold">¿Cómo obtener credenciales Twilio?</p>
      <ol className="flex flex-col gap-2 text-xs text-muted-foreground list-none">
        <li className="flex gap-2">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold">1</span>
          Crea una cuenta gratuita en{" "}
          <a href="https://www.twilio.com/try-twilio" target="_blank" rel="noreferrer" className="text-primary underline underline-offset-4">
            twilio.com
          </a>
          {" "}(incluye ~$15 USD de crédito de prueba).
        </li>
        <li className="flex gap-2">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold">2</span>
          En el dashboard de Twilio, copia el <strong className="text-foreground">Account SID</strong> y el <strong className="text-foreground">Auth Token</strong>.
        </li>
        <li className="flex gap-2">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold">3</span>
          Obtén un número de teléfono Twilio gratuito en <strong className="text-foreground">Phone Numbers → Get a number</strong>. Ese es el <em>número origen</em>.
        </li>
        <li className="flex gap-2">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold">4</span>
          Ingresa el número destino en formato E.164: <code className="rounded bg-muted px-1 text-foreground">+56912345678</code> para Chile.
        </li>
        <li className="flex gap-2">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold">5</span>
          En cuentas de prueba (Trial) solo puedes llamar a números <strong className="text-foreground">verificados</strong>. Ve a <strong className="text-foreground">Verified Caller IDs</strong> y agrega tu número personal.
        </li>
      </ol>
    </div>
  );
}
