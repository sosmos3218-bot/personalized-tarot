"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useAuth,
} from "@clerk/nextjs";
import { useTheme } from "@/components/ThemeProvider";
import {
  getDailyTarotLock,
  getSeoulTodayYmd,
  hasDailyFortuneViewed,
} from "@/lib/daily";
import { getSajuProfile, hasDailyHistoryForDate } from "@/lib/storage";

function SignedInNav() {
  const { userId } = useAuth();
  const [hasSaju, setHasSaju] = useState(true);
  const [seenToday, setSeenToday] = useState(false);

  useEffect(() => {
    const saju = Boolean(getSajuProfile(userId));
    setHasSaju(saju);
    const ymd = getSeoulTodayYmd();
    setSeenToday(
      hasDailyFortuneViewed(userId, ymd) ||
        Boolean(getDailyTarotLock(userId, ymd)) ||
        hasDailyHistoryForDate(ymd, userId)
    );
  }, [userId]);

  const todayHref = hasSaju ? "/today" : "/saju";

  return (
    <>
      <Link
        href={todayHref}
        className="inline-flex items-center gap-1.5 hover:text-[var(--accent-gold)] transition-colors px-1 font-medium text-[var(--accent-gold)]"
      >
        오늘의 운세
        {seenToday && hasSaju && (
          <span
            className="hidden sm:inline-flex rounded-full px-1.5 py-0.5 text-[9px] font-medium tracking-wide"
            style={{
              background: "var(--chip-bg)",
              color: "var(--accent-gold)",
              border: "1px solid var(--border)",
            }}
          >
            오늘 이미 봄
          </span>
        )}
      </Link>
      <Link
        href="/draw"
        className="hover:text-[var(--accent-gold)] transition-colors px-1"
      >
        뽑기
      </Link>
      <Link
        href="/saju"
        className="hover:text-[var(--accent-gold)] transition-colors px-1"
      >
        사주
      </Link>
      <Link
        href="/history"
        className="hover:text-[var(--accent-gold)] transition-colors px-1"
      >
        기록
      </Link>
      <Link
        href="/settings"
        className="hover:text-[var(--accent-gold)] transition-colors px-1 hidden sm:inline"
      >
        알림
      </Link>
      <UserButton afterSignOutUrl="/" />
    </>
  );
}

export default function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="site-header sticky top-0 z-40">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold tracking-wide text-accent shrink-0"
        >
          <span className="text-lg leading-none" aria-hidden>
            ✦
          </span>
          <span className="text-[15px] sm:text-base">별빛 타로</span>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-3 text-sm text-body">
          <SignedIn>
            <SignedInNav />
          </SignedIn>

          <SignedOut>
            <SignInButton mode="redirect" forceRedirectUrl="/saju">
              <button
                type="button"
                className="rounded-full px-3 py-1.5 text-xs font-medium text-white transition-colors"
                style={{ background: "var(--accent-violet-soft)" }}
              >
                시작하기
              </button>
            </SignInButton>
          </SignedOut>

          <button
            type="button"
            onClick={toggleTheme}
            className="theme-toggle"
            aria-label={
              theme === "dark" ? "라이트 모드로 전환" : "다크 모드로 전환"
            }
            title={theme === "dark" ? "라이트 모드" : "다크 모드"}
          >
            {theme === "dark" ? (
              <span aria-hidden className="text-sm">
                ☀
              </span>
            ) : (
              <span aria-hidden className="text-sm">
                ☾
              </span>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
}
