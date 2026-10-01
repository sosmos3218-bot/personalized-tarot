import type { ReadingResult } from "@/lib/types";
import type { SajuProfile } from "@/lib/saju/types";
import type { DailyTarotLock } from "@/lib/daily/types";
import { readJsonBlob, userPath, writeJsonBlob } from "./blobJson";

const HISTORY_LIMIT = 50;

export interface ReminderPrefs {
  emailEnabled: boolean;
  /** Opt-in for daily Web Push (오늘의 운세) */
  pushEnabled?: boolean;
  /** Hour 0–23 in Asia/Seoul */
  hourKst: number;
  /** Last Seoul YMD we already sent email for */
  lastSentYmd?: string | null;
  /** Last Seoul YMD we already sent push for */
  lastPushYmd?: string | null;
  updatedAt: string;
}

export interface StoredPushSubscription {
  endpoint: string;
  expirationTime?: number | null;
  keys: { p256dh: string; auth: string };
  userAgent?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PushSubscriptionsDoc {
  items: StoredPushSubscription[];
  updatedAt: string;
}

export interface HistoryDoc {
  items: ReadingResult[];
  updatedAt: string;
}

export interface DailyLockDoc {
  lock: DailyTarotLock | null;
  viewedAt?: string | null;
  fortuneSnapshot?: unknown;
  updatedAt: string;
}

function historyPath(userId: string) {
  return userPath(userId, "history.json");
}
function sajuPath(userId: string) {
  return userPath(userId, "saju.json");
}
function dailyPath(userId: string, dateYmd: string) {
  return userPath(userId, "daily", `${dateYmd}.json`);
}
function prefsPath(userId: string) {
  return userPath(userId, "prefs.json");
}
function pushPath(userId: string) {
  return userPath(userId, "push-subscriptions.json");
}

export async function getHistoryDoc(userId: string): Promise<HistoryDoc> {
  const doc = await readJsonBlob<HistoryDoc>(historyPath(userId));
  return doc ?? { items: [], updatedAt: new Date().toISOString() };
}

export async function listReadings(userId: string): Promise<ReadingResult[]> {
  const doc = await getHistoryDoc(userId);
  return Array.isArray(doc.items) ? doc.items : [];
}

export async function getReading(
  userId: string,
  id: string
): Promise<ReadingResult | null> {
  const items = await listReadings(userId);
  return items.find((r) => r.id === id) ?? null;
}

export async function upsertReading(
  userId: string,
  reading: ReadingResult
): Promise<ReadingResult[]> {
  const doc = await getHistoryDoc(userId);
  const next = [
    reading,
    ...doc.items.filter((r) => r.id !== reading.id),
  ].slice(0, HISTORY_LIMIT);
  await writeJsonBlob(historyPath(userId), {
    items: next,
    updatedAt: new Date().toISOString(),
  } satisfies HistoryDoc);
  return next;
}

export async function updateReadingFields(
  userId: string,
  id: string,
  patch: Partial<Pick<ReadingResult, "interpretation" | "interpretationSource">>
): Promise<ReadingResult | null> {
  const doc = await getHistoryDoc(userId);
  let updated: ReadingResult | null = null;
  const items = doc.items.map((r) => {
    if (r.id !== id) return r;
    updated = { ...r, ...patch };
    return updated;
  });
  if (!updated) return null;
  await writeJsonBlob(historyPath(userId), {
    items,
    updatedAt: new Date().toISOString(),
  } satisfies HistoryDoc);
  return updated;
}

export async function clearReadings(userId: string): Promise<void> {
  await writeJsonBlob(historyPath(userId), {
    items: [],
    updatedAt: new Date().toISOString(),
  } satisfies HistoryDoc);
}

export async function mergeReadings(
  userId: string,
  locals: ReadingResult[]
): Promise<ReadingResult[]> {
  const doc = await getHistoryDoc(userId);
  const byId = new Map<string, ReadingResult>();
  for (const r of doc.items) byId.set(r.id, r);
  for (const r of locals) {
    const prev = byId.get(r.id);
    if (!prev) {
      byId.set(r.id, r);
      continue;
    }
    const preferLocal =
      (r.interpretationSource === "ai" && prev.interpretationSource !== "ai") ||
      new Date(r.createdAt).getTime() >= new Date(prev.createdAt).getTime();
    if (preferLocal) byId.set(r.id, { ...prev, ...r });
  }
  const items = [...byId.values()]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, HISTORY_LIMIT);
  await writeJsonBlob(historyPath(userId), {
    items,
    updatedAt: new Date().toISOString(),
  } satisfies HistoryDoc);
  return items;
}

