import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { DailyTarotLock } from "@/lib/daily/types";
import { getDailyDoc, saveDailyDoc } from "@/lib/server/userData";
import { getSeoulTodayYmd } from "@/lib/daily/date";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const dateYmd = searchParams.get("date") ?? getSeoulTodayYmd();
  try {
    const doc = await getDailyDoc(userId, dateYmd);
    return NextResponse.json({
      dateYmd,
      lock: doc?.lock ?? null,
      viewedAt: doc?.viewedAt ?? null,
      fortuneSnapshot: doc?.fortuneSnapshot ?? null,
    });
  } catch (e) {
    console.error("[daily-lock GET]", e);
    return NextResponse.json({ error: "조회 실패" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = (await req.json()) as {
      dateYmd?: string;
      lock?: DailyTarotLock | null;
      viewedAt?: string | null;
      fortuneSnapshot?: unknown;
    };
    const dateYmd = body.dateYmd ?? getSeoulTodayYmd();
    const existing = await getDailyDoc(userId, dateYmd);
    await saveDailyDoc(userId, dateYmd, {
      lock: body.lock !== undefined ? body.lock : existing?.lock ?? null,
      viewedAt:
        body.viewedAt !== undefined
          ? body.viewedAt
          : existing?.viewedAt ?? new Date().toISOString(),
      fortuneSnapshot:
        body.fortuneSnapshot !== undefined
          ? body.fortuneSnapshot
          : existing?.fortuneSnapshot,
    });
    return NextResponse.json({ ok: true, dateYmd });
  } catch (e) {
    console.error("[daily-lock PUT]", e);
    return NextResponse.json({ error: "저장 실패" }, { status: 500 });
  }
}
