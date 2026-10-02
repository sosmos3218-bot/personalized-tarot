"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import AuthGate from "@/components/AuthGate";
import ProgressSteps from "@/components/ProgressSteps";
import ShareFortuneCard from "@/components/ShareFortuneCard";
import TarotCardFace from "@/components/TarotCardFace";
import { getCardById, drawRandomCards } from "@/lib/cards";
import {
  buildDailyFortune,
  dailyFortunePlainText,
  getSeoulTodayYmd,
  type DailyFortune,
} from "@/lib/daily";
import { buildInterpretation, createReadingId } from "@/lib/interpretation";
import { SAJU_DISCLAIMER, SAJU_DISCLAIMER_DETAIL } from "@/lib/saju";
import { getOnboarding, getSajuProfile } from "@/lib/storage";
import {
  loadDailyLock,
  loadSajuProfile,
  syncDailyLock,
  syncMarkDailyViewed,
  syncSaveReading,
} from "@/lib/sync";
import type { DrawnCard, TarotCard } from "@/lib/types";
import { DEFAULT_ONBOARDING } from "@/lib/types";

export default function TodayPage() {
  return (
    <AuthGate requireSaju>
      <Suspense fallback={<p className="text-center text-body animate-pulse">불러오는 중…</p>}>
        <TodayReport />
      </Suspense>
    </AuthGate>
  );
}

