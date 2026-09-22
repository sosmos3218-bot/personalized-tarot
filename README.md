# 별빛 타로 — 개인화 타로 MVP

회원가입·온보딩 후, 메이저 아르카나로 **개인화된 타로 리딩**을 받는 한국어 웹 앱입니다.
Clerk 인증과 Vercel AI Gateway 기반 해석(실패 시 템플릿 폴백)을 지원합니다.

## 환경 변수

`.env.example`을 참고해 `.env.local`을 만드세요.

| 변수 | 설명 |
|------|------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key (`pk_test_…` / `pk_live_…`) |
| `CLERK_SECRET_KEY` | Clerk secret key (`sk_test_…` / `sk_live_…`) |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/sign-up` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | `/onboarding` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | `/onboarding` |
| `AI_GATEWAY_API_KEY` | (선택) Vercel AI Gateway — 없으면 템플릿 해석 |

**빌드:** `next build`는 Clerk 키가 필요합니다. CI/로컬에서는 Clerk 대시보드의 **테스트 키**를 `.env.local`에 넣거나, 형식만 맞는 placeholder(`pk_test_…` / `sk_test_…`)로 타입체크·빌드를 통과시킬 수 있습니다. Placeholder로는 실제 로그인이 되지 않습니다. `.env.local`은 gitignore 대상입니다.

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

1. **랜딩** — 서비스 소개 (한국어)
2. **회원가입 / 로그인** — Clerk (`/sign-up`, `/sign-in`, 한국어 localization)
3. **온보딩 3문항** — 고민 분야 / 기분 / 리딩 목표 (localStorage, Clerk user id 키)
4. **뽑기** — 섞기 → 1장 또는 3장 스프레드 → 카드 공개
5. **AI 해석** — `POST /api/interpret` (인증 필요). 모델: `openai/gpt-5-mini` via AI Gateway. 키 없거나 실패 시 템플릿
6. **결과 · 기록** — AI/템플릿 해석 표시, 로컬 히스토리

### 라우트

| 경로 | 설명 |
|------|------|
| `/` | 랜딩 |
| `/sign-up` | Clerk 회원가입 |
| `/sign-in` | Clerk 로그인 |
| `/auth` | 레거시 → `/sign-up` 리다이렉트 |
| `/onboarding` | 온보딩 (보호) |
| `/draw` | 카드 뽑기 (보호) |
| `/result` | 리딩 결과 (보호, AI 해석 호출) |
| `/history` | 로컬 리딩 기록 (보호) |
| `/api/interpret` | AI/템플릿 해석 API (보호) |

### 인증 + AI 흐름

1. 랜딩 CTA → `/sign-up` (미로그인) 또는 `/draw` (로그인)
2. Clerk 가입/로그인 후 `/onboarding`
3. 온보딩 답변은 `localStorage`에 `tarot_onboarding:<userId>`로 저장
4. `/draw`에서 카드 뽑기 → 템플릿 해석으로 임시 저장 → `/result`
5. 결과 페이지가 `/api/interpret` 호출 → AI 텍스트 표시 (실패 시 템플릿 + 안내)

### 기술 스택

- Next.js App Router + TypeScript + Tailwind CSS
- Clerk (`@clerk/nextjs`) + `@clerk/localizations` (ko-KR)
- Vercel AI SDK (`ai`) + AI Gateway (`openai/gpt-5-mini`)
- 상태: localStorage (온보딩·히스토리)

## 참고

- 엔터테인먼트·셀프 리플렉션 목적입니다.
- 실제 점술·의료·법률 조언을 대체하지 않습니다.
