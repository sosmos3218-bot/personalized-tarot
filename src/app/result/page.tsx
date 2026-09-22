"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import AuthGate from "@/components/AuthGate";
import TarotCardFace from "@/components/TarotCardFace";
import { getHistory, getLastReading } from "@/lib/storage";
import type { ReadingResult } from "@/lib/types";
import {
  CONCERN_LABELS,
  GOAL_LABELS,
  MOOD_LABELS,
  SPREAD_LABELS,
} from "@/lib/types";

export default function ResultPage() {
  return (
    <AuthGate requireOnboarding>
      <Suspense
        fallback={
          <p className="text-center text-violet-300 animate-pulse">불러오는 중…</p>
        }
      >
        <ResultContent />
      </Suspense>
    </AuthGate>
  );
}

function ResultContent() {
  const searchParams = useSearchParams();
  const [reading, setReading] = useState<ReadingResult | null>(null);

  useEffect(() => {
    const id = searchParams.get("id");
    if (id) {
      const found = getHistory().find((r) => r.id === id);
      setReading(found ?? getLastReading());
    } else {
      setReading(getLastReading());
    }
  }, [searchParams]);

  if (!reading) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-violet-300">저장된 리딩이 없습니다.</p>
        <Link href="/draw" className="btn-primary">
          카드 뽑기
        </Link>
      </div>
    );
  }

  const dateLabel = new Date(reading.createdAt).toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="space-y-8 animate-fade-up">
      <div className="text-center">
        <p className="text-xs tracking-widest text-amber-300/70">RESULT</p>
        <h1 className="mt-2 text-2xl font-bold text-amber-100">리딩 결과</h1>
        <p className="mt-1 text-xs text-violet-400">{dateLabel} (KST)</p>
        <p className="mt-2 text-sm text-violet-300">
          {SPREAD_LABELS[reading.spread]} ·{" "}
          {CONCERN_LABELS[reading.onboarding.concern]} ·{" "}
          {MOOD_LABELS[reading.onboarding.mood]}
        </p>
        <p className="text-xs text-violet-400">
          목표: {GOAL_LABELS[reading.onboarding.goal].split(" — ")[0]}
        </p>
      </div>

      <div className="flex flex-wrap items-end justify-center gap-4">
        {reading.cards.map((d, i) => (
          <TarotCardFace
            key={`${d.card.id}-${i}`}
            card={d.card}
            positionLabel={d.positionLabel}
            revealed
            size={reading.spread === "three" ? "sm" : "lg"}
          />
        ))}
      </div>

      <section className="card-panel">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-amber-100">
          <span aria-hidden>✧</span> 개인화 해석
        </h2>
        <div className="whitespace-pre-wrap text-sm leading-relaxed text-violet-100/95">
          {reading.interpretation}
        </div>
      </section>

      <p className="text-center text-xs text-violet-500">
        이 리딩은 자동으로 기록에 저장되었습니다.
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link href="/draw" className="btn-primary">
          다시 뽑기
        </Link>
        <Link href="/history" className="btn-secondary">
          기록 보기
        </Link>
        <Link href="/onboarding" className="btn-secondary">
          온보딩 다시하기
        </Link>
      </div>
    </div>
  );
}
