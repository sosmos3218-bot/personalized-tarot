/**
 * Client helpers: write-through to server when signed in.
 * localStorage remains a cache / offline fallback.
 */
import type { ReadingResult } from "./types";
import type { SajuProfile } from "./saju/types";
import type { DailyTarotLock } from "./daily/types";
import {
  getHistory,
  getSajuProfile,
  saveReading as saveReadingLocal,
  saveSajuProfile as saveSajuLocal,
  updateReadingInterpretation as updateReadingLocal,
  clearHistory as clearHistoryLocal,
} from "./storage";
import {
  getDailyTarotLock,
  saveDailyTarotLock as saveDailyLockLocal,
  markDailyFortuneViewed as markViewedLocal,
} from "./daily/storage";

const MIGRATE_FLAG = "tarot_server_migrated";

function migrateFlagKey(userId: string) {
  return `${MIGRATE_FLAG}:${userId}`;
}

export async function fetchServerHistory(): Promise<ReadingResult[] | null> {
  try {
    const res = await fetch("/api/history");
    if (!res.ok) return null;
    const data = (await res.json()) as { items?: ReadingResult[] };
    return Array.isArray(data.items) ? data.items : [];
  } catch {
    return null;
  }
}

export async function fetchServerReading(
  id: string
): Promise<ReadingResult | null> {
  try {
    const res = await fetch(`/api/history/${encodeURIComponent(id)}`);
    if (!res.ok) return null;
    const data = (await res.json()) as { reading?: ReadingResult };
    return data.reading ?? null;
  } catch {
    return null;
  }
}

export async function fetchServerSaju(): Promise<SajuProfile | null> {
  try {
    const res = await fetch("/api/saju-profile");
    if (!res.ok) return null;
    const data = (await res.json()) as { profile?: SajuProfile | null };
    return data.profile ?? null;
  } catch {
    return null;
  }
}

/** One-time localStorage → server merge, then use server as source of truth. */
export async function ensureMigrated(userId: string): Promise<ReadingResult[]> {
  const local = getHistory(userId);
  const already =
    typeof window !== "undefined" &&
    localStorage.getItem(migrateFlagKey(userId)) === "1";

  if (!already && local.length > 0) {
    try {
      const res = await fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ migrate: local }),
      });
      if (res.ok) {
        const data = (await res.json()) as { items?: ReadingResult[] };
        localStorage.setItem(migrateFlagKey(userId), "1");
        const items = data.items ?? local;
        // Mirror merged server list into local cache
        localStorage.setItem(
          `tarot_history:${userId}`,
          JSON.stringify(items)
        );
        return items;
      }
    } catch {
      /* fall through */
    }
  }

  const server = await fetchServerHistory();
  if (server) {
    localStorage.setItem(migrateFlagKey(userId), "1");
    localStorage.setItem(`tarot_history:${userId}`, JSON.stringify(server));
    return server;
  }
  return local;
}

export async function syncSaveReading(
  reading: ReadingResult,
  userId?: string | null
): Promise<void> {
  saveReadingLocal(reading, userId);
  if (!userId) return;
  try {
    await fetch("/api/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reading }),
    });
  } catch {
    /* local already saved */
  }
}

export async function syncUpdateInterpretation(
  id: string,
  interpretation: string,
  source?: "ai" | "template",
  userId?: string | null
): Promise<void> {
  updateReadingLocal(id, interpretation, source, userId);
  if (!userId) return;
  try {
    await fetch(`/api/history/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ interpretation, interpretationSource: source }),
    });
  } catch {
    /* ignore */
  }
}

export async function syncClearHistory(userId?: string | null): Promise<void> {
  clearHistoryLocal(userId);
  if (!userId) return;
  try {
    await fetch("/api/history", { method: "DELETE" });
  } catch {
    /* ignore */
  }
}

export async function syncSaveSaju(
  profile: SajuProfile,
  userId?: string | null
): Promise<void> {
  saveSajuLocal(profile, userId);
  if (!userId) return;
  try {
    await fetch("/api/saju-profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile }),
    });
  } catch {
    /* ignore */
  }
}

/** Load saju: server first, else local; write-through if only local. */
export async function loadSajuProfile(
  userId?: string | null
): Promise<SajuProfile | null> {
  if (!userId) return getSajuProfile(userId);
  const server = await fetchServerSaju();
  if (server) {
    saveSajuLocal(server, userId);
    return server;
  }
  const local = getSajuProfile(userId);
  if (local) {
    void syncSaveSaju(local, userId);
  }
  return local;
}

export async function syncDailyLock(
  lock: DailyTarotLock,
  userId?: string | null,
  fortuneSnapshot?: unknown
): Promise<void> {
  saveDailyLockLocal(lock, userId);
  if (!userId) return;
  try {
    await fetch("/api/daily-lock", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dateYmd: lock.dateYmd,
        lock,
        viewedAt: new Date().toISOString(),
        fortuneSnapshot,
      }),
    });
  } catch {
    /* ignore */
  }
}

export async function syncMarkDailyViewed(
  userId?: string | null,
  dateYmd?: string,
  fortuneSnapshot?: unknown
): Promise<void> {
  markViewedLocal(userId, dateYmd);
  if (!userId) return;
  try {
    await fetch("/api/daily-lock", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dateYmd,
        viewedAt: new Date().toISOString(),
        fortuneSnapshot,
      }),
    });
  } catch {
    /* ignore */
  }
}

export async function fetchServerDailyLock(dateYmd: string): Promise<{
  lock: DailyTarotLock | null;
  viewedAt: string | null;
} | null> {
  try {
    const res = await fetch(
      `/api/daily-lock?date=${encodeURIComponent(dateYmd)}`
    );
    if (!res.ok) return null;
    const data = (await res.json()) as {
      lock?: DailyTarotLock | null;
      viewedAt?: string | null;
    };
    return { lock: data.lock ?? null, viewedAt: data.viewedAt ?? null };
  } catch {
    return null;
  }
}

/** Prefer server lock; hydrate local. */
export async function loadDailyLock(
  userId: string | null | undefined,
  dateYmd: string
): Promise<DailyTarotLock | null> {
  if (userId) {
    const server = await fetchServerDailyLock(dateYmd);
    if (server?.lock) {
      saveDailyLockLocal(server.lock, userId);
      return server.lock;
    }
  }
  return getDailyTarotLock(userId, dateYmd);
}
