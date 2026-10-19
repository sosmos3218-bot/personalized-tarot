import type { Metadata } from "next";
import Link from "next/link";
import { Bullets, LegalPage, Section } from "@/components/LegalPage";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = {
  title: "이용약관 | 별빛 타로",
  description: "별빛 타로 서비스 이용약관",
};

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="TERMS OF SERVICE"
      title="이용약관"
      intro={
        <p>
          이 약관은 {LEGAL.operatorName}(이하 &quot;운영자&quot;)가 제공하는{" "}
          {LEGAL.serviceName}(이하 &quot;서비스&quot;)의 이용 조건과 절차,
          운영자와 이용자의 권리 및 의무를 정합니다.
        </p>
      }
    >
      <Section title="제1조 (서비스의 성격 및 면책)">
        <div
          className="rounded-xl border px-4 py-3"
          style={{ borderColor: "var(--border)", background: "var(--surface)" }}
        >
          <p className="font-medium text-heading">
            서비스가 제공하는 타로 리딩, 사주 풀이, 오늘의 운세는 오락 및
            자기성찰 목적의 콘텐츠입니다.
          </p>
          <p className="mt-1">
            어떤 내용도 의료, 법률, 금융, 투자, 심리 상담 등 전문적인 조언이
            아니며, 미래를 예측하거나 결과를 보장하지 않습니다. 건강, 법적
            문제, 재정 결정 등 중요한 사안은 반드시 해당 분야의 전문가와
            상의하세요.
          </p>
        </div>
        <p>
          해석 문장의 일부는 AI가 자동으로 생성하며, 부정확하거나 이용자의
          상황에 맞지 않을 수 있습니다. 이용자가 서비스 내용을 근거로 내린
          결정의 책임은 이용자 본인에게 있습니다.
        </p>
      </Section>

      <Section title="제2조 (회원 가입)">
        <Bullets
          items={[
            "이용자는 이메일 등으로 회원 가입한 뒤 서비스를 이용할 수 있습니다. 회원 인증은 Clerk를 통해 처리됩니다.",
            "만 14세 미만은 가입할 수 없습니다.",
            "타인의 정보를 도용하거나 허위 정보를 입력해서는 안 됩니다.",
          ]}
        />
      </Section>

      <Section title="제3조 (서비스의 제공 및 변경)">
        <Bullets
          items={[
            "서비스는 사주 기반 오늘의 운세, 타로 카드 뽑기 및 해석, 리딩 기록 보관, 선택형 메일 및 푸시 알림 기능을 제공합니다.",
            "서비스는 현재 무료로 제공됩니다. 유료 기능을 도입하는 경우 사전에 알리고 별도 동의를 받습니다.",
            "운영자는 서비스 개선, 점검, 외부 서비스 장애 등의 사유로 서비스의 전부 또는 일부를 변경하거나 일시 중단할 수 있습니다.",
          ]}
        />
      </Section>

      <Section title="제4조 (이용자의 의무)">
        <p>이용자는 다음 행위를 해서는 안 됩니다.</p>
        <Bullets
          items={[
            "서비스를 비정상적으로 대량 호출하거나 자동화 도구로 남용하는 행위",
            "서비스의 보안을 우회하거나 다른 이용자의 정보에 접근하려는 행위",
            "서비스 콘텐츠를 운영자의 허락 없이 상업적으로 이용하는 행위",
            "관계 법령이나 공공질서에 반하는 행위",
          ]}
        />
      </Section>

      <Section title="제5조 (콘텐츠의 권리)">
        <p>
          서비스의 디자인, 문구, 카드 해설 등 콘텐츠에 대한 권리는 운영자
          또는 정당한 권리자에게 있습니다. 이용자는 자신의 리딩 결과를 개인적인
          용도로 저장하거나 공유할 수 있습니다.
        </p>
      </Section>

      <Section title="제6조 (개인정보 보호)">
        <p>
          운영자는 관련 법령과{" "}
          <Link href="/privacy" className="text-accent underline">
            개인정보처리방침
          </Link>
          에 따라 이용자의 개인정보를 보호합니다.
        </p>
      </Section>

      <Section title="제7조 (회원 탈퇴 및 이용 제한)">
        <Bullets
          items={[
            <>
              이용자는 언제든지{" "}
              <Link href="/settings" className="text-accent underline">
                설정
              </Link>{" "}
              화면의 「계정 삭제」에서 탈퇴할 수 있습니다. 탈퇴 시 계정과 모든
              데이터가 즉시 삭제되며 복구할 수 없습니다. (
              <Link href="/account-deletion" className="text-accent underline">
                계정 삭제 안내
              </Link>
              )
            </>,
            "이용자가 제4조를 위반한 경우 운영자는 사전 통지 후 서비스 이용을 제한하거나 계정을 삭제할 수 있습니다.",
          ]}
        />
      </Section>

      <Section title="제8조 (책임의 제한)">
        <Bullets
          items={[
            "운영자는 무료로 제공되는 서비스와 관련하여 법령에 특별한 규정이 없는 한 책임을 지지 않습니다. 다만 운영자의 고의 또는 중대한 과실로 인한 손해는 예외로 합니다.",
            "운영자는 천재지변, 외부 서비스(인증, 호스팅, AI, 메일 및 푸시 발송) 장애 등 운영자가 통제할 수 없는 사유로 인한 서비스 중단에 대해 책임을 지지 않습니다.",
          ]}
        />
      </Section>

      <Section title="제9조 (약관의 변경)">
        <p>
          운영자는 필요한 경우 관련 법령을 위반하지 않는 범위에서 약관을
          변경할 수 있으며, 변경 시 시행 7일 전(이용자에게 불리한 변경은 30일
          전)부터 서비스 화면을 통해 알립니다.
        </p>
      </Section>

      <Section title="제10조 (준거법 및 분쟁 해결)">
        <p>
          이 약관은 대한민국 법률에 따르며, 서비스 이용과 관련한 분쟁은
          민사소송법상 관할 법원에서 해결합니다. 문의: {LEGAL.contactEmail}
        </p>
      </Section>

      <Section title="부칙">
        <p>이 약관은 {LEGAL.effectiveDate}부터 시행합니다.</p>
      </Section>
    </LegalPage>
  );
}
