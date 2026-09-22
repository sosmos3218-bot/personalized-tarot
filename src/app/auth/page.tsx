"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Legacy demo auth — redirects to Clerk sign-up */
export default function AuthRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/sign-up");
  }, [router]);

  return (
    <div className="flex min-h-[40vh] items-center justify-center text-body">
      <p className="animate-pulse">회원가입 페이지로 이동 중…</p>
    </div>
  );
}
