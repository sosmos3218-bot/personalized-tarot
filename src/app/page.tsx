"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import {
  getDailyTarotLock,
  getSeoulTodayYmd,
  hasDailyFortuneViewed,
} from "@/lib/daily";
import { getSajuProfile, hasDailyHistoryForDate } from "@/lib/storage";

export default function LandingPage() {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const loggedIn = isLoaded && isSignedIn;
  const [hasSaju, setHasSaju] = useState(false);
  const [seenToday, setSeenToday] = useState(false);

  useEffect(() => {
    if (!loggedIn || !userId) {
      setHasSaju(false);
      setSeenToday(false);
      return;
    }
    setHasSaju(Boolean(getSajuProfile(userId)));
    const ymd = getSeoulTodayYmd();
    setSeenToday(
      hasDailyFortuneViewed(userId, ymd) ||
        Boolean(getDailyTarotLock(userId, ymd)) ||
        hasDailyHistoryForDate(ymd, userId)
    );
  }, [loggedIn, userId]);

  const primaryHref = !loggedIn
    ? "/sign-up"
    : hasSaju
      ? "/today"
      : "/saju";
  const primaryLabel = !loggedIn
    ? "무료로 시작하기"
    : hasSaju
      ? seenToday
        ? "오늘의 운세 다시 보기"
        : "오늘의 운세 보기"
      : "사주 등록하고 시작";

  return (
    <div className="space-y-10 sm:space-y-14">
      <section className="pt-4 sm:pt-10 text-center animate-fade-up">
        <div
          className="mb-5 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] tracking-[0.22em] text-accent"
          style={{ borderColor: "var(--border)", background: "var(--surface)" }}
        >
          <span aria-hidden>✦</span>
          TAROT + SAJU FUSION
        </div>
        <h1 className="mb-4 text-[1.85rem] sm:text-4xl font-bold leading-[1.25] text-heading tracking-tight">
          타로와 사주가
          <br />
          <span className="hero-gradient-text">만나는 별빛</span>
        </h1>
        <p className="mx-auto max-w-md text-body leading-relaxed text-[15px] sm:text-base px-1">
          만세력 일간·오행과 고전 타로를 결합한{" "}
          <strong className="text-accent font-semibold">타로+사주 퓨전</strong>
          입니다.
          <br className="hidden sm:block" />
          가입 → 사주 → <strong className="text-heading font-medium">오늘의 운세</strong>
          순으로, 맞춤 리딩은 원할 때만.
        </p>
        <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center">
          <Link
            href={primaryHref}
            className="btn-primary w-full sm:w-auto animate-glow"
          >
            {primaryLabel}
          </Link>
          <Link
            href={loggedIn ? (hasSaju ? "/draw" : "/saju") : "#how"}
            className="btn-secondary w-full sm:w-auto"
          >
            {loggedIn
              ? hasSaju
                ? "맞춤 리딩 · 카드 뽑기"
                : "사주부터 등록"
              : "이용 방법 보기"}
          </Link>
        </div>

        {loggedIn && hasSaju && seenToday && (
          <p className="mt-3 text-xs text-muted">
            <Link
              href="/today"
              className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 transition-colors hover:border-[var(--accent-gold-bright)]"
              style={{ borderColor: "var(--border)", background: "var(--chip-bg)" }}
            >
              <span className="text-accent font-medium">오늘 이미 봄</span>
              <span>· 운세 다시 열기</span>
            </Link>
          </p>
        )}

        <div
          className="mt-10 flex justify-center gap-3 opacity-80 animate-soft-float"
          aria-hidden
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-16 w-11 sm:h-20 sm:w-14 rounded-lg border shadow-md"
              style={{
                borderColor: "var(--card-back-border)",
                background:
                  "linear-gradient(145deg, #4c1d95 0%, #1e1b4b 55%, #0f0a1a 100%)",
                transform: `rotate(${(i - 1) * 8}deg) translateY(${Math.abs(i - 1) * 4}px)`,
              }}
            />
          ))}
        </div>
      </section>

      <section
        id="how"
        className="grid gap-3 sm:gap-4 sm:grid-cols-3 scroll-mt-20"
      >
        {[
          {
            step: "01",
            title: "가입 · 사주",
            desc: "로그인 후 생년월일로 일간·간지(만세력 MVP)를 등록합니다.",
          },
          {
            step: "02",
            title: "오늘의 운세",
            desc: "서울 날짜 기준 일간·오행 톤, 운세 점수, 선택적 일일 타로 1장.",
          },
          {
            step: "03",
            title: "맞춤 리딩 (선택)",
            desc: "짧은 질문 후 타로+사주 퓨전 AI 해석. 원치 않으면 건너뛸 수 있어요.",
          },
        ].map((item) => (
          <div key={item.step} className="card-panel text-center !p-5">
            <div className="mb-2 text-[11px] tracking-[0.2em] text-accent font-medium">
              {item.step}
            </div>
            <h3 className="mb-2 font-semibold text-heading">{item.title}</h3>
            <p className="text-sm text-body leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </section>

      <section className="card-panel animate-glow !p-6 sm:!p-7">
        <h2 className="mb-4 text-lg font-semibold text-heading flex items-center gap-2">
          <span aria-hidden className="text-accent">
            ✧
          </span>
          왜 별빛 타로인가요?
        </h2>
        <ul className="space-y-2.5 text-sm text-body leading-relaxed">
          <li className="flex gap-2">
            <span className="text-accent shrink-0">·</span>
            <span>
              <strong className="text-heading">타로+사주 퓨전</strong> — 일간·오행
              요약과 메이저 아르카나를 함께 읽습니다.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-accent shrink-0">·</span>
            <span>
              <strong className="text-heading">오늘의 운세 우선</strong> — 사주만
              있으면 바로 일일 리포트. 맞춤 온보딩은 선택입니다.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-accent shrink-0">·</span>
            <span>메이저 아르카나 22장의 고전 의미를 한국어로 제공합니다.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-accent shrink-0">·</span>
            <span>
              사주를 반영한 AI 퓨전 해석(실패 시 템플릿 폴백)을 제공합니다.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-accent shrink-0">·</span>
            <span>
              MVP 만세력은 참고용이며, 전문 명리를 대체하지 않습니다.
            </span>
          </li>
        </ul>
      </section>

      <section className="text-center text-xs text-muted pb-2 leading-relaxed">
        엔터테인먼트·셀프 리플렉션 목적 · 실제 점술·의료·법률 조언을 대체하지
        않습니다
        <br />
        MVP 만세력은 참고용이며 전문 명리가 아닙니다
      </section>
    </div>
  );
}
