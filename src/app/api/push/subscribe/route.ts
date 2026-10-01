import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  clearPushSubscriptions,
  getPrefs,
  getPushSubscriptions,
  removePushSubscription,
  savePrefs,
  upsertPushSubscription,
  type ReminderPrefs,
} from "@/lib/server/userData";
import { getPublicVapidKey } from "@/lib/server/webPush";

export const runtime = "nodejs";

const DEFAULT_PREFS: ReminderPrefs = {
  emailEnabled: false,
  pushEnabled: false,
  hourKst: 8,
  lastSentYmd: null,
  lastPushYmd: null,
  updatedAt: new Date(0).toISOString(),
};

function isValidSub(body: unknown): body is {
  endpoint: string;
  expirationTime?: number | null;
  keys: { p256dh: string; auth: string };
} {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;
  if (typeof b.endpoint !== "string" || !b.endpoint.startsWith("https://")) {
    return false;
  }
  const keys = b.keys as Record<string, unknown> | undefined;
  if (!keys || typeof keys.p256dh !== "string" || typeof keys.auth !== "string") {
    return false;
  }
  return true;
}

/** Public VAPID key + current subscription count for the signed-in user. */
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const publicKey = getPublicVapidKey();
  const doc = await getPushSubscriptions(userId);
  const prefs = (await getPrefs(userId)) ?? DEFAULT_PREFS;
  return NextResponse.json({
    publicKey,
    pushEnabled: Boolean(prefs.pushEnabled),
    subscriptions: doc.items.map((i) => ({
      endpoint: i.endpoint,
      updatedAt: i.updatedAt,
    })),
  });
}

/** Save / refresh a push subscription and enable push prefs. */
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!getPublicVapidKey()) {
    return NextResponse.json(
      { error: "푸시가 아직 설정되지 않았습니다." },
      { status: 503 }
    );
  }
  try {
    const body = await req.json();
    if (!isValidSub(body)) {
      return NextResponse.json({ error: "잘못된 구독 정보" }, { status: 400 });
    }
    const ua = req.headers.get("user-agent");
    const doc = await upsertPushSubscription(userId, {
      endpoint: body.endpoint,
      expirationTime: body.expirationTime ?? null,
      keys: body.keys,
      userAgent: ua,
    });
    const prev = (await getPrefs(userId)) ?? DEFAULT_PREFS;
    const prefs: ReminderPrefs = {
      ...prev,
      pushEnabled: true,
      updatedAt: new Date().toISOString(),
    };
    await savePrefs(userId, prefs);
    return NextResponse.json({ ok: true, prefs, count: doc.items.length });
  } catch (e) {
    console.error("[push subscribe POST]", e);
    return NextResponse.json({ error: "구독 저장 실패" }, { status: 500 });
  }
}

/** Opt out: remove one endpoint or clear all + disable push. */
export async function DELETE(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    let endpoint: string | undefined;
    try {
      const body = (await req.json()) as { endpoint?: string };
      endpoint = body.endpoint;
    } catch {
      endpoint = undefined;
    }
    if (endpoint) {
      await removePushSubscription(userId, endpoint);
    } else {
      await clearPushSubscriptions(userId);
    }
    const remaining = await getPushSubscriptions(userId);
    const prev = (await getPrefs(userId)) ?? DEFAULT_PREFS;
    const prefs: ReminderPrefs = {
      ...prev,
      pushEnabled: remaining.items.length > 0 ? prev.pushEnabled : false,
      updatedAt: new Date().toISOString(),
    };
    if (remaining.items.length === 0) {
      prefs.pushEnabled = false;
    }
    await savePrefs(userId, prefs);
    return NextResponse.json({ ok: true, prefs, count: remaining.items.length });
  } catch (e) {
    console.error("[push subscribe DELETE]", e);
    return NextResponse.json({ error: "구독 해제 실패" }, { status: 500 });
  }
}
