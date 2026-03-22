import { NextResponse } from "next/server";
import { sendPushToAll } from "@/lib/web-push";

export async function POST() {
  try {
    const results = await sendPushToAll({
      title: "🔔 Test — CdT Secure",
      body: "Si ves esto, las push notifications funcionan correctamente.",
      tag: "test-push",
      url: "/notifications",
    });

    if (results.length === 0) {
      return NextResponse.json(
        { error: "No hay suscripciones push guardadas. Activa el toggle primero.", subscriptions: 0 },
        { status: 404 }
      );
    }

    const ok = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    return NextResponse.json({
      ok: failed === 0,
      total: results.length,
      delivered: ok,
      failed,
      results,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Push failed", details: String(err) },
      { status: 500 }
    );
  }
}
