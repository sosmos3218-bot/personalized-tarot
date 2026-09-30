/**
 * 십신 — 일간 대비 천간 / 지지 정기(本氣).
 * 지지 정기는 지장간 본기와 동일.
 */
import { STEMS, type Element } from "./constants";
import { mainStemIndex } from "./jijanggan";

export interface TenGodName {
  ko: string;
  han: string;
}

export interface PillarTenGods {
  /** 천간 십신 */
  stemKo: string;
  stemHan: string;
  /** 지지 정기 십신 */
  branchKo: string;
  branchHan: string;
}

const GENERATES: Record<Element, Element> = {
  wood: "fire",
  fire: "earth",
  earth: "metal",
  metal: "water",
  water: "wood",
};

const CONTROLS: Record<Element, Element> = {
  wood: "earth",
  earth: "water",
  water: "fire",
  fire: "metal",
  metal: "wood",
};

function tenGod(dayStem: number, otherStem: number): TenGodName {
  const a = STEMS[dayStem];
  const b = STEMS[otherStem];
  const sameYy = a.yinYang === b.yinYang;
  if (a.element === b.element) {
    return sameYy ? { ko: "비견", han: "比肩" } : { ko: "겁재", han: "劫財" };
  }
  if (GENERATES[a.element] === b.element) {
    return sameYy ? { ko: "식신", han: "食神" } : { ko: "상관", han: "傷官" };
  }
  if (CONTROLS[a.element] === b.element) {
    return sameYy ? { ko: "편재", han: "偏財" } : { ko: "정재", han: "正財" };
  }
  if (CONTROLS[b.element] === a.element) {
    return sameYy ? { ko: "편관", han: "偏官" } : { ko: "정관", han: "正官" };
  }
  if (GENERATES[b.element] === a.element) {
    return sameYy ? { ko: "편인", han: "偏印" } : { ko: "정인", han: "正印" };
  }
  return { ko: "—", han: "—" };
}

export function pillarTenGods(
  dayStemIndex: number,
  stemIndex: number,
  branchIndex: number
): PillarTenGods {
  const stem = tenGod(dayStemIndex, stemIndex);
  const main = mainStemIndex(branchIndex);
  const branch = tenGod(dayStemIndex, main);
  return {
    stemKo: stem.ko,
    stemHan: stem.han,
    branchKo: branch.ko,
    branchHan: branch.han,
  };
}

export function branchMainStemIndex(branchIndex: number): number {
  return mainStemIndex(branchIndex);
}
