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

export type AiFailReason =
  | "no_credentials"
  | "billing"
  | "auth"
  | "model_not_found"
  | "rate_limit"
  | "empty"
  | "timeout"
  | "unknown";

export interface AiFailInfo {
  reason: AiFailReason;
  /** User-facing Korean message */
  message: string;
  /** Short log snippet (no secrets) */
  log: string;
}

function errText(err: unknown): string {
  if (err instanceof Error) {
    const parts = [err.name, err.message];
    const status = (err as { statusCode?: number }).statusCode;
    if (status) parts.push("status=" + status);
    return parts.filter(Boolean).join(" | ");
  }
  return String(err);
}

/**
 * Map Gateway / SDK failures to a stable reason + graceful Korean copy.
 * Prefer fixing billing/auth so AI succeeds; this only softens the fallback UX.
 */
export function classifyAiError(err: unknown): AiFailInfo {
  const text = errText(err);
  const lower = text.toLowerCase();

  if (
    /credit card|customer_verification|payment method|add a card|unlock your free credits/i.test(
      text
    )
  ) {
    return {
      reason: "billing",
      message:
        "AI \ud574\uc11d\uc744 \uc7a0\uc2dc \uc4f8 \uc218 \uc5c6\uc5b4 \uae30\ubcf8 \ud574\uc11d\uc744 \ubcf4\uc5ec\ub4dc\ub824\uc694. (\uc11c\ube44\uc2a4 \uce21 AI \uacb0\uc81c \uc218\ub2e8 \ud655\uc778\uc774 \ud544\uc694\ud569\ub2c8\ub2e4)",
      log: text.slice(0, 240),
    };
  }

  if (
    /unauthenticated|authentication|401|invalid.?api.?key|ai_gateway_api_key/i.test(
      lower
    )
  ) {
    return {
      reason: "auth",
      message:
        "AI \uc5f0\uacb0\uc5d0 \ubb38\uc81c\uac00 \uc788\uc5b4 \uae30\ubcf8 \ud574\uc11d\uc744 \ubcf4\uc5ec\ub4dc\ub824\uc694. \uc7a0\uc2dc \ud6c4 \ub2e4\uc2dc \uc2dc\ub3c4\ud574 \uc8fc\uc138\uc694.",
      log: text.slice(0, 240),
    };
  }

  if (/model.?not.?found|does not exist|unknown model|404/i.test(lower)) {
    return {
      reason: "model_not_found",
      message:
        "AI \ubaa8\ub378 \uc124\uc815\uc5d0 \ubb38\uc81c\uac00 \uc788\uc5b4 \uae30\ubcf8 \ud574\uc11d\uc744 \ubcf4\uc5ec\ub4dc\ub824\uc694.",
      log: text.slice(0, 240),
    };
  }

  if (/rate.?limit|429|too many requests/i.test(lower)) {
    return {
      reason: "rate_limit",
      message:
        "\uc694\uccad\uc774 \ubab0\ub824 AI\ub97c \uc7a0\uc2dc \uc4f8 \uc218 \uc5c6\uc5b4 \uae30\ubcf8 \ud574\uc11d\uc744 \ubcf4\uc5ec\ub4dc\ub824\uc694. \uc7a0\uc2dc \ud6c4 \ub2e4\uc2dc \uc2dc\ub3c4\ud574 \uc8fc\uc138\uc694.",
      log: text.slice(0, 240),
    };
  }

  if (/timeout|timed out|abort|ETIMEDOUT|ECONNRESET/i.test(text)) {
    return {
      reason: "timeout",
      message:
        "AI \uc751\ub2f5\uc774 \ub2a6\uc5b4 \uae30\ubcf8 \ud574\uc11d\uc744 \ubcf4\uc5ec\ub4dc\ub824\uc694. \uc7a0\uc2dc \ud6c4 \ub2e4\uc2dc \uc2dc\ub3c4\ud574 \uc8fc\uc138\uc694.",
      log: text.slice(0, 240),
    };
  }

  return {
    reason: "unknown",
    message: "AI \ud574\uc11d\uc5d0 \uc2e4\ud328\ud574 \uae30\ubcf8 \ud574\uc11d\uc744 \ubcf4\uc5ec\ub4dc\ub824\uc694.",
    log: text.slice(0, 240),
  };
}
