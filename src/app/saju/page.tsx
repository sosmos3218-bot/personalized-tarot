"use client";

import { Suspense } from "react";
import AuthGate from "@/components/AuthGate";
import SajuForm from "./SajuForm";

export default function SajuPage() {
  return (
    <AuthGate>
      <Suspense
        fallback={
          <p className="text-center text-body animate-pulse">불러오는 중…</p>
        }
      >
        <SajuForm />
      </Suspense>
    </AuthGate>
  );
}
