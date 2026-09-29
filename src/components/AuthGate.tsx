"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { getOnboarding, getSajuProfile } from "@/lib/storage";

interface Props {
  children: React.ReactNode;
  requireOnboarding?: boolean;
  /** 사주 프로필 필수 (기본: requireOnboarding과 동일하게 적용하려면 명시) */
  requireSaju?: boolean;
}

export default function AuthGate({
  children,
  requireOnboarding = false,
  requireSaju = false,
}: Props) {
  const router = useRouter();
  const { isLoaded, isSignedIn, userId } = useAuth();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn || !userId) {
      router.replace("/sign-in");
      return;
    }

    if (requireSaju && !getSajuProfile(userId)) {
      router.replace("/saju");
      return;
    }

    if (requireOnboarding && !getOnboarding(userId)) {
      router.replace("/onboarding");
      return;
    }

    setReady(true);
  }, [isLoaded, isSignedIn, userId, router, requireOnboarding, requireSaju]);

  if (!isLoaded || !ready) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-body">
        <p className="animate-pulse">불러오는 중…</p>
      </div>
    );
  }

  return <>{children}</>;
}
