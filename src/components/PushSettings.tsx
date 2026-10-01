"use client";

import { useEffect, useState } from "react";
import {
  pushSupported,
  subscribePush,
  subscriptionToJSON,
  unsubscribePush,
} from "@/lib/client/push";

interface Prefs {
  emailEnabled: boolean;
  pushEnabled: boolean;
  hourKst: number;
  lastSentYmd?: string | null;
  lastPushYmd?: string | null;
  updatedAt: string;
}

export default function PushSettings(props: {
  prefs: Prefs | null;
  onPrefs: (p: Prefs) => void;
  onMsg: (m: string | null) => void;
  onError: (e: string | null) => void;
}) {
  const [pushOn, setPushOn] = useState(false);
  const [pushBusy, setPushBusy] = useState(false);
  const [vapidPublic, setVapidPublic] = useState<string | null>(null);
  const [canPush, setCanPush] = useState(false);
  const [iosHint, setIosHint] = useState(false);

  useEffect(() => {
    setCanPush(pushSupported());
    const ua = navigator.userAgent || "";
    const isIOS =
      /iPad|iPhone|iPod/.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    setIosHint(isIOS);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const pushRes = await fetch("/api/push/subscribe");
        if (!pushRes.ok) return;
        const pushData = (await pushRes.json()) as {
          publicKey: string | null;
          pushEnabled: boolean;
        };
        if (cancelled) return;
        setVapidPublic(pushData.publicKey);
        if (typeof pushData.pushEnabled === "boolean") {
          setPushOn(pushData.pushEnabled);
        }
      } catch {
        /* ignore */
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (props.prefs) setPushOn(Boolean(props.prefs.pushEnabled));
  }, [props.prefs]);

  async function togglePush(next: boolean) {
    setPushBusy(true);
    props.onMsg(null);
    props.onError(null);
    try {
      if (next) {
        if (!canPush) {
          throw new Error(
            "이 브라우저는 웹 푸시를 지원하지 않습니다. Chrome/Android 또는 홈 화면에 추가한 iOS Safari를 사용해 주세요."
          );
        }
        if (!vapidPublic) {
          throw new Error(
            "푸시 키가 아직 설정되지 않았습니다. 잠시 후 다시 시도해 주세요."
          );
        }
        const sub = await subscribePush(vapidPublic);
        if (!sub) {
          throw new Error(
            "알림 권한이 거부되었거나 구독에 실패했습니다. 브라우저 설정에서 알림을 허용해 주세요."
          );
        }
        const res = await fetch("/api/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(subscriptionToJSON(sub)),
        });
        if (!res.ok) {
          const t = await res.text();
          throw new Error(t.slice(0, 120) || "푸시 구독 저장 실패");
        }
        const data = (await res.json()) as { prefs: Prefs };
        props.onPrefs(data.prefs);
        setPushOn(true);
        props.onMsg(
          "푸시 알림이 켜졌습니다. 매일 아침(서울 08:00 전후) 「오늘의 운세」 알림을 받아요."
        );
      } else {
        await unsubscribePush();
        const res = await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });
        if (!res.ok) throw new Error("푸시 해제에 실패했습니다.");
        const data = (await res.json()) as { prefs: Prefs };
        props.onPrefs(data.prefs);
        setPushOn(false);
        props.onMsg("푸시 알림을 끄셨습니다.");
      }
    } catch (e) {
      props.onError(e instanceof Error ? e.message : "푸시 설정 실패");
      setPushOn(!next);
    } finally {
      setPushBusy(false);
    }
  }

  return (
    <section className="card-panel space-y-4 !p-5">
      <div>
        <p className="text-sm font-medium text-heading">웹 푸시 (PWA)</p>
        <p className="mt-1 text-xs text-muted leading-relaxed">
          네이티브 앱 없이 휴대폰 알림으로 오늘의 운세를 받아요. 알림을 탭하면
          「오늘의 운세」로 이동합니다.
        </p>
      </div>

      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          className="mt-1 h-4 w-4 rounded"
          checked={pushOn}
          disabled={pushBusy}
          onChange={(e) => void togglePush(e.target.checked)}
        />
        <span>
          <span className="block text-sm font-medium text-heading">
            푸시로 오늘의 운세 받기
          </span>
          <span className="block text-xs text-muted mt-0.5">
            {canPush
              ? "브라우저 알림 권한이 필요합니다."
              : "이 환경에서는 웹 푸시를 쓸 수 없습니다."}
          </span>
        </span>
      </label>

      {iosHint && (
        <p
          className="rounded-xl border px-3 py-2 text-xs leading-relaxed text-body"
          style={{
            borderColor: "var(--border)",
            background: "var(--chip-bg)",
          }}
        >
          <strong className="text-heading">iOS 안내:</strong> 안정적인 푸시를
          위해 Safari에서 <em>공유 → 홈 화면에 추가</em>한 뒤, 홈 화면 아이콘으로
          연 앱에서 알림을 허용해 주세요. (iOS 16.4+)
        </p>
      )}

      {!iosHint && canPush && (
        <p className="text-xs text-muted leading-relaxed">
          Android Chrome은 알림 권한만 허용하면 됩니다. 홈 화면에 추가하면 앱처럼
          사용할 수 있어요.
        </p>
      )}

      {props.prefs?.lastPushYmd && (
        <p className="text-xs text-muted">
          최근 푸시 발송(서울 날짜): {props.prefs.lastPushYmd}
        </p>
      )}

      {pushBusy && (
        <p className="text-sm text-muted" role="status">
          푸시 설정 처리 중…
        </p>
      )}
    </section>
  );
}
