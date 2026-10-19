import Link from "next/link";
import { LEGAL } from "@/lib/legal";

export default function SiteFooter() {
  return (
    <footer className="mx-auto max-w-3xl px-4 pb-10 pt-2 text-center text-xs text-muted">
      <nav
        aria-label="법적 고지"
        className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1"
      >
        <Link href="/privacy" className="hover:underline font-medium">
          개인정보처리방침
        </Link>
        <Link href="/terms" className="hover:underline">
          이용약관
        </Link>
        <Link href="/account-deletion" className="hover:underline">
          계정 삭제 안내
        </Link>
      </nav>
      <p className="mt-2 leading-relaxed">
        {LEGAL.serviceName}의 리딩은 오락 및 자기성찰 목적이며, 의료, 법률,
        금융 조언이 아닙니다.
      </p>
    </footer>
  );
}
