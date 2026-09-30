import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getReading, updateReadingFields } from "@/lib/server/userData";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  try {
    const reading = await getReading(userId, id);
    if (!reading) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ reading });
  } catch (e) {
    console.error("[history id GET]", e);
    return NextResponse.json({ error: "불러오기 실패" }, { status: 500 });
  }
}

export async function PATCH(req: Request, ctx: Ctx) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  try {
    const body = (await req.json()) as {
      interpretation?: string;
      interpretationSource?: "ai" | "template";
    };
    const reading = await updateReadingFields(userId, id, body);
    if (!reading) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ reading });
  } catch (e) {
    console.error("[history id PATCH]", e);
    return NextResponse.json({ error: "수정 실패" }, { status: 500 });
  }
}
