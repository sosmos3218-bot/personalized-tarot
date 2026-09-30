import type { Element, YinYang } from "./constants";
import type { HiddenStem } from "./jijanggan";

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

export interface PillarTenGods {
  /** 천간 십신 */
  stemKo: string;
  stemHan: string;
  /** 지지 정기(本氣) 십신 */
  branchKo: string;
  branchHan: string;
}

export interface TenGodSet {
  year: PillarTenGods;
  month: PillarTenGods;
  day: PillarTenGods;
  hour: PillarTenGods | null;
}

export interface PillarJijanggan {
  branchHan: string;
  branchKo: string;
  /** 여기 → 중기 → 본기 */
  stems: HiddenStem[];
  /** 짧은 표기 예: 戊(여) · 丙(중) · 甲(본) */
  compact: string;
}

export interface JijangganSet {
  year: PillarJijanggan;
  month: PillarJijanggan;
  day: PillarJijanggan;
  hour: PillarJijanggan | null;
}

export type DaeunDirection = "forward" | "backward";

export interface DaeunPillarInfo {
  /** 0부터 */
  index: number;
  stemIndex: number;
  branchIndex: number;
  stemHan: string;
  stemKo: string;
  branchHan: string;
  branchKo: string;
  label: string;
  /** 만 나이 시작(포함) */
  ageFrom: number;
  /** 만 나이 끝(포함) */
  ageTo: number;
}

export interface DaeunSet {
  direction: DaeunDirection;
  directionLabel: string;
  /** 연간 음양 */
  yearStemYinYang: YinYang;
  startAge: number;
  /** 절입까지 일수(근사) */
  daysToBoundary: number;
  boundaryTermName: string;
  pillars: DaeunPillarInfo[];
}

export interface SajuChart {
  year: Pillar;
  month: Pillar;
  day: Pillar;
  hour: Pillar | null;
  dayMaster: DayMaster;
  /** 일간 기준 십신. 구 저장본에는 없을 수 있음 */
  tenGods?: TenGodSet;
  /** 지지 지장간. 구 저장본에는 없을 수 있음 */
  jijanggan?: JijangganSet;
  /** 대운. 성별 미지정이면 null */
  daeun?: DaeunSet | null;
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
  "MVP 만세력은 참고용입니다. 절기는 태양 황경 근사(수 시간 오차 가능)이고, 시각을 모르면 정오로 경계를 보며, 십신은 천간·지지 정기, 지장간·대운은 간이 규칙입니다. 대운 시작 나이는 절입 일수÷3 근사입니다. 진태양시·야자시·신살은 반영하지 않으며 전문 명리·상담을 대체하지 않습니다.";
