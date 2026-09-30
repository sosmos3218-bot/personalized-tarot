import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { SajuProfile } from "@/lib/saju/types";
import { getSaju, saveSaju } from "@/lib/server/userData";

export const runtime = "nodejs";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const profile = await getSaju(userId);
    return NextResponse.json({ profile });
  } catch (e) {
    console.error("[saju GET]", e);
    return NextResponse.json({ error: "사주 불러오기 실패" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = (await req.json()) as { profile?: SajuProfile };
    if (!body.profile?.chart || !body.profile?.input) {
      return NextResponse.json({ error: "profile 필요" }, { status: 400 });
    }
    await saveSaju(userId, body.profile);
    return NextResponse.json({ profile: body.profile });
  } catch (e) {
    console.error("[saju PUT]", e);
    return NextResponse.json({ error: "사주 저장 실패" }, { status: 500 });
  }
}
