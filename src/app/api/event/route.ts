import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendWhatsAppNotification } from "@/lib/callmebot";
import { makeAlarmCall } from "@/lib/twilio";
import { sendPushToAll } from "@/lib/web-push";

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

    await supabaseAdmin.from("sensor_logs").insert({ zone_id: zone.id, status });
    await supabaseAdmin
      .from("device_status")
      .upsert({ id: 1, last_seen: new Date().toISOString(), is_online: true });

    const shouldAlarm = status === true && zone.trigger_local_alarm === true;

    if (status === true && zone.is_enabled) {
      const [configRes, contactsRes] = await Promise.all([
        supabaseAdmin
          .from("config")
          .select("notifications_enabled, calls_enabled, twilio_account_sid, twilio_auth_token, twilio_from_number")
          .eq("id", 1)
          .single(),
        supabaseAdmin
          .from("notification_contacts")
          .select("phone_number, callmebot_api_key, is_enabled, call_enabled")
          .or("is_enabled.eq.true,call_enabled.eq.true"),
      ]);

      const config   = configRes.data;
      const contacts = contactsRes.data ?? [];

      const whatsappTargets = contacts.filter((c) => c.is_enabled);
      const callTargets     = contacts.filter((c) => c.call_enabled);

      const whatsappMsg = `🚨 [CdT Secure] Zona ${zone_id} (${zone.name}) - ABIERTO`;

      const tasks: Promise<unknown>[] = [];

      if (config?.notifications_enabled && whatsappTargets.length) {
        whatsappTargets.forEach((c) =>
          tasks.push(sendWhatsAppNotification(c.phone_number, c.callmebot_api_key, whatsappMsg))
        );
      }

      if (
        config?.calls_enabled &&
        config.twilio_account_sid &&
        config.twilio_auth_token &&
        config.twilio_from_number &&
        callTargets.length
      ) {
        callTargets.forEach((c) =>
          tasks.push(
            makeAlarmCall(
              config.twilio_account_sid,
              config.twilio_auth_token,
              config.twilio_from_number,
              c.phone_number,
              zone_id,
              zone.name
            )
          )
        );
      }

      tasks.push(
        sendPushToAll({
          title: "🚨 Alarma activada",
          body: `Zona ${zone_id} (${zone.name}) — sensor abierto`,
          tag: `alarm-${zone.id}`,
          url: "/",
        })
      );

      await Promise.allSettled(tasks);
    }

    return NextResponse.json({ should_alarm: shouldAlarm });
  } catch (err) {
    console.error("[API /event]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
