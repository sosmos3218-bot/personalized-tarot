export type ConcernCategory =
  | "love"
  | "career"
  | "money"
  | "health"
  | "growth"
  | "relationship";

export type MoodFeeling =
  | "anxious"
  | "hopeful"
  | "confused"
  | "tired"
  | "curious"
  | "calm";

export type ReadingGoal = "insight" | "action" | "comfort";

export type SpreadType = "one" | "three";

export interface User {
  email: string;
  name: string;
  createdAt: string;
}

export interface OnboardingAnswers {
  concern: ConcernCategory;
  mood: MoodFeeling;
  goal: ReadingGoal;
}

export interface TarotCard {
  id: number;
  nameKo: string;
  nameEn: string;
  keywords: string[];
  uprightMeaning: string;
  uprightAdvice: string;
}

export interface DrawnCard {
  card: TarotCard;
  position: number;
  positionLabel: string;
}

export interface ReadingResult {
  id: string;
  createdAt: string;
  spread: SpreadType;
  onboarding: OnboardingAnswers;
  cards: DrawnCard[];
  interpretation: string;
}

export const CONCERN_LABELS: Record<ConcernCategory, string> = {
  love: "연애 / 사랑",
  career: "진로 / 커리어",
  money: "금전 / 재물",
  health: "건강 / 에너지",
  growth: "성장 / 자기계발",
  relationship: "인간관계",
};

export const MOOD_LABELS: Record<MoodFeeling, string> = {
  anxious: "불안해요",
  hopeful: "희망적이에요",
  confused: "혼란스러워요",
  tired: "지쳐 있어요",
  curious: "궁금해요",
  calm: "차분해요",
};

export const GOAL_LABELS: Record<ReadingGoal, string> = {
  insight: "통찰 — 상황을 더 깊이 이해하고 싶어요",
  action: "행동 — 다음에 무엇을 할지 알고 싶어요",
  comfort: "위로 — 따뜻한 위로와 안심이 필요해요",
};

export const SPREAD_LABELS: Record<SpreadType, string> = {
  one: "원 카드 (오늘의 메시지)",
  three: "쓰리 카드 (과거·현재·미래)",
};

export const THREE_CARD_POSITIONS = ["과거", "현재", "미래"] as const;
