import { SignUp } from "@clerk/nextjs";
import { clerkAppearance } from "@/lib/clerk-appearance";

export default function SignUpPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center space-y-6 animate-fade-up py-4">
      <div className="text-center">
        <p className="text-[11px] tracking-[0.22em] text-accent font-medium">
          SIGN UP
        </p>
        <h1 className="mt-2 text-2xl font-bold text-heading">회원가입</h1>
        <p className="mt-2 text-sm text-body leading-relaxed px-2">
          가입 → 사주 →{" "}
          <strong className="text-heading font-medium">오늘의 운세</strong>.
          타로+사주 퓨전으로 하루를 열어보세요. 맞춤 리딩은 선택입니다.
        </p>
      </div>
      <SignUp
        appearance={clerkAppearance}
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        fallbackRedirectUrl="/saju"
        forceRedirectUrl="/saju"
      />
    </div>
  );
}
