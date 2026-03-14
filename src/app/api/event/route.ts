import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendWhatsAppNotification } from "@/lib/callmebot";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { zone_id, status, token } = body;

    if (!token || token !== process.env.ALARM_TOKEN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (typeof zone_id !== "number" || typeof status !== "boolean") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const { data: zone, error: zoneErr } = await supabaseAdmin
      .from("zones")
      .select("id, name, is_enabled, trigger_local_alarm")
      .eq("zone_number", zone_id)
      .single();

    if (zoneErr || !zone) {
      return NextResponse.json({ error: "Zone not found" }, { status: 404 });
    }

    await supabaseAdmin.from("sensor_logs").insert({
      zone_id: zone.id,
      status,
    });

    await supabaseAdmin
      .from("device_status")
      .upsert({ id: 1, last_seen: new Date().toISOString(), is_online: true });

    const shouldAlarm = status === true && zone.trigger_local_alarm === true;

    if (status === true && zone.is_enabled) {
      const { data: config } = await supabaseAdmin
        .from("config")
        .select("phone_number, callmebot_api_key, notifications_enabled")
        .eq("id", 1)
        .single();

      if (config?.notifications_enabled && config.phone_number && config.callmebot_api_key) {
        const stateLabel = status ? "🚨 ABIERTO" : "✅ CERRADO";
        const message = `[CdT Secure] Zona ${zone_id} (${zone.name}) - ${stateLabel}`;
        await sendWhatsAppNotification(config.phone_number, config.callmebot_api_key, message);
      }
    }

    return NextResponse.json({ should_alarm: shouldAlarm });
  } catch (err) {
    console.error("[API /event]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
