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
        <p className="mt-2 text-sm text-body">
          가입 후 온보딩을 거쳐 나만의 타로 리딩을 받아보세요.
        </p>
      </div>
      <SignUp
        appearance={clerkAppearance}
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        fallbackRedirectUrl="/onboarding"
        forceRedirectUrl="/onboarding"
      />
    </div>
  );
}
