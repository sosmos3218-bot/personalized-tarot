import type { OnboardingAnswers, ReadingResult, User } from "./types";

const KEYS = {
  user: "tarot_user",
  onboarding: "tarot_onboarding",
  history: "tarot_history",
  lastReading: "tarot_last_reading",
} as const;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function onboardingKey(userId?: string | null): string {
  return userId ? `${KEYS.onboarding}:${userId}` : KEYS.onboarding;
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

export function getHistory(): ReadingResult[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(KEYS.history);
    return raw ? (JSON.parse(raw) as ReadingResult[]) : [];
  } catch {
    return [];
  }
}

export function saveReading(reading: ReadingResult): void {
  if (!isBrowser()) return;
  const history = getHistory();
  const next = [reading, ...history.filter((r) => r.id !== reading.id)].slice(
    0,
    50
  );
  localStorage.setItem(KEYS.history, JSON.stringify(next));
  localStorage.setItem(KEYS.lastReading, JSON.stringify(reading));
}

export function updateReadingInterpretation(
  id: string,
  interpretation: string,
  source?: "ai" | "template"
): void {
  if (!isBrowser()) return;
  const history = getHistory();
  const next = history.map((r) =>
    r.id === id
      ? {
          ...r,
          interpretation,
          interpretationSource: source ?? r.interpretationSource,
        }
      : r
  );
  localStorage.setItem(KEYS.history, JSON.stringify(next));
  const last = getLastReading();
  if (last?.id === id) {
    localStorage.setItem(
      KEYS.lastReading,
      JSON.stringify({
        ...last,
        interpretation,
        interpretationSource: source ?? last.interpretationSource,
      })
    );
  }
}

export function getLastReading(): ReadingResult | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(KEYS.lastReading);
    return raw ? (JSON.parse(raw) as ReadingResult) : null;
  } catch {
    return null;
  }
}

export function clearHistory(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(KEYS.history);
  localStorage.removeItem(KEYS.lastReading);
}
