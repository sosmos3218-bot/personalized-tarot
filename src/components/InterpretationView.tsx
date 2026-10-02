"use client";

type Block =
  | { kind: "heading"; level: 2 | 3; text: string }
  | { kind: "paragraph"; text: string }
  | { kind: "list"; items: string[] };

type Section = {
  title: string | null;
  blocks: Block[];
};

function stripInlineNoise(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .trim();
}

/** Parse lightweight markdown (## / ### / lists / paragraphs) into sections. */
export function parseInterpretation(text: string): Section[] {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const sections: Section[] = [];
  let current: Section = { title: null, blocks: [] };
  let paraBuf: string[] = [];
  let listBuf: string[] = [];

  function flushPara() {
    if (!paraBuf.length) return;
    const joined = stripInlineNoise(paraBuf.join(" ").replace(/\s+/g, " "));
    if (joined) current.blocks.push({ kind: "paragraph", text: joined });
    paraBuf = [];
  }

  function flushList() {
    if (!listBuf.length) return;
    current.blocks.push({
      kind: "list",
      items: listBuf.map(stripInlineNoise).filter(Boolean),
    });
    listBuf = [];
  }

  function flushInline() {
    flushList();
    flushPara();
  }

  function pushSection(title: string | null) {
    flushInline();
    if (current.title !== null || current.blocks.length > 0) {
      sections.push(current);
    }
    current = { title, blocks: [] };
  }

  for (const raw of lines) {
    const line = raw.trimEnd();
    const trimmed = line.trim();

    if (!trimmed) {
      flushInline();
      continue;
    }

    const h2 = trimmed.match(/^##\s+(.+)$/);
    if (h2) {
      pushSection(stripInlineNoise(h2[1]));
      continue;
    }

    const h3 = trimmed.match(/^###\s+(.+)$/);
    if (h3) {
      flushInline();
      current.blocks.push({
        kind: "heading",
        level: 3,
        text: stripInlineNoise(h3[1]),
      });
      continue;
    }

    const bullet = trimmed.match(/^[-*•]\s+(.+)$/);
    if (bullet) {
      flushPara();
      listBuf.push(bullet[1]);
      continue;
    }

    const numbered = trimmed.match(/^\d+[.)]\s+(.+)$/);
    if (numbered) {
      flushPara();
      listBuf.push(numbered[1]);
      continue;
    }

    flushList();
    paraBuf.push(trimmed);
  }

  flushInline();
  if (current.title !== null || current.blocks.length > 0) {
    sections.push(current);
  }

  return sections.length > 0 ? sections : [{ title: null, blocks: [] }];
}

function BlockNodes({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((b, i) => {
        if (b.kind === "heading") {
          return (
            <h4
              key={i}
              className="pt-1 text-[13px] font-semibold tracking-tight text-heading"
            >
              {b.text}
            </h4>
          );
        }
        if (b.kind === "list") {
          return (
            <ul
              key={i}
              className="list-disc space-y-1.5 pl-4 text-sm leading-relaxed text-body marker:text-accent"
            >
              {b.items.map((item, j) => (
                <li key={j}>{item}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i} className="text-sm leading-[1.75] text-body">
            {b.text}
          </p>
        );
      })}
    </>
  );
}

export function InterpretationLoading({
  label = "해석을 정리하는 중…",
}: {
  label?: string;
}) {
  return (
    <div
      className="flex flex-col items-center gap-4 rounded-xl border border-dashed px-5 py-8 text-center"
      style={{ borderColor: "var(--border)", background: "var(--chip-bg)" }}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span
        className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-transparent"
        style={{
          borderTopColor: "var(--accent-violet-soft)",
          borderRightColor: "var(--accent-gold-bright)",
        }}
        aria-hidden
      />
      <div className="space-y-1.5">
        <p className="text-sm font-medium text-heading">{label}</p>
        <p className="text-xs text-muted">
          사주 기운과 카드를 맞춰 보는 중이에요
        </p>
      </div>
      <div className="mt-1 w-full max-w-sm space-y-2.5" aria-hidden>
        <div
          className="h-3 w-[88%] animate-pulse rounded-full"
          style={{ background: "var(--border)" }}
        />
        <div
          className="h-3 w-full animate-pulse rounded-full"
          style={{ background: "var(--border)" }}
        />
        <div
          className="h-3 w-[72%] animate-pulse rounded-full"
          style={{ background: "var(--border)" }}
        />
        <div
          className="h-3 w-[94%] animate-pulse rounded-full"
          style={{ background: "var(--border)" }}
        />
      </div>
    </div>
  );
}

export function InterpretationPageLoading() {
  return (
    <div className="mx-auto max-w-lg space-y-6 animate-fade-up py-6">
      <div className="space-y-2 text-center">
        <p className="text-[11px] font-medium tracking-[0.22em] text-accent">
          RESULT · 타로+사주
        </p>
        <h1 className="text-2xl font-bold text-heading">리딩 결과</h1>
      </div>
      <section className="card-panel !p-5 sm:!p-7">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-heading">
          <span aria-hidden className="text-accent">
            ✧
          </span>
          해석
        </h2>
        <InterpretationLoading />
      </section>
    </div>
  );
}

export default function InterpretationView({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const sections = parseInterpretation(text);

  if (!text.trim()) {
    return (
      <p className="py-4 text-center text-sm text-muted">해석이 비어 있습니다.</p>
    );
  }

  const allUntitled = sections.every((s) => s.title === null);
  if (allUntitled && sections.length === 1) {
    return (
      <div className={`space-y-3 ${className}`}>
        <BlockNodes blocks={sections[0].blocks} />
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {sections.map((section, i) => {
        if (!section.title) {
          return (
            <div key={i} className="space-y-2.5">
              <BlockNodes blocks={section.blocks} />
            </div>
          );
        }

        return (
          <article
            key={i}
            className="space-y-2.5 rounded-xl border px-4 py-3.5 sm:px-5 sm:py-4"
            style={{
              borderColor: "var(--border)",
              background: "var(--chip-bg)",
            }}
          >
            <header
              className="flex items-center gap-2 border-b pb-2"
              style={{ borderColor: "var(--border)" }}
            >
              <span className="text-xs text-accent" aria-hidden>
                ✦
              </span>
              <h3 className="text-sm font-semibold tracking-tight text-heading">
                {section.title}
              </h3>
            </header>
            <div className="space-y-2.5 pt-0.5">
              <BlockNodes blocks={section.blocks} />
            </div>
          </article>
        );
      })}
    </div>
  );
}
