"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getUser, clearUser } from "@/lib/storage";
import type { User } from "@/lib/types";
import { useRouter } from "next/navigation";

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    setUser(getUser());
  }, []);

  function handleLogout() {
    clearUser();
    setUser(null);
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-violet-900/40 bg-[#0b0614]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-wide text-amber-200">
          <span className="text-lg" aria-hidden>
            ✦
          </span>
          <span>별빛 타로</span>
        </Link>
        <nav className="flex items-center gap-3 text-sm text-violet-200">
          {user ? (
            <>
              <Link href="/draw" className="hover:text-amber-200 transition-colors">
                뽑기
              </Link>
              <Link href="/history" className="hover:text-amber-200 transition-colors">
                기록
              </Link>
              <span className="hidden sm:inline text-violet-400">{user.name}님</span>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full border border-violet-700/60 px-3 py-1 text-xs hover:border-amber-400/60 hover:text-amber-200 transition-colors"
              >
                로그아웃
              </button>
            </>
          ) : (
            <Link
              href="/auth"
              className="rounded-full bg-violet-700/80 px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-600 transition-colors"
            >
              시작하기
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
