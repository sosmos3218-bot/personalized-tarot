import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { koKR } from "@clerk/localizations";
import Header from "@/components/Header";
import { ThemeProvider } from "@/components/ThemeProvider";
import { clerkAppearance } from "@/lib/clerk-appearance";
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
  title: "별빛 타로 — 타로+사주 퓨전",
  description:
    "사주(만세력) 기운과 타로 카드를 결합한 개인화 퓨전 리딩. 메이저 아르카나와 일간·오행으로 오늘의 메시지를 받아보세요.",
};

const themeInitScript = `
(function(){
  try {
    var t = localStorage.getItem('starlight-tarot-theme');
    if (t === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} mystic-bg antialiased min-h-screen`}
      >
        <ClerkProvider
          localization={koKR}
          appearance={clerkAppearance}
          signInUrl="/sign-in"
          signUpUrl="/sign-up"
          signInFallbackRedirectUrl="/saju"
          signUpFallbackRedirectUrl="/saju"
        >
          <ThemeProvider>
            <Header />
            <main className="mx-auto max-w-3xl px-4 py-6 sm:py-10 pb-16">
              {children}
            </main>
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
