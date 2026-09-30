import type { Metadata } from "next";

const title = "오늘의 운세 — 별빛 타로";
const description =
  "서울 기준 오늘의 사주 기운과 타로 한 장. 별빛 타로에서 운세 점수를 확인하고 카드로 공유하세요.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    url: "https://personalized-tarot.vercel.app/today",
    siteName: "별빛 타로",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary",
    title,
    description,
  },
};

export default function TodayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
