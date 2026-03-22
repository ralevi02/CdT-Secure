import webPush from "web-push";
import { createClient } from "@supabase/supabase-js";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY!;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || "mailto:cdtsecure@proton.me";

webPush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type PushPayload = {
  title: string;
  body: string;
  tag?: string;
  url?: string;
};

export type PushResult = {
  endpoint: string;
  success: boolean;
  status?: number;
  error?: string;
};

export async function sendPushToAll(payload: PushPayload): Promise<PushResult[]> {
  const { data: subs } = await supabaseAdmin
    .from("push_subscriptions")
    .select("id, endpoint, keys_p256dh, keys_auth");

  if (!subs || subs.length === 0) return [];

  const body = JSON.stringify(payload);

  const pushOptions: webPush.RequestOptions = {
    TTL: 60 * 60,
    urgency: "high",
    topic: payload.tag || "cdt-alert",
  };

  const results = await Promise.allSettled(
    subs.map((sub) =>
      webPush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.keys_p256dh, auth: sub.keys_auth },
        },
        body,
        pushOptions
      )
    )
  );

  const report: PushResult[] = [];
  const expired: string[] = [];

  results.forEach((r, i) => {
    const ep = subs[i].endpoint.slice(0, 60) + "...";
    if (r.status === "fulfilled") {
      report.push({ endpoint: ep, success: true, status: r.value.statusCode });
    } else {
      const code = (r.reason as { statusCode?: number })?.statusCode;
      const msg = (r.reason as { body?: string })?.body || String(r.reason);
      report.push({ endpoint: ep, success: false, status: code, error: msg });
      if (code === 410) expired.push(subs[i].id);
    }
  });

  if (expired.length > 0) {
    await supabaseAdmin
      .from("push_subscriptions")
      .delete()
      .in("id", expired);
  }

  return report;
}
