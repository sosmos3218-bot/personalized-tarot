"use client";

export type FlowStep = "saju" | "today" | "reading";

const STEPS: { id: FlowStep; label: string; hint: string }[] = [
  { id: "saju", label: "기운", hint: "출생 정보" },
  { id: "today", label: "오늘의 운세", hint: "일일 리포트" },
  { id: "reading", label: "맞춤 리딩", hint: "선택" },
];

interface Props {
  current: FlowStep;
  /** completed steps (or steps before current are treated done) */
  done?: FlowStep[];
  className?: string;
}

function stepIndex(id: FlowStep): number {
  return STEPS.findIndex((s) => s.id === id);
}

export default function ProgressSteps({
  current,
  done = [],
  className = "",
}: Props) {
  const currentIdx = stepIndex(current);

  return (
    <nav
      aria-label="이용 단계"
      className={`mx-auto w-full max-w-md ${className}`}
    >
      <ol className="flex items-start gap-1 sm:gap-2">
        {STEPS.map((step, i) => {
          const isCurrent = step.id === current;
          const isDone =
            done.includes(step.id) || (currentIdx >= 0 && i < currentIdx);
          return (
            <li key={step.id} className="flex flex-1 flex-col items-center gap-1.5">
              <div className="flex w-full items-center gap-1">
                {i > 0 && (
                  <div
                    className={`progress-track h-0.5 !flex-1 ${
                      isDone || isCurrent ? "progress-fill" : ""
                    }`}
                    aria-hidden
                  />
                )}
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold tabular-nums ${
                    isCurrent
                      ? "text-white"
                      : isDone
                        ? "text-white"
                        : "text-muted"
                  }`}
                  style={{
                    background: isCurrent
                      ? "var(--accent-violet-soft)"
                      : isDone
                        ? "var(--accent-gold-bright)"
                        : "var(--chip-bg)",
                    border: isCurrent || isDone ? "none" : "1px solid var(--border)",
                  }}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  {isDone && !isCurrent ? "✓" : i + 1}
                </span>
                {i < STEPS.length - 1 && (
                  <div
                    className={`progress-track h-0.5 !flex-1 ${
                      isDone ? "progress-fill" : ""
                    }`}
                    aria-hidden
                  />
                )}
              </div>
              <div className="px-0.5 text-center">
                <p
                  className={`text-[11px] sm:text-xs font-medium leading-tight ${
                    isCurrent ? "text-heading" : "text-muted"
                  }`}
                >
                  {step.label}
                </p>
                <p className="hidden sm:block text-[10px] text-muted mt-0.5">
                  {step.hint}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
      <p className="mt-2 text-center text-[11px] text-muted leading-relaxed">
        출생 기운 등록 후{" "}
        <strong className="font-medium text-heading">오늘의 운세</strong>를
        먼저 볼 수 있어요. 맞춤 리딩은 선택입니다.
      </p>
    </nav>
  );
}
