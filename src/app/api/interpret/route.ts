import { auth } from "@clerk/nextjs/server";
import { generateText } from "ai";
import { NextResponse } from "next/server";
import { canAttemptAi, getTarotModel } from "@/lib/ai";
import { buildInterpretation } from "@/lib/interpretation";
import { sajuPromptBlock } from "@/lib/saju";
import type { SajuProfile } from "@/lib/saju";
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
  saju?: SajuProfile | null;
}

const SYSTEM_PROMPT = `당신은 한국어로 말하는 타로+사주(만세력) 퓨전 리더입니다.
신비롭지만 현실에 발 딛은 어조로, 과장된 예언이나 공포 조장 없이 해석합니다.
의료·법률·재정에 대한 확정적 조언은 피하고, 성찰과 위로, 실천 가능한 관점을 제공합니다.
사주 정보는 MVP 참고용임을 인지하고, 단정적인 명리 진단처럼 말하지 마세요.
응답은 반드시 한국어로, 다음 세 섹션을 포함하세요:
## 사주 기운
## 타로
## 퓨전 메시지
마크다운 제목은 ## / ### 정도만 사용하고, 불필요한 이모지는 최소화하세요.`;

function buildUserPrompt(
  cards: DrawnCard[],
  onboarding: OnboardingAnswers,
  spread: SpreadType,
  saju?: SajuProfile | null
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

[사주 요약]
${sajuPromptBlock(saju ?? null)}

뽑힌 카드:
${cardLines}

위 정보를 바탕으로 타로+사주 퓨전 해석을 작성해 주세요.
반드시 ## 사주 기운 / ## 타로 / ## 퓨전 메시지 세 섹션으로 구성하세요.`;
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

  const { cards, onboarding, spread = "one", saju = null } = body;

  if (!cards?.length || !onboarding?.concern || !onboarding?.mood || !onboarding?.goal) {
    return NextResponse.json(
      { error: "카드와 온보딩 정보가 필요합니다." },
      { status: 400 }
    );
  }

  const templateText = buildInterpretation(cards, onboarding, spread, saju);

  if (!canAttemptAi()) {
    return NextResponse.json({
      source: "template" as const,
      text: templateText,
      message: "AI 키가 없어 템플릿 해석을 반환합니다.",
    });
  }

  try {
    const { text } = await generateText({
      model: getTarotModel(),
      system: SYSTEM_PROMPT,
      prompt: buildUserPrompt(cards, onboarding, spread, saju),
      maxOutputTokens: 1600,
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
