import { auth } from "@clerk/nextjs/server";
import { generateText } from "ai";
import { NextResponse } from "next/server";
import { buildInterpretation } from "@/lib/interpretation";
import {
  CONCERN_LABELS,
  GOAL_LABELS,
  MOOD_LABELS,
  SPREAD_LABELS,
  type DrawnCard,
  type OnboardingAnswers,
  type SpreadType,
} from "@/lib/types";

export const runtime = "nodejs";

interface InterpretBody {
  cards?: DrawnCard[];
  onboarding?: OnboardingAnswers;
  spread?: SpreadType;
}

const SYSTEM_PROMPT = `당신은 한국어로 말하는 타로 리더입니다.
신비롭지만 현실에 발 딛은 어조로, 과장된 예언이나 공포 조장 없이 해석합니다.
의료·법률·재정에 대한 확정적 조언은 피하고, 성찰과 위로, 실천 가능한 관점을 제공합니다.
응답은 반드시 한국어로, 읽기 쉬운 구조(카드별 섹션 + 종합)로 작성하세요.
마크다운 제목은 ## / ### 정도만 사용하고, 불필요한 이모지는 최소화하세요.`;

function buildUserPrompt(
  cards: DrawnCard[],
  onboarding: OnboardingAnswers,
  spread: SpreadType
): string {
  const cardLines = cards
    .map(
      (d, i) =>
        `${i + 1}. [${d.positionLabel}] ${d.card.nameKo} (${d.card.nameEn})
   키워드: ${d.card.keywords.join(", ")}
   정방향 의미: ${d.card.uprightMeaning}
   조언: ${d.card.uprightAdvice}`
    )
    .join("\n\n");

  return `스프레드: ${SPREAD_LABELS[spread]}
고민 분야: ${CONCERN_LABELS[onboarding.concern]}
현재 기분: ${MOOD_LABELS[onboarding.mood]}
리딩 목표: ${GOAL_LABELS[onboarding.goal]}

뽑힌 카드:
${cardLines}

위 정보를 바탕으로 개인화된 타로 해석을 작성해 주세요.
각 카드에 대한 짧은 섹션과, 마지막에 종합 메시지를 포함해 주세요.`;
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { error: "로그인이 필요합니다." },
      { status: 401 }
    );
  }

  let body: InterpretBody;
  try {
    body = (await req.json()) as InterpretBody;
  } catch {
    return NextResponse.json(
      { error: "요청 본문을 읽을 수 없습니다." },
      { status: 400 }
    );
  }

  const { cards, onboarding, spread = "one" } = body;

  if (!cards?.length || !onboarding?.concern || !onboarding?.mood || !onboarding?.goal) {
    return NextResponse.json(
      { error: "카드와 온보딩 정보가 필요합니다." },
      { status: 400 }
    );
  }

  const templateText = buildInterpretation(cards, onboarding, spread);

  const apiKey = process.env.AI_GATEWAY_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      source: "template" as const,
      text: templateText,
      message: "AI 키가 없어 템플릿 해석을 반환합니다.",
    });
  }

  try {
    const { text } = await generateText({
      model: "openai/gpt-5-mini",
      system: SYSTEM_PROMPT,
      prompt: buildUserPrompt(cards, onboarding, spread),
      maxOutputTokens: 1200,
    });

    if (!text?.trim()) {
      return NextResponse.json({
        source: "template" as const,
        text: templateText,
        message: "AI 응답이 비어 템플릿으로 대체했습니다.",
      });
    }

    return NextResponse.json({
      source: "ai" as const,
      text: text.trim(),
    });
  } catch (err) {
    console.error("[interpret] AI failed, using template:", err);
    return NextResponse.json({
      source: "template" as const,
      text: templateText,
      message: "AI 해석에 실패해 템플릿 해석을 반환합니다.",
    });
  }
}
