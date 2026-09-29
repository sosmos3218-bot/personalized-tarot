import { auth } from "@clerk/nextjs/server";
import { generateText } from "ai";
import { NextResponse } from "next/server";
import { sajuPromptBlock } from "@/lib/saju";
import type { SajuProfile } from "@/lib/saju";

export const runtime = "nodejs";

interface Body {
  fortunePlain?: string;
  saju?: SajuProfile | null;
  dateYmd?: string;
}

const SYSTEM_PROMPT = `당신은 한국어로 말하는 타로+사주(만세력) 일일 운세 도우미입니다.
과장된 예언·공포 조장 없이, 짧고 따뜻한 톤으로 오늘의 기운을 보완 설명합니다.
의료·법률·재정 확정 조언은 피합니다. MVP 사주는 참고용입니다.
응답은 한국어 2–4문단, 마크다운 ## 제목 없이 본문만 작성하세요.`;

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { error: "로그인이 필요합니다." },
      { status: 401 }
    );
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json(
      { error: "요청 본문을 읽을 수 없습니다." },
      { status: 400 }
    );
  }

  const fortunePlain = body.fortunePlain?.trim();
  if (!fortunePlain) {
    return NextResponse.json(
      { error: "운세 본문이 필요합니다." },
      { status: 400 }
    );
  }

  const apiKey = process.env.AI_GATEWAY_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      source: "template" as const,
      message: "AI 키가 없어 템플릿을 유지합니다.",
    });
  }

  try {
    const { text } = await generateText({
      model: "openai/gpt-5-mini",
      system: SYSTEM_PROMPT,
      prompt: `날짜(서울): ${body.dateYmd ?? "오늘"}

[사주]
${sajuPromptBlock(body.saju ?? null)}

[템플릿 운세]
${fortunePlain}

위 템플릿을 바탕으로, 오늘의 기운을 2–4문단으로 자연스럽게 보완해 주세요.
템플릿의 초점·주의 취지를 유지하되 문장만 다듬고 풍부하게 하세요.`,
      maxOutputTokens: 700,
    });

    if (!text?.trim()) {
      return NextResponse.json({
        source: "template" as const,
        message: "AI 응답이 비어 템플릿을 유지합니다.",
      });
    }

    return NextResponse.json({
      source: "ai" as const,
      text: text.trim(),
    });
  } catch (err) {
    console.error("[daily-interpret] AI failed:", err);
    return NextResponse.json({
      source: "template" as const,
      message: "AI 보완에 실패해 템플릿을 유지합니다.",
    });
  }
}
