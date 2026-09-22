"use client";

import type { TarotCard } from "@/lib/types";

interface Props {
  card: TarotCard;
  positionLabel?: string;
  revealed?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "w-[5.5rem] h-[8.25rem] sm:w-24 sm:h-36 text-[10px]",
  md: "w-28 h-[10.5rem] sm:w-32 sm:h-48 text-xs",
  lg: "w-36 h-[13.5rem] sm:w-40 sm:h-60 text-sm",
};

export default function TarotCardFace({
  card,
  positionLabel,
  revealed = true,
  size = "md",
}: Props) {
  return (
    <div className="flex flex-col items-center gap-2">
      {positionLabel && (
        <span className="text-[10px] sm:text-xs tracking-[0.2em] text-accent uppercase font-medium">
          {positionLabel}
        </span>
      )}
      <div
        className={`relative ${sizeClasses[size]} rounded-xl border transition-all duration-500 ${
          revealed
            ? "animate-card-reveal shadow-[0_12px_32px_rgba(42,31,61,0.18)] dark:shadow-[0_0_30px_rgba(167,139,250,0.25)]"
            : ""
        }`}
        style={{
          borderColor: revealed
            ? "var(--card-face-border)"
            : "var(--card-back-border)",
          background: revealed
            ? "linear-gradient(180deg, #3d2a5c 0%, #2a1a4a 45%, #140a24 100%)"
            : "linear-gradient(145deg, #4c1d95 0%, #1e1b4b 55%, #0f0a1a 100%)",
        }}
      >
        {revealed ? (
          <div className="flex h-full flex-col items-center justify-between p-2.5 sm:p-3 text-center">
            <div className="text-[9px] sm:text-[10px] text-violet-300/80 tracking-wide">
              {card.nameEn}
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-xl sm:text-2xl text-amber-300" aria-hidden>
                ✦
              </span>
              <span className="font-semibold text-amber-50 leading-tight">
                {card.nameKo}
              </span>
              <span className="text-[9px] sm:text-[10px] text-violet-300">
                No. {String(card.id).padStart(2, "0")}
              </span>
            </div>
            <div className="text-[8px] sm:text-[9px] leading-snug text-violet-300/85 line-clamp-2">
              {card.keywords.join(" · ")}
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="flex h-[85%] w-[85%] items-center justify-center rounded-lg border border-violet-600/40 bg-[radial-gradient(circle_at_center,_#6d28d9_0%,_#1e1b4b_55%,_#0f0a1a_100%)]">
              <span className="text-3xl text-violet-300/50" aria-hidden>
                ✧
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
