/** Asia/Seoul “오늘” 유틸 */

const SEOUL_TZ = "Asia/Seoul";

/** 서울 기준 YYYY-MM-DD */
export function getSeoulTodayYmd(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: SEOUL_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** 표시용: 2026년 9월 29일 (화) */
export function formatSeoulDateKo(ymd: string): string {
  const [ys, ms, ds] = ymd.split("-").map(Number);
  const utcGuess = new Date(Date.UTC(ys, ms - 1, ds, 12, 0, 0));
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: SEOUL_TZ,
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(utcGuess);
}

export { SEOUL_TZ };
