"use client";

import Link from "next/link";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/nextjs";
import { useTheme } from "@/components/ThemeProvider";

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
            <Link
              href="/draw"
              className="hover:text-[var(--accent-gold)] transition-colors px-1"
            >
              뽑기
            </Link>
            <Link
              href="/history"
              className="hover:text-[var(--accent-gold)] transition-colors px-1"
            >
              기록
            </Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>

          <SignedOut>
            <SignInButton mode="redirect" forceRedirectUrl="/onboarding">
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
