/**
 * 절(節) 시각 — 태양 황경 근사 (Meeus 간략식).
 * 한국천문연구원 발표와 수 시간 차이 날 수 있음. 참고용.
 */
export interface JieTerm {
  name: string;
  longitude: number;
  /** 이 절 이후 월지의 지지 index */
  branchIndex: number;
  /** Julian Date (UT, 연속) */
  jd: number;
  /** 한국 표준시 */
  kstYear: number;
  kstMonth: number;
  kstDay: number;
  kstHour: number;
  kstMinute: number;
}

/** 월주를 바꾸는 12절. month/day는 탐색 시작용 근사 */
const JIE_DEFS: {
  name: string;
  lon: number;
  branchIndex: number;
  month: number;
  day: number;
}[] = [
  { name: "소한", lon: 285, branchIndex: 1, month: 1, day: 6 },
  { name: "입춘", lon: 315, branchIndex: 2, month: 2, day: 4 },
  { name: "경칩", lon: 345, branchIndex: 3, month: 3, day: 6 },
  { name: "청명", lon: 15, branchIndex: 4, month: 4, day: 5 },
  { name: "입하", lon: 45, branchIndex: 5, month: 5, day: 6 },
  { name: "망종", lon: 75, branchIndex: 6, month: 6, day: 6 },
  { name: "소서", lon: 105, branchIndex: 7, month: 7, day: 7 },
  { name: "입추", lon: 135, branchIndex: 8, month: 8, day: 8 },
  { name: "백로", lon: 165, branchIndex: 9, month: 9, day: 8 },
  { name: "한로", lon: 195, branchIndex: 10, month: 10, day: 8 },
  { name: "입동", lon: 225, branchIndex: 11, month: 11, day: 7 },
  { name: "대설", lon: 255, branchIndex: 0, month: 12, day: 7 },
];

/** Fliegel–Van Flandern JDN (해당 그레고리력 날짜의 UT 정오) */
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

/** 한국 표준시 → Julian Date (UT) */
export function kstToJd(
  y: number,
  m: number,
  d: number,
  hour: number,
  minute: number
): number {
  const ut = new Date(Date.UTC(y, m - 1, d, hour - 9, minute, 0));
  const jdn = julianDayNumber(
    ut.getUTCFullYear(),
    ut.getUTCMonth() + 1,
    ut.getUTCDate()
  );
  return jdn + (ut.getUTCHours() - 12) / 24 + ut.getUTCMinutes() / 1440;
}

function jdToKst(jd: number): {
  kstYear: number;
  kstMonth: number;
  kstDay: number;
  kstHour: number;
  kstMinute: number;
} {
  // JD integer is noon UT; convert to ms
  const ms = (jd - 2440587.5) * 86400000 + 9 * 3600000;
  const dt = new Date(ms);
  return {
    kstYear: dt.getUTCFullYear(),
    kstMonth: dt.getUTCMonth() + 1,
    kstDay: dt.getUTCDate(),
    kstHour: dt.getUTCHours(),
    kstMinute: dt.getUTCMinutes(),
  };
}

/** 태양 시황경(도). 간략 Meeus — 대략 0.01° (~15분) 수준 */
export function solarLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
  const Mr = (M * Math.PI) / 180;
  const C =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mr) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * Mr) +
    0.000289 * Math.sin(3 * Mr);
  const omega = 125.04 - 1934.136 * T;
  let lon =
    L0 + C - 0.00569 - 0.00478 * Math.sin((omega * Math.PI) / 180);
  lon %= 360;
  if (lon < 0) lon += 360;
  return lon;
}

function signedDelta(jd: number, targetLon: number): number {
  let d = solarLongitude(jd) - targetLon;
  d = ((d + 540) % 360) - 180;
  return d;
}

function termJd(
  year: number,
  lon: number,
  month: number,
  day: number
): number {
  const center = kstToJd(year, month, day, 12, 0);
  let lo = center - 6;
  let hi = center + 6;
  // 창이 절기를 포함하도록 부호가 반대면 조금 넓힘
  if (signedDelta(lo, lon) > 0 || signedDelta(hi, lon) < 0) {
    lo = center - 20;
    hi = center + 20;
  }
  for (let i = 0; i < 50; i++) {
    const mid = (lo + hi) / 2;
    if (signedDelta(mid, lon) < 0) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

const cache = new Map<number, JieTerm[]>();

export function jieTermsForYear(year: number): JieTerm[] {
  const hit = cache.get(year);
  if (hit) return hit;
  const terms = JIE_DEFS.map((def) => {
    const jd = termJd(year, def.lon, def.month, def.day);
    return {
      name: def.name,
      longitude: def.lon,
      branchIndex: def.branchIndex,
      jd,
      ...jdToKst(jd),
    };
  });
  cache.set(year, terms);
  return terms;
}

export function lichunOfYear(year: number): JieTerm {
  const term = jieTermsForYear(year).find((t) => t.name === "입춘");
  if (!term) throw new Error("입춘");
  return term;
}

/**
 * 출생 시각(KST)이 속한 월지.
 * 시각을 모르면 정오(12:00)로 비교한다.
 */
export function monthBranchAtKst(
  y: number,
  m: number,
  d: number,
  hour: number,
  minute: number
): { branchIndex: number; termName: string } {
  const jd = kstToJd(y, m, d, hour, minute);
  const pool = [
    ...jieTermsForYear(y - 1),
    ...jieTermsForYear(y),
    ...jieTermsForYear(y + 1),
  ];
  let best: JieTerm | null = null;
  for (const t of pool) {
    if (t.jd <= jd && (!best || t.jd > best.jd)) best = t;
  }
  if (!best) {
    return { branchIndex: 1, termName: "소한" };
  }
  return { branchIndex: best.branchIndex, termName: best.name };
}

/** 입춘 이전이면 전년 */
export function sajuYearAtKst(
  y: number,
  m: number,
  d: number,
  hour: number,
  minute: number
): number {
  const jd = kstToJd(y, m, d, hour, minute);
  const lichun = lichunOfYear(y);
  return jd < lichun.jd ? y - 1 : y;
}

/**
 * 출생 시각 기준 직전·직후 절(節).
 * 대운 시작 나이(절입까지 일수÷3) 계산용.
 */
export function jieNeighborsAtKst(
  y: number,
  m: number,
  d: number,
  hour: number,
  minute: number
): { prev: JieTerm; next: JieTerm; birthJd: number } {
  const birthJd = kstToJd(y, m, d, hour, minute);
  const pool = [
    ...jieTermsForYear(y - 1),
    ...jieTermsForYear(y),
    ...jieTermsForYear(y + 1),
  ].sort((a, b) => a.jd - b.jd);

  let prev: JieTerm | null = null;
  let next: JieTerm | null = null;
  for (const t of pool) {
    if (t.jd <= birthJd) prev = t;
    else if (!next) {
      next = t;
      break;
    }
  }
  if (!prev) prev = pool[0]!;
  if (!next) next = pool[pool.length - 1]!;
  return { prev, next, birthJd };
}
