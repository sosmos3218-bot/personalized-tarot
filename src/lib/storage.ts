import type { OnboardingAnswers, ReadingResult, User } from "./types";
import type { SajuProfile } from "./saju/types";

const KEYS = {
  user: "tarot_user",
  onboarding: "tarot_onboarding",
  saju: "tarot_saju",
  history: "tarot_history",
  lastReading: "tarot_last_reading",
} as const;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function onboardingKey(userId?: string | null): string {
  return userId ? `${KEYS.onboarding}:${userId}` : KEYS.onboarding;
}

function sajuKey(userId?: string | null): string {
  return userId ? `${KEYS.saju}:${userId}` : KEYS.saju;
}

function historyKey(userId?: string | null): string {
  return userId ? `${KEYS.history}:${userId}` : KEYS.history;
}

function lastReadingKey(userId?: string | null): string {
  return userId ? `${KEYS.lastReading}:${userId}` : KEYS.lastReading;
}

/** @deprecated Demo localStorage user — Clerk is the source of truth */
export function getUser(): User | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(KEYS.user);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

/** @deprecated */
export function saveUser(user: User): void {
  if (!isBrowser()) return;
  localStorage.setItem(KEYS.user, JSON.stringify(user));
}

/** @deprecated — use Clerk signOut via UserButton */
export function clearUser(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(KEYS.user);
}

export function getOnboarding(userId?: string | null): OnboardingAnswers | null {
  if (!isBrowser()) return null;
  try {
    const keyed = localStorage.getItem(onboardingKey(userId));
    if (keyed) return JSON.parse(keyed) as OnboardingAnswers;
    // Legacy unscoped key (pre-Clerk demo)
    if (userId) {
      const legacy = localStorage.getItem(KEYS.onboarding);
      if (legacy) {
        const parsed = JSON.parse(legacy) as OnboardingAnswers;
        localStorage.setItem(onboardingKey(userId), legacy);
        return parsed;
      }
    }
    return null;
  } catch {
    return null;
  }
}

export function saveOnboarding(
  answers: OnboardingAnswers,
  userId?: string | null
): void {
  if (!isBrowser()) return;
  localStorage.setItem(onboardingKey(userId), JSON.stringify(answers));
}

export function getSajuProfile(userId?: string | null): SajuProfile | null {
  if (!isBrowser()) return null;
  try {
    const keyed = localStorage.getItem(sajuKey(userId));
    if (keyed) return JSON.parse(keyed) as SajuProfile;
    if (userId) {
      const legacy = localStorage.getItem(KEYS.saju);
      if (legacy) {
        localStorage.setItem(sajuKey(userId), legacy);
        return JSON.parse(legacy) as SajuProfile;
      }
    }
    return null;
  } catch {
    return null;
  }
}

export function saveSajuProfile(
  profile: SajuProfile,
  userId?: string | null
): void {
  if (!isBrowser()) return;
  localStorage.setItem(sajuKey(userId), JSON.stringify(profile));
}

export function clearSajuProfile(userId?: string | null): void {
  if (!isBrowser()) return;
  localStorage.removeItem(sajuKey(userId));
  if (userId) localStorage.removeItem(KEYS.saju);
}

export function getHistory(userId?: string | null): ReadingResult[] {
  if (!isBrowser()) return [];
  try {
    const keyed = localStorage.getItem(historyKey(userId));
    if (keyed) return JSON.parse(keyed) as ReadingResult[];
    // Migrate legacy unscoped history into the user bucket once
    if (userId) {
      const legacy = localStorage.getItem(KEYS.history);
      if (legacy) {
        localStorage.setItem(historyKey(userId), legacy);
        return JSON.parse(legacy) as ReadingResult[];
      }
    }
    return [];
  } catch {
    return [];
  }
}

export function saveReading(
  reading: ReadingResult,
  userId?: string | null
): void {
  if (!isBrowser()) return;
  const history = getHistory(userId);
  const next = [reading, ...history.filter((r) => r.id !== reading.id)].slice(
    0,
    50
  );
  localStorage.setItem(historyKey(userId), JSON.stringify(next));
  localStorage.setItem(lastReadingKey(userId), JSON.stringify(reading));
}

export function updateReadingInterpretation(
  id: string,
  interpretation: string,
  source?: "ai" | "template",
  userId?: string | null
): void {
  if (!isBrowser()) return;
  const history = getHistory(userId);
  const next = history.map((r) =>
    r.id === id
      ? {
          ...r,
          interpretation,
          interpretationSource: source ?? r.interpretationSource,
        }
      : r
  );
  localStorage.setItem(historyKey(userId), JSON.stringify(next));
  const last = getLastReading(userId);
  if (last?.id === id) {
    localStorage.setItem(
      lastReadingKey(userId),
      JSON.stringify({
        ...last,
        interpretation,
        interpretationSource: source ?? last.interpretationSource,
      })
    );
  }
}

export function getLastReading(userId?: string | null): ReadingResult | null {
  if (!isBrowser()) return null;
  try {
    const keyed = localStorage.getItem(lastReadingKey(userId));
    if (keyed) return JSON.parse(keyed) as ReadingResult;
    if (userId) {
      const legacy = localStorage.getItem(KEYS.lastReading);
      if (legacy) {
        localStorage.setItem(lastReadingKey(userId), legacy);
        return JSON.parse(legacy) as ReadingResult;
      }
    }
    return null;
  } catch {
    return null;
  }
}

export function clearHistory(userId?: string | null): void {
  if (!isBrowser()) return;
  localStorage.removeItem(historyKey(userId));
  localStorage.removeItem(lastReadingKey(userId));
  if (userId) {
    localStorage.removeItem(KEYS.history);
    localStorage.removeItem(KEYS.lastReading);
  }
}

/** Seoul-today daily reading exists in this user's history */
export function hasDailyHistoryForDate(
  dateYmd: string,
  userId?: string | null
): boolean {
  return getHistory(userId).some((r) => {
    if (!r.tags?.includes("daily")) return false;
    try {
      const ymd = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Seoul",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date(r.createdAt));
      return ymd === dateYmd;
    } catch {
      return false;
    }
  });
}
