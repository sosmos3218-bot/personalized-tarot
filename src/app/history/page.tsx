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
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs tracking-widest text-amber-300/70">HISTORY</p>
          <h1 className="mt-1 text-2xl font-bold text-amber-100">리딩 기록</h1>
          <p className="mt-1 text-sm text-violet-300">
            이 기기에 저장된 최근 리딩입니다. (최대 50건)
          </p>
        </div>
        {items.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-rose-300/80 hover:text-rose-200"
          >
            전체 삭제
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="card-panel text-center space-y-4">
          <p className="text-violet-300">아직 저장된 리딩이 없습니다.</p>
          <Link href="/draw" className="btn-primary">
            첫 카드 뽑기
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
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
                  className="card-panel block transition hover:border-amber-400/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-amber-100">
                        {SPREAD_LABELS[r.spread]}
                      </p>
                      <p className="mt-1 text-xs text-violet-300">
                        {CONCERN_LABELS[r.onboarding.concern]} · {cardNames}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-violet-500">
                      {dateLabel}
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <div className="text-center">
        <Link href="/draw" className="btn-secondary">
          새 리딩 시작
        </Link>
      </div>
    </div>
  );
}
