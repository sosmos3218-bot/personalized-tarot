"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import AuthGate from "@/components/AuthGate";
import TarotCardFace from "@/components/TarotCardFace";
import {
  getHistory,
  getLastReading,
  updateReadingInterpretation,
} from "@/lib/storage";
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
          <p className="text-center text-body animate-pulse">불러오는 중…</p>
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
  const [source, setSource] = useState<"ai" | "template" | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const fetchedForId = useRef<string | null>(null);

  useEffect(() => {
    const id = searchParams.get("id");
    if (id) {
      const found = getHistory().find((r) => r.id === id);
      setReading(found ?? getLastReading());
    } else {
      setReading(getLastReading());
    }
  }, [searchParams]);

  useEffect(() => {
    if (!reading) return;
    if (fetchedForId.current === reading.id) return;
    // Skip re-fetch if already AI-sourced from history
    if (reading.interpretationSource === "ai") {
      setSource("ai");
      fetchedForId.current = reading.id;
      return;
    }

    fetchedForId.current = reading.id;
    let cancelled = false;

    async function fetchInterpretation() {
      setLoadingAi(true);
      setAiError(null);
      try {
        const res = await fetch("/api/interpret", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cards: reading!.cards,
            onboarding: reading!.onboarding,
            spread: reading!.spread,
          }),
        });

        if (!res.ok) {
          const data = (await res.json().catch(() => null)) as {
            error?: string;
          } | null;
          throw new Error(data?.error ?? "해석 요청에 실패했습니다.");
        }

        const data = (await res.json()) as {
          source: "ai" | "template";
          text: string;
          message?: string;
        };

        if (cancelled) return;

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
        updateReadingInterpretation(reading!.id, data.text, data.source);

        if (data.source === "template" && data.message) {
          setAiError(data.message);
        }
      } catch (e) {
        if (cancelled) return;
        setSource("template");
        setAiError(
          e instanceof Error
            ? e.message
            : "AI 해석을 가져오지 못해 기본 해석을 표시합니다."
        );
      } finally {
        if (!cancelled) setLoadingAi(false);
      }
    }

    void fetchInterpretation();
    return () => {
      cancelled = true;
    };
  }, [reading]);

  if (!reading) {
    return (
      <div className="card-panel space-y-5 text-center !py-10 animate-fade-up">
        <div
          className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border text-2xl"
          style={{ borderColor: "var(--border)", background: "var(--chip-bg)" }}
          aria-hidden
        >
          ✦
        </div>
        <div>
          <p className="font-medium text-heading">저장된 리딩이 없습니다</p>
          <p className="mt-1.5 text-sm text-body">
            카드를 뽑아 결과를 확인해 보세요.
          </p>
        </div>
        <Link href="/draw" className="btn-primary inline-flex">
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
        <p className="text-[11px] tracking-[0.22em] text-accent font-medium">
          RESULT
        </p>
        <h1 className="mt-2 text-2xl font-bold text-heading">리딩 결과</h1>
        <p className="mt-1.5 text-xs text-muted">{dateLabel} (KST)</p>
        <p className="mt-2 text-sm text-body">
          {SPREAD_LABELS[reading.spread]} ·{" "}
          {CONCERN_LABELS[reading.onboarding.concern]} ·{" "}
          {MOOD_LABELS[reading.onboarding.mood]}
        </p>
        <p className="text-xs text-muted mt-1">
          목표: {GOAL_LABELS[reading.onboarding.goal].split(" — ")[0]}
        </p>
      </div>

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

      <section className="card-panel !p-5 sm:!p-7">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-heading">
            <span aria-hidden className="text-accent">
              ✧
            </span>{" "}
            개인화 해석
          </h2>
          {loadingAi ? (
            <span className="text-xs text-muted animate-pulse">
              AI가 해석을 작성하는 중…
            </span>
          ) : source === "ai" ? (
            <span
              className="rounded-full px-2.5 py-0.5 text-[11px] font-medium"
              style={{
                background: "var(--chip-bg)",
                color: "var(--accent-violet-soft)",
              }}
            >
              AI 해석
            </span>
          ) : source === "template" ? (
            <span
              className="rounded-full px-2.5 py-0.5 text-[11px] font-medium text-muted"
              style={{ background: "var(--chip-bg)" }}
            >
              템플릿 해석
            </span>
          ) : null}
        </div>

        {loadingAi && (
          <div className="mb-4 rounded-xl border border-dashed px-4 py-3 text-sm text-body"
            style={{ borderColor: "var(--border)" }}
          >
            <p className="animate-pulse">
              카드를 읽고 있습니다. 잠시만 기다려 주세요…
            </p>
          </div>
        )}

        {aiError && !loadingAi && (
          <p className="mb-3 text-xs text-muted" role="status">
            {aiError}
          </p>
        )}

        <div className="whitespace-pre-wrap text-sm leading-[1.75] text-body">
          {reading.interpretation}
        </div>
      </section>

      <p className="text-center text-xs text-muted">
        이 리딩은 자동으로 기록에 저장되었습니다.
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center sm:flex-wrap">
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
