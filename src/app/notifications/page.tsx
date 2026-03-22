import { createClient } from "@supabase/supabase-js";
import { NotificationsToggleForm } from "@/components/config-form";
import { CreateContactForm } from "@/components/create-contact-form";
import { NotificationContactCard } from "@/components/notification-contact-card";
import { Separator } from "@/components/ui/separator";
import type { NotificationContact, Config } from "@/lib/supabase";
import { Bell, Users, Smartphone } from "lucide-react";
import Link from "next/link";
import { PushNotificationToggle } from "@/components/push-toggle";

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
      <div className="flex items-center gap-3">
        <Link href="/" data-glass="item" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#25D366]/10 relative">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        </Link>
        <div>
          <h1 className="text-xl font-bold">Notificaciones</h1>
          <p className="text-sm text-muted-foreground">Gestiona los contactos y alertas por WhatsApp</p>
        </div>
      </div>

      {/* Master toggle */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Ajuste global</h2>
        </div>
        <NotificationsToggleForm config={config} />
        <PushNotificationToggle />
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
          <div data-glass="item-dim" className="flex flex-col items-center gap-2 rounded-xl border border-dashed p-8 text-center relative">
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
