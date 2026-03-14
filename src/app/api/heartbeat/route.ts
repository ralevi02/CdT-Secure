import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token } = body;

    if (!token || token !== process.env.ALARM_TOKEN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await supabaseAdmin
      .from("device_status")
      .upsert({ id: 1, last_seen: new Date().toISOString(), is_online: true });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[API /heartbeat]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
