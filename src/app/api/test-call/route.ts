import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { makeTestCall } from "@/lib/twilio";

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

    const [contactRes, configRes] = await Promise.all([
      supabaseAdmin
        .from("notification_contacts")
        .select("name, phone_number")
        .eq("id", contact_id)
        .single(),
      supabaseAdmin
        .from("config")
        .select("twilio_account_sid, twilio_auth_token, twilio_from_number")
        .eq("id", 1)
        .single(),
    ]);

    if (contactRes.error || !contactRes.data) {
      return NextResponse.json({ error: "Contacto no encontrado" }, { status: 404 });
    }

    const cfg = configRes.data;
    if (!cfg?.twilio_account_sid || !cfg.twilio_auth_token || !cfg.twilio_from_number) {
      return NextResponse.json(
        { error: "Credenciales Twilio no configuradas. Completa el formulario en /llamadas." },
        { status: 422 }
      );
    }

    await makeTestCall(
      cfg.twilio_account_sid,
      cfg.twilio_auth_token,
      cfg.twilio_from_number,
      contactRes.data.phone_number,
      contactRes.data.name
    );

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error("[API /test-call]", err);
    const message = err instanceof Error ? err.message : "Error interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
