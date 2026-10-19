/**
 * Writes binary brand assets (PNG icons, favicon) into public/ before build.
 * They are stored as base64 text in scripts/brand-assets/ so the repo can be
 * updated through text-only tooling. File name "icons__icon-192.png.b64"
 * maps to "public/icons/icon-192.png".
 */
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = join(root, "scripts", "brand-assets");

for (const name of readdirSync(srcDir)) {
  if (!name.endsWith(".b64")) continue;
  const rel = name.slice(0, -4).split("__").join("/");
  const out = join(root, "public", rel);
  const buf = Buffer.from(readFileSync(join(srcDir, name), "utf8").replace(/\s+/g, ""), "base64");
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, buf);
  console.log(`[brand-assets] public/${rel} (${buf.length} bytes)`);
}
