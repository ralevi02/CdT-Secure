import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendWhatsAppNotification } from "@/lib/callmebot";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { contact_id } = await req.json();

    if (!contact_id) {
      return NextResponse.json({ error: "contact_id requerido" }, { status: 400 });
    }

    const { data: contact, error } = await supabaseAdmin
      .from("notification_contacts")
      .select("name, phone_number, callmebot_api_key")
      .eq("id", contact_id)
      .single();

    if (error || !contact) {
      return NextResponse.json({ error: "Contacto no encontrado" }, { status: 404 });
    }

    const message = `✅ [CdT Secure] Mensaje de prueba para ${contact.name}. Las notificaciones están funcionando correctamente.`;

    await sendWhatsAppNotification(contact.phone_number, contact.callmebot_api_key, message);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[API /test-notification]", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
