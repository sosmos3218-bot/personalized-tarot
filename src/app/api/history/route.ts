import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { ReadingResult } from "@/lib/types";
import {
  clearReadings,
  listReadings,
  mergeReadings,
  upsertReading,
} from "@/lib/server/userData";

export const runtime = "nodejs";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const items = await listReadings(userId);
    return NextResponse.json({ items });
  } catch (e) {
    console.error("[history GET]", e);
    return NextResponse.json(
      { error: "기록을 불러오지 못했습니다." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = (await req.json()) as {
      reading?: ReadingResult;
      migrate?: ReadingResult[];
    };
    if (Array.isArray(body.migrate)) {
      const items = await mergeReadings(userId, body.migrate);
      return NextResponse.json({ items, migrated: true });
    }
    if (!body.reading?.id) {
      return NextResponse.json({ error: "reading 필요" }, { status: 400 });
    }
    const items = await upsertReading(userId, body.reading);
    return NextResponse.json({ items, reading: body.reading });
  } catch (e) {
    console.error("[history POST]", e);
    return NextResponse.json(
      { error: "기록 저장에 실패했습니다." },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    await clearReadings(userId);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[history DELETE]", e);
    return NextResponse.json(
      { error: "삭제에 실패했습니다." },
      { status: 500 }
    );
  }
}
