import type { Element } from "@/lib/saju/constants";
import type { Pillar } from "@/lib/saju/types";

export type ElementRelation =
  | "same"
  | "generates"
  | "generated_by"
  | "controls"
  | "controlled_by"
  | "neutral";

export interface DailyFortune {
  /** Asia/Seoul YYYY-MM-DD */
  dateYmd: string;
  dateLabel: string;
  /** 사용자 일간 오행 */
  dayMasterElement: Element;
  dayMasterLabel: string;
  dayMasterStem: string;
  /** 오늘 일주 */
  todayPillar: Pillar;
  todayElement: Element;
  todayElementLabel: string;
  relation: ElementRelation;
  relationLabel: string;
  /** 0–100 운세 점수 (결정적) */
  luckScore: number;
  energyTone: string;
  summary: string;
  focus: string;
  caution: string;
  seed: number;
}

export interface DailyTarotLock {
  dateYmd: string;
  cardId: number;
  readingId: string;
  lockedAt: string;
}
