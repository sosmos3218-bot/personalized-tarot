import type { Metadata } from "next";
import RetryButton from "./RetryButton";

export const metadata: Metadata = {
  title: "오프라인 | 별빛 타로",
};

export default function OfflinePage() {
  return (
    <div className="mx-auto max-w-md text-center space-y-5 pt-10 animate-fade-up">
      <div className="text-5xl" aria-hidden>
        ✦
      </div>
      <h1 className="text-2xl font-bold text-heading">
        지금은 별빛이 잠시 닿지 않아요
      </h1>
      <p className="text-sm text-body leading-relaxed">
        인터넷 연결이 끊어진 것 같아요. 와이파이나 모바일 데이터를 확인한 뒤
        다시 시도해 주세요. 연결되면 오늘의 운세와 리딩을 바로 이어서 볼 수
        있어요.
      </p>
      <RetryButton />
    </div>
  );
}
