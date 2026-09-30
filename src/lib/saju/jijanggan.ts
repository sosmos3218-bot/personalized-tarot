/**
 * 지장간(支藏干) — 지지에 숨은 천간.
 * 여기(餘氣) → 중기(中氣) → 본기/정기(本氣). 없는 칸은 생략.
 * 파생 학파마다 子·午·酉·亥 표기가 약간 다를 수 있음(참고용).
 */
import { STEMS } from "./constants";

export type JijangRole = "여기" | "중기" | "본기";

export interface HiddenStem {
  stemIndex: number;
  stemHan: string;
  stemKo: string;
  role: JijangRole;
  /** 본기(정기) 여부 */
  isMain: boolean;
}

/** 지지 index 0=子 … 11=亥 → 여기·중기·본기 순 */
const TABLE: { stem: number; role: JijangRole }[][] = [
  [
    { stem: 8, role: "여기" },
    { stem: 9, role: "본기" },
  ],
  [
    { stem: 9, role: "여기" },
    { stem: 7, role: "중기" },
    { stem: 5, role: "본기" },
  ],
  [
    { stem: 4, role: "여기" },
    { stem: 2, role: "중기" },
    { stem: 0, role: "본기" },
  ],
  [
    { stem: 0, role: "여기" },
    { stem: 1, role: "본기" },
  ],
  [
    { stem: 1, role: "여기" },
    { stem: 9, role: "중기" },
    { stem: 4, role: "본기" },
  ],
  [
    { stem: 4, role: "여기" },
    { stem: 6, role: "중기" },
    { stem: 2, role: "본기" },
  ],
  [
    { stem: 2, role: "여기" },
    { stem: 5, role: "중기" },
    { stem: 3, role: "본기" },
  ],
  [
    { stem: 3, role: "여기" },
    { stem: 1, role: "중기" },
    { stem: 5, role: "본기" },
  ],
  [
    { stem: 4, role: "여기" },
    { stem: 8, role: "중기" },
    { stem: 6, role: "본기" },
  ],
  [
    { stem: 6, role: "여기" },
    { stem: 7, role: "본기" },
  ],
  [
    { stem: 7, role: "여기" },
    { stem: 3, role: "중기" },
    { stem: 4, role: "본기" },
  ],
  [
    { stem: 4, role: "여기" },
    { stem: 0, role: "중기" },
    { stem: 8, role: "본기" },
  ],
];

export function hiddenStemsForBranch(branchIndex: number): HiddenStem[] {
  const row = TABLE[((branchIndex % 12) + 12) % 12];
  return row.map((cell) => {
    const s = STEMS[cell.stem];
    return {
      stemIndex: cell.stem,
      stemHan: s.han,
      stemKo: s.ko,
      role: cell.role,
      isMain: cell.role === "본기",
    };
  });
}

export function mainStemIndex(branchIndex: number): number {
  const stems = hiddenStemsForBranch(branchIndex);
  const main = stems.find((s) => s.isMain);
  return main?.stemIndex ?? stems[stems.length - 1]!.stemIndex;
}

export function formatHiddenStems(branchIndex: number): string {
  return hiddenStemsForBranch(branchIndex)
    .map((h) => {
      const short =
        h.role === "본기" ? "본" : h.role === "중기" ? "중" : "여";
      return `${h.stemHan}(${short})`;
    })
    .join(" · ");
}
