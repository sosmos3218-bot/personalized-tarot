import {
  BRANCHES,
  ELEMENT_TRAITS,
  type Element,
} from "@/lib/saju/constants";
import { ELEMENT_PLAIN } from "@/lib/saju/plain";
import { getDayPillarForSolarDate } from "@/lib/saju/compute";
import type { SajuProfile } from "@/lib/saju/types";
import { formatSeoulDateKo, getSeoulTodayYmd } from "./date";
import { hashString, pickFrom, seededUnit } from "./hash";
import type { DailyFortune, ElementRelation } from "./types";

/** 오행 상생: wood→fire→earth→metal→water→wood */
const GENERATES: Record<Element, Element> = {
  wood: "fire",
  fire: "earth",
  earth: "metal",
  metal: "water",
  water: "wood",
};

/** 오행 상극: wood→earth, earth→water, water→fire, fire→metal, metal→wood */
const CONTROLS: Record<Element, Element> = {
  wood: "earth",
  earth: "water",
  water: "fire",
  fire: "metal",
  metal: "wood",
};

const RELATION_LABELS: Record<ElementRelation, string> = {
  same: "비슷한 흐름 — 익숙한 리듬",
  generates: "내가 밀어 줌 — 표현·확장",
  generated_by: "도움을 받음 — 충전·지원",
  controls: "정리하는 날 — 결단·주도",
  controlled_by: "압박이 느껴짐 — 긴장·조심",
  neutral: "담담한 중간",
};

function relationOf(self: Element, today: Element): ElementRelation {
  if (self === today) return "same";
  if (GENERATES[self] === today) return "generates";
  if (GENERATES[today] === self) return "generated_by";
  if (CONTROLS[self] === today) return "controls";
  if (CONTROLS[today] === self) return "controlled_by";
  return "neutral";
}

const ENERGY_TONES: Record<ElementRelation, string[]> = {
  same: [
    "오늘의 흐름이 나와 닮아, 본연의 리듬이 잘 드러납니다.",
    "비슷한 결의 에너지가 겹쳐, 익숙한 방식으로 흐름을 타기 좋습니다.",
  ],
  generates: [
    "내 기운이 오늘의 흐름을 밀어 올리는 날 — 표현과 실행에 탄력이 붙습니다.",
    "생하는 방향으로 에너지가 흘러, 작은 시도가 눈에 띄기 쉽습니다.",
  ],
  generated_by: [
    "오늘 기운이 나를 북돋워 주는 날 — 도움과 기회가 스며들기 쉽습니다.",
    "충전되는 톤입니다. 받되, 과하게 기대기보다 균형 있게 받아보세요.",
  ],
  controls: [
    "정리·결단의 기운이 앞섭니다. 우선순위를 분명히 하면 효율이 납니다.",
    "주도권이 생기는 흐름 — 다만 밀어붙이기보다 한 박자 호흡을 두세요.",
  ],
  controlled_by: [
    "외부 압박이나 변수가 느껴질 수 있는 날입니다. 페이스 조절이 핵심입니다.",
    "긴장이 올라오기 쉬운 톤 — 완벽보다 지속 가능한 선택을 우선하세요.",
  ],
  neutral: [
    "특별한 극단 없이 담담한 흐름입니다. 루틴을 지키는 것이 이득입니다.",
  ],
};

const SUMMARIES: Record<ElementRelation, string[]> = {
  same: [
    "오늘은 자신의 색깔을 그대로 드러내도 어색하지 않은 날입니다. 무리한 연기보다 솔직함이 통합니다.",
    "익숙한 강점을 다시 쓰는 하루입니다. 새 판을 짜기보다 다듬는 쪽이 유리합니다.",
  ],
  generates: [
    "씨앗을 밖으로 밀어내는 기운입니다. 말·글·제안처럼 ‘내보내는’ 일이 잘 맞습니다.",
    "창작·설득·네트워크에 힘이 실립니다. 결과를 조급히 재기보다 흐름을 타 보세요.",
  ],
  generated_by: [
    "지원과 호의가 닿기 쉬운 날입니다. 부탁·협력을 열어두면 길이 생깁니다.",
    "회복과 학습에 좋은 톤입니다. 정보를 흡수하고, 몸을 돌보는 선택이 빛을 냅니다.",
  ],
  controls: [
    "정리·마감·결정에 적합한 날입니다. 쌓아 둔 일을 한 칸씩 비워보세요.",
    "기준을 세우면 주변이 따라옵니다. 감정보다 원칙을 짧게 정리해 두면 흔들림이 줄어듭니다.",
  ],
  controlled_by: [
    "예상 밖 일정이나 감정 파도가 올 수 있습니다. 여유 버퍼를 남겨 두세요.",
    "통제욕을 내려놓고 ‘할 수 있는 한 조각’에 집중하면 하루가 덜 무겁습니다.",
  ],
  neutral: [
    "평온한 중간 지대입니다. 큰 승부보다 꾸준한 한 걸음이 점수를 쌓습니다.",
  ],
};

