import type { DailyTarotLock } from "./types";
import { getSeoulTodayYmd } from "./date";

const KEY_PREFIX = "tarot_daily_draw";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function lockKey(userId?: string | null, dateYmd?: string): string {
  const d = dateYmd ?? getSeoulTodayYmd();
  const u = userId ?? "anon";
  return `${KEY_PREFIX}:${u}:${d}`;
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
}
