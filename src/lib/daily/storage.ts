import type { DailyTarotLock } from "./types";
import { getSeoulTodayYmd } from "./date";

const KEY_PREFIX = "tarot_daily_draw";
const VIEW_PREFIX = "tarot_daily_view";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function lockKey(userId?: string | null, dateYmd?: string): string {
  const d = dateYmd ?? getSeoulTodayYmd();
  const u = userId ?? "anon";
  return `${KEY_PREFIX}:${u}:${d}`;
}

function viewKey(userId?: string | null, dateYmd?: string): string {
  const d = dateYmd ?? getSeoulTodayYmd();
  const u = userId ?? "anon";
  return `${VIEW_PREFIX}:${u}:${d}`;
}

export function getDailyTarotLock(
  userId?: string | null,
  dateYmd?: string
): DailyTarotLock | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(lockKey(userId, dateYmd));
    return raw ? (JSON.parse(raw) as DailyTarotLock) : null;
  } catch {
    return null;
  }
}

export function saveDailyTarotLock(
  lock: DailyTarotLock,
  userId?: string | null
): void {
  if (!isBrowser()) return;
  localStorage.setItem(lockKey(userId, lock.dateYmd), JSON.stringify(lock));
  markDailyFortuneViewed(userId, lock.dateYmd);
}

/** Mark that the user opened / viewed today's fortune (Seoul date). */
export function markDailyFortuneViewed(
  userId?: string | null,
  dateYmd?: string
): void {
  if (!isBrowser()) return;
  localStorage.setItem(viewKey(userId, dateYmd), new Date().toISOString());
}

export function hasDailyFortuneViewed(
  userId?: string | null,
  dateYmd?: string
): boolean {
  if (!isBrowser()) return false;
  return localStorage.getItem(viewKey(userId, dateYmd)) != null;
}