const FOCUS: Record<Element, string[]> = {
  wood: [
    "성장 한 걸음 — 배우고 싶은 주제 하나를 짧게라도 진전시키기",
    "관계의 가지 치기보다, 새싹처럼 가벼운 제안부터 해보기",
  ],
  fire: [
    "표현과 연결 — 감사·칭찬·아이디어를 한 번 밖으로 내보내기",
    "열정을 작은 불꽃으로: 25분만 몰입하는 타임박스를 두기",
  ],
  earth: [
    "안정 루틴 — 식사·수면·책상 정리 중 하나를 확실히 챙기기",
    "약속·마감일을 달력에 다시 적어 현실 감각을 고정하기",
  ],
  metal: [
    "결단 한 줄 — 미뤄 둔 Yes/No를 오늘 중으로 정리하기",
    "불필요한 알림·탭을 줄이고, 핵심 할 일 3개만 남기기",
  ],
  water: [
    "흐름 읽기 — 직관이 가리키는 방향을 메모로 남겨두기",
    "혼자만의 고요한 시간 15분으로 머릿속을 맑히기",
  ],
};

const CAUTION: Record<ElementRelation, string[]> = {
  same: [
    "익숙함에 갇혀 피드백을 무시하지 마세요.",
    "자기 방식만 고집하면 기회를 놓칠 수 있습니다.",
  ],
  generates: [
    "과한 소모로 밤까지 에너지를 다 쓰지 마세요.",
    "말의 속도가 사실보다 앞서가지 않게 한 번 더 확인하세요.",
  ],
  generated_by: [
    "호의에만 기대다 주도권을 잃을 수 있습니다.",
    "달콤한 제안에 서명·약속은 하루 미뤄도 늦지 않습니다.",
  ],
  controls: [
    "날카로운 말이 관계를 깎지 않도록 톤을 다듬으세요.",
    "모든 것을 통제하려다 세부에서 길을 잃을 수 있습니다.",
  ],
  controlled_by: [
    "감정적으로 즉답하지 말고, 호흡 후 답하세요.",
    "수면·식사를 미루면 긴장이 배로 커질 수 있습니다.",
  ],
  neutral: [
    "권태로 미루기보다, 최소 단위라도 착수하세요.",
    "남의 페이스에 휩쓸려 일정만 채우지 마세요.",
  ],
};

function luckScoreFor(seed: number, relation: ElementRelation): number {
  const base: Record<ElementRelation, number> = {
    same: 72,
    generates: 78,
    generated_by: 82,
    controls: 70,
    controlled_by: 58,
    neutral: 65,
  };
  const jitter = Math.floor(seededUnit(seed, 7) * 17) - 4; // -4..12
  return Math.max(42, Math.min(96, base[relation] + jitter));
}

/**
 * 사용자 사주 + 서울 오늘 날짜로 결정적 일일 운세 생성.
 * userId를 넣으면 같은 날·같은 사용자에게 항상 동일한 결과.
 */
export function buildDailyFortune(
  saju: SajuProfile,
  opts?: { userId?: string | null; dateYmd?: string }
): DailyFortune {
  const dateYmd = opts?.dateYmd ?? getSeoulTodayYmd();
  const userKey = opts?.userId ?? "anon";
  const seed = hashString(`${userKey}|${dateYmd}|${saju.chart.day.stemIndex}|daily`);

  const dm = saju.chart.dayMaster;
  const todayPillar = getDayPillarForSolarDate(dateYmd);
  const todayElement = BRANCHES[todayPillar.branchIndex].element;
  const relation = relationOf(dm.element, todayElement);

  return {
    dateYmd,
    dateLabel: formatSeoulDateKo(dateYmd),
    dayMasterElement: dm.element,
    dayMasterLabel: ELEMENT_PLAIN[dm.element],
    dayMasterStem: `${dm.stemHan}(${dm.stemKo})`,
    todayPillar,
    todayElement,
    todayElementLabel: ELEMENT_PLAIN[todayElement],
    relation,
    relationLabel: RELATION_LABELS[relation],
    luckScore: luckScoreFor(seed, relation),
    energyTone: pickFrom(seed, ENERGY_TONES[relation], 1),
    summary: pickFrom(seed, SUMMARIES[relation], 2),
    focus: pickFrom(seed, FOCUS[dm.element], 3),
    caution: pickFrom(seed, CAUTION[relation], 4),
    seed,
  };
}

export function dailyFortunePlainText(f: DailyFortune): string {
  return [
    `## 오늘의 기운`,
    `${f.dateLabel} · 서울 기준`,
    `「일간(나를 나타내는 기운)」 ${f.dayMasterStem} — ${f.dayMasterLabel} (${ELEMENT_TRAITS[f.dayMasterElement]})`,
    `오늘의 날 기둥 ${f.todayPillar.label} · ${f.todayElementLabel} 기운`,
    `나와 오늘의 관계: ${f.relationLabel}`,
    `운세 점수: ${f.luckScore}`,
    "",
    f.energyTone,
    "",
    `## 요약`,
    f.summary,
    "",
    `## 오늘의 초점`,
    f.focus,
    "",
    `## 주의`,
    f.caution,
  ].join("\n");
}
