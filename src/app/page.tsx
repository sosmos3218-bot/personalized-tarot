"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";

export default function LandingPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const loggedIn = isLoaded && isSignedIn;

  return (
    <div className="space-y-10 sm:space-y-14">
      <section className="pt-4 sm:pt-10 text-center animate-fade-up">
        <div
          className="mb-5 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] tracking-[0.22em] text-accent"
          style={{ borderColor: "var(--border)", background: "var(--surface)" }}
        >
          <span aria-hidden>✦</span>
          PERSONALIZED TAROT
        </div>
        <h1 className="mb-4 text-[1.85rem] sm:text-4xl font-bold leading-[1.25] text-heading tracking-tight">
          나를 위한
          <br />
          <span className="hero-gradient-text">별빛 타로</span>
        </h1>
        <p className="mx-auto max-w-md text-body leading-relaxed text-[15px] sm:text-base px-1">
          고민과 기분, 원하는 방향을 알려주시면
          <br className="hidden sm:block" />
          고전 타로 의미와 결합한{" "}
          <strong className="text-accent font-semibold">개인화 해석</strong>을
          전해드립니다.
        </p>
        <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center">
          <Link
            href={loggedIn ? "/draw" : "/sign-up"}
            className="btn-primary w-full sm:w-auto animate-glow"
          >
            {loggedIn ? "카드 뽑으러 가기" : "무료로 시작하기"}
          </Link>
          <Link href="#how" className="btn-secondary w-full sm:w-auto">
            이용 방법 보기
          </Link>
        </div>

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
            title: "간단한 가입",
            desc: "Clerk로 안전하게 회원가입·로그인합니다.",
          },
          {
            step: "02",
            title: "3가지 질문",
            desc: "고민 분야 · 기분 · 리딩에서 원하는 것(통찰/행동/위로)",
          },
          {
            step: "03",
            title: "개인화 리딩",
            desc: "1장 또는 3장 스프레드 + AI 맞춤 해석과 기록 저장",
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
            <span>메이저 아르카나 22장의 고전 의미를 한국어로 제공합니다.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-accent shrink-0">·</span>
            <span>
              온보딩 답변을 반영한 AI 개인화 해석(실패 시 템플릿 폴백)을
              제공합니다.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-accent shrink-0">·</span>
            <span>
              리딩 기록은 기기에 안전하게 저장되며, 언제든 다시 볼 수 있습니다.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-accent shrink-0">·</span>
            <span>
              모바일에서도 편안하게 이용할 수 있는 미스티컬 UI입니다.
            </span>
          </li>
        </ul>
      </section>

      <section className="text-center text-xs text-muted pb-2">
        엔터테인먼트·셀프 리플렉션 목적 · 실제 점술·의료·법률 조언을 대체하지
        않습니다
      </section>
    </div>
  );
}
