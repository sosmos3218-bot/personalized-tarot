/**
 * 간지(干支) 사주 계산 — MVP
 *
 * 한계 (정직하게):
 * - 절(節)은 태양 황경 간략식. 한국천문연구원 시각과 수 시간 차이 날 수 있음.
 * - 출생 시각을 모르면 월·년주는 당일 12:00 KST로 비교.
 * - 시주: 진태양시(경도+균시차 근사) 후 야자시 규칙 적용 가능.
 * - 음력은 1900–2100 비트테이블; 지역 만세력과 하루 차이 날 수 있음.
 * - 십신·지장간·대운·신살(도화·화개·역마·공망·천을귀인)은 간이 규칙.
 */
import {
  BRANCHES,
  ELEMENT_LABELS,
  ELEMENT_TRAITS,
  STEMS,
  YIN_YANG_LABELS,
} from "./constants";
import { computeDaeun, formatDaeunCompact } from "./daeun";
import {
  formatHiddenStems,
  hiddenStemsForBranch,
} from "./jijanggan";
import {
  formatYmd,
  lunarToSolar,
  parseYmd,
  solarToLunar,
} from "./lunar";
import { computeSinsal, formatSinsalCompact } from "./sinsal";
import { monthBranchAtKst, sajuYearAtKst } from "./solarTerms";
import { pillarTenGods } from "./tenGods";
import {
  DEFAULT_LONGITUDE_E,
  shiftSolarDate,
  toTrueSolarTime,
  type TrueSolarResult,
} from "./trueSolar";
import { applyYajaRules, type YajaAdjustment } from "./yaja";
import {
  SAJU_DISCLAIMER,
  type DayMaster,
  type Gender,
  type JijangganSet,
  type Pillar,
  type PillarJijanggan,
  type SajuChart,
  type SajuInput,
  type SajuProfile,
  type TenGodSet,
} from "./types";

function julianDayNumber(y: number, m: number, d: number): number {
  const a = Math.floor((14 - m) / 12);
  const y2 = y + 4800 - a;
  const m2 = m + 12 * a - 3;
  return (
    d +
    Math.floor((153 * m2 + 2) / 5) +
    365 * y2 +
    Math.floor(y2 / 4) -
    Math.floor(y2 / 100) +
    Math.floor(y2 / 400) -
    32045
  );
}

function makePillar(stemIndex: number, branchIndex: number): Pillar {
  const stem = STEMS[((stemIndex % 10) + 10) % 10];
  const branch = BRANCHES[((branchIndex % 12) + 12) % 12];
  return {
    stemIndex: ((stemIndex % 10) + 10) % 10,
    branchIndex: ((branchIndex % 12) + 12) % 12,
    stemHan: stem.han,
    stemKo: stem.ko,
    branchHan: branch.han,
    branchKo: branch.ko,
    label: `${stem.han}${branch.han}(${stem.ko}${branch.ko})`,
  };
}

/** 일주: JDN + 49 ≡ 干支 index (0=甲子). 2000-01-01 = 戊午 검증됨 */
function dayPillar(y: number, m: number, d: number): Pillar {
  const idx = (((julianDayNumber(y, m, d) + 49) % 60) + 60) % 60;
  return makePillar(idx % 10, idx % 12);
}

/**
 * 연주: 입춘 이전이면 전년.
 * 연간지: (year - 4) % 10/12
 */
function yearPillar(
  y: number,
  m: number,
  d: number,
  hour: number,
  minute: number
): Pillar {
  const year = sajuYearAtKst(y, m, d, hour, minute);
  const stem = (((year - 4) % 10) + 10) % 10;
  const branch = (((year - 4) % 12) + 12) % 12;
  return makePillar(stem, branch);
}

