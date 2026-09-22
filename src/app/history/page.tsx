"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AuthGate from "@/components/AuthGate";
import { clearHistory, getHistory } from "@/lib/storage";
import type { ReadingResult } from "@/lib/types";
import {
  CONCERN_LABELS,
  SPREAD_LABELS,
} from "@/lib/types";

export default function HistoryPage() {
  return (
    <AuthGate>
      <HistoryList />
    </AuthGate>
  );
}

function HistoryList() {
  const [items, setItems] = useState<ReadingResult[]>([]);

  useEffect(() => {
    setItems(getHistory());
  }, []);

  function handleClear() {
    if (!confirm("모든 리딩 기록을 삭제할까요?")) return;
    clearHistory();
    setItems([]);
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] tracking-[0.22em] text-accent font-medium">HISTORY</p>
          <h1 className="mt-1 text-2xl font-bold text-heading">리딩 기록</h1>
          <p className="mt-1 text-sm text-body">
            이 기기에 저장된 최근 리딩입니다. (최대 50건)
          </p>
        </div>
        {items.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="text-xs shrink-0 transition-colors"
            style={{ color: "var(--rose)" }}
          >
            전체 삭제
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="card-panel text-center space-y-5 !py-10">
          <div
            className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border text-2xl"
            style={{ borderColor: "var(--border)", background: "var(--chip-bg)" }}
            aria-hidden
          >
            ✧
          </div>
          <div>
            <p className="font-medium text-heading">아직 저장된 리딩이 없습니다</p>
            <p className="mt-1.5 text-sm text-body">
              첫 카드를 뽑아 나만의 기록을 남겨보세요.
            </p>
          </div>
          <Link href="/draw" className="btn-primary inline-flex">
            첫 카드 뽑기
          </Link>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {items.map((r) => {
            const dateLabel = new Date(r.createdAt).toLocaleString("ko-KR", {
              timeZone: "Asia/Seoul",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });
            const cardNames = r.cards.map((c) => c.card.nameKo).join(" · ");
            return (
              <li key={r.id}>
                <Link
                  href={`/result?id=${r.id}`}
                  className="card-panel block transition hover:border-[var(--accent-gold-bright)] !p-4 sm:!p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-heading">
                        {SPREAD_LABELS[r.spread]}
                      </p>
                      <p className="mt-1 text-xs text-body truncate">
                        {CONCERN_LABELS[r.onboarding.concern]} · {cardNames}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-muted pt-0.5">
                      {dateLabel}
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <div className="text-center pt-2">
        <Link href="/draw" className="btn-secondary">
          새 리딩 시작
        </Link>
      </div>
    </div>
  );
}
