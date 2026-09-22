import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Header from "@/components/Header";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "별빛 타로 — 나를 위한 개인화 타로",
  description:
    "회원가입 후 온보딩 답변에 맞춘 개인화 타로 리딩. 메이저 아르카나로 오늘의 메시지를 받아보세요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} mystic-bg antialiased min-h-screen`}
      >
        <Header />
        <main className="mx-auto max-w-3xl px-4 py-8 pb-16">{children}</main>
      </body>
    </html>
  );
}
