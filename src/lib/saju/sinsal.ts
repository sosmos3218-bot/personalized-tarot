/**
 * 신살(神殺) 일부 — 지지·일간 기반 간이 규칙 (참고용)
 * 도화 · 화개 · 역마 · 공망 · 천을귀인
 */
import { BRANCHES } from "./constants";
import type { Pillar } from "./types";

export interface SinsalHit {
  key: string;
  nameKo: string;
  nameHan: string;
  brief: string;
  /** 어느 주에서 성립했는지 */
  where: string[];
}

export interface SinsalSet {
  items: SinsalHit[];
  /** 공망 지지 (없으면 빈 배열) */
  gongmangBranches: string[];
  compact: string;
}

/** 삼합 그룹 → 도화/화개/역마 지지 index */
const SAMHAP: Record<
  number,
  { peach: number; hwagae: number; yeokma: number; name: string }
> = {
  // 申子辰 수국
  8: { peach: 9, hwagae: 4, yeokma: 2, name: "신자진" }, // 酉 辰 寅
  0: { peach: 9, hwagae: 4, yeokma: 2, name: "신자진" },
  4: { peach: 9, hwagae: 4, yeokma: 2, name: "신자진" },
  // 寅午戌 화국
  2: { peach: 3, hwagae: 10, yeokma: 8, name: "인오술" }, // 卯 戌 申
  6: { peach: 3, hwagae: 10, yeokma: 8, name: "인오술" },
  10: { peach: 3, hwagae: 10, yeokma: 8, name: "인오술" },
  // 巳酉丑 금국
  5: { peach: 6, hwagae: 1, yeokma: 11, name: "사유축" }, // 午 丑 亥
  9: { peach: 6, hwagae: 1, yeokma: 11, name: "사유축" },
  1: { peach: 6, hwagae: 1, yeokma: 11, name: "사유축" },
  // 亥卯未 목국
  11: { peach: 0, hwagae: 7, yeokma: 5, name: "해묘미" }, // 子 未 巳
  3: { peach: 0, hwagae: 7, yeokma: 5, name: "해묘미" },
  7: { peach: 0, hwagae: 7, yeokma: 5, name: "해묘미" },
};

/** 일간 → 천을귀인 지지 indices */
const CHEONEUL: Record<number, number[]> = {
  0: [1, 7], // 甲 → 丑未
  1: [0, 8], // 乙 → 子申
  2: [11, 9], // 丙 → 亥酉
  3: [11, 9], // 丁 → 亥酉
  4: [1, 7], // 戊 → 丑未
  5: [0, 8], // 己 → 子申
  6: [2, 6], // 庚 → 寅午
  7: [2, 6], // 辛 → 寅午
  8: [3, 5], // 壬 → 卯巳
  9: [3, 5], // 癸 → 卯巳
};

function branchLabel(i: number): string {
  const b = BRANCHES[((i % 12) + 12) % 12];
  return `${b.han}(${b.ko})`;
}

export function computeSinsal(args: {
  dayStemIndex: number;
  dayBranchIndex: number;
  year: Pillar;
  month: Pillar;
  day: Pillar;
  hour: Pillar | null;
}): SinsalSet {
  const pillars: { name: string; branchIndex: number }[] = [
    { name: "년", branchIndex: args.year.branchIndex },
    { name: "월", branchIndex: args.month.branchIndex },
    { name: "일", branchIndex: args.day.branchIndex },
  ];
  if (args.hour) {
    pillars.push({ name: "시", branchIndex: args.hour.branchIndex });
  }

  // 일지 기준 삼합 신살 (년월일시 지지에 해당 살 있으면 hit)
  const base = SAMHAP[args.dayBranchIndex];
  const items: SinsalHit[] = [];

  function collect(
    key: string,
    nameKo: string,
    nameHan: string,
    brief: string,
    targetBranch: number
  ) {
    const where = pillars
      .filter((p) => p.branchIndex === targetBranch)
      .map((p) => p.name);
    if (where.length) {
      items.push({ key, nameKo, nameHan, brief, where });
    }
  }

  if (base) {
    collect(
      "dohwa",
      "도화살",
      "桃花",
      "이성·매력·인기 길신/살 (삼합 도화).",
      base.peach
    );
    collect(
      "hwagae",
      "화개살",
      "華蓋",
      "예술·종교·고독·집중의 별.",
      base.hwagae
    );
    collect(
      "yeokma",
      "역마살",
      "驛馬",
      "이동·변동·여행·자리 바뀜.",
      base.yeokma
    );
  }

  // 연지 기준도 보조로 한 번 더 (일지와 다를 때만)
  const yearBase = SAMHAP[args.year.branchIndex];
  if (yearBase && args.year.branchIndex !== args.dayBranchIndex) {
    const wherePeach = pillars
      .filter((p) => p.branchIndex === yearBase.peach)
      .map((p) => `${p.name}(연지기준)`);
    if (wherePeach.length) {
      items.push({
        key: "dohwa_year",
        nameKo: "도화살",
        nameHan: "桃花",
        brief: "연지 삼합 기준 도화.",
        where: wherePeach,
      });
    }
  }

  // 천을귀인: 일간 기준, 년월일시 지지
  const gui = CHEONEUL[args.dayStemIndex] ?? [];
  const guiWhere = pillars
    .filter((p) => gui.includes(p.branchIndex))
    .map((p) => p.name);
  if (guiWhere.length) {
    items.push({
      key: "cheoneul",
      nameKo: "천을귀인",
      nameHan: "天乙貴人",
      brief: "귀인·도움·위기의 조력. 일간 기준.",
      where: guiWhere,
    });
  }

  // 공망
  let ganji = 0;
  for (let i = 0; i < 60; i++) {
    if (i % 10 === args.dayStemIndex && i % 12 === args.dayBranchIndex) {
      ganji = i;
      break;
    }
  }
  const xunStart = ganji - (ganji % 10);
  const gmTable: Record<number, [number, number]> = {
    0: [10, 11],
    10: [8, 9],
    20: [6, 7],
    30: [4, 5],
    40: [2, 3],
    50: [0, 1],
  };
  const gm = gmTable[xunStart] ?? [];
  const gmWhere = pillars
    .filter((p) => gm.includes(p.branchIndex))
    .map((p) => p.name);
  if (gm.length) {
    items.push({
      key: "gongmang",
      nameKo: "공망",
      nameHan: "空亡",
      brief: `일주의 공망 지지 ${gm.map(branchLabel).join("·")}. 해당 주 공허·변동.`,
      where: gmWhere.length ? gmWhere : ["(사주에 없음)"],
    });
  }

  // Dedupe by key+where
  const seen = new Set<string>();
  const deduped = items.filter((it) => {
    const k = `${it.key}:${it.where.join(",")}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  const compact = deduped
    .map((it) => `${it.nameKo}(${it.where.join("")})`)
    .join(" · ");

  return {
    items: deduped,
    gongmangBranches: gm.map(branchLabel),
    compact: compact || "해당 신살 없음(간이)",
  };
}

export function formatSinsalCompact(s: SinsalSet | null | undefined): string | null {
  if (!s) return null;
  return `신살: ${s.compact}`;
}