/** 월지: 절(節) 황경 시각. 월간: 연간에 따른 오호둔(五虎遁) */
function monthPillar(
  y: number,
  m: number,
  d: number,
  hour: number,
  minute: number,
  yearStemIndex: number
): Pillar {
  const { branchIndex } = monthBranchAtKst(y, m, d, hour, minute);

  // 寅=2 가 첫 월(인월). 월 순서 offset from 寅:
  // 寅2,卯3,辰4,巳5,午6,未7,申8,酉9,戌10,亥11,子0,丑1
  const monthOrder = [11, 12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; // index by branch: 子→11 …
  const monthNum = monthOrder[branchIndex]; // 1=寅 … 12=丑

  // 五虎遁: 甲己→丙寅, 乙庚→戊寅, 丙辛→庚寅, 丁壬→壬寅, 戊癸→甲寅
  const yinStemByYearStem = [2, 4, 6, 8, 0, 2, 4, 6, 8, 0];
  const stem = (yinStemByYearStem[yearStemIndex] + (monthNum - 1)) % 10;
  return makePillar(stem, branchIndex);
}

/** 시주: 2시간 단위. 자시 23:00–00:59. 오서둔(五鼠遁) */
function hourPillar(
  dayStemIndex: number,
  hour: number,
  minute: number
): Pillar {
  const totalMin = hour * 60 + minute;
  // 23:00–00:59 → 子(0); 01:00–02:59 → 丑(1); …
  let branchIndex: number;
  if (totalMin >= 23 * 60 || totalMin < 60) branchIndex = 0;
  else branchIndex = Math.floor((totalMin - 60) / 120) + 1;

  // 甲己→甲, 乙庚→丙, 丙辛→戊, 丁壬→庚, 戊癸→壬
  const ziStemByDayStem = [0, 2, 4, 6, 8, 0, 2, 4, 6, 8];
  const stem = (ziStemByDayStem[dayStemIndex] + branchIndex) % 10;
  return makePillar(stem, branchIndex);
}

function dayMasterFromStem(stemIndex: number): DayMaster {
  const stem = STEMS[stemIndex];
  return {
    stemIndex,
    stemHan: stem.han,
    stemKo: stem.ko,
    yinYang: stem.yinYang,
    yinYangLabel: YIN_YANG_LABELS[stem.yinYang],
    element: stem.element,
    elementLabel: ELEMENT_LABELS[stem.element],
    elementTrait: ELEMENT_TRAITS[stem.element],
  };
}

function pillarJijanggan(p: Pillar): PillarJijanggan {
  return {
    branchHan: p.branchHan,
    branchKo: p.branchKo,
    stems: hiddenStemsForBranch(p.branchIndex),
    compact: formatHiddenStems(p.branchIndex),
  };
}

function resolveSolarDate(input: SajuInput): {
  y: number;
  m: number;
  d: number;
  solarDate: string;
  lunarDate?: string;
} {
  const { y, m, d } = parseYmd(input.birthDate);
  if (y < 1900 || y > 2100) {
    throw new Error("생년은 1900–2100년만 지원합니다.");
  }

  if (input.calendarType === "lunar") {
    const solar = lunarToSolar(y, m, d, false);
    return {
      y: solar.y,
      m: solar.m,
      d: solar.d,
      solarDate: formatYmd(solar.y, solar.m, solar.d),
      lunarDate: formatYmd(y, m, d),
    };
  }

  let lunarDate: string | undefined;
  try {
    const lunar = solarToLunar(y, m, d);
    lunarDate = `${formatYmd(lunar.y, lunar.m, lunar.d)}${lunar.leap ? "(윤)" : ""}`;
  } catch {
    lunarDate = undefined;
  }

  return { y, m, d, solarDate: formatYmd(y, m, d), lunarDate };
}

export function computeSaju(input: SajuInput): SajuChart {
  const resolved = resolveSolarDate(input);
  let { y, m, d, solarDate } = resolved;
  const { lunarDate } = resolved;

  let hh = 12;
  let mm = 0;
  let hour: Pillar | null = null;
  let trueSolar: TrueSolarResult | null = null;
  let yaja: YajaAdjustment | null = null;
  const timeUnknown = Boolean(input.timeUnknown) || !input.birthTime;
  if (!timeUnknown && input.birthTime) {
    const tm = /^(\d{1,2}):(\d{2})$/.exec(input.birthTime.trim());
    if (!tm) throw new Error("출생 시각은 HH:mm 형식이어야 합니다.");
    hh = Number(tm[1]);
    mm = Number(tm[2]);
    if (hh < 0 || hh > 23 || mm < 0 || mm > 59) {
      throw new Error("출생 시각이 올바르지 않습니다.");
    }

    const lon =
      typeof input.longitudeE === "number" && Number.isFinite(input.longitudeE)
        ? input.longitudeE
        : DEFAULT_LONGITUDE_E;
    const useTrue = input.useTrueSolar !== false;
    if (useTrue) {
      trueSolar = toTrueSolarTime(y, m, d, hh, mm, lon);
      hh = trueSolar.hour;
      mm = trueSolar.minute;
      if (trueSolar.dayDelta !== 0) {
        const shifted = shiftSolarDate(y, m, d, trueSolar.dayDelta);
        y = shifted.y;
        m = shifted.m;
        d = shifted.d;
        solarDate = formatYmd(y, m, d);
      }
    }

    const yajaMode = input.yajaMode ?? "next_day";
    yaja = applyYajaRules(y, m, d, hh, mm, yajaMode);
    if (yaja.applied) {
      y = yaja.y;
      m = yaja.m;
      d = yaja.d;
      solarDate = formatYmd(y, m, d);
    }
  }

  const year = yearPillar(y, m, d, hh, mm);
  const month = monthPillar(y, m, d, hh, mm, year.stemIndex);
  const day = dayPillar(y, m, d);
  const dm = dayMasterFromStem(day.stemIndex);

  if (!timeUnknown) {
    hour = hourPillar(day.stemIndex, hh, mm);
  }

  const tenGods: TenGodSet = {
    year: pillarTenGods(day.stemIndex, year.stemIndex, year.branchIndex),
    month: pillarTenGods(day.stemIndex, month.stemIndex, month.branchIndex),
    day: pillarTenGods(day.stemIndex, day.stemIndex, day.branchIndex),
    hour: hour
      ? pillarTenGods(day.stemIndex, hour.stemIndex, hour.branchIndex)
      : null,
  };

  const jijanggan: JijangganSet = {
    year: pillarJijanggan(year),
    month: pillarJijanggan(month),
    day: pillarJijanggan(day),
    hour: hour ? pillarJijanggan(hour) : null,
  };

  const gender: Gender = input.gender ?? "unspecified";

  const daeun = computeDaeun({
    yearStemIndex: year.stemIndex,
    monthPillar: month,
    gender,
    y,
    m,
    d,
    hour: hh,
    minute: mm,
    count: 10,
  });

  const sinsal = computeSinsal({
    dayStemIndex: day.stemIndex,
    dayBranchIndex: day.branchIndex,
    year,
    month,
    day,
    hour,
  });

  return {
    year,
    month,
    day,
    hour,
    dayMaster: dm,
    solarDate,
    lunarDate,
    calendarType: input.calendarType,
    birthTime: timeUnknown ? null : input.birthTime ?? null,
    timeUnknown,
    gender,
    tenGods,
    jijanggan,
    daeun,
    sinsal,
    trueSolar,
    yaja,
    disclaimer: SAJU_DISCLAIMER,
    computedAt: new Date().toISOString(),
  };
}

export function formatSajuSummary(chart: SajuChart): string {
  const dm = chart.dayMaster;
  const pillars = [
    `년 ${chart.year.label}`,
    `월 ${chart.month.label}`,
    `일 ${chart.day.label}`,
  ];
  if (chart.hour) pillars.push(`시 ${chart.hour.label}`);
  return (
    `일간 ${dm.stemHan}(${dm.stemKo}) · ${dm.yinYangLabel} · ${dm.elementLabel}` +
    ` — ${pillars.join(" / ")}`
  );
}

export function buildSajuProfile(input: SajuInput): SajuProfile {
  const chart = computeSaju(input);
  return {
    input: {
      ...input,
      gender: input.gender ?? "unspecified",
      timeUnknown: Boolean(input.timeUnknown) || !input.birthTime,
    },
    chart,
    summaryText: formatSajuSummary(chart),
    updatedAt: new Date().toISOString(),
  };
}

/** AI 프롬프트·템플릿용 짧은 블록 */
export function sajuPromptBlock(profile: SajuProfile | null | undefined): string {
  if (!profile?.chart) return "사주 정보 없음";
  const c = profile.chart;
  const dm = c.dayMaster;
  const jj = c.jijanggan;
  const lines = [
    `일간(日干): ${dm.stemHan}(${dm.stemKo}) / ${dm.yinYangLabel} / ${dm.elementLabel} — ${dm.elementTrait}`,
    `년주: ${c.year.label}`,
    `월주: ${c.month.label}`,
    `일주: ${c.day.label}`,
    c.hour ? `시주: ${c.hour.label}` : "시주: 미상(출생 시각 없음)",
    c.tenGods
      ? `십신(천간/지지정기): 년 ${c.tenGods.year.stemKo}/${c.tenGods.year.branchKo} · 월 ${c.tenGods.month.stemKo}/${c.tenGods.month.branchKo} · 일 ${c.tenGods.day.stemKo}/${c.tenGods.day.branchKo}${c.tenGods.hour ? ` · 시 ${c.tenGods.hour.stemKo}/${c.tenGods.hour.branchKo}` : ""}`
      : null,
    jj
      ? `지장간: 년 ${jj.year.compact} · 월 ${jj.month.compact} · 일 ${jj.day.compact}${jj.hour ? ` · 시 ${jj.hour.compact}` : ""}`
      : null,
    formatDaeunCompact(c.daeun ?? null),
    formatSinsalCompact(c.sinsal),
    c.trueSolar
      ? `진태양시: ${String(c.trueSolar.hour).padStart(2, "0")}:${String(c.trueSolar.minute).padStart(2, "0")} (보정 ${c.trueSolar.totalOffsetMin}분, 경도 ${c.trueSolar.longitudeE}°E)`
      : null,
    c.yaja?.applied ? `야자시: ${c.yaja.label} — ${c.yaja.note}` : null,
    `양력 기준일: ${c.solarDate}`,
    c.calendarType === "lunar" && c.lunarDate
      ? `입력 음력: ${c.lunarDate}`
      : null,
    `성별: ${
      c.gender === "female" ? "여" : c.gender === "male" ? "남" : "미지정"
    }`,
    `고지: ${SAJU_DISCLAIMER}`,
  ];
  return lines.filter(Boolean).join("\n");
}

/** 양력 YYYY-MM-DD의 일주(日柱) — 오늘의 운세 등에서 재사용 */
export function getDayPillarForSolarDate(ymd: string): Pillar {
  const { y, m, d } = parseYmd(ymd);
  return dayPillar(y, m, d);
}
