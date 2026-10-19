/**
 * 법적 고지(개인정보처리방침, 이용약관, 계정 삭제 안내)에 쓰이는 운영자 정보.
 * 스토어 제출 전에 아래 대괄호 플레이스홀더를 실제 값으로 바꿔 주세요.
 */
export const LEGAL = {
  serviceName: "별빛 타로",
  /** TODO: 운영자(개인 또는 사업자) 이름 */
  operatorName: "[운영자 이름]",
  /** TODO: 개인정보 보호책임자 이름 (운영자와 같으면 동일하게 입력) */
  privacyOfficer: "[개인정보 보호책임자 이름]",
  /** TODO: 문의 및 개인정보 관련 연락처 이메일 */
  contactEmail: "[연락처 이메일]",
  siteUrl: "https://personalized-tarot.vercel.app",
  effectiveDate: "2026년 10월 19일",
  effectiveDateIso: "2026-10-19",
} as const;

export function isLegalPlaceholder(value: string): boolean {
  return /^\[.*\]$/.test(value);
}
