/**
 * AI helpers for tarot/saju interpretations.
 *
 * Calls go through a fallback chain (see getTarotChain):
 *   1. TAROT_AI_MODEL (primary, cheap paid Gateway model on the monthly free credits)
 *   2. TAROT_AI_FALLBACK_MODELS, comma separated. Entries prefixed "google:" call
 *      Gemini directly via @ai-sdk/google and are skipped when
 *      GOOGLE_GENERATIVE_AI_API_KEY is absent. Other entries are Gateway model ids.
 * Routes fall back to their template when every attempt fails.
 * Gateway auth: AI_GATEWAY_API_KEY, or OIDC on Vercel.
 */
import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

const DEFAULT_PRIMARY = "openai/gpt-4.1-mini";
const DEFAULT_FALLBACKS =
  "google:gemini-3.5-flash-lite,nvidia/nemotron-3.5-lightning-free";

/** Whole chain must finish well inside the routes' 60s maxDuration. */
const CHAIN_BUDGET_MS = 50_000;
const PRIMARY_TIMEOUT_MS = 20_000;
const FALLBACK_TIMEOUT_MS = 15_000;
/** Do not start an attempt with less time than this left. */
const MIN_ATTEMPT_MS = 4_000;

type ProviderOptions = Record<string, Record<string, string | number | boolean | Record<string, string | number>>>;

export interface TarotAttempt {
  kind: "gateway" | "google";
  /** Gateway id ("openai/gpt-4.1-mini") or Gemini id ("gemini-3.5-flash-lite"). */
  model: string;
  /** Log label, e.g. "gateway:openai/gpt-4.1-mini" or "google:gemini-3.5-flash-lite". */
  label: string;
  timeoutMs: number;
}

/** Primary Gateway model id (env override or default). */
export function getTarotModel(): string {
  return process.env.TAROT_AI_MODEL?.trim() || DEFAULT_PRIMARY;
}

function hasGatewayCredentials(): boolean {
  return Boolean(
    process.env.AI_GATEWAY_API_KEY ||
      process.env.VERCEL_OIDC_TOKEN ||
      process.env.VERCEL === "1"
  );
}

function hasGoogleKey(): boolean {
  return Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim());
}

function parseEntry(raw: string, timeoutMs: number): TarotAttempt | null {
  const id = raw.trim();
  if (!id) return null;
  if (id.startsWith("google:")) {
    const model = id.slice("google:".length).trim();
    return model ? { kind: "google", model, label: "google:" + model, timeoutMs } : null;
  }
  const model = id.startsWith("gateway:") ? id.slice("gateway:".length).trim() : id;
  return model ? { kind: "gateway", model, label: "gateway:" + model, timeoutMs } : null;
}

/**
 * Ordered attempts, with unavailable providers removed
 * (no Gemini key -> skip google:, no Gateway credentials -> skip Gateway).
 */
export function getTarotChain(): TarotAttempt[] {
  const fallbacks = process.env.TAROT_AI_FALLBACK_MODELS ?? DEFAULT_FALLBACKS;
  const entries = [parseEntry(getTarotModel(), PRIMARY_TIMEOUT_MS)].concat(
    fallbacks.split(",").map(function (e) {
      return parseEntry(e, FALLBACK_TIMEOUT_MS);
    })
  );
  const seen = new Set<string>();
  const out: TarotAttempt[] = [];
  for (const a of entries) {
    if (!a || seen.has(a.label)) continue;
    if (a.kind === "google" && !hasGoogleKey()) continue;
    if (a.kind === "gateway" && !hasGatewayCredentials()) continue;
    seen.add(a.label);
    out.push(a);
  }
  return out;
}

/**
 * Per-model provider options. Keyed by provider, so unrelated providers ignore them.
 * - nvidia nemotron: reasoning on by default burns the output budget (empty text).
 * - gemini 2.5: thinkingBudget 0; gemini 3+: thinkingLevel minimal.
 * - openai gpt-5 family: minimal reasoning effort.
 */