function LuckMeter({ score }: { score: number }) {
  const clamped = Math.max(0, Math.min(100, score));
  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between gap-2">
        <span className="text-sm font-medium text-heading">오늘의 운세 점수</span>
        <span className="text-2xl font-bold text-accent tabular-nums">
          {clamped}
          <span className="ml-0.5 text-sm font-medium text-muted">/100</span>
        </span>
      </div>
      <div
        className="h-2.5 w-full overflow-hidden rounded-full"
        style={{ background: "var(--chip-bg)" }}
        role="meter"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="운세 점수"
      >
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${clamped}%`,
            background: "linear-gradient(90deg, #7c3aed 0%, #b8860b 55%, #fbbf24 100%)",
          }}
        />
      </div>
    </div>
  );
}

function TodayReport() {
  const { userId } = useAuth();
  const searchParams = useSearchParams();
  const welcome = searchParams.get("welcome") === "1";
  const [fortune, setFortune] = useState<DailyFortune | null>(null);
  const [enhancedSummary, setEnhancedSummary] = useState<string | null>(null);
  const [aiSource, setAiSource] = useState<"ai" | "template" | null>(null);
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [drawnCard, setDrawnCard] = useState<TarotCard | null>(null);
  const [readingId, setReadingId] = useState<string | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [alreadyDrawn, setAlreadyDrawn] = useState(false);

  const load = useCallback(() => {
    let cancelled = false;
    async function run() {
      const saju = (await loadSajuProfile(userId)) ?? getSajuProfile(userId);
      if (!saju || cancelled) return;
      const dateYmd = getSeoulTodayYmd();
      const f = buildDailyFortune(saju, { userId, dateYmd });
      if (cancelled) return;
      setFortune(f);
      void syncMarkDailyViewed(userId, dateYmd, f);
      const lock = await loadDailyLock(userId, dateYmd);
      if (cancelled) return;
      if (lock) {
        setAlreadyDrawn(true);
        setReadingId(lock.readingId);
        const card = getCardById(lock.cardId);
        if (card) setDrawnCard(card);
      } else {
        setAlreadyDrawn(false);
        setReadingId(null);
        setDrawnCard(null);
      }
    }
    void run();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    return load();
  }, [load]);

  useEffect(() => {
    if (!fortune || !userId) return;
    let cancelled = false;
    async function enhance() {
      setAiLoading(true);
      try {
        const saju = getSajuProfile(userId);
        const res = await fetch("/api/daily-interpret", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fortunePlain: dailyFortunePlainText(fortune!),
            saju,
            dateYmd: fortune!.dateYmd,
          }),
        });
        if (!res.ok) {
          if (!cancelled) setAiSource("template");
          return;
        }
        const data = (await res.json()) as {
          source: "ai" | "template";
          text?: string;
          message?: string;
        };
        if (cancelled) return;
        setAiSource(data.source);
        setAiMessage(data.source === "template" ? (data.message ?? null) : null);
        if (data.source === "ai" && data.text?.trim()) {
          setEnhancedSummary(data.text.trim());
        }
      } catch {
        if (!cancelled) setAiSource("template");
      } finally {
        if (!cancelled) setAiLoading(false);
      }
    }
    void enhance();
    return () => {
      cancelled = true;
    };
  }, [fortune, userId]);

  const fusionHint = useMemo(() => {
    if (!fortune || !drawnCard) return null;
    return (
      "나를 나타내는 기운 " +
      fortune.dayMasterStem +
      "(" +
      fortune.dayMasterLabel +
      ")과 「" +
      drawnCard.nameKo +
      "」가 오늘의 한 장으로 만납니다."
    );
  }, [fortune, drawnCard]);

  function handleDailyDraw() {
    if (!fortune || !userId || alreadyDrawn || drawing) return;
    const saju = getSajuProfile(userId);
    if (!saju) return;
    setDrawing(true);
    const [card] = drawRandomCards(1);
    if (!card) {
      setDrawing(false);
      return;
    }
    const onboarding = getOnboarding(userId) ?? DEFAULT_ONBOARDING;
    const drawn: DrawnCard[] = [
      { card, position: 0, positionLabel: "오늘의 타로" },
    ];
    const interpretation = buildInterpretation(drawn, onboarding, "one", saju);
    const id = createReadingId();
    const reading = {
      id,
      createdAt: new Date().toISOString(),
      spread: "one" as const,
      onboarding,
      cards: drawn,
      interpretation: [
        interpretation,
        "",
        "## 오늘의 운세 연계",
        fortune.summary,
        "초점: " + fortune.focus,
      ].join("\n"),
      interpretationSource: "template" as const,
      sajuSummary: saju.summaryText,
      tags: ["daily"],
    };
    void syncSaveReading(reading, userId);
    void syncDailyLock(
      {
        dateYmd: fortune.dateYmd,
        cardId: card.id,
        readingId: id,
        lockedAt: new Date().toISOString(),
      },
      userId,
      fortune
    );
    setDrawnCard(card);
    setReadingId(id);
    setAlreadyDrawn(true);
    setDrawing(false);
  }

  if (!fortune) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-body">
        <p className="animate-pulse">불러오는 중…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 animate-fade-up">
      <ProgressSteps current="today" done={["saju"]} />
      {welcome && (
        <div
          className="rounded-2xl border px-4 py-3 text-sm leading-relaxed"
          style={{
            borderColor: "var(--choice-selected-border)",
            background: "var(--choice-selected-bg)",
          }}
          role="status"
        >
          <p className="font-medium text-heading">사주가 연결됐어요</p>
          <p className="mt-1 text-body text-[13px]">
            아래에서 오늘의 운세를 확인하세요. 더 깊은 맞춤 리딩은{" "}
            <Link href="/onboarding" className="text-accent hover:underline">
              여기서
            </Link>
            .
          </p>
        </div>
      )}
      <div className="text-center">
        <p className="text-[11px] tracking-[0.22em] text-accent font-medium">
          2단계 · 오늘의 운세
        </p>
        <h1 className="mt-2 text-2xl font-bold text-heading">오늘의 운세</h1>
        <p className="mt-2 text-sm text-body">{fortune.dateLabel}</p>
      </div>
      <section className="card-panel space-y-4 !p-5 sm:!p-6">
        <LuckMeter score={fortune.luckScore} />
        <div
          className="rounded-xl border px-3 py-2.5 text-sm leading-relaxed"
          style={{ borderColor: "var(--border)", background: "var(--chip-bg)" }}
        >
          <p className="text-xs tracking-wide text-accent font-medium mb-1">오늘의 흐름</p>
          <p className="text-heading font-medium">
            「일간(나를 나타내는 기운)」 {fortune.dayMasterStem} · {fortune.dayMasterLabel}
          </p>
          <p className="mt-1 text-body text-[13px]">
            오늘의 날 기운 {fortune.todayPillar.label} · {fortune.todayElementLabel}
            <span className="mx-1.5 text-muted">·</span>
            {fortune.relationLabel}
          </p>
          <p className="mt-2 text-body">{fortune.energyTone}</p>
        </div>
      </section>
      <section className="card-panel space-y-3 !p-5 sm:!p-6">
        <h2 className="font-semibold text-heading flex items-center gap-2">
          <span className="text-accent" aria-hidden>✦</span>
          에너지 요약
        </h2>
        {aiLoading && (
          <p className="text-xs text-muted animate-pulse">
            AI 보완 해석을 확인하는 중… (템플릿은 이미 표시됩니다)
          </p>
        )}
        {aiSource === "ai" && enhancedSummary ? (
          <div className="space-y-2 text-sm text-body leading-relaxed whitespace-pre-wrap">
            {enhancedSummary}
          </div>
        ) : (
          <p className="text-sm text-body leading-relaxed">{fortune.summary}</p>
        )}
        {aiSource && (
          <p className="text-[11px] text-muted leading-relaxed">
            {aiSource === "ai"
              ? "AI 보완 · 기본 운세 기반"
              : aiMessage ?? "기본 운세 (AI 보완 없음)"}
          </p>
        )}
      </section>
      <div className="grid gap-3 sm:grid-cols-2">
        <section className="card-panel space-y-2 !p-4 sm:!p-5">
          <h3 className="text-sm font-semibold text-heading">오늘의 초점</h3>
          <p className="text-sm text-body leading-relaxed">{fortune.focus}</p>
        </section>
        <section className="card-panel space-y-2 !p-4 sm:!p-5">
          <h3 className="text-sm font-semibold text-heading">주의</h3>
          <p className="text-sm text-body leading-relaxed">{fortune.caution}</p>
        </section>
      </div>
      <section className="card-panel space-y-4 !p-5 sm:!p-6">
        <div>
          <h2 className="font-semibold text-heading">오늘의 타로 1장</h2>
          <p className="mt-1 text-xs text-body leading-relaxed">
            하루 한 장만 뽑을 수 있습니다. 사주 기운과 함께 기록에 저장됩니다.
          </p>
        </div>
        {drawnCard ? (
          <div className="flex flex-col items-center gap-4">
            <TarotCardFace card={drawnCard} positionLabel="오늘의 타로" revealed size="lg" />
            <p className="text-center text-sm text-body leading-relaxed px-2">
              <strong className="text-heading">{drawnCard.nameKo}</strong>
              <span className="text-muted"> · {drawnCard.nameEn}</span>
              <br />
              {drawnCard.keywords.join(" · ")}
            </p>
            {fusionHint && (
              <p className="text-center text-xs text-body leading-relaxed px-1">{fusionHint}</p>
            )}
            {readingId && (
              <Link href={`/result?id=${readingId}`} className="btn-secondary text-sm">
                상세 해석 보기
              </Link>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-2">
            <button
              type="button"
              className="btn-primary animate-glow min-w-[12rem]"
              disabled={drawing}
              onClick={handleDailyDraw}
            >
              {drawing ? "뽑는 중…" : "✦ 오늘의 타로 뽑기"}
            </button>
            <p className="text-[11px] text-muted text-center">
              뽑은 카드는 오늘(서울) 자정까지 고정됩니다.
            </p>
          </div>
        )}
      </section>
      <ShareFortuneCard fortune={fortune} tarotName={drawnCard?.nameKo} />
      <p className="text-center text-[11px] text-muted leading-relaxed px-2">
        ※ {SAJU_DISCLAIMER}
        <br />
        엔터테인먼트·셀프 리플렉션 목적이며 전문 상담을 대체하지 않습니다.
      </p>
      <details className="text-center text-[11px] text-muted">
        <summary className="cursor-pointer select-none text-accent hover:underline">자세히</summary>
        <p className="mt-1 px-2 leading-relaxed">{SAJU_DISCLAIMER_DETAIL}</p>
      </details>
      <div className="flex flex-wrap justify-center gap-2 pt-1">
        <Link href="/onboarding" className="btn-secondary text-sm">맞춤 리딩 준비</Link>
        <Link href="/draw" className="btn-secondary text-sm">카드 뽑기</Link>
        <Link href="/saju" className="btn-secondary text-sm">사주 확인</Link>
      </div>
    </div>
  );
}
