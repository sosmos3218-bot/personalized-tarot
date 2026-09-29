/**
 * 결정적 해시 — 같은 userId+date면 같은 운세 텍스트/점수.
 * crypto 없이 동작하는 간단한 FNV-1a 변형.
 */

export function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** 0..1 의사난수 시퀀스 (결정적) */
export function seededUnit(seed: number, salt = 0): number {
  const x = Math.imul(seed ^ (salt * 0x9e3779b9), 0x85ebca6b) >>> 0;
  return (x % 10000) / 10000;
}

export function pickIndex(seed: number, length: number, salt = 0): number {
  if (length <= 0) return 0;
  return Math.floor(seededUnit(seed, salt) * length) % length;
}

export function pickFrom<T>(seed: number, items: readonly T[], salt = 0): T {
  return items[pickIndex(seed, items.length, salt)]!;
}