export function getProviderOptionsFor(a: Pick<TarotAttempt, "kind" | "model">): ProviderOptions | undefined {
  const m = a.model.toLowerCase();
  const bare = m.includes("/") ? m.slice(m.indexOf("/") + 1) : m;
  if (m.startsWith("nvidia/")) return { nvidia: { reasoningEffort: "none" } };
  if (a.kind === "google" || m.startsWith("google/")) {
    if (bare.startsWith("gemini-2.5")) return { google: { thinkingConfig: { thinkingBudget: 0 } } };
    if (bare.startsWith("gemini-")) return { google: { thinkingConfig: { thinkingLevel: "minimal" } } };
    return undefined;
  }
  if (m.startsWith("openai/gpt-5")) return { openai: { reasoningEffort: "minimal" } };
  return undefined;
}

/** Whether any AI attempt is possible (Gateway credentials or a Gemini key). */
export function canAttemptAi(): boolean {
  return getTarotChain().length > 0;
}

let googleProvider: ReturnType<typeof createGoogleGenerativeAI> | null = null;
function googleModel(id: string) {
  if (!googleProvider) googleProvider = createGoogleGenerativeAI();
  return googleProvider(id);
}

export type TarotAiResult =
  | { ok: true; text: string; servedBy: string; ms: number }
  | { ok: false; fail: AiFailInfo };

/**
 * Run the fallback chain. Any error (402/403 credits or free tier, 429, 5xx,
 * timeout) or empty text moves on to the next attempt. Never throws.
 */
export async function generateTarotText(opts: {
  route: string;
  system: string;
  prompt: string;
  maxOutputTokens: number;
}): Promise<TarotAiResult> {
  const chain = getTarotChain();
  const started = Date.now();
  let lastFail: AiFailInfo = {
    reason: "no_credentials",
    message: "AI\ub97c \uc4f8 \uc218 \uc5c6\uc5b4 \uae30\ubcf8 \ud574\uc11d\uc744 \ubcf4\uc5ec\ub4dc\ub824\uc694.",
    log: "no providers configured",
  };
  for (const a of chain) {
    const left = CHAIN_BUDGET_MS - (Date.now() - started);
    if (left < MIN_ATTEMPT_MS) {
      console.warn("[" + opts.route + "] AI chain budget exhausted before " + a.label);
      break;
    }
    const timeoutMs = Math.min(a.timeoutMs, left);
    const t0 = Date.now();
    try {
      const result = await generateText({
        model: a.kind === "google" ? googleModel(a.model) : a.model,
        system: opts.system,
        prompt: opts.prompt,
        maxOutputTokens: opts.maxOutputTokens,
        providerOptions: getProviderOptionsFor(a),
        // Fall back to the next provider instead of retrying the same one.
        maxRetries: 0,
        abortSignal: AbortSignal.timeout(timeoutMs),
      });
      const text = result.text ? result.text.trim() : "";
      const ms = Date.now() - t0;
      if (text) {
        console.info("[" + opts.route + "] AI served by " + a.label + " in " + ms + "ms (finish=" + result.finishReason + ")");
        return { ok: true, text, servedBy: a.label, ms };
      }
      lastFail = {
        reason: "empty",
        message: "AI \uc751\ub2f5\uc774 \ube44\uc5b4 \uae30\ubcf8 \ud574\uc11d\uc744 \ubcf4\uc5ec\ub4dc\ub824\uc694.",
        log: a.label + " empty (finish=" + result.finishReason + ")",
      };
      console.warn("[" + opts.route + "] AI attempt " + a.label + " empty after " + ms + "ms (finish=" + result.finishReason + ")");
    } catch (err) {
      lastFail = classifyAiError(err);
      console.warn("[" + opts.route + "] AI attempt " + a.label + " failed after " + (Date.now() - t0) + "ms: " + lastFail.reason + " | " + lastFail.log);
    }
  }
  return { ok: false, fail: lastFail };
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
    /credit card|customer_verification|payment method|add a card|unlock your free credits|insufficient|free tier users|paid credits|quota_for_entity_exceeded|status=402|status=403/i.test(
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
