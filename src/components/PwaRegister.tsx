"use client";

import { useEffect, useState } from "react";
import { ensureServiceWorker } from "@/lib/client/push";

/**
 * Registers the service worker early and shows a light install / iOS hint.
 */
export default function PwaRegister() {
  const [hint, setHint] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    void ensureServiceWorker();

    try {
      if (sessionStorage.getItem("pwa-hint-dismissed") === "1") {
        setDismissed(true);
        return;
      }
    } catch {
      /* ignore */
    }

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // iOS Safari
      ("standalone" in navigator &&
        (navigator as Navigator & { standalone?: boolean }).standalone === true);

    if (isStandalone) return;

    const ua = navigator.userAgent || "";
    const isIOS = /iPad|iPhone|iPod/.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const isAndroid = /Android/i.test(ua);

    if (isIOS) {
      setHint(
        "iOS에서 푸시를 받으려면 Safari → 공유 → 「홈 화면에 추가」 후 설치된 앱에서 알림을 허용하세요."
      );
    } else if (isAndroid) {
      setHint(
        "홈 화면에 추가하면 앱처럼 쓸 수 있어요. 알림은 설정에서 켤 수 있습니다."
      );
    }
  }, []);

  if (!hint || dismissed) return null;

  return (
    <div
      className="fixed bottom-3 left-3 right-3 z-40 mx-auto max-w-lg rounded-2xl border px-3 py-2.5 text-xs leading-relaxed shadow-lg sm:left-auto"
      style={{
        background: "var(--surface)",
        borderColor: "var(--border)",
        color: "var(--foreground)",
      }}
      role="status"
    >
      <div className="flex items-start gap-2">
        <p className="flex-1 text-body">{hint}</p>
        <button
          type="button"
          className="shrink-0 rounded-lg px-2 py-1 text-[11px] font-medium text-muted hover:text-heading"
          onClick={() => {
            setDismissed(true);
            try {
              sessionStorage.setItem("pwa-hint-dismissed", "1");
            } catch {
              /* ignore */
            }
          }}
          aria-label="닫기"
        >
          닫기
        </button>
      </div>
      <p className="mt-1 text-[10px] text-muted">
        자세한 알림 설정은{" "}
        <a href="/settings" className="underline underline-offset-2">
          알림
        </a>
        에서
      </p>
    </div>
  );
}
