import { createClient } from "@supabase/supabase-js";
import { NotificationsToggleForm } from "@/components/config-form";
import { CreateContactForm } from "@/components/create-contact-form";
import { NotificationContactCard } from "@/components/notification-contact-card";
import { Separator } from "@/components/ui/separator";
import type { NotificationContact, Config } from "@/lib/supabase";
import { Bell, Users } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const revalidate = 0;

export default async function NotificationsPage() {
  const [contactsRes, configRes] = await Promise.all([
    supabase.from("notification_contacts").select("*").order("created_at", { ascending: true }),
    supabase.from("config").select("*").eq("id", 1).single(),
  ]);

  const contacts: NotificationContact[] = contactsRes.data ?? [];
  const config: Config = configRes.data ?? { id: 1, notifications_enabled: false, heartbeat_timeout_mins: 5 };
  const activeCount = contacts.filter((c) => c.is_enabled).length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold">Notificaciones</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Gestiona los contactos y alertas por WhatsApp
        </p>
      </div>

      {/* Master toggle */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Ajuste global</h2>
        </div>
        <NotificationsToggleForm config={config} />
      </section>

      <Separator />

      {/* Contacts */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold">Contactos</h2>
          </div>
          {contacts.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {activeCount} de {contacts.length} activos
            </span>
          )}
        </div>

        <CreateContactForm />

        {contacts.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed p-8 text-center">
            <Bell className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No hay contactos. Agrega el primero arriba.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {contacts.map((c) => (
              <NotificationContactCard key={c.id} contact={c} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
