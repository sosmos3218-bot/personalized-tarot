"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser, getOnboarding } from "@/lib/storage";

interface Props {
  children: React.ReactNode;
  requireOnboarding?: boolean;
}

export default function AuthGate({ children, requireOnboarding = false }: Props) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const user = getUser();
    if (!user) {
      router.replace("/auth");
      return;
    }
    if (requireOnboarding && !getOnboarding()) {
      router.replace("/onboarding");
      return;
    }
    setReady(true);
  }, [router, requireOnboarding]);

  if (!ready) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-violet-300">
        <p className="animate-pulse">불러오는 중…</p>
      </div>
    );
  }

  return <>{children}</>;
}
