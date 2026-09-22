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
  title: "별빛 타로 — 나를 위한 개인화 타로",
  description:
    "회원가입 후 온보딩 답변에 맞춘 개인화 타로 리딩. 메이저 아르카나로 오늘의 메시지를 받아보세요.",
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
          signInFallbackRedirectUrl="/onboarding"
          signUpFallbackRedirectUrl="/onboarding"
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
