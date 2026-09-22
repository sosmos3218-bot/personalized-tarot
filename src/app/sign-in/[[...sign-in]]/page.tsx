import { SignIn } from "@clerk/nextjs";
import { clerkAppearance } from "@/lib/clerk-appearance";

export default function SignInPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center space-y-6 animate-fade-up py-4">
      <div className="text-center">
        <p className="text-[11px] tracking-[0.22em] text-accent font-medium">
          SIGN IN
        </p>
        <h1 className="mt-2 text-2xl font-bold text-heading">로그인</h1>
        <p className="mt-2 text-sm text-body">
          계정으로 로그인하고 개인화 타로를 이어가세요.
        </p>
      </div>
      <SignIn
        appearance={clerkAppearance}
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        fallbackRedirectUrl="/onboarding"
        forceRedirectUrl="/onboarding"
      />
    </div>
  );
}
