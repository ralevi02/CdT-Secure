import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST() {
  try {
    const { error } = await supabaseAdmin
      .from("zones")
      .update({ is_enabled: false })
      .neq("id", "00000000-0000-0000-0000-000000000000");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, message: "Todas las zonas desarmadas" });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
