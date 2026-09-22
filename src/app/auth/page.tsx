"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser, saveUser, getOnboarding } from "@/lib/storage";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const user = getUser();
    if (user) {
      router.replace(getOnboarding() ? "/draw" : "/onboarding");
    }
  }, [router]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();

    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      setError("올바른 이메일을 입력해 주세요.");
      return;
    }
    if (mode === "signup" && trimmedName.length < 1) {
      setError("이름을 입력해 주세요.");
      return;
    }

    const existing = getUser();
    if (mode === "login") {
      if (!existing || existing.email !== trimmedEmail) {
        setError("등록된 계정이 없습니다. 회원가입을 진행해 주세요.");
        return;
      }
      router.push(getOnboarding() ? "/draw" : "/onboarding");
      return;
    }

    saveUser({
      email: trimmedEmail,
      name: trimmedName || trimmedEmail.split("@")[0],
      createdAt: new Date().toISOString(),
    });
    router.push("/onboarding");
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-amber-100">
          {mode === "signup" ? "회원가입" : "로그인"}
        </h1>
        <p className="mt-2 text-sm text-violet-300">
          데모 인증입니다. 이메일과 이름은 이 기기에만 저장됩니다.
        </p>
      </div>

      <div className="card-panel">
        <div className="mb-6 flex rounded-full bg-violet-950/60 p-1">
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setError("");
            }}
            className={`flex-1 rounded-full py-2 text-sm transition ${
              mode === "signup"
                ? "bg-violet-600 text-white"
                : "text-violet-300 hover:text-white"
            }`}
          >
            회원가입
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError("");
            }}
            className={`flex-1 rounded-full py-2 text-sm transition ${
              mode === "login"
                ? "bg-violet-600 text-white"
                : "text-violet-300 hover:text-white"
            }`}
          >
            로그인
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <label className="block space-y-1.5">
              <span className="text-sm text-violet-200">이름</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: 민지"
                className="w-full rounded-xl border border-violet-700/60 bg-[#12081f] px-4 py-3 text-sm text-violet-50 outline-none focus:border-amber-400/60"
                autoComplete="name"
              />
            </label>
          )}
          <label className="block space-y-1.5">
            <span className="text-sm text-violet-200">이메일</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-violet-700/60 bg-[#12081f] px-4 py-3 text-sm text-violet-50 outline-none focus:border-amber-400/60"
              autoComplete="email"
              required
            />
          </label>

          {error && (
            <p className="text-sm text-rose-300" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="btn-primary w-full">
            {mode === "signup" ? "가입하고 시작하기" : "로그인"}
          </button>
        </form>
      </div>

      <p className="text-center text-xs text-violet-500">
        추후 실제 인증(OAuth/이메일 매직링크)으로 교체할 수 있도록 구조화되어 있습니다.
      </p>
    </div>
  );
}
