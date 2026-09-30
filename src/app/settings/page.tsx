"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import AuthGate from "@/components/AuthGate";

interface Prefs {
  emailEnabled: boolean;
  hourKst: number;
  lastSentYmd?: string | null;
  updatedAt: string;
}

export default function SettingsPage() {
  return (
    <AuthGate>
      <SettingsForm />
    </AuthGate>
  );
}

function SettingsForm() {
  const { user } = useUser();
  const [prefs, setPrefs] = useState<Prefs | null>(null);
  const [hour, setHour] = useState(8);
  const [enabled, setEnabled] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const emailReady = Boolean(
    typeof process !== "undefined"
  ); /* server checks RESEND */

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/prefs");
        if (!res.ok) throw new Error("설정을 불러오지 못했습니다.");
        const data = (await res.json()) as { prefs: Prefs };
        if (cancelled) return;
        setPrefs(data.prefs);
        setHour(data.prefs.hourKst);
        setEnabled(data.prefs.emailEnabled);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "오류");
        }
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function save() {
    setSaving(true);
    setMsg(null);
    setError(null);
    try {
      const res = await fetch("/api/prefs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailEnabled: enabled, hourKst: hour }),
      });
      if (!res.ok) throw new Error("저장에 실패했습니다.");
      const data = (await res.json()) as { prefs: Prefs };
      setPrefs(data.prefs);
      setMsg(
        enabled
          ? `매일 오전 ${hour}시(서울)에 오늘의 운세 메일 알림을 받습니다. (옵트인)`
          : "메일 알림을 끄셨습니다."
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "저장 실패");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 animate-fade-up">
      <div>
        <p className="text-[11px] tracking-[0.22em] text-accent font-medium">
          SETTINGS
        </p>
        <h1 className="mt-1 text-2xl font-bold text-heading">알림 설정</h1>
        <p className="mt-1 text-sm text-body leading-relaxed">
          매일 원하는 시각에 「오늘의 운세」 리마인드 메일을 받을 수 있어요.
          옵트인한 경우에만 발송됩니다.
        </p>
      </div>

      <section className="card-panel space-y-4 !p-5">
        <div>
          <p className="text-sm font-medium text-heading">계정 이메일</p>
          <p className="mt-1 text-sm text-body">
            {user?.primaryEmailAddress?.emailAddress ?? "로그인 이메일"}
          </p>
        </div>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 rounded"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
          />
          <span>
            <span className="block text-sm font-medium text-heading">
              매일 오늘의 운세 메일 받기
            </span>
            <span className="block text-xs text-muted mt-0.5">
              사주가 등록된 계정에만 발송됩니다. 언제든 해제할 수 있어요.
            </span>
          </span>
        </label>

        <div>
          <label
            htmlFor="reminder-hour"
            className="mb-1.5 block text-sm font-medium text-heading"
          >
            발송 시각 (서울)
          </label>
          <select
            id="reminder-hour"
            value={hour}
            disabled={!enabled}
            onChange={(e) => setHour(Number(e.target.value))}
            className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none disabled:opacity-50"
            style={{
              background: "var(--input-bg)",
              borderColor: "var(--input-border)",
              color: "var(--foreground)",
            }}
          >
            {Array.from({ length: 24 }, (_, i) => (
              <option key={i} value={i}>
                {String(i).padStart(2, "0")}:00
              </option>
            ))}
          </select>
        </div>

        {prefs?.lastSentYmd && (
          <p className="text-xs text-muted">
            최근 발송(서울 날짜): {prefs.lastSentYmd}
          </p>
        )}

        {msg && (
          <p className="text-sm text-heading" role="status">
            {msg}
          </p>
        )}
        {error && (
          <p className="text-sm" style={{ color: "var(--rose)" }} role="alert">
            {error}
          </p>
        )}

        <button
          type="button"
          className="btn-primary w-full"
          disabled={saving}
          onClick={() => void save()}
        >
          {saving ? "저장 중…" : "설정 저장"}
        </button>
      </section>

      <p className="text-xs text-muted leading-relaxed px-1">
        메일 발송에는 서버 환경 변수{" "}
        <code className="text-[11px]">RESEND_API_KEY</code> 와{" "}
        <code className="text-[11px]">RESEND_FROM_EMAIL</code> 이 필요합니다.
        설정되어 있지 않으면 크론이 발송을 건너뛰고 로그만 남깁니다. Vercel Cron
        은 <code className="text-[11px]">vercel.json</code> 의{" "}
        <code className="text-[11px]">/api/cron/daily-reminder</code> 를 매시
        정각에 호출합니다.
        {emailReady ? null : null}
      </p>

      <div className="flex flex-wrap gap-2 justify-center">
        <Link href="/today" className="btn-secondary text-sm">
          오늘의 운세
        </Link>
        <Link href="/history" className="btn-secondary text-sm">
          리딩 기록
        </Link>
      </div>
    </div>
  );
}
