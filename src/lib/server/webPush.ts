import webpush from "web-push";

export type PushSubscriptionJSON = {
  endpoint: string;
  expirationTime?: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
};

let configured = false;

export function configureWebPush(): boolean {
  const publicKey =
    process.env.VAPID_PUBLIC_KEY || process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject =
    process.env.VAPID_SUBJECT || "mailto:noreply@personalized-tarot.vercel.app";
  if (!publicKey || !privateKey) {
    return false;
  }
  if (!configured) {
    webpush.setVapidDetails(subject, publicKey, privateKey);
    configured = true;
  }
  return true;
}

export function getPublicVapidKey(): string | null {
  return (
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
    process.env.VAPID_PUBLIC_KEY ||
    null
  );
}

export async function sendWebPush(
  subscription: PushSubscriptionJSON,
  payload: { title: string; body: string; url?: string }
): Promise<{ ok: boolean; statusCode?: number; gone?: boolean; error?: string }> {
  if (!configureWebPush()) {
    return { ok: false, error: "VAPID keys missing" };
  }
  try {
    const res = await webpush.sendNotification(
      subscription,
      JSON.stringify({
        title: payload.title,
        body: payload.body,
        url: payload.url || "/today",
      }),
      {
        TTL: 60 * 60 * 12,
        urgency: "normal",
      }
    );
    return { ok: true, statusCode: res.statusCode };
  } catch (e: unknown) {
    const err = e as { statusCode?: number; message?: string; body?: string };
    const statusCode = err.statusCode;
    const gone = statusCode === 404 || statusCode === 410;
    return {
      ok: false,
      statusCode,
      gone,
      error: err.message || err.body || "push failed",
    };
  }
}
