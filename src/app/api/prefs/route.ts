import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getPrefs, savePrefs, type ReminderPrefs } from "@/lib/server/userData";

export const runtime = "nodejs";

const DEFAULT: ReminderPrefs = {
  emailEnabled: false,
  hourKst: 8,
  lastSentYmd: null,
  updatedAt: new Date(0).toISOString(),
};

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const prefs = (await getPrefs(userId)) ?? DEFAULT;
    return NextResponse.json({ prefs });
  } catch (e) {
    console.error("[prefs GET]", e);
    return NextResponse.json({ error: "설정 조회 실패" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = (await req.json()) as {
      emailEnabled?: boolean;
      hourKst?: number;
    };
    const prev = (await getPrefs(userId)) ?? DEFAULT;
    const hour =
      typeof body.hourKst === "number"
        ? Math.max(0, Math.min(23, Math.floor(body.hourKst)))
        : prev.hourKst;
    const prefs: ReminderPrefs = {
      emailEnabled:
        typeof body.emailEnabled === "boolean"
          ? body.emailEnabled
          : prev.emailEnabled,
      hourKst: hour,
      lastSentYmd: prev.lastSentYmd ?? null,
      updatedAt: new Date().toISOString(),
    };
    await savePrefs(userId, prefs);
    return NextResponse.json({ prefs });
  } catch (e) {
    console.error("[prefs PUT]", e);
    return NextResponse.json({ error: "설정 저장 실패" }, { status: 500 });
  }
}
