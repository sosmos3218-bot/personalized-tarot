"use client";

import { useState } from "react";
import type { DailyFortune } from "@/lib/daily";
import {
  SHARE_PAGE_URL,
  renderShareCardBlob,
  shareCaption,
  type ShareCardContent,
} from "@/lib/daily/shareCard";

function toContent(
  fortune: DailyFortune,
  tarotName?: string | null
): ShareCardContent {
  return {
    dateLabel: fortune.dateLabel,
    luckScore: fortune.luckScore,
    headline: fortune.energyTone,
    focus: fortune.focus,
    tarotName: tarotName ?? null,
    dayMasterStem: fortune.dayMasterStem,
    dayMasterLabel: fortune.dayMasterLabel,
    todayPillarLabel: fortune.todayPillar.label,
    relationLabel: fortune.relationLabel,
  };
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export default function ShareFortuneCard({
  fortune,
  tarotName,
}: {
  fortune: DailyFortune;
  tarotName?: string | null;
}) {
  const [busy, setBusy] = useState<"share" | "save" | null>(null);
  const [note, setNote] = useState<string | null>(null);

  async function onSave() {
    setBusy("save");
    setNote(null);
    try {
      const content = toContent(fortune, tarotName);
      const blob = await renderShareCardBlob(content);
      downloadBlob(blob, `byeolbit-${fortune.dateYmd}.png`);
      const copied = await copyText(`${shareCaption(content)}`);
      setNote(
        copied
          ? "이미지를 저장했고, 공유 문구와 링크를 복사했습니다."
          : "이미지를 저장했습니다. 링크: " + SHARE_PAGE_URL
      );
    } catch {
      setNote("이미지를 만들지 못했습니다. 다시 시도해 주세요.");
    } finally {
      setBusy(null);
    }
  }

  async function onShare() {
    setBusy("share");
    setNote(null);
    const content = toContent(fortune, tarotName);
    const caption = shareCaption(content);
    try {
      const blob = await renderShareCardBlob(content);
      const file = new File([blob], `byeolbit-${fortune.dateYmd}.png`, {
        type: "image/png",
      });
      const nav = navigator as Navigator & {
        canShare?: (data: ShareData) => boolean;
      };
      if (nav.share && nav.canShare?.({ files: [file] })) {
        await nav.share({
          files: [file],
          title: "별빛 타로 · 오늘의 운세",
          text: caption,
        });
        setNote("공유 시트를 열었습니다.");
        return;
      }
      if (nav.share) {
        await nav.share({
          title: "별빛 타로 · 오늘의 운세",
          text: caption,
          url: SHARE_PAGE_URL,
        });
        setNote("링크와 문구를 공유했습니다.");
        return;
      }
      downloadBlob(blob, `byeolbit-${fortune.dateYmd}.png`);
      const copied = await copyText(caption);
      setNote(
        copied
          ? "이 브라우저는 공유 시트를 지원하지 않아 이미지를 저장하고 문구를 복사했습니다."
          : "이미지를 저장했습니다. 링크를 직접 복사해 주세요: " + SHARE_PAGE_URL
      );
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setNote(null);
        return;
      }
      setNote("공유에 실패했습니다. 이미지 저장을 이용해 주세요.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="card-panel space-y-3 !p-5 sm:!p-6">
      <div>
        <h2 className="font-semibold text-heading flex items-center gap-2">
          <span className="text-accent" aria-hidden>
            ✦
          </span>
          운세 카드 공유
        </h2>
        <p className="mt-1 text-xs text-body leading-relaxed">
          오늘의 점수, 한줄 운세, 일간
          {tarotName ? "과 타로 카드" : ""}를 이미지로 나눌 수 있습니다. 개인
          사주 원국 전체는 넣지 않습니다.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="btn-primary text-sm"
          disabled={busy !== null}
          onClick={() => void onShare()}
        >
          {busy === "share" ? "준비 중…" : "공유하기"}
        </button>
        <button
          type="button"
          className="btn-secondary text-sm"
          disabled={busy !== null}
          onClick={() => void onSave()}
        >
          {busy === "save" ? "저장 중…" : "이미지 저장"}
        </button>
      </div>
      {note && (
        <p className="text-xs text-body leading-relaxed" role="status">
          {note}
        </p>
      )}
    </section>
  );
}
