import Link from "next/link";
import { LEGAL } from "@/lib/legal";

export function LegalPage({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <article className="mx-auto max-w-2xl space-y-6 animate-fade-up">
      <header>
        <p className="text-[11px] tracking-[0.22em] text-accent font-medium">
          {eyebrow}
        </p>
        <h1 className="mt-1 text-2xl font-bold text-heading">{title}</h1>
        <p className="mt-1 text-xs text-muted">
          시행일: {LEGAL.effectiveDate}
        </p>
        {intro && (
          <div className="mt-3 text-sm text-body leading-relaxed">{intro}</div>
        )}
      </header>
      <div className="card-panel !p-5 sm:!p-6 space-y-6 text-sm text-body leading-relaxed">
        {children}
      </div>
      <nav className="flex flex-wrap gap-2 justify-center text-sm">
        <Link href="/privacy" className="btn-secondary text-sm">
          개인정보처리방침
        </Link>
        <Link href="/terms" className="btn-secondary text-sm">
          이용약관
        </Link>
        <Link href="/account-deletion" className="btn-secondary text-sm">
          계정 삭제 안내
        </Link>
      </nav>
    </article>
  );
}

export function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2">
      <h2 className="text-base font-semibold text-heading">{title}</h2>
      {children}
    </section>
  );
}

export function Bullets({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="list-disc pl-5 space-y-1">
      {items.map((it, i) => (
        <li key={i}>{it}</li>
      ))}
    </ul>
  );
}
