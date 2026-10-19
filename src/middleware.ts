import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/** Always public: legal pages, account deletion info, offline fallback. */
const isPublicRoute = createRouteMatcher([
  "/",
  "/privacy(.*)",
  "/terms(.*)",
  "/account-deletion(.*)",
  "/offline(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
]);

const isProtectedRoute = createRouteMatcher([
  "/onboarding(.*)",
  "/saju(.*)",
  "/draw(.*)",
  "/result(.*)",
  "/history(.*)",
  "/today(.*)",
  "/settings(.*)",
  "/api/interpret(.*)",
  "/api/daily-interpret(.*)",
  "/api/history(.*)",
  "/api/saju-profile(.*)",
  "/api/daily-lock(.*)",
  "/api/prefs(.*)",
  "/api/push(.*)",
  "/api/account(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) return;
  if (!isProtectedRoute(req)) return;
  if (req.nextUrl.pathname.startsWith("/api/")) {
    await auth.protect();
    return;
  }
  // Signed-out page visits go to our sign-in page instead of a 404.
  const { userId } = await auth();
  if (!userId) {
    const url = new URL("/sign-in", req.url);
    url.searchParams.set(
      "redirect_url",
      req.nextUrl.pathname + req.nextUrl.search
    );
    return NextResponse.redirect(url);
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
