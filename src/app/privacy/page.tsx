import type { Metadata } from "next";
import Link from "next/link";
import { Bullets, LegalPage, Section } from "@/components/LegalPage";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = {
  title: "개인정보처리방침 | 별빛 타로",
  description: "별빛 타로 개인정보처리방침",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="PRIVACY POLICY"
      title="개인정보처리방침"
      intro={
        <p>
          {LEGAL.operatorName}(이하 &quot;운영자&quot;)는 {LEGAL.serviceName}
          (이하 &quot;서비스&quot;)를 운영하면서 「개인정보 보호법」 등 관련
          법령을 준수하며, 이용자의 개인정보를 소중히 다룹니다. 이 방침은
          서비스가 어떤 정보를 왜 수집하고, 어떻게 보관하고 삭제하는지
          설명합니다.
        </p>
      }
    >
      <Section title="1. 처리하는 개인정보 항목">
        <Bullets
          items={[
            <>
              <strong>계정 정보</strong>: 이메일 주소, 회원 고유 식별자(User ID).
              로그인 인증 과정에서 Clerk를 통해 처리됩니다.
            </>,
            <>
              <strong>사주 프로필</strong>: 생년월일, 출생 시각(선택), 성별,
              양력/음력 등 사주 계산에 필요한 정보.
            </>,
            <>
              <strong>리딩 기록</strong>: 뽑은 카드, 선택한 고민 주제와 기분,
              해석 결과, 생성 시각. 최근 기록 최대 50건과 오늘의 운세 카드
              기록이 저장됩니다.
            </>,
            <>
              <strong>알림 설정 및 푸시 구독 정보</strong>: 메일/푸시 수신 여부,
              발송 시각, 브라우저 푸시 구독 주소(endpoint)와 암호화 키, 기기의
              User-Agent.
            </>,
            <>
              <strong>AI 해석 요청 정보</strong>: 해석을 만들기 위해 뽑은 카드,
              고민 주제, 사주 요약 정보가 AI 모델로 전송됩니다. 이름이나
              이메일은 전송하지 않습니다.
            </>,
            <>
              <strong>자동 생성 정보</strong>: 서비스 운영과 보안을 위한 접속
              로그(IP 주소, 요청 시각, 브라우저 정보)가 호스팅 사업자 서버에
              일시적으로 기록될 수 있습니다.
            </>,
          ]}
        />
        <p>
          서비스는 광고 식별자를 수집하지 않으며, 광고나 행태 추적, 제3자
          분석 도구를 사용하지 않습니다.
        </p>
      </Section>

      <Section title="2. 개인정보의 처리 목적">
        <Bullets
          items={[
            "회원 가입, 로그인, 본인 확인 및 계정 관리",
            "사주 계산과 타로 리딩, 오늘의 운세 등 개인화 콘텐츠 제공",
            "리딩 기록 저장 및 여러 기기 간 동기화",
            "이용자가 선택한 경우에 한해 오늘의 운세 메일 및 푸시 알림 발송",
            "서비스 안정성 확보, 오류 분석, 부정 이용 방지",
          ]}
        />
      </Section>

      <Section title="3. 보유 및 이용 기간">
        <Bullets
          items={[
            "계정 정보, 사주 프로필, 리딩 기록, 알림 설정: 회원 탈퇴(계정 삭제) 시까지 보관하며, 탈퇴 즉시 삭제합니다.",
            "푸시 구독 정보: 알림을 끄거나 구독이 만료되면 삭제되며, 계정 삭제 시 함께 삭제됩니다.",
            "AI 해석 요청: 운영자는 해석 결과를 리딩 기록으로만 보관하며, 요청 원문을 별도로 저장하지 않습니다.",
            "접속 로그: 호스팅 사업자의 정책에 따라 단기간 보관 후 자동 삭제됩니다.",
          ]}
        />
        <p>
          다만 관계 법령에 따라 보존할 의무가 있는 경우에는 해당 기간 동안
          보관합니다.
        </p>
      </Section>

      <Section title="4. 개인정보의 제3자 제공">
        <p>
          운영자는 이용자의 개인정보를 제3자에게 판매하거나 제공하지 않습니다.
          법령에 근거가 있거나 수사기관의 적법한 요청이 있는 경우는 예외로
          합니다.
        </p>
      </Section>

      <Section title="5. 개인정보 처리위탁 및 국외 이전">
        <p>
          서비스 제공을 위해 아래 업체에 개인정보 처리를 위탁하고 있으며,
          해당 업체의 서버가 국외(주로 미국)에 있어 개인정보가 국외로
          이전됩니다. 이전은 서비스 이용 시 암호화된 네트워크를 통해
          이루어집니다.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="text-left text-heading">
                <th className="py-1.5 pr-3 font-semibold">수탁자 (국가)</th>
                <th className="py-1.5 pr-3 font-semibold">위탁 업무</th>
                <th className="py-1.5 font-semibold">이전 항목</th>
              </tr>
            </thead>
            <tbody className="align-top">
              <tr>
                <td className="py-1.5 pr-3">Clerk, Inc. (미국)</td>
                <td className="py-1.5 pr-3">회원 인증 및 계정 관리</td>
                <td className="py-1.5">이메일, 회원 식별자, 로그인 기록</td>
              </tr>
              <tr>
                <td className="py-1.5 pr-3">Vercel Inc. (미국)</td>
                <td className="py-1.5 pr-3">
                  웹 호스팅, 데이터 저장(Vercel Blob), AI 요청 중계(Vercel AI
                  Gateway)
                </td>
                <td className="py-1.5">
                  사주 프로필, 리딩 기록, 알림 설정, 푸시 구독 정보, AI 해석
                  요청 내용, 접속 로그
                </td>
              </tr>
              <tr>
                <td className="py-1.5 pr-3">
                  Vercel AI Gateway를 통해 연결되는 AI 모델 제공자
                </td>
                <td className="py-1.5 pr-3">타로 및 사주 해석 문장 생성</td>
                <td className="py-1.5">
                  카드, 고민 주제, 사주 요약 (이름, 이메일 제외)
                </td>
              </tr>
              <tr>
                <td className="py-1.5 pr-3">Resend, Inc. (미국)</td>
                <td className="py-1.5 pr-3">
                  오늘의 운세 메일 발송 (메일 알림을 켠 경우에만)
                </td>
                <td className="py-1.5">이메일 주소, 메일 본문</td>
              </tr>
              <tr>
                <td className="py-1.5 pr-3">
                  브라우저 푸시 서비스 (Google, Apple, Mozilla 등)
                </td>
                <td className="py-1.5 pr-3">
                  푸시 알림 전달 (푸시 알림을 켠 경우에만)
                </td>
                <td className="py-1.5">푸시 구독 주소, 알림 내용</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          국외 이전을 원하지 않으시면 서비스 이용을 중단하고 계정을 삭제할 수
          있습니다. 이 경우 서비스 이용이 불가능합니다.
        </p>
      </Section>

      <Section title="6. 개인정보의 파기 절차 및 방법">
        <p>
          보유 기간이 끝나거나 처리 목적이 달성된 개인정보는 지체 없이
          파기합니다. 전자적 파일은 복구할 수 없는 방법으로 삭제합니다.
          계정 삭제를 요청하면 Vercel Blob에 저장된 사주 프로필, 리딩 기록,
          알림 설정, 푸시 구독 정보, 오늘의 운세 기록을 모두 삭제한 뒤 Clerk
          계정을 삭제합니다.
        </p>
      </Section>

      <Section title="7. 이용자의 권리와 행사 방법">
        <p>
          이용자는 언제든지 자신의 개인정보에 대해 열람, 정정, 삭제, 처리정지를
          요구할 수 있습니다.
        </p>
        <Bullets
          items={[
            <>사주 프로필 수정: 앱의 「사주」 메뉴에서 직접 수정할 수 있습니다.</>,
            <>알림 수신 거부: 「알림 설정」에서 메일과 푸시를 각각 끌 수 있습니다.</>,
            <>
              계정 및 전체 데이터 삭제: 로그인 후{" "}
              <Link href="/settings" className="text-accent underline">
                설정
              </Link>{" "}
              화면 하단의 「계정 삭제」에서 바로 삭제할 수 있습니다. 자세한
              절차는{" "}
              <Link href="/account-deletion" className="text-accent underline">
                계정 삭제 안내
              </Link>
              를 참고하세요.
            </>,
            <>
              그 밖의 요청은 {LEGAL.contactEmail}로 연락하시면 지체 없이
              조치하겠습니다.
            </>,
          ]}
        />
      </Section>

      <Section title="8. 개인정보의 안전성 확보 조치">
        <Bullets
          items={[
            "모든 통신은 HTTPS로 암호화됩니다.",
            "이용자 데이터는 비공개(private) 저장소에 회원별로 분리해 저장하며, 본인 인증을 거친 요청만 접근할 수 있습니다.",
            "비밀번호 등 인증 정보는 운영자가 직접 보관하지 않고 인증 전문 업체(Clerk)가 처리합니다.",
            "접근 권한을 최소한의 인원으로 제한합니다.",
          ]}
        />
      </Section>

      <Section title="9. 쿠키 및 로컬 저장소">
        <p>
          서비스는 로그인 상태 유지를 위해 Clerk의 인증 쿠키를 사용하고, 빠른
          화면 표시와 오프라인 사용을 위해 브라우저의 로컬 저장소에 사주
          프로필과 리딩 기록 사본을 저장합니다. 광고나 추적 목적의 쿠키는
          사용하지 않습니다. 브라우저 설정에서 쿠키를 차단할 수 있으나, 이
          경우 로그인이 필요한 기능을 이용할 수 없습니다.
        </p>
      </Section>

      <Section title="10. 만 14세 미만 아동">
        <p>
          서비스는 만 14세 미만 아동을 대상으로 하지 않으며, 만 14세 미만인
          경우 가입할 수 없습니다. 만 14세 미만 아동의 정보가 수집된 사실을
          알게 되면 즉시 삭제합니다.
        </p>
      </Section>

      <Section title="11. 개인정보 보호책임자">
        <Bullets
          items={[
            <>운영자: {LEGAL.operatorName}</>,
            <>개인정보 보호책임자: {LEGAL.privacyOfficer}</>,
            <>연락처: {LEGAL.contactEmail}</>,
          ]}
        />
      </Section>

      <Section title="12. 권익침해 구제 방법">
        <p>
          개인정보 침해에 대한 상담이나 분쟁 해결이 필요하면 아래 기관에
          문의할 수 있습니다.
        </p>
        <Bullets
          items={[
            "개인정보침해 신고센터 (privacy.kisa.or.kr / 국번 없이 118)",
            "개인정보 분쟁조정위원회 (www.kopico.go.kr / 1833-6972)",
            "대검찰청 사이버수사과 (www.spo.go.kr / 국번 없이 1301)",
            "경찰청 사이버수사국 (ecrm.police.go.kr / 국번 없이 182)",
          ]}
        />
      </Section>

      <Section title="13. 방침의 변경">
        <p>
          이 방침은 {LEGAL.effectiveDate}부터 시행됩니다. 내용이 변경되는
          경우 시행 7일 전부터 서비스 화면을 통해 알려 드립니다.
        </p>
      </Section>
    </LegalPage>
  );
}
