/**
 * Private Vercel Blob JSON document helpers.
 * Paths are scoped under users/{userId}/…
 */
import { get, put } from "@vercel/blob";

const ACCESS = "private" as const;

export function userPath(userId: string, ...parts: string[]): string {
  const safe = parts.map((p) => p.replace(/[^a-zA-Z0-9._-]/g, "_"));
  return ["users", userId.replace(/[^a-zA-Z0-9_-]/g, "_"), ...safe].join("/");
}

export async function readJsonBlob<T>(pathname: string): Promise<T | null> {
  try {
    const result = await get(pathname, { access: ACCESS });
    if (!result || result.statusCode !== 200 || !result.stream) return null;
    const text = await new Response(result.stream).text();
    if (!text.trim()) return null;
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

export async function writeJsonBlob(
  pathname: string,
  data: unknown
): Promise<void> {
  await put(pathname, JSON.stringify(data), {
    access: ACCESS,
    contentType: "application/json",
    allowOverwrite: true,
    addRandomSuffix: false,
    cacheControlMaxAge: 60,
  });
}
