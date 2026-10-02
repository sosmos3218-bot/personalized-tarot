import { auth } from "@clerk/nextjs/server";
import { generateText } from "ai";
import { NextResponse } from "next/server";
import { canAttemptAi, classifyAiError, getTarotModel } from "@/lib/ai";
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
export const maxDuration = 60;

interface InterpretBody {
  cards?: DrawnCard[];
  onboarding?: OnboardingAnswers;
  spread?: SpreadType;
  saju?: SajuProfile | null;
}

const SYSTEM_PROMPT =
  "당신은 한국어로 말하는 타로+사주 퓨전 리더입니다.\n" +
  "과장된 예언·공포 조장 없이, 짧고 따뜻한 톤으로 안내합니다.\n" +
  "의료·법률·재정 확정 조언은 피합니다. 사주는 참고용입니다.\n\n" +
  "언어 규칙:\n" +
  "-일상 한국어를 먼저 쓰세요.\n" +
  "-사주 용어가 필요하면 「일간(나를 나타내는 기운)」처럼 짧게만 풀어 주세요.\n" +
  "-십신·지장간·진태양시·야자시·신살 등 전문 용어는 피하세요.\n\n" +
  "응답은 반드시 아래 세 개의 마크다운 제목으로 나누세요:\n" +
  "## 오늘의 기운\n## 타로\n## 함께 읽는 메시지";

function buildUserPrompt(
  cards: DrawnCard[],
  onboarding: OnboardingAnswers,
  spread: SpreadType,
  saju?: SajuProfile | null
): string {
  const cardLines = cards
    .map(function (d, i) {
      return (
        String(i + 1) +
        ". [" +
        d.positionLabel +
        "] " +
        d.card.nameKo +
        " - " +
        d.card.keywords.join(", ")
      );
    })
    .join("\n");
  return (
    "스프레드: " +
    SPREAD_LABELS[spread] +
    "\n고민: " +
    CONCERN_LABELS[onboarding.concern] +
    "\n기분: " +
    MOOD_LABELS[onboarding.mood] +
    "\n목표: " +
    GOAL_LABELS[onboarding.goal] +
    "\n\n[출생 기운]\n" +
    sajuPromptBlock(saju || null) +
    "\n\n[타로 카드]\n" +
    cardLines +
    "\n\n위 정보를 바탕으로 일상 한국어로 퓨전 해석을 쓰고, 세 개의 ## 제목을 지키세요."
  );
}

export async function POST(req: Request) {
  const authResult = await auth();
  const userId = authResult.userId;
  if (!userId) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }
  let body: InterpretBody;
  try {
    body = (await req.json()) as InterpretBody;
  } catch {
    return NextResponse.json({ error: "요청 본문을 읽을 수 없습니다." }, { status: 400 });
  }
  const cards = body.cards;
  const onboarding = body.onboarding;
  const spread = body.spread || "one";
  const saju = body.saju || null;
  if (!cards || !cards.length || !onboarding || !onboarding.concern || !onboarding.mood || !onboarding.goal) {
    return NextResponse.json({ error: "카드와 온보딩 정보가 필요합니다." }, { status: 400 });
  }
  const templateText = buildInterpretation(cards, onboarding, spread, saju);
  if (!canAttemptAi()) {
    return NextResponse.json({
      source: "template" as const,
      text: templateText,
      reason: "no_credentials" as const,
      message: "AI를 쓸 수 없어 기본 해석을 보여드립니다.",
    });
  }
  try {
    const result = await generateText({
      model: getTarotModel(),
      system: SYSTEM_PROMPT,
      prompt: buildUserPrompt(cards, onboarding, spread, saju),
      maxOutputTokens: 1600,
    });
    const text = result.text;
    if (!text || !text.trim()) {
      return NextResponse.json({
        source: "template" as const,
        text: templateText,
        reason: "empty" as const,
        message: "AI 응답이 비어 기본 해석을 보여드립니다.",
      });
    }
    return NextResponse.json({ source: "ai" as const, text: text.trim() });
  } catch (err) {
    const info = classifyAiError(err);
    console.error("[interpret] AI failed:", info.reason, info.log);
    return NextResponse.json({
      source: "template" as const,
      text: templateText,
      reason: info.reason,
      message: info.message,
    });
  }
}
