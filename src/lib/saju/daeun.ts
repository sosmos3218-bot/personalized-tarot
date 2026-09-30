/**
 * 대운(大運) — MVP
 *
 * - 방향: 양남음녀=순행, 음남양녀=역행 (연간 음양 + 성별)
 * - 시작 나이: 출생~인접 절입 일수 ÷ 3 (근사, 반올림)
 * - 각 대운 10년, 월주에서 ±1씩 진행
 * - 성별 미지정·절기 근사 한계 있음
 */
import { BRANCHES, STEMS } from "./constants";
import { jieNeighborsAtKst } from "./solarTerms";
import type {
  DaeunDirection,
  DaeunPillarInfo,
  DaeunSet,
  Gender,
  Pillar,
} from "./types";

function makeLabel(stemIndex: number, branchIndex: number): string {
  const stem = STEMS[((stemIndex % 10) + 10) % 10];
  const branch = BRANCHES[((branchIndex % 12) + 12) % 12];
  return `${stem.han}${branch.han}(${stem.ko}${branch.ko})`;
}

function makePillarInfo(
  index: number,
  stemIndex: number,
  branchIndex: number,
  ageFrom: number,
  ageTo: number
): DaeunPillarInfo {
  const si = ((stemIndex % 10) + 10) % 10;
  const bi = ((branchIndex % 12) + 12) % 12;
  const stem = STEMS[si];
  const branch = BRANCHES[bi];
  return {
    index,
    stemIndex: si,
    branchIndex: bi,
    stemHan: stem.han,
    stemKo: stem.ko,
    branchHan: branch.han,
    branchKo: branch.ko,
    label: makeLabel(si, bi),
    ageFrom,
    ageTo,
  };
}

/**
 * 양간(甲丙戊庚壬)=yang + 남 → 순행
 * 음간 + 여 → 순행
 * 그 외 → 역행
 */
export function daeunDirection(
  yearStemIndex: number,
  gender: Gender
): DaeunDirection | null {
  if (gender !== "male" && gender !== "female") return null;
  const yang = STEMS[((yearStemIndex % 10) + 10) % 10].yinYang === "yang";
  const forward =
    (yang && gender === "male") || (!yang && gender === "female");
  return forward ? "forward" : "backward";
}

export function computeDaeun(opts: {
  yearStemIndex: number;
  monthPillar: Pillar;
  gender: Gender;
  y: number;
  m: number;
  d: number;
  hour: number;
  minute: number;
  /** 기본 10 */
  count?: number;
}): DaeunSet | null {
  const direction = daeunDirection(opts.yearStemIndex, opts.gender);
  if (!direction) return null;

  const yearStem = STEMS[((opts.yearStemIndex % 10) + 10) % 10];
  const { prev, next, birthJd } = jieNeighborsAtKst(
    opts.y,
    opts.m,
    opts.d,
    opts.hour,
    opts.minute
  );

  const boundary = direction === "forward" ? next : prev;
  const daysRaw =
    direction === "forward"
      ? boundary.jd - birthJd
      : birthJd - boundary.jd;
  const daysToBoundary = Math.max(0, daysRaw);
  // 전통: 3일 ≈ 1년. 반올림.
  let startAge = Math.round(daysToBoundary / 3);
  if (startAge < 0) startAge = 0;

  const step = direction === "forward" ? 1 : -1;
  const count = opts.count ?? 10;
  const pillars: DaeunPillarInfo[] = [];

  for (let i = 0; i < count; i++) {
    const stemIndex = opts.monthPillar.stemIndex + step * (i + 1);
    const branchIndex = opts.monthPillar.branchIndex + step * (i + 1);
    const ageFrom = startAge + i * 10;
    const ageTo = ageFrom + 9;
    pillars.push(makePillarInfo(i, stemIndex, branchIndex, ageFrom, ageTo));
  }

  return {
    direction,
    directionLabel: direction === "forward" ? "순행" : "역행",
    yearStemYinYang: yearStem.yinYang,
    startAge,
    daysToBoundary: Math.round(daysToBoundary * 10) / 10,
    boundaryTermName: boundary.name,
    pillars,
  };
}

/** 프롬프트용 한 줄 */
export function formatDaeunCompact(
  daeun: DaeunSet | null | undefined
): string | null {
  if (!daeun?.pillars?.length) return null;
  const head = daeun.pillars
    .slice(0, 4)
    .map((p) => `${p.label}(${p.ageFrom}–${p.ageTo})`)
    .join(", ");
  const more =
    daeun.pillars.length > 4
      ? ` 외 ${daeun.pillars.length - 4}운`
      : "";
  return `대운 ${daeun.directionLabel} · 시작 만${daeun.startAge}세(${daeun.boundaryTermName} 기준) · ${head}${more}`;
}
