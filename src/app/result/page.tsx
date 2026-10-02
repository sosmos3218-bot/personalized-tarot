"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import AuthGate from "@/components/AuthGate";
import InterpretationView, {
  InterpretationLoading,
  InterpretationPageLoading,
} from "@/components/InterpretationView";
import TarotCardFace from "@/components/TarotCardFace";
import {
  dayMasterPlain,
  SAJU_DISCLAIMER,
  SAJU_DISCLAIMER_DETAIL,
  sajuDetailLines,
} from "@/lib/saju";
import type { SajuProfile } from "@/lib/saju";
import {
  getHistory,
  getLastReading,
  getSajuProfile,
} from "@/lib/storage";
import {
  ensureMigrated,
  fetchServerReading,
  loadSajuProfile,
  syncUpdateInterpretation,
} from "@/lib/sync";
import type { ReadingRecord } from "@/lib/types";
import {
  CONCERN_LABELS,
  GOAL_LABELS,
  MOOD_LABELS,
  SPREAD_LABELS,
} from "@/lib/types";

export default function ResultPage() {
  return (
    <AuthGate>
      <Suspense fallback={<InterpretationPageLoading />}>
        <ResultContent />
      </Suspense>
    </AuthGate>
  );
}

function ResultContent() {
  const { userId } = useAuth();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [reading, setReading] = useState<ReadingRecord | null>(null);
  const [saju, setSaju] = useState<SajuProfile | null>(null);
  const [source, setSource] = useState<"ai" | "template" | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const requested = useRef(false);

  useEffect(() => {
    let cancelled = false;
    async function boot() {
      ensureMigrated(userId);
      const profile = (await loadSajuProfile(userId)) ?? getSajuProfile(userId);
      if (cancelled) return;
      setSaju(profile);

      let rec: ReadingRecord | null = null;
      if (id) {
        rec =
          getHistory(userId).find((r) => r.id === id) ??
          (await fetchServerReading(id, userId));
      } else {
        rec = getLastReading(userId);
      }
      if (cancelled) return;
      setReading(rec);
      if (rec?.interpretationSource) setSource(rec.interpretationSource);
      setPageLoading(false);
    }
    void boot();
    return () => {
      cancelled = true;
    };
  }, [id, userId]);

  useEffect(() => {
    if (!reading || requested.current) return;
    if (reading.interpretationSource === "ai") return;
    requested.current = true;
    setLoadingAi(true);
    setAiError(null);

    async function run() {
      try {
        const res = await fetch("/api/interpret", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cards: reading!.cards,
            onboarding: reading!.onboarding,
            spread: reading!.spread,
            saju,
          }),
        });
        if (!res.ok) {
          setAiError("해석 요청에 실패했어요. 기본 해석을 보여드립니다.");
          setSource("template");
          return;
        }
        const data = (await res.json()) as {
          source: "ai" | "template";
          text: string;
          message?: string;
        };
        setSource(data.source);
        setReading((prev) =>
          prev
            ? {
                ...prev,
                interpretation: data.text,
                interpretationSource: data.source,
              }
            : prev
        );
        void syncUpdateInterpretation(reading!.id, data.text, data.source, userId);
        if (data.source === "template" && data.message) {
          setAiError(data.message);
        }
      } catch (e) {
        setSource("template");
        setAiError(
          e instanceof Error
            ? e.message
            : "해석 중 오류가 났어요. 기본 해석을 보여드립니다."
        );
      } finally {
        setLoadingAi(false);
      }
    }
    void run();
  }, [reading, saju, userId]);

  if (pageLoading) return <InterpretationPageLoading />;
  if (!reading) {
    return (
      <div className="mx-auto max-w-lg space-y-4 text-center animate-fade-up">
        <p className="text-body">저장된 리딩이 없어요.</p>
        <Link href="/today" className="btn-primary inline-block">오늘의 운세</Link>
      </div>
    );
  }

  const dateLabel = new Date(reading.createdAt).toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul",
  });

  return (
    <div className="mx-auto max-w-lg space-y-6 animate-fade-up">
      <div className="text-center">
        <p className="text-[11px] font-medium tracking-[0.22em] text-accent">
          RESULT · 타로+사주
        </p>
        <h1 className="mt-2 text-2xl font-bold text-heading">리딩 결과</h1>
        <p className="mt-1.5 text-xs text-muted">{dateLabel} (KST)</p>
        <p className="mt-2 text-sm text-body">
          {SPREAD_LABELS[reading.spread]} ·{" "}
          {CONCERN_LABELS[reading.onboarding.concern]} ·{" "}
          {MOOD_LABELS[reading.onboarding.mood]}
        </p>
        <p className="mt-1 text-xs text-muted">
          목표: {GOAL_LABELS[reading.onboarding.goal].split(" — ")[0]}
        </p>
      </div>

      <section className="card-panel !p-5 sm:!p-6">
        <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-heading sm:text-lg">
          <span aria-hidden className="text-accent">✧</span>
          나의 기운 요약
        </h2>
        {saju ? (
          <div className="space-y-2 text-sm text-body">
            <p className="font-medium leading-relaxed text-heading">
              {saju.summaryText}
            </p>
            <p className="leading-relaxed">{dayMasterPlain(saju.chart)}</p>
            <details className="text-xs text-muted">
              <summary className="cursor-pointer select-none text-accent hover:underline">
                자세히
              </summary>
              <div className="mt-2 space-y-1">
                {sajuDetailLines(saju.chart).map((line) => (
                  <p key={line}>{line}</p>
                ))}
                <p className="pt-1">{SAJU_DISCLAIMER_DETAIL}</p>
              </div>
            </details>
            <p className="text-xs leading-relaxed text-muted">{SAJU_DISCLAIMER}</p>
            <Link href="/saju" className="inline-block text-xs text-accent hover:underline">
              사주 프로필 수정
            </Link>
          </div>
        ) : (
          <p className="text-sm text-body">
            사주 프로필이 없습니다.{" "}
            <Link href="/saju" className="text-accent hover:underline">등록하기</Link>
          </p>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="flex items-center justify-center gap-2 text-center text-base font-semibold text-heading sm:text-lg">
          <span aria-hidden className="text-accent">✦</span>
          타로 카드
        </h2>
        <div className="flex flex-wrap items-end justify-center gap-3 sm:gap-4">
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
      </section>

      <section className="space-y-3">
        <h2 className="text-center text-base font-semibold text-heading sm:text-lg">해석</h2>
        {loadingAi ? (
          <InterpretationLoading />
        ) : source === "ai" ? (
          <div className="space-y-2">
            <p className="text-center text-[11px] text-accent">AI 퓨전 해석</p>
            <InterpretationView text={reading.interpretation} />
          </div>
        ) : source === "template" ? (
          <div className="space-y-2">
            {aiError && (
              <p className="text-center text-[11px] text-muted leading-relaxed px-2">{aiError}</p>
            )}
            <p className="text-center text-[11px] text-muted">기본 해석</p>
            <InterpretationView text={reading.interpretation} />
          </div>
        ) : (
          <InterpretationView text={reading.interpretation} />
        )}
      </section>

      <div className="flex flex-wrap justify-center gap-2">
        <Link href="/today" className="btn-primary text-sm">오늘의 운세</Link>
        <Link href="/history" className="btn-secondary text-sm">기록</Link>
        <Link href="/draw" className="btn-secondary text-sm">다시 뽑기</Link>
      </div>
    </div>
  );
}
