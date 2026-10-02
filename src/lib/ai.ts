/**
 * Vercel AI Gateway helpers for tarot/saju interpretations.
 * Prefer AI_GATEWAY_API_KEY when set; on Vercel, OIDC (VERCEL / VERCEL_OIDC_TOKEN) also works.
 */

const DEFAULT_MODEL = "inclusionai/ling-3.1-flash-free";

/** Gateway model id: env override or free default. */
export function getTarotModel(): string {
  return process.env.TAROT_AI_MODEL?.trim() || DEFAULT_MODEL;
}

/**
 * Whether we should attempt a live Gateway call.
 * Static key preferred; production OIDC path when VERCEL=1 or VERCEL_OIDC_TOKEN is present.
 */
export function canAttemptAi(): boolean {
  return Boolean(
    process.env.AI_GATEWAY_API_KEY ||
      process.env.VERCEL_OIDC_TOKEN ||
      process.env.VERCEL === "1"
  );
}
