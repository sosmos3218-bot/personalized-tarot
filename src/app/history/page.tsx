"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import AuthGate from "@/components/AuthGate";
import {
  getSajuProfile,
  hasDailyHistoryForDate,
} from "@/lib/storage";
import {
  ensureMigrated,
  loadSajuProfile,
  syncClearHistory,
} from "@/lib/sync";
import type { ReadingResult } from "@/lib/types";
import {
  CONCERN_LABELS,
  SPREAD_LABELS,
} from "@/lib/types";
import {
  getDailyTarotLock,
  getSeoulTodayYmd,
  hasDailyFortuneViewed,
} from "@/lib/daily";

export default function HistoryPage() {
  return (
    <AuthGate>
      <HistoryList />
    </AuthGate>
  );
}

function snippetFromInterpretation(text: string, max = 72): string {
  const cleaned = text
    .replace(/^#+\s*/gm, "")
    .replace(/\*\*/g, "")
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (cleaned.length <= max) return cleaned;
  return `${cleaned.slice(0, max).trimEnd()}…`;
}

function isDaily(r: ReadingResult): boolean {
  return Boolean(r.tags?.includes("daily"));
}

function HistoryList() {
  const { userId } = useAuth();
  const [items, setItems] = useState<ReadingResult[]>([]);
  const [hasSaju, setHasSaju] = useState(false);
  const [seenToday, setSeenToday] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const [items, saju] = await Promise.all([
        userId ? ensureMigrated(userId) : Promise.resolve([]),
        loadSajuProfile(userId),
      ]);
      if (cancelled) return;
      setItems(items);
      setHasSaju(Boolean(saju ?? getSajuProfile(userId)));
      const ymd = getSeoulTodayYmd();
      const seen =
        hasDailyFortuneViewed(userId, ymd) ||
        Boolean(getDailyTarotLock(userId, ymd)) ||
        items.some((r) => {
          if (!r.tags?.includes("daily")) return false;
          try {
            const d = new Intl.DateTimeFormat("en-CA", {
              timeZone: "Asia/Seoul",
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            }).format(new Date(r.createdAt));
            return d === ymd;
          } catch {
            return false;
          }
        }) ||
        hasDailyHistoryForDate(ymd, userId);
      setSeenToday(seen);
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const todayHref = hasSaju ? "/today" : "/saju";

  const emptyHint = useMemo(() => {
    if (!hasSaju) {
      return {
        title: "사주를 먼저 등록해 보세요",
        body: "생년월일로 일간·오행을 등록하면 오늘의 운세와 퓨전 리딩을 시작할 수 있어요.",
        primaryHref: "/saju",
        primaryLabel: "사주 등록하기",
        secondaryHref: "/draw",
        secondaryLabel: "카드만 먼저 뽑기",
      };
    }
    return {
      title: "아직 저장된 기록이 없습니다",
      body: "오늘의 운세로 하루를 열거나, 첫 카드를 뽑아 나만의 기록을 남겨보세요.",
      primaryHref: "/today",
      primaryLabel: "오늘의 운세 보기",
      secondaryHref: "/draw",
      secondaryLabel: "첫 카드 뽑기",
    };
  }, [hasSaju]);

  async function handleClear() {
    if (!confirm("모든 리딩 기록을 삭제할까요? (서버·이 기기 모두)")) return;
    await syncClearHistory(userId);
    setItems([]);
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] tracking-[0.22em] text-accent font-medium">
            HISTORY
          </p>
          <h1 className="mt-1 text-2xl font-bold text-heading">리딩 기록</h1>
          <p className="mt-1 text-sm text-body">
            계정에 동기화된 최근 리딩입니다. (최대 50건 · 기기 변경에도 유지)
          </p>
        </div>
        {items.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="text-xs shrink-0 transition-colors"
            style={{ color: "var(--rose)" }}
          >
            전체 삭제
          </button>
        )}
      </div>

      <section
        className="card-panel !p-4 sm:!p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        style={{
          background:
            "linear-gradient(135deg, rgba(124,58,237,0.06) 0%, rgba(184,134,11,0.08) 100%)",
        }}
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-heading">오늘의 운세</p>
            {seenToday && (
              <Link
                href={todayHref}
                className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium tracking-wide"
                style={{
                  background: "var(--chip-bg)",
                  color: "var(--accent-gold)",
                  border: "1px solid var(--border)",
                }}
              >
                오늘 이미 봄
              </Link>
            )}
          </div>
          <p className="mt-1 text-xs text-body leading-relaxed">
            {hasSaju
              ? seenToday
                ? "오늘 운세를 다시 확인하거나, 기록이 남아 있는지 살펴보세요."
                : "서울 날짜 기준 일간·오행 톤과 하루 한 장의 타로를 받아보세요."
              : "사주를 등록하면 오늘의 운세와 퓨전 해석을 이용할 수 있어요."}
          </p>
        </div>
        <Link
          href={todayHref}
          className="btn-primary shrink-0 text-center !px-5 !py-2.5 text-sm"
        >
          {hasSaju
            ? seenToday
              ? "다시 보기"
              : "오늘의 운세"
            : "사주 등록하기"}
        </Link>
      </section>

      {items.length === 0 ? (
        <div className="card-panel text-center space-y-5 !py-10">
          <div
            className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border text-2xl"
            style={{ borderColor: "var(--border)", background: "var(--chip-bg)" }}
            aria-hidden
          >
            ✧
          </div>
          <div>
            <p className="font-medium text-heading">{emptyHint.title}</p>
            <p className="mt-1.5 text-sm text-body px-2">{emptyHint.body}</p>
          </div>
          <div className="flex flex-col items-stretch gap-2.5 sm:flex-row sm:justify-center">
            <Link href={emptyHint.primaryHref} className="btn-primary inline-flex">
              {emptyHint.primaryLabel}
            </Link>
            <Link
              href={emptyHint.secondaryHref}
              className="btn-secondary inline-flex"
            >
              {emptyHint.secondaryLabel}
            </Link>
          </div>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {items.map((r) => {
            const daily = isDaily(r);
            const dateLabel = new Date(r.createdAt).toLocaleString("ko-KR", {
              timeZone: "Asia/Seoul",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });
            const cardNames = r.cards.map((c) => c.card.nameKo).join(" · ");
            const typeLabel = daily
              ? "오늘의 운세"
              : SPREAD_LABELS[r.spread];
            const concern = daily
              ? "일일 타로"
              : CONCERN_LABELS[r.onboarding.concern];
            const snippet = snippetFromInterpretation(r.interpretation);

            return (
              <li key={r.id}>
                <Link
                  href={`/result?id=${r.id}`}
                  className="card-panel block transition hover:border-[var(--accent-gold-bright)] !p-4 sm:!p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium tracking-wide"
                          style={{
                            background: daily
                              ? "rgba(184, 134, 11, 0.12)"
                              : "var(--chip-bg)",
                            color: daily
                              ? "var(--accent-gold)"
                              : "var(--accent-violet)",
                            border: "1px solid var(--border)",
                          }}
                        >
                          {daily ? "DAILY" : "SPREAD"}
                        </span>
                        <p className="text-sm font-medium text-heading truncate">
                          {typeLabel}
                        </p>
                      </div>
                      <p className="text-xs text-body truncate">
                        <span className="text-heading">{concern}</span>
                        {cardNames ? (
                          <>
                            <span className="mx-1.5 text-muted">·</span>
                            <span>{cardNames}</span>
                          </>
                        ) : null}
                      </p>
                      {snippet ? (
                        <p className="text-[12px] text-muted leading-relaxed line-clamp-2">
                          {snippet}
                        </p>
                      ) : null}
                    </div>
                    <span className="shrink-0 text-xs text-muted pt-0.5 tabular-nums">
                      {dateLabel}
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <div className="flex flex-col items-stretch gap-2.5 sm:flex-row sm:justify-center pt-1">
        <Link href={todayHref} className="btn-primary text-center">
          오늘의 운세
        </Link>
        <Link href="/draw" className="btn-secondary text-center">
          새 리딩 시작
        </Link>
      </div>
    </div>
  );
}
