/**
 * 음력↔양력 변환 (1900–2100)
 * 표준 비트테이블 기반. 윤달·날짜 범위 검증 포함.
 */
import { LUNAR_BASE_YEAR, LUNAR_INFO, LUNAR_MAX_YEAR } from "./constants";

function leapMonth(year: number): number {
  return LUNAR_INFO[year - LUNAR_BASE_YEAR] & 0xf;
}

function leapDays(year: number): number {
  if (leapMonth(year)) {
    return LUNAR_INFO[year - LUNAR_BASE_YEAR] & 0x10000 ? 30 : 29;
  }
  return 0;
}

function monthDays(year: number, month: number): number {
  return LUNAR_INFO[year - LUNAR_BASE_YEAR] & (0x10000 >> month) ? 30 : 29;
}

function yearDays(year: number): number {
  let sum = 348;
  for (let i = 0x8000; i > 0x8; i >>= 1) {
    sum += LUNAR_INFO[year - LUNAR_BASE_YEAR] & i ? 1 : 0;
  }
  return sum + leapDays(year);
}

/** 1900-01-31 이 음력 1900-01-01에 해당 (전통 테이블 기준) */
const BASE_SOLAR = Date.UTC(1900, 0, 31);

function utcYmd(y: number, m: number, d: number): number {
  return Date.UTC(y, m - 1, d);
}

function fromUtc(ms: number): { y: number; m: number; d: number } {
  const dt = new Date(ms);
  return {
    y: dt.getUTCFullYear(),
    m: dt.getUTCMonth() + 1,
    d: dt.getUTCDate(),
  };
}

export function isLunarYearSupported(year: number): boolean {
  return year >= LUNAR_BASE_YEAR && year <= LUNAR_MAX_YEAR;
}

/**
 * 음력 → 양력
 * @param leap 윤달 여부 (해당 연에 그 윤달이 있을 때만)
 */
export function lunarToSolar(
  year: number,
  month: number,
  day: number,
  leap = false
): { y: number; m: number; d: number } {
  if (!isLunarYearSupported(year)) {
    throw new Error("음력 변환은 1900–2100년만 지원합니다.");
  }
  if (month < 1 || month > 12 || day < 1 || day > 30) {
    throw new Error("음력 날짜가 올바르지 않습니다.");
  }

  let offset = 0;
  for (let y = LUNAR_BASE_YEAR; y < year; y++) {
    offset += yearDays(y);
  }

  const leapM = leapMonth(year);
  for (let m = 1; m < month; m++) {
    offset += monthDays(year, m);
    if (leapM === m) offset += leapDays(year);
  }

  if (leap) {
    if (leapM !== month) {
      throw new Error("해당 연도에는 선택하신 윤달이 없습니다.");
    }
    offset += monthDays(year, month);
  }

  const maxDay = leap ? leapDays(year) : monthDays(year, month);
  if (day > maxDay) {
    throw new Error(`해당 음력 월은 ${maxDay}일까지입니다.`);
  }

  offset += day - 1;
  return fromUtc(BASE_SOLAR + offset * 86400000);
}

/** 양력 → 음력 (표시용) */
export function solarToLunar(
  year: number,
  month: number,
  day: number
): { y: number; m: number; d: number; leap: boolean } {
  if (year < LUNAR_BASE_YEAR || year > LUNAR_MAX_YEAR) {
    throw new Error("음력 변환은 1900–2100년만 지원합니다.");
  }

  let offset = Math.floor((utcYmd(year, month, day) - BASE_SOLAR) / 86400000);
  if (offset < 0) {
    throw new Error("1900-01-31 이전 날짜는 지원하지 않습니다.");
  }

  let y = LUNAR_BASE_YEAR;
  let daysInYear = yearDays(y);
  while (offset >= daysInYear && y < LUNAR_MAX_YEAR) {
    offset -= daysInYear;
    y++;
    daysInYear = yearDays(y);
  }

  const leapM = leapMonth(y);
  let m = 1;
  let leap = false;
  while (m <= 12) {
    const md = monthDays(y, m);
    if (offset < md) break;
    offset -= md;
    if (leapM === m) {
      const ld = leapDays(y);
      if (offset < ld) {
        leap = true;
        break;
      }
      offset -= ld;
    }
    m++;
  }

  return { y, m, d: offset + 1, leap };
}

export function formatYmd(y: number, m: number, d: number): string {
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export function parseYmd(iso: string): { y: number; m: number; d: number } {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!m) throw new Error("날짜 형식이 올바르지 않습니다. (YYYY-MM-DD)");
  return { y: Number(m[1]), m: Number(m[2]), d: Number(m[3]) };
}
