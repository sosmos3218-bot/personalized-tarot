import type { Element, YinYang } from "./constants";
import type { HiddenStem } from "./jijanggan";
import type { SinsalSet } from "./sinsal";
import type { TrueSolarResult } from "./trueSolar";
import type { YajaAdjustment, YajaMode } from "./yaja";

export type CalendarType = "solar" | "lunar";
export type Gender = "female" | "male" | "unspecified";
export type { YajaMode } from "./yaja";
export type { SinsalSet, SinsalHit } from "./sinsal";
export type { TrueSolarResult } from "./trueSolar";

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
  /** YYYY-MM-DD */
  birthDate: string;
  /** HH:mm */
  birthTime?: string | null;
  timeUnknown?: boolean;
  gender?: Gender;
  calendarType: CalendarType;
  longitudeE?: number | null;
  useTrueSolar?: boolean;
  yajaMode?: YajaMode;
}

export interface PillarTenGods {
  stemKo: string;
  stemHan: string;
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
  stems: HiddenStem[];
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
  index: number;
  stemIndex: number;
  branchIndex: number;
  stemHan: string;
  stemKo: string;
  branchHan: string;
  branchKo: string;
  label: string;
  ageFrom: number;
  ageTo: number;
}

export interface DaeunSet {
  direction: DaeunDirection;
  directionLabel: string;
  yearStemYinYang: YinYang;
  startAge: number;
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
  tenGods?: TenGodSet;
  jijanggan?: JijangganSet;
  daeun?: DaeunSet | null;
  sinsal?: SinsalSet;
  trueSolar?: TrueSolarResult | null;
  yaja?: YajaAdjustment | null;
  solarDate: string;
  lunarDate?: string;
  calendarType: CalendarType;
  birthTime?: string | null;
  timeUnknown: boolean;
  gender: Gender;
  disclaimer: string;
  computedAt: string;
}

export interface SajuProfile {
  input: SajuInput;
  chart: SajuChart;
  summaryText: string;
  updatedAt: string;
}

export const SAJU_DISCLAIMER =
  "\ucd9c\uc0dd \uc815\ubcf4\ub85c \uacc4\uc0b0\ud55c \ucc38\uace0\uc6a9 \ud750\ub984\uc785\ub2c8\ub2e4. \uc804\ubb38 \uba85\ub9ac\u00b7\uc0c1\ub2f4\uc744 \ub300\uccb4\ud558\uc9c0 \uc54a\uc544\uc694.";
