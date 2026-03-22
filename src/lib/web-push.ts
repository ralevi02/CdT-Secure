import webPush from "web-push";
import { createClient } from "@supabase/supabase-js";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY!;

webPush.setVapidDetails(
  "mailto:admin@cdtsecure.local",
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

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

export async function sendPushToAll(payload: PushPayload) {
  const { data: subs } = await supabaseAdmin
    .from("push_subscriptions")
    .select("id, endpoint, keys_p256dh, keys_auth");

  if (!subs || subs.length === 0) return;

  const body = JSON.stringify(payload);

  const results = await Promise.allSettled(
    subs.map((sub) =>
      webPush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.keys_p256dh, auth: sub.keys_auth },
        },
        body
      )
    )
  );

  const expired = results
    .map((r, i) => (r.status === "rejected" && (r.reason as { statusCode?: number })?.statusCode === 410 ? subs[i].id : null))
    .filter(Boolean);

  if (expired.length > 0) {
    await supabaseAdmin
      .from("push_subscriptions")
      .delete()
      .in("id", expired);
  }
}
