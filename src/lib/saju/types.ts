import type { Element, YinYang } from "./constants";

export type CalendarType = "solar" | "lunar";
export type Gender = "female" | "male" | "unspecified";

export interface Pillar {
  stemIndex: number;
  branchIndex: number;
  stemHan: string;
  stemKo: string;
  branchHan: string;
  branchKo: string;
  label: string;
}

export interface DayMaster {
  stemIndex: number;
  stemHan: string;
  stemKo: string;
  yinYang: YinYang;
  yinYangLabel: string;
  element: Element;
  elementLabel: string;
  elementTrait: string;
}

export interface SajuInput {
  /** YYYY-MM-DD (양력 또는 음력, calendarType에 따름) */
  birthDate: string;
  /** HH:mm, 없으면 시주 생략 */
  birthTime?: string | null;
  timeUnknown?: boolean;
  gender?: Gender;
  calendarType: CalendarType;
}

export interface SajuChart {
  year: Pillar;
  month: Pillar;
  day: Pillar;
  hour: Pillar | null;
  dayMaster: DayMaster;
  /** 계산에 사용한 양력 날짜 YYYY-MM-DD */
  solarDate: string;
  /** 입력 음력 날짜 (해당 시) */
  lunarDate?: string;
  calendarType: CalendarType;
  birthTime?: string | null;
  timeUnknown: boolean;
  gender: Gender;
  /** MVP 한계 고지 */
  disclaimer: string;
  computedAt: string;
}

export interface SajuProfile {
  input: SajuInput;
  chart: SajuChart;
  /** 해석/UI용 한 줄 요약 */
  summaryText: string;
  updatedAt: string;
}

export const SAJU_DISCLAIMER =
  "MVP 만세력은 참고용입니다. 절기·시차·윤달·야자시 등을 단순화했으며, 전문 명리·상담을 대체하지 않습니다.";
