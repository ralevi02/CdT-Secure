"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ─── Schemas ────────────────────────────────────────────────────────────────

const configSchema = z.object({
  phone_number: z.string().min(5, "Número inválido").max(20),
  callmebot_api_key: z.string().min(1, "API Key requerida"),
  notifications_enabled: z.boolean(),
  heartbeat_timeout_mins: z.number().int().min(1).max(60),
});

const zoneUpdateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Nombre requerido").max(50),
  trigger_local_alarm: z.boolean(),
  is_enabled: z.boolean(),
});

const zoneCreateSchema = z.object({
  zone_number: z.number().int().min(1).max(99, "Máximo 99 zonas"),
  name: z.string().min(1, "Nombre requerido").max(50),
});

// ─── Actions ────────────────────────────────────────────────────────────────

export type ActionResult = { success: boolean; error?: string };

export async function updateConfig(formData: FormData): Promise<ActionResult> {
  const raw = {
    phone_number: formData.get("phone_number") as string,
    callmebot_api_key: formData.get("callmebot_api_key") as string,
    notifications_enabled: formData.get("notifications_enabled") === "true",
    heartbeat_timeout_mins: Number(formData.get("heartbeat_timeout_mins")),
  };

  const parsed = configSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { error } = await supabaseAdmin
    .from("config")
    .upsert({ id: 1, ...parsed.data });

  if (error) return { success: false, error: error.message };

  revalidatePath("/");
  revalidatePath("/config");
  return { success: true };
}

export async function createZone(formData: FormData): Promise<ActionResult> {
  const raw = {
    zone_number: Number(formData.get("zone_number")),
    name: formData.get("name") as string,
  };

  const parsed = zoneCreateSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { error } = await supabaseAdmin.from("zones").insert({
    zone_number: parsed.data.zone_number,
    name: parsed.data.name,
    is_enabled: true,
    trigger_local_alarm: false,
  });

  if (error) {
    if (error.code === "23505") {
      return { success: false, error: `El ID ${parsed.data.zone_number} ya existe` };
    }
    return { success: false, error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/zones");
  revalidatePath("/config");
  return { success: true };
}

export async function deleteZone(id: string): Promise<ActionResult> {
  if (!id) return { success: false, error: "ID inválido" };

  const { error } = await supabaseAdmin
    .from("zones")
    .delete()
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/");
  revalidatePath("/zones");
  revalidatePath("/config");
  return { success: true };
}

export async function updateZone(formData: FormData): Promise<ActionResult> {
  const raw = {
    id: formData.get("id") as string,
    name: formData.get("name") as string,
    trigger_local_alarm: formData.get("trigger_local_alarm") === "true",
    is_enabled: formData.get("is_enabled") === "true",
  };

  const parsed = zoneUpdateSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { error } = await supabaseAdmin
    .from("zones")
    .update({
      name: parsed.data.name,
      trigger_local_alarm: parsed.data.trigger_local_alarm,
      is_enabled: parsed.data.is_enabled,
    })
    .eq("id", parsed.data.id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/");
  revalidatePath("/zones");
  revalidatePath("/config");
  return { success: true };
}
