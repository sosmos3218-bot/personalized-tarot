import { auth } from "@clerk/nextjs/server";
import { generateText } from "ai";
import { NextResponse } from "next/server";
import {
  canAttemptAi,
  classifyAiError,
  getTarotModel,
} from "@/lib/ai";
import { sajuPromptBlock } from "@/lib/saju";
import type { SajuProfile } from "@/lib/saju";

export const runtime = "nodejs";
export const maxDuration = 60;

interface Body {
  fortunePlain?: string;
  saju?: SajuProfile | null;
  dateYmd?: string;
}

const SYSTEM_PROMPT =
  "\ub2f9\uc2e0\uc740 \ud55c\uad6d\uc5b4\ub85c \ub9d0\ud558\ub294 \ud0c0\ub85c+\uc0ac\uc8fc \uc77c\uc77c \uc6b4\uc138 \ub3c4\uc6b0\ubbf8\uc785\ub2c8\ub2e4.\n" +
  "\uacfc\uc7a5\ub41c \uc608\uc5b8\u00b7\uacf5\ud3ec \uc870\uc7a5 \uc5c6\uc774, \uc9e7\uace0 \ub530\ub73b\ud55c \ud1a4\uc73c\ub85c \uc624\ub298\uc758 \uae30\uc6b4\uc744 \ubcf4\uc644 \uc124\uba85\ud569\ub2c8\ub2e4.\n" +
  "\uc758\ub8cc\u00b7\ubc95\ub960\u00b7\uc7ac\uc815 \ud655\uc815 \uc870\uc5b8\uc740 \ud53c\ud569\ub2c8\ub2e4. \uc0ac\uc8fc\ub294 \ucc38\uace0\uc6a9\uc785\ub2c8\ub2e4.\n\n" +
  "\uc5b8\uc5b4 \uaddc\uce59:\n" +
  "-\uc77c\uc0c1 \ud55c\uad6d\uc5b4\ub97c \uba3c\uc800 \uc4f0\uc138\uc694.\n" +
  "-\uc0ac\uc8fc \uc6a9\uc5b4\uac00 \ud544\uc694\ud558\uba74 \u300c\uc77c\uac04(\ub098\ub97c \ub098\ud0c0\ub0b4\ub294 \uae30\uc6b4)\u300d\ucc98\ub7fc \uc9e7\uac8c\ub9cc \ud480\uc5b4 \uc8fc\uc138\uc694.\n" +
  "-\uc2ed\uc2e0\u00b7\uc9c0\uc7a5\uac04\u00b7\uc9c4\ud0dc\uc591\uc2dc\u00b7\uc57c\uc790\uc2dc\u00b7\uc2e0\uc0b4 \ub4f1 \uc804\ubb38 \uc6a9\uc5b4\ub294 \ud53c\ud558\uc138\uc694.\n\n" +
  "\uc751\ub2f5\uc740 \ud55c\uad6d\uc5b4 2\u20134\ubb38\ub2e8, \ub9c8\ud06c\ub2e4\uc6b4 ## \uc81c\ubaa9 \uc5c6\uc774 \ubcf8\ubb38\ub9cc \uc791\uc131\ud558\uc138\uc694.";

export async function POST(req: Request) {
  const authResult = await auth();
  const userId = authResult.userId;
  if (!userId) {
    return NextResponse.json(
      { error: "\ub85c\uadf8\uc778\uc774 \ud544\uc694\ud569\ub2c8\ub2e4." },
      { status: 401 }
    );
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json(
      { error: "\uc694\uccad \ubcf8\ubb38\uc744 \uc77d\uc744 \uc218 \uc5c6\uc2b5\ub2c8\ub2e4." },
      { status: 400 }
    );
  }

  const fortunePlain = body.fortunePlain ? body.fortunePlain.trim() : "";
  if (!fortunePlain) {
    return NextResponse.json(
      { error: "\uc6b4\uc138 \ubcf8\ubb38\uc774 \ud544\uc694\ud569\ub2c8\ub2e4." },
      { status: 400 }
    );
  }

  if (!canAttemptAi()) {
    return NextResponse.json({
      source: "template" as const,
      reason: "no_credentials" as const,
      message: "AI\ub97c \uc4f8 \uc218 \uc5c6\uc5b4 \uae30\ubcf8 \uc6b4\uc138\ub97c \uc720\uc9c0\ud569\ub2c8\ub2e4.",
    });
  }

  try {
    const result = await generateText({
      model: getTarotModel(),
      system: SYSTEM_PROMPT,
      prompt:
        "\ub0a0\uc9dc(\uc11c\uc6b8): " +
        (body.dateYmd || "\uc624\ub298") +
        "\n\n[\ucd9c\uc0dd \uae30\uc6b4]\n" +
        sajuPromptBlock(body.saju || null) +
        "\n\n[\uae30\ubcf8 \uc6b4\uc138]\n" +
        fortunePlain +
        "\n\n\uc704 \uae30\ubcf8 \uc6b4\uc138\ub97c \ubc14\ud0d5\uc73c\ub85c, \uc624\ub298\uc758 \uae30\uc6b4\uc744 2\u20134\ubb38\ub2e8\uc73c\ub85c \uc790\uc5f0\uc2a4\ub7fd\uac8c \ubcf4\uc644\ud574 \uc8fc\uc138\uc694.\n" +
        "\ucd08\uc810\u00b7\uc8fc\uc758 \ucde8\uc9c0\ub97c \uc720\uc9c0\ud558\ub418 \uc77c\uc0c1 \ud55c\uad6d\uc5b4\ub85c \ubb38\uc7a5\ub9cc \ub2e4\ub4ec\uace0 \ud48d\ubd80\ud558\uac8c \ud558\uc138\uc694.",
      maxOutputTokens: 700,
    });
    const text = result.text;

    if (!text || !text.trim()) {
      return NextResponse.json({
        source: "template" as const,
        reason: "empty" as const,
        message: "AI \uc751\ub2f5\uc774 \ube44\uc5b4 \uae30\ubcf8 \uc6b4\uc138\ub97c \uc720\uc9c0\ud569\ub2c8\ub2e4.",
      });
    }

    return NextResponse.json({
      source: "ai" as const,
      text: text.trim(),
    });
  } catch (err) {
    const info = classifyAiError(err);
    console.error("[daily-interpret] AI failed:", info.reason, info.log);
    return NextResponse.json({
      source: "template" as const,
      reason: info.reason,
      message: info.message,
    });
  }
}
