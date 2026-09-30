/**
 * 야자시(夜子時) / 조자시(早子時) 규칙 (MVP)
 *
 * 가정:
 * - 子時 = 23:00–00:59 (시계 또는 진태양시 기준).
 * - 야자시(23:00–23:59): 다음날 일주로 시주·일주 경계.
 * - 조자시(00:00–00:59): 당일 일주 유지.
 */

export type YajaMode = "off" | "next_day";

export interface YajaAdjustment {
  y: number;
  m: number;
  d: number;
  hour: number;
  minute: number;
  applied: boolean;
  label: string;
  note: string;
}

export function applyYajaRules(
  y: number,
  m: number,
  d: number,
  hour: number,
  minute: number,
  mode: YajaMode = "next_day"
): YajaAdjustment {
  const total = hour * 60 + minute;
  const inZiNight = total >= 23 * 60;
  const inZiMorning = total < 60;

  if (mode === "off" || (!inZiNight && !inZiMorning)) {
    return {
      y, m, d, hour, minute,
      applied: false,
      label: "야자시 미적용",
      note: "일반 시계/진태양시 기준 일주·시주.",
    };
  }

  if (inZiNight && mode === "next_day") {
    const dt = new Date(Date.UTC(y, m - 1, d + 1));
    return {
      y: dt.getUTCFullYear(),
      m: dt.getUTCMonth() + 1,
      d: dt.getUTCDate(),
      hour, minute,
      applied: true,
      label: "야자시 → 다음날 일주",
      note: "23:00–23:59 출생을 야자시로 보아 일주·시주 경계를 다음날로 넘깁니다. (MVP 관례)",
    };
  }

  return {
    y, m, d, hour, minute,
    applied: inZiMorning,
    label: inZiMorning ? "조자시 (당일 일주)" : "야자시 미적용",
    note: inZiMorning
      ? "00:00–00:59 조자시: 당일 일주로 시주를 계산합니다."
      : "일반 규칙.",
  };
}
