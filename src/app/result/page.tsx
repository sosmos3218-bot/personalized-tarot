"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import AuthGate from "@/components/AuthGate";
import TarotCardFace from "@/components/TarotCardFace";
import { SAJU_DISCLAIMER } from "@/lib/saju";
import type { SajuProfile } from "@/lib/saju";
import {
  getHistory,
  getLastReading,
  getSajuProfile,
  updateReadingInterpretation,
} from "@/lib/storage";
import type { ReadingResult } from "@/lib/types";
import {
  CONCERN_LABELS,
  GOAL_LABELS,
  MOOD_LABELS,
  SPREAD_LABELS,
} from "@/lib/types";

export default function ResultPage() {
  return (
    <AuthGate requireSaju>
      <Suspense
        fallback={
          <p className="text-center text-body animate-pulse">불러오는 중…</p>
        }
      >
        <ResultContent />
      </Suspense>
    </AuthGate>
  );
}
