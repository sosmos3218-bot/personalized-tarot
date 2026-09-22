"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { getOnboarding } from "@/lib/storage";

interface Props {
  children: React.ReactNode;
  requireOnboarding?: boolean;
}

export default function AuthGate({ children, requireOnboarding = false }: Props) {
  const router = useRouter();
  const { isLoaded, isSignedIn, userId } = useAuth();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn || !userId) {
      router.replace("/sign-in");
      return;
    }

    if (requireOnboarding && !getOnboarding(userId)) {
      router.replace("/onboarding");
      return;
    }

    setReady(true);
  }, [isLoaded, isSignedIn, userId, router, requireOnboarding]);

  if (!isLoaded || !ready) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-body">
        <p className="animate-pulse">불러오는 중…</p>
      </div>
    );
  }

  return <>{children}</>;
}
