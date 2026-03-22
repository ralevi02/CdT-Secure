import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendPushToAll } from "@/lib/web-push";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST() {
  try {
    const { data: subs, error: fetchErr } = await supabaseAdmin
      .from("push_subscriptions")
      .select("id, endpoint");

    if (fetchErr) {
      return NextResponse.json(
        { error: "DB error", details: fetchErr.message },
        { status: 500 }
      );
    }

    if (!subs || subs.length === 0) {
      return NextResponse.json(
        { error: "No hay suscripciones push guardadas. Activa el toggle de notificaciones push primero.", subscriptions: 0 },
        { status: 404 }
      );
    }

    await sendPushToAll({
      title: "🔔 Test — CdT Secure",
      body: "Si ves esto, las push notifications funcionan correctamente.",
      tag: "test-push",
      url: "/notifications",
    });

    return NextResponse.json({
      ok: true,
      subscriptions: subs.length,
      endpoints: subs.map((s) => s.endpoint.slice(0, 60) + "..."),
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Push failed", details: String(err) },
      { status: 500 }
    );
  }
}