export async function getSaju(userId: string): Promise<SajuProfile | null> {
  return readJsonBlob<SajuProfile>(sajuPath(userId));
}

export async function saveSaju(
  userId: string,
  profile: SajuProfile
): Promise<void> {
  await writeJsonBlob(sajuPath(userId), profile);
}

export async function getDailyDoc(
  userId: string,
  dateYmd: string
): Promise<DailyLockDoc | null> {
  return readJsonBlob<DailyLockDoc>(dailyPath(userId, dateYmd));
}

export async function saveDailyDoc(
  userId: string,
  dateYmd: string,
  doc: Omit<DailyLockDoc, "updatedAt">
): Promise<void> {
  await writeJsonBlob(dailyPath(userId, dateYmd), {
    ...doc,
    updatedAt: new Date().toISOString(),
  } satisfies DailyLockDoc);
}

export async function getPrefs(userId: string): Promise<ReminderPrefs | null> {
  return readJsonBlob<ReminderPrefs>(prefsPath(userId));
}

export async function savePrefs(
  userId: string,
  prefs: ReminderPrefs
): Promise<void> {
  await writeJsonBlob(prefsPath(userId), prefs);
}

export async function listUserIdsWithPrefs(): Promise<string[]> {
  const { list } = await import("@vercel/blob");
  const ids = new Set<string>();
  let cursor: string | undefined;
  do {
    const page = await list({
      prefix: "users/",
      cursor,
      limit: 1000,
    });
    for (const b of page.blobs) {
      const m = /^users\/([^/]+)\/prefs\.json$/.exec(b.pathname);
      if (m) ids.add(m[1]);
    }
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  return [...ids];
}

export async function getPushSubscriptions(
  userId: string
): Promise<PushSubscriptionsDoc> {
  const doc = await readJsonBlob<PushSubscriptionsDoc>(pushPath(userId));
  return doc ?? { items: [], updatedAt: new Date().toISOString() };
}

export async function upsertPushSubscription(
  userId: string,
  sub: Omit<StoredPushSubscription, "createdAt" | "updatedAt"> & {
    createdAt?: string;
  }
): Promise<PushSubscriptionsDoc> {
  const doc = await getPushSubscriptions(userId);
  const now = new Date().toISOString();
  const prev = doc.items.find((i) => i.endpoint === sub.endpoint);
  const nextItem: StoredPushSubscription = {
    endpoint: sub.endpoint,
    expirationTime: sub.expirationTime ?? null,
    keys: sub.keys,
    userAgent: sub.userAgent ?? null,
    createdAt: prev?.createdAt ?? sub.createdAt ?? now,
    updatedAt: now,
  };
  const items = [
    nextItem,
    ...doc.items.filter((i) => i.endpoint !== sub.endpoint),
  ].slice(0, 10);
  const next: PushSubscriptionsDoc = { items, updatedAt: now };
  await writeJsonBlob(pushPath(userId), next);
  return next;
}

export async function removePushSubscription(
  userId: string,
  endpoint: string
): Promise<PushSubscriptionsDoc> {
  const doc = await getPushSubscriptions(userId);
  const items = doc.items.filter((i) => i.endpoint !== endpoint);
  const next: PushSubscriptionsDoc = {
    items,
    updatedAt: new Date().toISOString(),
  };
  await writeJsonBlob(pushPath(userId), next);
  return next;
}

export async function clearPushSubscriptions(userId: string): Promise<void> {
  await writeJsonBlob(pushPath(userId), {
    items: [],
    updatedAt: new Date().toISOString(),
  } satisfies PushSubscriptionsDoc);
}

export async function listUserIdsWithPush(): Promise<string[]> {
  const { list } = await import("@vercel/blob");
  const ids = new Set<string>();
  let cursor: string | undefined;
  do {
    const page = await list({
      prefix: "users/",
      cursor,
      limit: 1000,
    });
    for (const b of page.blobs) {
      const m = /^users\/([^/]+)\/push-subscriptions\.json$/.exec(b.pathname);
      if (m) ids.add(m[1]);
    }
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  return [...ids];
}
