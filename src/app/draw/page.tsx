"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthGate from "@/components/AuthGate";
import TarotCardFace from "@/components/TarotCardFace";
import { drawRandomCards } from "@/lib/cards";
import { buildInterpretation, createReadingId } from "@/lib/interpretation";
import { getOnboarding, saveReading } from "@/lib/storage";
import type { DrawnCard, SpreadType } from "@/lib/types";
import { SPREAD_LABELS, THREE_CARD_POSITIONS } from "@/lib/types";

type Phase = "choose" | "shuffling" | "ready" | "revealing";

export default function DrawPage() {
  return (
    <AuthGate requireOnboarding>
      <DrawFlow />
    </AuthGate>
  );
}

function DrawFlow() {
  const router = useRouter();
  const [spread, setSpread] = useState<SpreadType | null>(null);
  const [phase, setPhase] = useState<Phase>("choose");
  const [drawn, setDrawn] = useState<DrawnCard[]>([]);
  const [revealedCount, setRevealedCount] = useState(0);

  function startShuffle(selected: SpreadType) {
    setSpread(selected);
    setPhase("shuffling");
    setRevealedCount(0);

    const count = selected === "one" ? 1 : 3;
    const cards = drawRandomCards(count);
    const positions =
      selected === "one" ? ["오늘의 메시지"] : [...THREE_CARD_POSITIONS];

    const next: DrawnCard[] = cards.map((card, i) => ({
      card,
      position: i,
      positionLabel: positions[i],
    }));

    setTimeout(() => {
      setDrawn(next);
      setPhase("ready");
    }, 1600);
  }

  function revealCards() {
    if (!spread || drawn.length === 0) return;
    setPhase("revealing");

    const total = drawn.length;
    let i = 0;
    const interval = setInterval(() => {
      i += 1;
      setRevealedCount(i);
      if (i >= total) {
        clearInterval(interval);
        const onboarding = getOnboarding();
        if (!onboarding) {
          router.push("/onboarding");
          return;
        }
        const interpretation = buildInterpretation(drawn, onboarding, spread);
        const reading = {
          id: createReadingId(),
          createdAt: new Date().toISOString(),
          spread,
          onboarding,
          cards: drawn,
          interpretation,
        };
        saveReading(reading);
        setTimeout(() => {
          router.push(`/result?id=${reading.id}`);
        }, 700);
      }
    }, 450);
  }

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <div className="text-center">
        <p className="text-xs tracking-widest text-amber-300/70">DRAW</p>
        <h1 className="mt-2 text-2xl font-bold text-amber-100">카드 뽑기</h1>
        <p className="mt-2 text-sm text-violet-300">
          스프레드를 고른 뒤, 마음을 가라앉히고 카드를 뽑아보세요.
        </p>
      </div>

      {phase === "choose" && (
        <div className="space-y-4">
          {(Object.keys(SPREAD_LABELS) as SpreadType[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => startShuffle(key)}
              className="card-panel w-full text-left transition hover:border-amber-400/40"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-amber-100">
                    {SPREAD_LABELS[key]}
                  </h2>
                  <p className="mt-1 text-sm text-violet-300">
                    {key === "one"
                      ? "한 장의 카드로 오늘의 핵심 메시지를 받습니다."
                      : "과거·현재·미래 흐름을 세 장으로 읽습니다."}
                  </p>
                </div>
                <span className="text-2xl text-violet-400" aria-hidden>
                  {key === "one" ? "Ⅰ" : "Ⅲ"}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {phase === "shuffling" && (
        <div className="flex flex-col items-center gap-6 py-10">
          <div className="relative h-48 w-32">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="animate-shuffle absolute inset-0 rounded-xl border border-violet-600 bg-gradient-to-br from-violet-900 to-indigo-950"
                style={{
                  animationDelay: `${i * 0.1}s`,
                  transform: `translateX(${(i - 1) * 8}px) rotate(${(i - 1) * 4}deg)`,
                }}
              />
            ))}
          </div>
          <p className="animate-pulse text-violet-200">카드를 섞는 중…</p>
        </div>
      )}

      {(phase === "ready" || phase === "revealing") && (
        <div className="space-y-8">
          <div className="flex flex-wrap items-end justify-center gap-4">
            {drawn.map((d, i) => (
              <TarotCardFace
                key={`${d.card.id}-${i}`}
                card={d.card}
                positionLabel={d.positionLabel}
                revealed={phase === "revealing" && i < revealedCount}
                size={spread === "three" ? "sm" : "lg"}
              />
            ))}
          </div>

          {phase === "ready" && (
            <div className="flex flex-col items-center gap-3">
              <button type="button" className="btn-primary animate-glow" onClick={revealCards}>
                ✦ 뽑기
              </button>
              <button
                type="button"
                className="text-sm text-violet-400 hover:text-violet-200"
                onClick={() => {
                  setPhase("choose");
                  setSpread(null);
                  setDrawn([]);
                }}
              >
                스프레드 다시 고르기
              </button>
            </div>
          )}

          {phase === "revealing" && (
            <p className="text-center animate-pulse text-violet-200">
              카드를 공개하는 중…
            </p>
          )}
        </div>
      )}
    </div>
  );
}
