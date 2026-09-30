"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { getOnboarding, getSajuProfile } from "@/lib/storage";

interface Props {
  children: React.ReactNode;
  /** 맞춤 리딩용 온보딩 필수 — /today는 요구하지 않음 */
  requireOnboarding?: boolean;
  /** 사주 프로필 필수 */
  requireSaju?: boolean;
}

export default function AuthGate({
  children,
  requireOnboarding = false,
  requireSaju = false,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoaded, isSignedIn, userId } = useAuth();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn || !userId) {
      router.replace("/sign-in");
      return;
    }

    if (requireSaju && !getSajuProfile(userId)) {
      const from = pathname && pathname !== "/saju" ? pathname : "";
      const params = new URLSearchParams({ need: "saju" });
      if (from) params.set("from", from);
      router.replace(`/saju?${params.toString()}`);
      return;
    }

    if (requireOnboarding && !getOnboarding(userId)) {
      const from = pathname && pathname !== "/onboarding" ? pathname : "";
      const params = new URLSearchParams({ soft: "1" });
      if (from) params.set("from", from);
      router.replace(`/onboarding?${params.toString()}`);
      return;
    }

    setReady(true);
  }, [
    isLoaded,
    isSignedIn,
    userId,
    router,
    pathname,
    requireOnboarding,
    requireSaju,
  ]);

  if (!isLoaded || !ready) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-body">
        <p className="animate-pulse">불러오는 중…</p>
      </div>
    );
  }

  return <>{children}</>;
}
