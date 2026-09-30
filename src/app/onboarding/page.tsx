"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import AuthGate from "@/components/AuthGate";
import ProgressSteps from "@/components/ProgressSteps";
import { saveOnboarding } from "@/lib/storage";
import type {
  ConcernCategory,
  MoodFeeling,
  ReadingGoal,
} from "@/lib/types";
import {
  CONCERN_LABELS,
  DEFAULT_ONBOARDING,
  MOOD_LABELS,
  GOAL_LABELS,
} from "@/lib/types";

const CONCERNS = Object.keys(CONCERN_LABELS) as ConcernCategory[];
const MOODS = Object.keys(MOOD_LABELS) as MoodFeeling[];
const GOALS = Object.keys(GOAL_LABELS) as ReadingGoal[];

export default function OnboardingPage() {
  return (
    <AuthGate requireSaju>
      <Suspense
        fallback={
          <p className="text-center text-body animate-pulse">불러오는 중…</p>
        }
      >
        <OnboardingForm />
      </Suspense>
    </AuthGate>
  );
}

function OnboardingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userId } = useAuth();
  const soft = searchParams.get("soft") === "1";
  const from = searchParams.get("from");
  const [step, setStep] = useState(0);
  const [concern, setConcern] = useState<ConcernCategory | null>(null);
  const [mood, setMood] = useState<MoodFeeling | null>(null);
  const [goal, setGoal] = useState<ReadingGoal | null>(null);

  function finish() {
    if (!concern || !mood || !goal) return;
    saveOnboarding({ concern, mood, goal }, userId);
    if (from && from.startsWith("/") && !from.startsWith("//")) {
      router.push(from);
    } else {
      router.push("/draw");
    }
  }

  function skipToToday() {
    // 기본값 저장해 두면 나중에 뽑기에서도 막히지 않음
    saveOnboarding(DEFAULT_ONBOARDING, userId);
    router.push("/today");
  }

  function skipWithDefaults() {
    saveOnboarding(DEFAULT_ONBOARDING, userId);
    if (from && from.startsWith("/") && !from.startsWith("//")) {
      router.push(from);
    } else {
      router.push("/draw");
    }
  }

  const titles = [
    "지금 마음에 걸리는 주제는?",
    "오늘의 기분은?",
    "리딩에서 원하는 것은?",
  ];

  return (
    <div className="mx-auto max-w-lg space-y-6 animate-fade-up">
      <ProgressSteps current="reading" done={["saju", "today"]} />

      <div className="text-center">
        <p className="text-[11px] tracking-[0.22em] text-accent font-medium">
          맞춤 리딩 {step + 1} / 3
        </p>
        <h1 className="mt-2 text-xl font-bold text-heading sm:text-2xl leading-snug px-1">
          {titles[step]}
        </h1>
        <p className="mt-2 text-sm text-body px-2 leading-relaxed">
          {soft
            ? "맞춤 해석을 위해 짧게 알려 주세요. 건너뛰고 바로 뽑을 수도 있어요."
            : "선택하면 타로+사주 퓨전 해석이 더 잘 맞아요. 오늘의 운세만 보려면 건너뛰세요."}
        </p>
        <div className="mx-auto mt-4 flex max-w-xs gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`progress-track ${i <= step ? "progress-fill" : ""}`}
            />
          ))}
        </div>
      </div>

      <div className="card-panel space-y-2.5 !p-4 sm:!p-5">
        {step === 0 &&
          CONCERNS.map((key) => (
            <ChoiceButton
              key={key}
              selected={concern === key}
              label={CONCERN_LABELS[key]}
              onClick={() => setConcern(key)}
            />
          ))}
        {step === 1 &&
          MOODS.map((key) => (
            <ChoiceButton
              key={key}
              selected={mood === key}
              label={MOOD_LABELS[key]}
              onClick={() => setMood(key)}
            />
          ))}
        {step === 2 &&
          GOALS.map((key) => (
            <ChoiceButton
              key={key}
              selected={goal === key}
              label={GOAL_LABELS[key]}
              onClick={() => setGoal(key)}
            />
          ))}
      </div>

      <div className="flex gap-3">
        {step > 0 && (
          <button
            type="button"
            className="btn-secondary flex-1"
            onClick={() => setStep(step - 1)}
          >
            이전
          </button>
        )}
        {step < 2 ? (
          <button
            type="button"
            className="btn-primary flex-1"
            disabled={(step === 0 && !concern) || (step === 1 && !mood)}
            onClick={() => setStep(step + 1)}
          >
            다음
          </button>
        ) : (
          <button
            type="button"
            className="btn-primary flex-1"
            disabled={!goal}
            onClick={finish}
          >
            카드 뽑으러 가기
          </button>
        )}
      </div>

      <div className="flex flex-col items-center gap-2 pt-1">
        <button
          type="button"
          className="text-sm text-muted hover:text-heading transition-colors underline-offset-2 hover:underline"
          onClick={skipToToday}
        >
          건너뛰고 오늘의 운세만 보기
        </button>
        {soft && (
          <button
            type="button"
            className="text-xs text-muted hover:text-heading transition-colors"
            onClick={skipWithDefaults}
          >
            기본값으로 바로 뽑기
          </button>
        )}
        <Link
          href="/today"
          className="text-xs text-muted hover:text-accent transition-colors"
        >
          오늘의 운세로 돌아가기
        </Link>
      </div>
    </div>
  );
}

function ChoiceButton({
  selected,
  label,
  onClick,
}: {
  selected: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`choice-btn ${selected ? "choice-btn-selected" : ""}`}
    >
      {label}
    </button>
  );
}
