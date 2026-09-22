import type { TarotCard } from "./types";

/** 메이저 아르카나 22장 — 정방향 의미 중심 */
export const MAJOR_ARCANA: TarotCard[] = [
{
id: 0,
nameKo: "바보",
nameEn: "The Fool",
keywords: ["새로운 시작", "순수", "모험"],
uprightMeaning:
"무한한 가능성과 새로운 여정의 시작을 상징합니다. 두려움 없이 첫 발을 내딛는 용기와 순수한 마음을 일깨웁니다.",
uprightAdvice: "완벽한 준비가 없어도 괜찮습니다. 지금이 시작하기에 좋은 때입니다.",
},
{
id: 1,
nameKo: "마법사",
nameEn: "The Magician",
keywords: ["의지", "창조", "자원"],
uprightMeaning:
"당신에게 이미 필요한 도구와 능력이 있음을 알려줍니다. 의지를 집중하면 원하는 것을 현실로 만들 수 있습니다.",
uprightAdvice: "가진 자원을 활용하세요. 행동과 의도가 일치할 때 마법이 일어납니다.",
},
{
id: 2,
nameKo: "여사제",
nameEn: "The High Priestess",
keywords: ["직관", "침묵", "내면"],
uprightMeaning:
"표면 아래의 진실과 직관의 목소리를 듣도록 안내합니다. 서두르기보다 고요히 내면의 지혜를 신뢰하세요.",
uprightAdvice: "답을 밖에서만 찾지 마세요. 이미 알고 있는 것을 조용히 들여다보세요.",
},
{
id: 3,
nameKo: "여황제",
nameEn: "The Empress",
keywords: ["풍요", "양육", "창조성"],
uprightMeaning:
"풍요와 돌봄, 창조의 에너지를 상징합니다. 자신과 주변을 돌보며 자연스러운 성장을 허용하는 때입니다.",
uprightAdvice: "자신을 돌보는 것이 사치가 아닙니다. 풍요는 돌봄에서 피어납니다.",
},
{
id: 4,
nameKo: "황제",
nameEn: "The Emperor",
keywords: ["구조", "안정", "리더십"],
uprightMeaning:
"질서와 책임, 단단한 기반을 세우는 힘을 나타냅니다. 경계를 명확히 하고 주도권을 잡는 것이 도움이 됩니다.",
uprightAdvice: "규칙을 세우고 지키는 힘이 필요합니다. 안정은 구조에서 나옵니다.",
},
{
id: 5,
nameKo: "교황",
nameEn: "The Hierophant",
keywords: ["전통", "가르침", "신념"],
uprightMeaning:
"전통과 가르침, 공유된 가치의 메시지를 전합니다. 멘토를 찾거나 검증된 길을 따르는 것이 도움이 될 수 있습니다.",
uprightAdvice: "혼자만이 답이 아닙니다. 믿을 수 있는 조언과 공동체의 지혜를 받아들이세요.",
},
{
id: 6,
nameKo: "연인",
nameEn: "The Lovers",
keywords: ["선택", "조화", "관계"],
uprightMeaning:
"중요한 선택과 관계의 조화를 상징합니다. 마음과 가치가 일치하는 방향을 선택하는 것이 핵심입니다.",
uprightAdvice: "선택이 어렵다면, 진짜 가치를 따라가세요. 조화는 정직한 선택에서 옵니다.",
},
{
id: 7,
nameKo: "전차",
nameEn: "The Chariot",
keywords: ["의지", "승리", "전진"],
uprightMeaning:
"강한 의지와 집중으로 앞으로 나아가는 힘을 보여줍니다. 방향을 정했다면 흔들리지 말고 전진하세요.",
uprightAdvice: "반대되는 힘을 하나로 모으세요. 통제와 추진력이 승리를 가져옵니다.",
},
{
id: 8,
nameKo: "힘",
nameEn: "Strength",
keywords: ["용기", "인내", "부드러운 힘"],
uprightMeaning:
"강압이 아닌 부드러운 용기와 인내의 힘을 상징합니다. 내면의 야성을 다정함으로 다루는 지혜입니다.",
uprightAdvice: "억지로 누르기보다 이해하고 다독이세요. 진짜 힘은 부드러운 인내에 있습니다.",
},
{
id: 9,
nameKo: "은둔자",
nameEn: "The Hermit",
keywords: ["성찰", "고독", "지혜"],
uprightMeaning:
"혼자만의 시간과 깊은 성찰이 필요한 때임을 알려줍니다. 내면의 등불을 따라 자신만의 답을 찾으세요.",
uprightAdvice: "잠시 물러나 고요함을 허용하세요. 지혜는 소음이 잦아든 곳에서 빛납니다.",
},
{
id: 10,
nameKo: "운명의 수레바퀴",
nameEn: "Wheel of Fortune",
keywords: ["변화", "순환", "기회"],
uprightMeaning:
"삶의 순환과 전환점을 상징합니다. 상황이 바뀌고 있으며, 그 흐름을 받아들이면 새로운 기회가 열립니다.",
uprightAdvice: "변화에 저항하기보다 흐름을 타세요. 운도 준비가 된 사람에게 찾아옵니다.",
},
{
id: 11,
nameKo: "정의",
nameEn: "Justice",
keywords: ["균형", "진실", "책임"],
uprightMeaning:
"공정함과 인과응보, 진실의 저울을 나타냅니다. 정직하게 상황을 바라보고 책임을 지는 것이 해법입니다.",
uprightAdvice: "감정보다 사실에 기반해 판단하세요. 균형 잡힌 선택이 평화를 가져옵니다.",
},
{
id: 12,
nameKo: "매달린 사람",
nameEn: "The Hanged Man",
keywords: ["관점 전환", "멈춤", "희생"],
uprightMeaning:
"잠시 멈추고 다른 각도에서 바라볼 것을 권합니다. 놓아줌으로써 오히려 새로운 통찰을 얻을 수 있습니다.",
uprightAdvice: "지금 당장 움직이지 않아도 됩니다. 관점을 바꾸면 답은 자연히 드러납니다.",
},
{
id: 13,
nameKo: "죽음",
nameEn: "Death",
keywords: ["끝과 시작", "변환", "놓아줌"],
uprightMeaning:
"물리적 죽음이 아니라 변환과 마무리의 카드입니다. 낡은 것을 내려놓아야 새것이 들어올 수 있습니다.",
uprightAdvice: "끝은 실패가 아닙니다. 한 챕터를 닫고 다음을 맞이할 용기를 가지세요.",
},
{
id: 14,
nameKo: "절제",
nameEn: "Temperance",
keywords: ["조화", "중용", "치유"],
uprightMeaning:
"균형과 인내, 서로 다른 것의 조화로운 결합을 상징합니다. 서두르지 않고 천천히 섞어가는 치유의 과정입니다.",
uprightAdvice: "극단을 피하고 중도를 찾으세요. 시간과 절제가 당신을 치유합니다.",
},
{
id: 15,
nameKo: "악마",
nameEn: "The Devil",
keywords: ["집착", "속박", "그림자"],
uprightMeaning:
"집착, 유혹, 스스로 만든 사슬을 비춥니다. 인식하는 순간부터 자유를 향한 첫걸음이 시작됩니다.",
uprightAdvice: "무엇이 당신을 붙잡고 있는지 직시하세요. 사슬은 생각보다 느슨할 수 있습니다.",
},
{
id: 16,
nameKo: "탑",
nameEn: "The Tower",
keywords: ["붕괴", "각성", "급변"],
uprightMeaning:
"흔들리던 기반이 무너지며 진실이 드러나는 순간입니다. 충격적이지만, 더 진실한 토대를 위한 각성입니다.",
uprightAdvice: "무너진 자리에 새로운 기반을 세울 수 있습니다. 저항보다 재건에 힘을 쓰세요.",
},
{
id: 17,
nameKo: "별",
nameEn: "The Star",
keywords: ["희망", "치유", "영감"],
uprightMeaning:
"폭풍 뒤의 고요한 희망과 치유를 상징합니다. 별을 바라보듯, 미래에 대한 신뢰를 회복하는 때입니다.",
uprightAdvice: "희망을 붙드세요. 작은 빛도 어두운 길을 안내하기에 충분합니다.",
},
{
id: 18,
nameKo: "달",
nameEn: "The Moon",
keywords: ["환상", "불안", "무의식"],
uprightMeaning:
"불확실함과 환상, 무의식의 세계를 비춥니다. 모든 것이 명확하지 않아도 괜찮으니, 직관을 믿되 착각에 주의하세요.",
uprightAdvice: "불안이 현실이 아닐 수 있습니다. 안개가 걷힐 때까지 조심스럽게 나아가세요.",
},
{
id: 19,
nameKo: "태양",
nameEn: "The Sun",
keywords: ["기쁨", "성공", "명료함"],
uprightMeaning:
"밝음과 기쁨, 성공과 명료함을 가져옵니다. 자신감을 갖고 빛나세요. 긍정적인 결과가 가까이에 있습니다.",
uprightAdvice: "있는 그대로의 자신을 드러내세요. 진실한 기쁨이 최고의 나침반입니다.",
},
{
id: 20,
nameKo: "심판",
nameEn: "Judgement",
keywords: ["부활", "소명", "결산"],
uprightMeaning:
"과거의 경험을 통합하고 더 높은 소명으로 일어나는 카드입니다. 용서와 재평가의 순간이 찾아왔습니다.",
uprightAdvice: "과거를 심판하기보다 배우세요. 이제 새로운 차원으로 도약할 때입니다.",
},
{
id: 21,
nameKo: "세계",
nameEn: "The World",
keywords: ["완성", "통합", "성취"],
uprightMeaning:
"한 사이클의 완성과 성취, 통합을 상징합니다. 노력의 결실을 인정하고, 다음 여정을 기쁜 마음으로 맞이하세요.",
uprightAdvice: "성취를 충분히 축하하세요. 완성 뒤에는 더 넓은 세계가 기다립니다.",
},
];

export function getCardById(id: number): TarotCard | undefined {
return MAJOR_ARCANA.find((c) => c.id === id);
}

export function drawRandomCards(count: number): TarotCard[] {
const shuffled = [...MAJOR_ARCANA].sort(() => Math.random() - 0.5);
return shuffled.slice(0, count);
}
