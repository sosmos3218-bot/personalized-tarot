"use client";

import { useState } from "react";
import { useAuth, useClerk } from "@clerk/nextjs";

const CONFIRM_TEXT = "삭제합니다";

function clearLocalUserData(userId: string | null | undefined) {
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k) continue;
      if (k.startsWith("tarot_") || (userId && k.includes(userId))) {
        keys.push(k);
      }
    }
    keys.forEach((k) => localStorage.removeItem(k));
  } catch {
    /* ignore */
  }
}

export default function DeleteAccount() {
  const { userId } = useAuth();
  const { signOut } = useClerk();
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirmed = typed.trim() === CONFIRM_TEXT;

  async function onDelete() {
    if (!confirmed || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/account", { method: "DELETE" });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error || "계정 삭제에 실패했어요.");
      }
      clearLocalUserData(userId);
      try {
        const reg = await navigator.serviceWorker?.getRegistration();
        const sub = await reg?.pushManager.getSubscription();
        await sub?.unsubscribe();
      } catch {
        /* ignore */
      }
      const target = "/?accountDeleted=1";
      try {
        await signOut({ redirectUrl: target });
      } catch {
        /* session may already be revoked */
      }
      window.location.assign(target);
    } catch (e) {
      setError(e instanceof Error ? e.message : "계정 삭제에 실패했어요.");
      setBusy(false);
    }
  }

  return (
    <section
      id="delete-account"
      className="card-panel space-y-3 !p-5 scroll-mt-24"
      aria-labelledby="delete-account-title"
    >
      <div>
        <h2 id="delete-account-title" className="text-sm font-semibold text-heading">
          계정 삭제
        </h2>
        <p className="mt-1 text-xs text-muted leading-relaxed">
          계정과 함께 사주 프로필, 리딩 기록, 오늘의 운세 기록, 알림 설정 및
          푸시 구독 정보가 즉시 영구 삭제됩니다. 삭제 후에는 복구할 수 없어요.
        </p>
      </div>

      {!open ? (
        <button
          type="button"
          className="btn-secondary w-full text-sm"
          style={{ color: "var(--rose)" }}
          onClick={() => setOpen(true)}
        >
          계정 삭제하기
        </button>
      ) : (
        <div className="space-y-3">
          <label htmlFor="delete-confirm" className="block text-sm text-body">
            정말 삭제하시려면 아래 칸에{" "}
            <strong className="text-heading">{CONFIRM_TEXT}</strong>를 입력해
            주세요.
          </label>
          <input
            id="delete-confirm"
            type="text"
            autoComplete="off"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder={CONFIRM_TEXT}
            className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
            style={{
              background: "var(--input-bg)",
              borderColor: "var(--input-border)",
              color: "var(--foreground)",
            }}
          />
          <div className="flex gap-2">
            <button
              type="button"
              className="btn-secondary flex-1 text-sm"
              disabled={busy}
              onClick={() => {
                setOpen(false);
                setTyped("");
                setError(null);
              }}
            >
              취소
            </button>
            <button
              type="button"
              className="flex-1 rounded-full px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
              style={{ background: "var(--rose)" }}
              disabled={!confirmed || busy}
              onClick={() => void onDelete()}
            >
              {busy ? "삭제 중…" : "영구 삭제"}
            </button>
          </div>
          {error && (
            <p className="text-xs" style={{ color: "var(--rose)" }} role="alert">
              {error}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
