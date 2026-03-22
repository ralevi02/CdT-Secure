import { createClient } from "@supabase/supabase-js";
import { Phone } from "lucide-react";
import type { Config, NotificationContact } from "@/lib/supabase";
import { TwilioCallsToggle, TwilioConfigForm } from "@/components/twilio-config-form";
import { CallContactCard } from "@/components/call-contact-card";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const revalidate = 0;

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

      {/* Master toggle */}
      <TwilioCallsToggle config={config} />

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
  const steps = [
    <>Crea una cuenta gratuita en <a href="https://www.twilio.com/try-twilio" target="_blank" rel="noreferrer" className="text-primary underline underline-offset-4">twilio.com</a> (incluye ~$15 USD de crédito de prueba).</>,
    <>En el dashboard de Twilio, copia el <strong className="text-foreground">Account SID</strong> y el <strong className="text-foreground">Auth Token</strong>.</>,
    <>Obtén un número de teléfono Twilio gratuito en <strong className="text-foreground">Phone Numbers → Get a number</strong>. Ese es el <em className="text-foreground">número origen</em>.</>,
    <>Ingresa el número destino en formato E.164: <code className="rounded bg-muted px-1 text-foreground">+56912345678</code> para Chile.</>,
    <>En cuentas de prueba (Trial) solo puedes llamar a números <strong className="text-foreground">verificados</strong>. Ve a <strong className="text-foreground">Verified Caller IDs</strong> y agrega tu número personal.</>,
  ];

  return (
    <details data-glass="card" className="group rounded-xl border bg-card shadow-sm relative overflow-hidden">
      <summary className="flex cursor-pointer items-center justify-between px-4 py-3 text-sm font-semibold list-none [&::-webkit-details-marker]:hidden">
        ¿Cómo obtener credenciales Twilio?
        <svg className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
      </summary>
      <ol className="flex flex-col gap-3 px-4 pb-4 text-xs text-muted-foreground list-none">
        {steps.map((content, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold mt-px">{i + 1}</span>
            <span className="leading-relaxed">{content}</span>
          </li>
        ))}
      </ol>
    </details>
  );
}
