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
  "You are a Korean tarot+saju fusion reader. Use everyday Korean first. " +
  "Gloss jargon like \u300cilgan (my energy)\u300d when needed. " +
  "Respond in Korean with sections: ## Today energy / ## Tarot / ## Together message.";

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
    "Spread: " +
    SPREAD_LABELS[spread] +
    "\nConcern: " +
    CONCERN_LABELS[onboarding.concern] +
    "\nMood: " +
    MOOD_LABELS[onboarding.mood] +
    "\nGoal: " +
    GOAL_LABELS[onboarding.goal] +
    "\n\n[Saju]\n" +
    sajuPromptBlock(saju || null) +
    "\n\n[Cards]\n" +
    cardLines +
    "\n\nWrite fusion reading in everyday Korean with the three ## sections."
  );
}

export async function POST(req: Request) {
  const authResult = await auth();
  const userId = authResult.userId;
  if (!userId) {
    return NextResponse.json({ error: "login required" }, { status: 401 });
  }
  let body: InterpretBody;
  try {
    body = (await req.json()) as InterpretBody;
  } catch {
    return NextResponse.json({ error: "bad body" }, { status: 400 });
  }
  const cards = body.cards;
  const onboarding = body.onboarding;
  const spread = body.spread || "one";
  const saju = body.saju || null;
  if (!cards || !cards.length || !onboarding || !onboarding.concern || !onboarding.mood || !onboarding.goal) {
    return NextResponse.json({ error: "need cards and onboarding" }, { status: 400 });
  }
  const templateText = buildInterpretation(cards, onboarding, spread, saju);
  if (!canAttemptAi()) {
    return NextResponse.json({
      source: "template" as const,
      text: templateText,
      reason: "no_credentials" as const,
      message: "AI unavailable; showing basic reading.",
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
        message: "Empty AI response; showing basic reading.",
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
