import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { getSeoulTodayYmd } from "@/lib/daily/date";
import { buildDailyFortune, dailyFortunePlainText } from "@/lib/daily/fortune";
import {
  getPrefs,
  getPushSubscriptions,
  getSaju,
  listUserIdsWithPrefs,
  listUserIdsWithPush,
  removePushSubscription,
  savePrefs,
} from "@/lib/server/userData";
import { configureWebPush, sendWebPush } from "@/lib/server/webPush";

export const runtime = "nodejs";
export const maxDuration = 60;

function seoulHourNow(): number {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    hour: "numeric",
    hour12: false,
  });
  const parts = fmt.formatToParts(new Date());
  const h = parts.find((p) => p.type === "hour")?.value ?? "0";
  const n = Number(h);
  return n === 24 ? 0 : n;
}

async function sendResendEmail(args: {
  to: string;
  subject: string;
  text: string;
}): Promise<{ ok: boolean; skipped?: boolean; error?: string }> {
  const key = process.env.RESEND_API_KEY;
  const from =
    process.env.RESEND_FROM_EMAIL ?? "별빛 타로 <onboarding@resend.dev>";
  if (!key) {
    return { ok: false, skipped: true, error: "RESEND_API_KEY missing" };
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [args.to],
        subject: args.subject,
        text: args.text,
      }),
    });
    if (!res.ok) {
      const t = await res.text();
      return { ok: false, error: t.slice(0, 300) };
    }
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "send failed",
    };
  }
}

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  const vercelCron = req.headers.get("x-vercel-cron") === "1";
  if (cronSecret) {
    if (authHeader !== `Bearer ${cronSecret}` && !vercelCron) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const hour = seoulHourNow();
  const ymd = getSeoulTodayYmd();
  const prefIds = await listUserIdsWithPrefs();
  const pushIds = await listUserIdsWithPush();
  const userIds = [...new Set([...prefIds, ...pushIds])];
  const clerk = await clerkClient();
  const pushReady = configureWebPush();

  const results: {
    userId: string;
    channel: "email" | "push";
    status: string;
    detail?: string;
  }[] = [];

  for (const userId of userIds) {
    try {
      const prefs = await getPrefs(userId);
      const saju = await getSaju(userId);
      const respectHour = process.env.CRON_RESPECT_HOUR === "1";

      if (prefs?.emailEnabled) {
        if (respectHour && prefs.hourKst !== hour) {
          results.push({ userId, channel: "email", status: "skip_hour" });
        } else if (prefs.lastSentYmd === ymd) {
          results.push({ userId, channel: "email", status: "skip_already" });
        } else if (!saju) {
          results.push({ userId, channel: "email", status: "skip_no_saju" });
        } else {
          const fortune = buildDailyFortune(saju, { userId, dateYmd: ymd });
          const clerkUser = await clerk.users.getUser(userId);
          const email =
            clerkUser.primaryEmailAddress?.emailAddress ??
            clerkUser.emailAddresses[0]?.emailAddress;
          if (!email) {
            results.push({ userId, channel: "email", status: "skip_no_email" });
          } else {
            const body = [
              "안녕하세요, 별빛 타로입니다.",
              "",
              `📅 ${fortune.dateLabel}`,
              `운세 점수: ${fortune.luckScore}/100`,
              "",
              dailyFortunePlainText(fortune),
              "",
              "자세히 보기: https://personalized-tarot.vercel.app/today",
              "",
              "알림을 끄려면: https://personalized-tarot.vercel.app/settings",
              "",
              "※ 엔터테인먼트 목적이며 전문 상담을 대체하지 않습니다.",
            ].join("\n");

            const sent = await sendResendEmail({
              to: email,
              subject: `[별빛 타로] 오늘의 운세 · ${fortune.luckScore}점`,
              text: body,
            });
            if (sent.skipped) {
              results.push({
                userId,
                channel: "email",
                status: "skip_no_provider",
                detail: sent.error,
              });
            } else if (!sent.ok) {
              results.push({
                userId,
                channel: "email",
                status: "error",
                detail: sent.error,
              });
            } else {
              await savePrefs(userId, {
                ...prefs,
                lastSentYmd: ymd,
                updatedAt: new Date().toISOString(),
              });
              results.push({ userId, channel: "email", status: "sent" });
            }
          }
        }
      } else if (prefs) {
        results.push({ userId, channel: "email", status: "skip_disabled" });
      }

      const pushOn = Boolean(prefs?.pushEnabled);
      if (!pushOn) {
        results.push({ userId, channel: "push", status: "skip_disabled" });
        continue;
      }
      if (!pushReady) {
        results.push({ userId, channel: "push", status: "skip_no_vapid" });
        continue;
      }
      if (respectHour && prefs && prefs.hourKst !== hour) {
        results.push({ userId, channel: "push", status: "skip_hour" });
        continue;
      }
      if (prefs?.lastPushYmd === ymd) {
        results.push({ userId, channel: "push", status: "skip_already" });
        continue;
      }
      if (!saju) {
        results.push({ userId, channel: "push", status: "skip_no_saju" });
        continue;
      }

      const fortune = buildDailyFortune(saju, { userId, dateYmd: ymd });
      const doc = await getPushSubscriptions(userId);
      if (doc.items.length === 0) {
        results.push({ userId, channel: "push", status: "skip_no_sub" });
        continue;
      }

      let anyOk = false;
      for (const sub of doc.items) {
        const sent = await sendWebPush(
          {
            endpoint: sub.endpoint,
            expirationTime: sub.expirationTime,
            keys: sub.keys,
          },
          {
            title: "별빛 타로 · 오늘의 운세",
            body: `${fortune.dateLabel} · 운세 ${fortune.luckScore}점 — 탭하여 보기`,
            url: "/today",
          }
        );
        if (sent.ok) {
          anyOk = true;
          results.push({
            userId,
            channel: "push",
            status: "sent",
            detail: sub.endpoint.slice(-24),
          });
        } else if (sent.gone) {
          await removePushSubscription(userId, sub.endpoint);
          results.push({
            userId,
            channel: "push",
            status: "gone_removed",
            detail: sent.error,
          });
        } else {
          results.push({
            userId,
            channel: "push",
            status: "error",
            detail: sent.error,
          });
        }
      }

      if (anyOk && prefs) {
        await savePrefs(userId, {
          ...prefs,
          lastSentYmd: (await getPrefs(userId))?.lastSentYmd ?? prefs.lastSentYmd,
          lastPushYmd: ymd,
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (e) {
      results.push({
        userId,
        channel: "email",
        status: "error",
        detail: e instanceof Error ? e.message : "unknown",
      });
    }
  }

  return NextResponse.json({
    ok: true,
    ymd,
    hour,
    checked: userIds.length,
    pushReady,
    results,
  });
}
