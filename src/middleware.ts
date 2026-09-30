import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

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
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
