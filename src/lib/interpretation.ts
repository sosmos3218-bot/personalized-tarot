import type {
  DrawnCard,
  MoodFeeling,
  OnboardingAnswers,
  ReadingGoal,
  ConcernCategory,
  SpreadType,
} from "./types";
import { CONCERN_LABELS, GOAL_LABELS, MOOD_LABELS } from "./types";

const CONCERN_OPENERS: Record<ConcernCategory, string> = {
  love: "연애와 사랑의 길을 묻는 당신에게",
  career: "진로와 커리어의 갈림길에 선 당신에게",
  money: "금전과 재물의 흐름을 살피는 당신에게",
  health: "건강과 에너지의 균형을 돌보는 당신에게",
  growth: "성장과 자기계발의 여정에 있는 당신에게",
  relationship: "인간관계의 매듭을 풀어가려는 당신에게",
};

const MOOD_BRIDGES: Record<MoodFeeling, string> = {
  anxious: "지금 마음이 불안한 만큼, 카드는 안정의 실마리를 건넵니다.",
  hopeful: "희망적인 기운이 이미 당신을 감싸고 있으니, 그 빛을 더 키워보세요.",
  confused: "혼란 속에서도 카드는 한 줄기 명료함을 보여줍니다.",
  tired: "지친 마음을 달래듯, 카드는 무리하지 말라는 메시지를 전합니다.",
  curious: "궁금증이 문을 열었으니, 카드가 보여주는 상징을 열린 마음으로 받아들여 보세요.",
  calm: "차분한 상태에서 듣는 메시지는 더 깊게 스며듭니다.",
};

const MOOD_DESCRIPTORS: Record<MoodFeeling, string> = {
  anxious: "불안한",
  hopeful: "희망에 찬",
  confused: "혼란스러운",
  tired: "지친",
  curious: "호기심 어린",
  calm: "차분한",
};

const GOAL_CLOSERS: Record<ReadingGoal, (cardName: string) => string> = {
  insight: (name) =>
    `「${name}」의 메시지를 마음에 새기면, 지금의 상황이 조금 더 선명해질 것입니다.`,
  action: (name) =>
    `「${name}」의 조언을 작은 행동으로 옮겨보세요. 완벽한 계획보다 한 걸음이 더 중요합니다.`,
  comfort: (name) =>
    `「${name}」의 메시지는 당신이 혼자가 아님을 상기시킵니다. 지금의 마음도 충분히 괜찮습니다.`,
};

const GOAL_SUMMARIES: Record<ReadingGoal, string> = {
  insight: "상황을 더 깊이 이해할 실마리를 찾고 있습니다.",
  action: "다음에 내디딜 한 걸음을 찾고 있습니다.",
  comfort: "따뜻한 위로를 받아들일 준비를 하고 있습니다.",
};

function buildOneCardInterpretation(
  cards: DrawnCard[],
  answers: OnboardingAnswers
): string {
  const drawn = cards[0];
  const card = drawn.card;
  const lines = [
    `${CONCERN_OPENERS[answers.concern]},`,
    `「${card.nameKo}」(${card.nameEn}) 카드가 뽑혔습니다.`,
    "",
    MOOD_BRIDGES[answers.mood],
    "",
    `✦ 카드의 핵심: ${card.keywords.join(" · ")}`,
    card.uprightMeaning,
    "",
    `✦ 조언: ${card.uprightAdvice}`,
    "",
    GOAL_CLOSERS[answers.goal](card.nameKo),
    "",
    `오늘의 초점 — ${CONCERN_LABELS[answers.concern]} / ${MOOD_LABELS[answers.mood]} / ${GOAL_LABELS[answers.goal].split(" — ")[0]}`,
  ];
  return lines.join("\n");
}

function buildThreeCardInterpretation(
  cards: DrawnCard[],
  answers: OnboardingAnswers
): string {
  const [past, present, future] = cards;
  const lines = [
    `${CONCERN_OPENERS[answers.concern]},`,
    "과거 · 현재 · 미래의 흐름이 펼쳐졌습니다.",
    "",
    MOOD_BRIDGES[answers.mood],
    "",
    `【과거 — ${past.card.nameKo}】`,
    `${past.card.keywords.join(" · ")}`,
    past.card.uprightMeaning,
    "",
    `【현재 — ${present.card.nameKo}】`,
    `${present.card.keywords.join(" · ")}`,
    present.card.uprightMeaning,
    "",
    `【미래 — ${future.card.nameKo}】`,
    `${future.card.keywords.join(" · ")}`,
    future.card.uprightMeaning,
    "",
    `✦ 종합 조언: ${present.card.uprightAdvice}`,
    GOAL_CLOSERS[answers.goal](present.card.nameKo),
    "",
    `과거(${past.card.nameKo})에서 현재(${present.card.nameKo})로, 그리고 미래(${future.card.nameKo})로 이어지는 이야기입니다. ${CONCERN_LABELS[answers.concern]}에 대한 당신의 ${MOOD_DESCRIPTORS[answers.mood]} 마음은 ${GOAL_SUMMARIES[answers.goal]}`,
  ];
  return lines.join("\n");
}

export function buildInterpretation(
  cards: DrawnCard[],
  answers: OnboardingAnswers,
  spread: SpreadType
): string {
  if (spread === "one") {
    return buildOneCardInterpretation(cards, answers);
  }
  return buildThreeCardInterpretation(cards, answers);
}

export function createReadingId(): string {
  return `reading_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
