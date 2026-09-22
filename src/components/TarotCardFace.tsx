"use client";

import type { TarotCard } from "@/lib/types";

interface Props {
  card: TarotCard;
  positionLabel?: string;
  revealed?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "w-24 h-36 text-[10px]",
  md: "w-32 h-48 text-xs",
  lg: "w-40 h-60 text-sm",
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
        <span className="text-xs tracking-widest text-amber-300/80 uppercase">
          {positionLabel}
        </span>
      )}
      <div
        className={`relative ${sizeClasses[size]} rounded-xl border transition-all duration-700 preserve-3d ${
          revealed
            ? "border-amber-400/50 bg-gradient-to-b from-[#2a1a4a] via-[#1a0f2e] to-[#0d0818] shadow-[0_0_30px_rgba(167,139,250,0.25)]"
            : "border-violet-800 bg-gradient-to-br from-violet-950 to-indigo-950"
        }`}
      >
        {revealed ? (
          <div className="flex h-full flex-col items-center justify-between p-3 text-center">
            <div className="text-[10px] text-violet-300/70">{card.nameEn}</div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl text-amber-300" aria-hidden>
                ✦
              </span>
              <span className="font-semibold text-amber-100 leading-tight">{card.nameKo}</span>
              <span className="text-[10px] text-violet-300">No. {String(card.id).padStart(2, "0")}</span>
            </div>
            <div className="text-[9px] leading-snug text-violet-300/80 line-clamp-2">
              {card.keywords.join(" · ")}
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="h-[85%] w-[85%] rounded-lg border border-violet-700/50 bg-[radial-gradient(circle_at_center,_#4c1d95_0%,_#1e1b4b_60%,_#0f0a1a_100%)] flex items-center justify-center">
              <span className="text-3xl text-violet-400/60" aria-hidden>
                ✧
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
