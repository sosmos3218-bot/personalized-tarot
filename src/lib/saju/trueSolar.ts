/**
 * 진태양시(眞太陽時) 근사
 *
 * 가정:
 * - 표준시: Asia/Seoul (UTC+9). 한국 법정 표준자오선은 역사적으로 127.5°E를 쓰기도 하나,
 *   현재 KST는 일본과 같은 135°E 기준 UTC+9. 본 MVP는 **관측 경도 vs 135°E** 보정.
 * - 도시/경도를 모르면 기본 경도 = 서울 시청 근사 126.978°E.
 * - 균시차(equation of time)는 Spencer(1971) 근사식 (분 단위, ±1~2분 오차 가능).
 * - 서머타임·고도·대기차 미반영.
 */

/** 서울 기본 경도 (동경, °) */
export const DEFAULT_LONGITUDE_E = 126.978;
/** KST 기준 표준자오선 (동경, °) — UTC+9 */
export const STANDARD_MERIDIAN_E = 135.0;

export function equationOfTimeMinutes(dayOfYear: number): number {
  const B = ((2 * Math.PI) / 365) * (dayOfYear - 1);
  return (
    229.18 *
    (0.000075 +
      0.001868 * Math.cos(B) -
      0.032077 * Math.sin(B) -
      0.014615 * Math.cos(2 * B) -
      0.040849 * Math.sin(2 * B))
  );
}

export function dayOfYear(y: number, m: number, d: number): number {
  const start = Date.UTC(y, 0, 0);
  const cur = Date.UTC(y, m - 1, d);
  return Math.round((cur - start) / 86400000);
}

export interface TrueSolarResult {
  hour: number;
  minute: number;
  dayDelta: number;
  longitudeOffsetMin: number;
  eotMin: number;
  totalOffsetMin: number;
  longitudeE: number;
  assumptions: string;
}

export function toTrueSolarTime(
  y: number,
  m: number,
  d: number,
  hour: number,
  minute: number,
  longitudeE: number = DEFAULT_LONGITUDE_E
): TrueSolarResult {
  const lonOff = 4 * (longitudeE - STANDARD_MERIDIAN_E);
  const eot = equationOfTimeMinutes(dayOfYear(y, m, d));
  const total = lonOff + eot;
  let totalMin = hour * 60 + minute + total;
  let dayDelta = 0;
  while (totalMin < 0) {
    totalMin += 1440;
    dayDelta -= 1;
  }
  while (totalMin >= 1440) {
    totalMin -= 1440;
    dayDelta += 1;
  }
  const hh = Math.floor(totalMin / 60);
  const mm = Math.floor(totalMin % 60);
  return {
    hour: hh,
    minute: mm,
    dayDelta,
    longitudeOffsetMin: Math.round(lonOff * 10) / 10,
    eotMin: Math.round(eot * 10) / 10,
    totalOffsetMin: Math.round(total * 10) / 10,
    longitudeE,
    assumptions:
      `진태양시 근사: 경도 ${longitudeE.toFixed(3)}°E, 표준자오선 ${STANDARD_MERIDIAN_E}°E, ` +
      `균시차 Spencer 근사. 경도보정 ${lonOff.toFixed(1)}분 + 균시차 ${eot.toFixed(1)}분.`,
  };
}

export function shiftSolarDate(
  y: number,
  m: number,
  d: number,
  dayDelta: number
): { y: number; m: number; d: number } {
  const dt = new Date(Date.UTC(y, m - 1, d + dayDelta));
  return {
    y: dt.getUTCFullYear(),
    m: dt.getUTCMonth() + 1,
    d: dt.getUTCDate(),
  };
}
