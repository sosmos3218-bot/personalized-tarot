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

export function getUser(): User | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(KEYS.user);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function saveUser(user: User): void {
  if (!isBrowser()) return;
  localStorage.setItem(KEYS.user, JSON.stringify(user));
}

export function clearUser(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(KEYS.user);
  localStorage.removeItem(KEYS.onboarding);
}

export function getOnboarding(): OnboardingAnswers | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(KEYS.onboarding);
    return raw ? (JSON.parse(raw) as OnboardingAnswers) : null;
  } catch {
    return null;
  }
}

export function saveOnboarding(answers: OnboardingAnswers): void {
  if (!isBrowser()) return;
  localStorage.setItem(KEYS.onboarding, JSON.stringify(answers));
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
  const next = [reading, ...history].slice(0, 50);
  localStorage.setItem(KEYS.history, JSON.stringify(next));
  localStorage.setItem(KEYS.lastReading, JSON.stringify(reading));
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
