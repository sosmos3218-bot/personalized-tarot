/**
 * 천간·지지·오행 상수 (MVP 만세력)
 * 참고용 — 전문 명리 프로그램이 아닙니다.
 */

export const STEMS = [
  { han: "甲", ko: "갑", yinYang: "yang" as const, element: "wood" as const },
  { han: "乙", ko: "을", yinYang: "yin" as const, element: "wood" as const },
  { han: "丙", ko: "병", yinYang: "yang" as const, element: "fire" as const },
  { han: "丁", ko: "정", yinYang: "yin" as const, element: "fire" as const },
  { han: "戊", ko: "무", yinYang: "yang" as const, element: "earth" as const },
  { han: "己", ko: "기", yinYang: "yin" as const, element: "earth" as const },
  { han: "庚", ko: "경", yinYang: "yang" as const, element: "metal" as const },
  { han: "辛", ko: "신", yinYang: "yin" as const, element: "metal" as const },
  { han: "壬", ko: "임", yinYang: "yang" as const, element: "water" as const },
  { han: "癸", ko: "계", yinYang: "yin" as const, element: "water" as const },
] as const;

export const BRANCHES = [
  { han: "子", ko: "자", element: "water" as const, animal: "쥐" },
  { han: "丑", ko: "축", element: "earth" as const, animal: "소" },
  { han: "寅", ko: "인", element: "wood" as const, animal: "호랑이" },
  { han: "卯", ko: "묘", element: "wood" as const, animal: "토끼" },
  { han: "辰", ko: "진", element: "earth" as const, animal: "용" },
  { han: "巳", ko: "사", element: "fire" as const, animal: "뱀" },
  { han: "午", ko: "오", element: "fire" as const, animal: "말" },
  { han: "未", ko: "미", element: "earth" as const, animal: "양" },
  { han: "申", ko: "신", element: "metal" as const, animal: "원숭이" },
  { han: "酉", ko: "유", element: "metal" as const, animal: "닭" },
  { han: "戌", ko: "술", element: "earth" as const, animal: "개" },
  { han: "亥", ko: "해", element: "water" as const, animal: "돼지" },
] as const;

export type Element = "wood" | "fire" | "earth" | "metal" | "water";
export type YinYang = "yin" | "yang";

export const ELEMENT_LABELS: Record<Element, string> = {
  wood: "목(木)",
  fire: "화(火)",
  earth: "토(土)",
  metal: "금(金)",
  water: "수(水)",
};

export const ELEMENT_TRAITS: Record<Element, string> = {
  wood: "성장·확장·인자함",
  fire: "열정·표현·명예",
  earth: "안정·신뢰·포용",
  metal: "결단·원칙·정리",
  water: "지혜·유연·흐름",
};

export const YIN_YANG_LABELS: Record<YinYang, string> = {
  yang: "양(陽)",
  yin: "음(陰)",
};

/** 절기 시작일(양력, 근사) — 월주 경계. 입춘~대한 순서의 절(節)만 사용 */
export const SOLAR_TERM_BOUNDS: { month: number; day: number; branchIndex: number }[] = [
  { month: 2, day: 4, branchIndex: 2 }, // 입춘 → 寅月
  { month: 3, day: 6, branchIndex: 3 }, // 경칩 → 卯月
  { month: 4, day: 5, branchIndex: 4 }, // 청명 → 辰月
  { month: 5, day: 6, branchIndex: 5 }, // 입하 → 巳月
  { month: 6, day: 6, branchIndex: 6 }, // 망종 → 午月
  { month: 7, day: 7, branchIndex: 7 }, // 소서 → 未月
  { month: 8, day: 8, branchIndex: 8 }, // 입추 → 申月
  { month: 9, day: 8, branchIndex: 9 }, // 백로 → 酉月
  { month: 10, day: 8, branchIndex: 10 }, // 한로 → 戌月
  { month: 11, day: 7, branchIndex: 11 }, // 입동 → 亥月
  { month: 12, day: 7, branchIndex: 0 }, // 대설 → 子月
  { month: 1, day: 6, branchIndex: 1 }, // 소한 → 丑月
];

/**
 * 음력 연도 비트테이블 (1900–2100).
 * 공개 영역 알고리즘(중국/한국 만세력 오픈소스에서 널리 쓰이는 형식):
 * - bits 0–3: 윤달 번호 (0=없음)
 * - bits 4–15: 1–12월 크기 (1=30일, 0=29일)
 * - bit 16: 윤달 크기
 */
export const LUNAR_INFO: number[] = [
  0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2,
  0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977,
  0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970,
  0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950,
  0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557,
  0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5b0, 0x14573, 0x052b0, 0x0a9a8, 0x0e950, 0x06aa0,
  0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0,
  0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b6a0, 0x195a6,
  0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570,
  0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x05ac0, 0x0ab60, 0x096d5, 0x092e0,
  0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5,
  0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930,
  0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530,
  0x05aa0, 0x076a3, 0x096d0, 0x04afb, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45,
  0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0,
  0x14b63, 0x09370, 0x049f8, 0x04970, 0x064b0, 0x168a6, 0x0ea50, 0x06b20, 0x1a6c4, 0x0aae0,
  0x0a2e0, 0x0d2e3, 0x0c960, 0x0d557, 0x0d4a0, 0x0da50, 0x05d55, 0x056a0, 0x0a6d0, 0x055d4,
  0x052d0, 0x0a9b8, 0x0a950, 0x0b4a0, 0x0b6a6, 0x0ad50, 0x055a0, 0x0aba4, 0x0a5b0, 0x052b0,
  0x0b273, 0x06930, 0x07337, 0x06aa0, 0x0ad50, 0x14b55, 0x04b60, 0x0a570, 0x054e4, 0x0d160,
  0x0e968, 0x0d520, 0x0daa0, 0x16aa6, 0x056d0, 0x04ae0, 0x0a9d4, 0x0a2d0, 0x0d150, 0x0f252,
  0x0d520,
];

export const LUNAR_BASE_YEAR = 1900;
export const LUNAR_MAX_YEAR = 2100;
