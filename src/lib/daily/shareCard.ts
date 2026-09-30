/**
 * Client-side daily fortune share card (canvas PNG).
 * No network, no AI — draws already-computed fortune text.
 */

export const SHARE_PAGE_URL = "https://personalized-tarot.vercel.app/today";

export interface ShareCardContent {
  dateLabel: string;
  luckScore: number;
  /** One-line energy / headline */
  headline: string;
  focus: string;
  /** Drawn tarot name, if any */
  tarotName?: string | null;
  dayMasterStem: string;
  dayMasterLabel: string;
  todayPillarLabel: string;
  relationLabel: string;
}

const W = 1080;
const H = 1350;

const FONT =
  '"Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", "NanumGothic", sans-serif';

function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number
): string[] {
  const chars = Array.from(text.replace(/\s+/g, " ").trim());
  if (chars.length === 0 || maxLines < 1) return [];
  const lines: string[] = [];
  let current = "";
  let i = 0;
  while (i < chars.length) {
    const trial = current + chars[i];
    if (current && ctx.measureText(trial).width > maxWidth) {
      if (lines.length === maxLines - 1) {
        let line = current;
        while (line && ctx.measureText(`${line}…`).width > maxWidth) {
          line = Array.from(line).slice(0, -1).join("");
        }
        lines.push(`${line}…`);
        return lines;
      }
      lines.push(current);
      current = "";
      continue;
    }
    current = trial;
    i += 1;
  }
  if (current && lines.length < maxLines) lines.push(current);
  return lines;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

export function drawShareCard(
  ctx: CanvasRenderingContext2D,
  content: ShareCardContent
) {
  ctx.clearRect(0, 0, W, H);

  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#fbf7f1");
  bg.addColorStop(0.55, "#f6efe4");
  bg.addColorStop(1, "#efe4f6");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const glowV = ctx.createRadialGradient(180, 80, 20, 200, 40, 520);
  glowV.addColorStop(0, "rgba(124, 58, 237, 0.22)");
  glowV.addColorStop(1, "rgba(124, 58, 237, 0)");
  ctx.fillStyle = glowV;
  ctx.fillRect(0, 0, W, H);

  const glowG = ctx.createRadialGradient(920, 1180, 20, 900, 1200, 480);
  glowG.addColorStop(0, "rgba(184, 134, 11, 0.20)");
  glowG.addColorStop(1, "rgba(184, 134, 11, 0)");
  ctx.fillStyle = glowG;
  ctx.fillRect(0, 0, W, H);

  // frame
  ctx.strokeStyle = "rgba(154, 114, 20, 0.45)";
  ctx.lineWidth = 3;
  roundRect(ctx, 36, 36, W - 72, H - 72, 36);
  ctx.stroke();
  ctx.strokeStyle = "rgba(109, 40, 217, 0.18)";
  ctx.lineWidth = 1;
  roundRect(ctx, 48, 48, W - 96, H - 96, 28);
  ctx.stroke();

  ctx.textAlign = "center";
  ctx.fillStyle = "#9a7214";
  ctx.font = `600 28px ${FONT}`;
  ctx.fillText("✦  STARLIGHT", W / 2, 130);

  ctx.fillStyle = "#2a1f3d";
  ctx.font = `700 64px ${FONT}`;
  ctx.fillText("별빛 타로", W / 2, 210);

  ctx.fillStyle = "#6d28d9";
  ctx.font = `500 26px ${FONT}`;
  ctx.fillText("개인화 타로 · 사주", W / 2, 258);

  ctx.fillStyle = "#6b6178";
  ctx.font = `500 30px ${FONT}`;
  ctx.fillText(`${content.dateLabel}  ·  서울`, W / 2, 330);

  // score panel
  ctx.fillStyle = "rgba(255, 253, 248, 0.88)";
  roundRect(ctx, 100, 370, W - 200, 250, 28);
  ctx.fill();
  ctx.strokeStyle = "rgba(124, 58, 237, 0.16)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = "#6b6178";
  ctx.font = `600 26px ${FONT}`;
  ctx.fillText("오늘의 운세", W / 2, 430);

  const score = Math.max(0, Math.min(100, Math.round(content.luckScore)));
  ctx.fillStyle = "#6d28d9";
  ctx.font = `700 92px ${FONT}`;
  ctx.fillText(String(score), W / 2 - 28, 540);
  const scoreW = ctx.measureText(String(score)).width;
  ctx.fillStyle = "#9a90a8";
  ctx.font = `600 28px ${FONT}`;
  ctx.textAlign = "left";
  ctx.fillText("/ 100", W / 2 - 28 + scoreW / 2 + 8, 530);
  ctx.textAlign = "center";

  const barX = 180;
  const barY = 568;
  const barW = W - 360;
  const barH = 16;
  ctx.fillStyle = "rgba(109, 40, 217, 0.10)";
  roundRect(ctx, barX, barY, barW, barH, 8);
  ctx.fill();
  const grad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
  grad.addColorStop(0, "#7c3aed");
  grad.addColorStop(0.55, "#b8860b");
  grad.addColorStop(1, "#fbbf24");
  ctx.fillStyle = grad;
  roundRect(ctx, barX, barY, Math.max(12, (barW * score) / 100), barH, 8);
  ctx.fill();

  // headline
  ctx.textAlign = "center";
  ctx.fillStyle = "#2a1f3d";
  ctx.font = `600 40px ${FONT}`;
  const headlines = wrapLines(ctx, content.headline, 860, 3);
  let hy = 710;
  for (const line of headlines) {
    ctx.fillText(line, W / 2, hy);
    hy += 56;
  }

  ctx.fillStyle = "#6b6178";
  ctx.font = `500 28px ${FONT}`;
  const focuses = wrapLines(ctx, `초점  ${content.focus}`, 860, 2);
  hy += 10;
  for (const line of focuses) {
    ctx.fillText(line, W / 2, hy);
    hy += 42;
  }

  // chips
  const chips: { label: string; value: string }[] = [
    {
      label: "일간",
      value: `${content.dayMasterStem} · ${content.dayMasterLabel}`,
    },
    {
      label: "오늘 일주",
      value: content.todayPillarLabel,
    },
  ];
  if (content.tarotName) {
    chips.push({ label: "오늘의 타로", value: content.tarotName });
  } else {
    chips.push({ label: "관계", value: content.relationLabel.split("—")[0].trim() });
  }

  const chipTop = 980;
  const chipH = 118;
  const gap = 20;
  const chipW = (W - 160 - gap * (chips.length - 1)) / chips.length;
  chips.forEach((chip, i) => {
    const x = 80 + i * (chipW + gap);
    ctx.fillStyle = "rgba(255, 253, 248, 0.9)";
    roundRect(ctx, x, chipTop, chipW, chipH, 22);
    ctx.fill();
    ctx.strokeStyle = "rgba(184, 134, 11, 0.35)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = "#9a7214";
    ctx.font = `600 20px ${FONT}`;
    ctx.textAlign = "center";
    ctx.fillText(chip.label, x + chipW / 2, chipTop + 40);

    ctx.fillStyle = "#2a1f3d";
    ctx.font = `600 24px ${FONT}`;
    const vals = wrapLines(ctx, chip.value, chipW - 28, 2);
    let vy = chipTop + (vals.length > 1 ? 72 : 84);
    for (const line of vals) {
      ctx.fillText(line, x + chipW / 2, vy);
      vy += 30;
    }
  });

  ctx.fillStyle = "#9a90a8";
  ctx.font = `500 22px ${FONT}`;
  ctx.fillText("참고용 · 엔터테인먼트", W / 2, 1188);
  ctx.fillStyle = "#6d28d9";
  ctx.font = `600 24px ${FONT}`;
  ctx.fillText("personalized-tarot.vercel.app/today", W / 2, 1236);
}

export function renderShareCardBlob(content: ShareCardContent): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return Promise.reject(new Error("canvas"));
  drawShareCard(ctx, content);
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("png"));
    }, "image/png");
  });
}

export function shareCaption(content: ShareCardContent): string {
  const bits = [
    `별빛 타로 · ${content.dateLabel} (서울)`,
    `오늘의 운세 ${Math.round(content.luckScore)}점`,
    content.headline,
    content.tarotName ? `오늘의 타로: ${content.tarotName}` : null,
    `일간 ${content.dayMasterStem}`,
    SHARE_PAGE_URL,
  ];
  return bits.filter(Boolean).join("\n");
}
