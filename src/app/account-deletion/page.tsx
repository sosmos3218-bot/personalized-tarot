import type { Metadata } from "next";
import Link from "next/link";
import { Bullets, LegalPage, Section } from "@/components/LegalPage";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = {
  title: "계정 삭제 안내 | 별빛 타로",
  description: "별빛 타로 계정과 데이터를 삭제하는 방법",
};

export default function AccountDeletionPage() {
  return (
    <LegalPage
      eyebrow="ACCOUNT DELETION"
      title="계정 및 데이터 삭제 안내"
      intro={
        <p>
          {LEGAL.serviceName} 계정은 앱 안에서 언제든지 직접 삭제할 수
          있습니다. 삭제하면 계정과 저장된 모든 데이터가 즉시 영구 삭제되며
          복구할 수 없습니다.
        </p>
      }
    >
      <Section title="앱에서 직접 삭제하기">
        <ol className="list-decimal pl-5 space-y-1">
          <li>
            {LEGAL.serviceName}에{" "}
            <Link href="/sign-in" className="text-accent underline">
              로그인
            </Link>
            합니다.
          </li>
          <li>
            상단 메뉴의 「알림」 또는 아래 버튼으로{" "}
            <Link href="/settings" className="text-accent underline">
              설정
            </Link>{" "}
            화면에 들어갑니다.
          </li>
          <li>화면 맨 아래 「계정 삭제」 영역에서 「계정 삭제하기」를 누릅니다.</li>
          <li>
            확인 칸에 <strong className="text-heading">삭제합니다</strong>를
            입력한 뒤 「영구 삭제」를 누르면 완료됩니다.
          </li>
        </ol>
        <div className="pt-2">
          <Link href="/settings#delete-account" className="btn-primary text-sm">
            설정에서 계정 삭제하기
          </Link>
        </div>
      </Section>

      <Section title="삭제되는 데이터">
        <Bullets
          items={[
            "계정 정보 (이메일, 회원 식별자, 로그인 정보)",
            "사주 프로필 (생년월일, 출생 시각, 성별 등)",
            "타로 리딩 기록과 오늘의 운세 기록",
            "메일 및 푸시 알림 설정, 푸시 구독 정보",
          ]}
        />
        <p>
          삭제는 요청 즉시 처리되며, 별도로 보관하는 데이터는 없습니다. 다만
          호스팅 사업자의 접속 로그나 백업은 해당 사업자 정책에 따라 짧은
          기간 후 자동으로 삭제됩니다. 기기의 브라우저에 남은 사본은 삭제
          과정에서 함께 지워집니다.
        </p>
      </Section>

      <Section title="앱에 접속할 수 없는 경우">
        <p>
          로그인이 되지 않는 등 앱에서 직접 삭제할 수 없다면 가입한 이메일
          주소로 {LEGAL.contactEmail}에 &quot;계정 삭제 요청&quot;을 보내
          주세요. 본인 확인 후 영업일 기준 7일 이내에 삭제하고 결과를 알려
          드립니다.
        </p>
      </Section>
    </LegalPage>
  );
}
