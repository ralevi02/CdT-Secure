"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const revalidateAll = () => {
  revalidatePath("/");
  revalidatePath("/zones");
  revalidatePath("/notifications");
  revalidatePath("/llamadas");
  revalidatePath("/config");
};

// ─── Schemas ────────────────────────────────────────────────────────────────

const configSchema = z.object({
  notifications_enabled: z.boolean(),
  heartbeat_timeout_mins: z.number().int().min(1).max(60),
});

const zoneCreateSchema = z.object({
  zone_number: z.number().int().min(1).max(99, "Máximo ID es 99"),
  name: z.string().min(1, "Nombre requerido").max(50),
});

const zoneUpdateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Nombre requerido").max(50),
  trigger_local_alarm: z.boolean(),
});

const contactSchema = z.object({
  name: z.string().min(1, "Nombre requerido").max(50),
  phone_number: z.string().min(5, "Número inválido").max(20),
  callmebot_api_key: z.string().min(1, "API Key requerida"),
});

// ─── Types ──────────────────────────────────────────────────────────────────

export type ActionResult = { success: boolean; error?: string };

// ─── Config ─────────────────────────────────────────────────────────────────

export async function updateConfig(formData: FormData): Promise<ActionResult> {
  const raw = {
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
  revalidateAll();
  return { success: true };
}

// ─── Zones ──────────────────────────────────────────────────────────────────

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

  revalidateAll();
  return { success: true };
}

export async function deleteZone(id: string): Promise<ActionResult> {
  if (!id) return { success: false, error: "ID inválido" };
  const { error } = await supabaseAdmin.from("zones").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidateAll();
  return { success: true };
}

export async function updateZone(formData: FormData): Promise<ActionResult> {
  const raw = {
    id: formData.get("id") as string,
    name: formData.get("name") as string,
    trigger_local_alarm: formData.get("trigger_local_alarm") === "true",
  };

  const parsed = zoneUpdateSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { error } = await supabaseAdmin
    .from("zones")
    .update({ name: parsed.data.name, trigger_local_alarm: parsed.data.trigger_local_alarm })
    .eq("id", parsed.data.id);

  if (error) return { success: false, error: error.message };
  revalidateAll();
  return { success: true };
}

export async function armZones(mode: "all" | "selected", selectedIds: string[]): Promise<ActionResult> {
  if (mode === "all") {
    const { error } = await supabaseAdmin
      .from("zones")
      .update({ is_enabled: true })
      .neq("id", "00000000-0000-0000-0000-000000000000");
    if (error) return { success: false, error: error.message };
  } else {
    if (selectedIds.length === 0) {
      return { success: false, error: "Selecciona al menos una zona" };
    }
    // Enable selected, disable the rest
    const { error: e1 } = await supabaseAdmin
      .from("zones")
      .update({ is_enabled: true })
      .in("id", selectedIds);
    const { error: e2 } = await supabaseAdmin
      .from("zones")
      .update({ is_enabled: false })
      .not("id", "in", `(${selectedIds.map((id) => `"${id}"`).join(",")})`);
    if (e1 || e2) return { success: false, error: e1?.message ?? e2?.message };
  }
  revalidateAll();
  return { success: true };
}

export async function toggleZoneArm(id: string, is_enabled: boolean): Promise<ActionResult> {
  const { error } = await supabaseAdmin
    .from("zones")
    .update({ is_enabled })
    .eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidateAll();
  return { success: true };
}

export async function disarmAllZones(): Promise<ActionResult> {
  const { error } = await supabaseAdmin
    .from("zones")
    .update({ is_enabled: false })
    .neq("id", "00000000-0000-0000-0000-000000000000");
  if (error) return { success: false, error: error.message };
  revalidateAll();
  return { success: true };
}

// ─── Notification Contacts ───────────────────────────────────────────────────

export async function createContact(formData: FormData): Promise<ActionResult> {
  const raw = {
    name: formData.get("name") as string,
    phone_number: formData.get("phone_number") as string,
    callmebot_api_key: formData.get("callmebot_api_key") as string,
  };

  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { error } = await supabaseAdmin
    .from("notification_contacts")
    .insert({ ...parsed.data, is_enabled: true });

  if (error) return { success: false, error: error.message };
  revalidateAll();
  return { success: true };
}

export async function deleteContact(id: string): Promise<ActionResult> {
  if (!id) return { success: false, error: "ID inválido" };
  const { error } = await supabaseAdmin
    .from("notification_contacts")
    .delete()
    .eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidateAll();
  return { success: true };
}

export async function toggleContact(id: string, is_enabled: boolean): Promise<ActionResult> {
  const { error } = await supabaseAdmin
    .from("notification_contacts")
    .update({ is_enabled })
    .eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidateAll();
  return { success: true };
}

export async function toggleContactCall(id: string, call_enabled: boolean): Promise<ActionResult> {
  const { error } = await supabaseAdmin
    .from("notification_contacts")
    .update({ call_enabled })
    .eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidateAll();
  return { success: true };
}

// ─── Twilio Config ────────────────────────────────────────────────────────────

const twilioSchema = z.object({
  twilio_account_sid:  z.string().min(1, "Account SID requerido"),
  twilio_auth_token:   z.string().min(1, "Auth Token requerido"),
  twilio_from_number:  z.string().min(5, "Número origen requerido"),
  calls_enabled:       z.boolean(),
});

export async function updateTwilioConfig(formData: FormData): Promise<ActionResult> {
  const raw = {
    twilio_account_sid:  formData.get("twilio_account_sid") as string,
    twilio_auth_token:   formData.get("twilio_auth_token")  as string,
    twilio_from_number:  formData.get("twilio_from_number") as string,
    calls_enabled:       formData.get("calls_enabled") === "true",
  };

  const parsed = twilioSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { error } = await supabaseAdmin
    .from("config")
    .upsert({ id: 1, ...parsed.data });

  if (error) return { success: false, error: error.message };
  revalidateAll();
  return { success: true };
}
