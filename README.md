# 별빛 타로 — 타로+사주 퓨전 MVP

회원가입 후 **사주(만세력) 프로필**을 등록하면 **오늘의 운세**를 바로 볼 수 있고, 선택적으로 짧은 온보딩 후 메이저 아르카나 **타로+사주 퓨전 리딩**을 받는 한국어 웹 앱입니다.
Clerk 인증과 Vercel AI Gateway 기반 해석(실패 시 템플릿 폴백)을 지원합니다.

## 환경 변수

`.env.example`을 참고해 `.env.local`을 만드세요.

| 변수 | 설명 |
|------|------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key (`pk_test_…` / `pk_live_…`) |
| `CLERK_SECRET_KEY` | Clerk secret key (`sk_test_…` / `sk_live_…`) |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/sign-up` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | `/saju` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | `/saju` |
| `AI_GATEWAY_API_KEY` | (선택) Vercel AI Gateway API 키 — 있으면 우선 사용. 없으면 템플릿 해석 |
| `TAROT_AI_MODEL` | (선택) Gateway 모델 id. 기본값 `inclusionai/ling-3.1-flash-free` (무료) |

**빌드:** `next build`는 Clerk 키가 필요합니다. `.env.local`은 gitignore 대상입니다. 시크릿을 커밋하지 마세요.

**AI Gateway:** 로컬은 `AI_GATEWAY_API_KEY`를 권장합니다. Vercel 배포 환경에서는 Hobby AI Gateway 크레딧과 OIDC(`VERCEL` / `VERCEL_OIDC_TOKEN`)로 키 없이도 시도할 수 있습니다. 모델은 `TAROT_AI_MODEL`로 덮어쓸 수 있으며, 기본은 무료 모델 `inclusionai/ling-3.1-flash-free`입니다. 실패 시 항상 템플릿으로 폴백합니다.

## 실행 방법

```bash
cd personalized-tarot
npm install
cp .env.example .env.local   # 실제 Clerk / AI Gateway 키 입력
npm run dev
```

프로덕션 빌드:

```bash
npm run build
npm start
```

## 기능

1. **랜딩** — 타로+사주 퓨전 소개 (한국어)
2. **회원가입 / 로그인** — Clerk (`/sign-up`, `/sign-in`) → `/saju`
3. **사주 프로필** — 생년월일(필수), 출생 시각(선택/모름), 성별(선택), 양력/음력 → 저장 후 **오늘의 운세** 추천
4. **오늘의 운세** — 사주만 있으면 이용 가능 (`/today`). 온보딩 불필요
5. **온보딩 3문항 (선택)** — 고민 분야 / 기분 / 리딩 목표. 건너뛰고 운세만 볼 수 있음
6. **뽑기** — 1장 또는 3장 스프레드 (온보딩 없으면 기본값)
7. **AI 퓨전 해석** — `POST /api/interpret` — 섹션: 사주 기운 / 타로 / 퓨전 메시지
8. **결과 · 기록** — 사주 요약 · 타로 카드 · 퓨전 해석 블록, 로컬 히스토리

### 라우트

| 경로 | 설명 |
|------|------|
| `/` | 랜딩 |
| `/sign-up` | Clerk 회원가입 |
| `/sign-in` | Clerk 로그인 |
| `/saju` | 사주 프로필 (보호) |
| `/today` | 오늘의 운세 (보호, 사주 필요 · 온보딩 불필요) |
| `/onboarding` | 맞춤 리딩 온보딩 (보호, 사주 필요 · 스킵 가능) |
| `/draw` | 카드 뽑기 (보호, 사주 필요) |
| `/result` | 리딩 결과 (보호) |
| `/history` | 로컬 리딩 기록 (보호) |
| `/api/interpret` | AI/템플릿 퓨전 해석 API (보호) |

### 사주 계산 (MVP · 참고용)

로컬 TypeScript (`src/lib/saju/`) — 유료 API 없음.

- **일간(日干)** · 음양 · 오행: 양력 일주(JDN 기반 간지)
- **년·월·일주**: 입춘·12절은 태양 황경 근사 시각 + 오호둔 (시각 미상이면 당일 12:00 KST)
- **시주**: 출생 시각이 있을 때만 (2시간 지지, 오서둔)
- **음력**: 1900–2100 비트테이블 변환 (윤달 UI 미선택)

**한계:** 절기 시각은 황경 근사라 공식 절입시각과 수 시간 차이 날 수 있음. 진태양시·야자시 미반영. 십신(정기)·지장간(여기·중기·본기)·대운(순·역행, 절입÷3 시작 나이 근사)은 간이 규칙. 신살 없음.  
**고지:** MVP 만세력은 참고용이며 전문 명리가 아닙니다.

사주·온보딩은 `localStorage`에 Clerk user id 키로 저장됩니다 (`tarot_saju:<userId>`, `tarot_onboarding:<userId>`).

### 기술 스택

- Next.js App Router + TypeScript + Tailwind CSS
- Clerk (`@clerk/nextjs`) + `@clerk/localizations` (ko-KR)
- Vercel AI SDK (`ai`) + AI Gateway (기본 `inclusionai/ling-3.1-flash-free`, `TAROT_AI_MODEL`로 변경 가능)
- 상태: localStorage (사주·온보딩·히스토리)

## 참고

- 엔터테인먼트·셀프 리플렉션 목적입니다.
- 실제 점술·의료·법률·전문 명리 상담을 대체하지 않습니다.
