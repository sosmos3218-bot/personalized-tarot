"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getUser } from "@/lib/storage";

export default function LandingPage() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setLoggedIn(!!getUser());
  }, []);

  return (
    <div className="space-y-12">
      <section className="pt-8 text-center animate-fade-up">
        <p className="mb-3 text-sm tracking-[0.3em] text-amber-300/80">PERSONALIZED TAROT</p>
        <h1 className="mb-4 text-3xl font-bold leading-tight text-amber-50 sm:text-4xl">
          나를 위한
          <br />
          <span className="bg-gradient-to-r from-amber-200 via-violet-300 to-indigo-300 bg-clip-text text-transparent">
            별빛 타로
          </span>
        </h1>
        <p className="mx-auto max-w-md text-violet-200/90 leading-relaxed">
          고민과 기분, 원하는 방향을 알려주시면
          <br />
          고전 타로 의미와 결합한 <strong className="text-amber-200">개인화 해석</strong>을
          전해드립니다.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link href={loggedIn ? "/draw" : "/auth"} className="btn-primary w-full sm:w-auto">
            {loggedIn ? "카드 뽑으러 가기" : "무료로 시작하기"}
          </Link>
          <Link href="#how" className="btn-secondary w-full sm:w-auto">
            이용 방법 보기
          </Link>
        </div>
      </section>

      <section id="how" className="grid gap-4 sm:grid-cols-3">
        {[
          {
            step: "01",
            title: "간단한 가입",
            desc: "이메일과 이름만으로 바로 시작합니다. (데모 인증)",
          },
          {
            step: "02",
            title: "3가지 질문",
            desc: "고민 분야 · 기분 · 리딩에서 원하는 것(통찰/행동/위로)",
          },
          {
            step: "03",
            title: "개인화 리딩",
            desc: "1장 또는 3장 스프레드 + 맞춤 해석과 기록 저장",
          },
        ].map((item) => (
          <div key={item.step} className="card-panel text-center">
            <div className="mb-2 text-xs tracking-widest text-amber-400/80">{item.step}</div>
            <h3 className="mb-2 font-semibold text-amber-100">{item.title}</h3>
            <p className="text-sm text-violet-300/90 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </section>

      <section className="card-panel animate-glow">
        <h2 className="mb-3 text-lg font-semibold text-amber-100">왜 별빛 타로인가요?</h2>
        <ul className="space-y-2 text-sm text-violet-200/90">
          <li>· 메이저 아르카나 22장의 고전 의미를 한국어로 제공합니다.</li>
          <li>· 온보딩 답변을 반영한 템플릿 기반 개인화 해석을 제공합니다.</li>
          <li>· 리딩 기록은 기기에 안전하게 저장되며, 언제든 다시 볼 수 있습니다.</li>
          <li>· 모바일에서도 편안하게 이용할 수 있는 미스티컬 UI입니다.</li>
        </ul>
      </section>

      <section className="text-center text-xs text-violet-500 pb-4">
        MVP 데모 · 실제 결제/서버 인증 없음 · 엔터테인먼트 목적
      </section>
    </div>
  );
}
