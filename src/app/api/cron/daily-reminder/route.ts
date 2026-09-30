import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { getSeoulTodayYmd } from "@/lib/daily/date";
import { buildDailyFortune, dailyFortunePlainText } from "@/lib/daily/fortune";
import {
  getPrefs,
  getSaju,
  listUserIdsWithPrefs,
  savePrefs,
} from "@/lib/server/userData";

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
  // en-US hour12:false can yield "24" for midnight in some engines
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
  // Vercel Cron sends Authorization: Bearer <CRON_SECRET> when configured;
  // also allow Vercel Cron user-agent without secret on Hobby (optional).
  const vercelCron = req.headers.get("x-vercel-cron") === "1";
  if (cronSecret) {
    if (authHeader !== `Bearer ${cronSecret}` && !vercelCron) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const hour = seoulHourNow();
  const ymd = getSeoulTodayYmd();
  const userIds = await listUserIdsWithPrefs();
  const clerk = await clerkClient();

  const results: {
    userId: string;
    status: string;
    detail?: string;
  }[] = [];

  for (const userId of userIds) {
    try {
      const prefs = await getPrefs(userId);
      if (!prefs?.emailEnabled) {
        results.push({ userId, status: "skip_disabled" });
        continue;
      }
      // Hobby cron runs once daily (~08:00 KST). Default: send all opted-in
      // users on that run. Set CRON_RESPECT_HOUR=1 to filter by hourKst.
      const respectHour = process.env.CRON_RESPECT_HOUR === "1";
      if (respectHour && prefs.hourKst !== hour) {
        results.push({ userId, status: "skip_hour" });
        continue;
      }
      if (prefs.lastSentYmd === ymd) {
        results.push({ userId, status: "skip_already" });
        continue;
      }
      const saju = await getSaju(userId);
      if (!saju) {
        results.push({ userId, status: "skip_no_saju" });
        continue;
      }
      const fortune = buildDailyFortune(saju, { userId, dateYmd: ymd });
      const clerkUser = await clerk.users.getUser(userId);
      const email =
        clerkUser.primaryEmailAddress?.emailAddress ??
        clerkUser.emailAddresses[0]?.emailAddress;
      if (!email) {
        results.push({ userId, status: "skip_no_email" });
        continue;
      }
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
          status: "skip_no_provider",
          detail: sent.error,
        });
        continue;
      }
      if (!sent.ok) {
        results.push({ userId, status: "error", detail: sent.error });
        continue;
      }
      await savePrefs(userId, {
        ...prefs,
        lastSentYmd: ymd,
        updatedAt: new Date().toISOString(),
      });
      results.push({ userId, status: "sent" });
    } catch (e) {
      results.push({
        userId,
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
    results,
  });
}
