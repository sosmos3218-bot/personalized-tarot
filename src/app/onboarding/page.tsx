"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthGate from "@/components/AuthGate";
import { saveOnboarding } from "@/lib/storage";
import type {
  ConcernCategory,
  MoodFeeling,
  ReadingGoal,
} from "@/lib/types";
import { CONCERN_LABELS, MOOD_LABELS, GOAL_LABELS } from "@/lib/types";

const CONCERNS = Object.keys(CONCERN_LABELS) as ConcernCategory[];
const MOODS = Object.keys(MOOD_LABELS) as MoodFeeling[];
const GOALS = Object.keys(GOAL_LABELS) as ReadingGoal[];

export default function OnboardingPage() {
  return (
    <AuthGate>
      <OnboardingForm />
    </AuthGate>
  );
}

function OnboardingForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [concern, setConcern] = useState<ConcernCategory | null>(null);
  const [mood, setMood] = useState<MoodFeeling | null>(null);
  const [goal, setGoal] = useState<ReadingGoal | null>(null);

  function finish() {
    if (!concern || !mood || !goal) return;
    saveOnboarding({ concern, mood, goal });
    router.push("/draw");
  }

  const titles = [
    "지금 가장 마음에 걸리는 주제는?",
    "오늘의 기분은 어떤가요?",
    "이번 리딩에서 무엇을 원하시나요?",
  ];

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="text-center">
        <p className="text-xs tracking-widest text-amber-300/70">
          ONBOARDING {step + 1} / 3
        </p>
        <h1 className="mt-2 text-xl font-bold text-amber-100 sm:text-2xl">
          {titles[step]}
        </h1>
        <div className="mx-auto mt-4 flex max-w-xs gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full ${
                i <= step ? "bg-amber-400" : "bg-violet-900"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="card-panel space-y-3">
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
          <button type="button" className="btn-secondary flex-1" onClick={() => setStep(step - 1)}>
            이전
          </button>
        )}
        {step < 2 ? (
          <button
            type="button"
            className="btn-primary flex-1"
            disabled={
              (step === 0 && !concern) || (step === 1 && !mood)
            }
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
      className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition ${
        selected
          ? "border-amber-400/70 bg-violet-800/50 text-amber-100"
          : "border-violet-800/60 bg-[#12081f]/60 text-violet-200 hover:border-violet-500"
      }`}
    >
      {label}
    </button>
  );
}
