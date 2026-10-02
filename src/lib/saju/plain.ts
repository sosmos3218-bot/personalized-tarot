/**
 * Everyday-Korean labels for saju UI / prompts.
 * Keep classical terms only as short optional glosses.
 */

import { ELEMENT_TRAITS, type Element } from "./constants";
import type { SajuChart, SajuProfile } from "./types";

type ElementStringMap = { [K in Element]: string };

/** Plain element names. */
export const ELEMENT_PLAIN: ElementStringMap = {
  wood: "\ub098\ubb34",
  fire: "\ubd88",
  earth: "\ud759",
  metal: "\uc1e0",
  water: "\ubb3c",
};

const ELEMENT_CLASSICAL: ElementStringMap = {
  wood: "\ubaa9",
  fire: "\ud654",
  earth: "\ud1a0",
  metal: "\uae08",
  water: "\uc218",
};

export function elementPlainWithGloss(el: Element): string {
  return ELEMENT_PLAIN[el] + "\u300c" + ELEMENT_CLASSICAL[el] + "\u300d";
}

export function dayMasterPlain(chart: SajuChart): string {
  const dm = chart.dayMaster;
  const yy = dm.yinYang === "yang" ? "\uc591" : "\uc74c";
  return (
    "\u300c\uc77c\uac04(\ub098\ub97c \ub098\ud0c0\ub0b4\ub294 \uae30\uc6b4)\u300d " +
    dm.stemHan +
    "(" +
    dm.stemKo +
    ") \u2014 " +
    yy +
    "\uc758 " +
    ELEMENT_PLAIN[dm.element] +
    " \uae30\uc6b4 \u00b7 " +
    dm.elementTrait
  );
}

export function formatSajuSummaryPlain(chart: SajuChart): string {
  const dm = chart.dayMaster;
  const pillars = [
    "\ud574 " + chart.year.label,
    "\ub2ec " + chart.month.label,
    "\ub0a0 " + chart.day.label,
  ];
  if (chart.hour) pillars.push("\uc2dc " + chart.hour.label);
  return (
    "\ub098\ub97c \ub098\ud0c0\ub0b4\ub294 \uae30\uc6b4 " +
    dm.stemHan +
    "(" +
    dm.stemKo +
    ") \u00b7 " +
    ELEMENT_PLAIN[dm.element] +
    " \u2014 " +
    pillars.join(" / ")
  );
}

export const SAJU_DISCLAIMER_PLAIN =
  "\ucd9c\uc0dd \uc815\ubcf4\ub85c \uacc4\uc0b0\ud55c \ucc38\uace0\uc6a9 \ud750\ub984\uc785\ub2c8\ub2e4. \uc804\ubb38 \uba85\ub9ac\u00b7\uc0c1\ub2f4\uc744 \ub300\uccb4\ud558\uc9c0 \uc54a\uc544\uc694.";

export const SAJU_DISCLAIMER_DETAIL =
  "\uc808\uae30\u00b7\uc2dc\uac01 \ubcf4\uc815\u00b7\uc57c\uc790\uc2dc\u00b7\uc2e0\uc0b4\u00b7\uc2ed\uc2e0\u00b7\uc9c0\uc7a5\uac04\u00b7\ub300\uc6b4\uc740 \uac04\uc774 \uaddc\uce59\uc774\ub77c \uc218 \uc2dc\uac04~\ud558\ub8e8 \ucc28\uc774\uac00 \ub0a0 \uc218 \uc788\uc2b5\ub2c8\ub2e4.";

export function sajuDetailLines(chart: SajuChart): string[] {
  const lines: string[] = [];
  lines.push(
    "\uae30\ub465(\ub144\u00b7\uc6d4\u00b7\uc77c" +
      (chart.hour ? "\u00b7\uc2dc" : "") +
      "): " +
      chart.year.label +
      " / " +
      chart.month.label +
      " / " +
      chart.day.label +
      (chart.hour ? " / " + chart.hour.label : "")
  );
  if (chart.trueSolar) {
    lines.push(
      "\uc2dc\uac01 \ubcf4\uc815\u300c\uc9c4\ud0dc\uc591\uc2dc\u300d: " +
        String(chart.trueSolar.hour).padStart(2, "0") +
        ":" +
        String(chart.trueSolar.minute).padStart(2, "0") +
        " (" +
        chart.trueSolar.totalOffsetMin +
        "\ubd84)"
    );
  }
  if (chart.yaja && chart.yaja.applied) {
    lines.push(chart.yaja.label + " \u2014 " + chart.yaja.note);
  }
  if (chart.sinsal && chart.sinsal.items && chart.sinsal.items.length) {
    const names: string[] = [];
    for (let i = 0; i < chart.sinsal.items.length; i++) {
      names.push(chart.sinsal.items[i].nameKo);
    }
    lines.push("\ucc38\uace0 \uc0c1\uc9d5: " + names.join(" \u00b7 "));
  }
  if (chart.daeun) {
    lines.push(
      "\ud070 \ud750\ub984\u300c\ub300\uc6b4\u300d: " +
        chart.daeun.directionLabel +
        " \u00b7 \uc2dc\uc791 \ub9cc" +
        chart.daeun.startAge +
        "\uc138 \uadfc\uc0ac"
    );
  }
  return lines;
}

export function sajuPromptBlockPlain(
  profile: SajuProfile | null | undefined
): string {
  if (!profile || !profile.chart) return "\uc0ac\uc8fc(\ucd9c\uc0dd \uae30\uc6b4) \uc815\ubcf4 \uc5c6\uc74c";
  const c = profile.chart;
  const dm = c.dayMaster;
  const yy = dm.yinYang === "yang" ? "\uc591" : "\uc74c";
  const lines = [
    "\ub098\ub97c \ub098\ud0c0\ub0b4\ub294 \uae30\uc6b4\u300c\uc77c\uac04\u300d: " +
      dm.stemHan +
      "(" +
      dm.stemKo +
      ") / " +
      yy +
      " / " +
      elementPlainWithGloss(dm.element) +
      " \u2014 " +
      ELEMENT_TRAITS[dm.element],
    "\ud574\uc758 \uae30\ub465\u300c\ub144\uc8fc\u300d: " + c.year.label,
    "\ub2ec\uc758 \uae30\ub465\u300c\uc6d4\uc8fc\u300d: " + c.month.label,
    "\ub0a0\uc758 \uae30\ub465\u300c\uc77c\uc8fc\u300d: " + c.day.label,
    c.hour
      ? "\uc2dc\uc758 \uae30\ub465\u300c\uc2dc\uc8fc\u300d: " + c.hour.label
      : "\uc2dc\uc758 \uae30\ub465\u300c\uc2dc\uc8fc\u300d: \uc5c6\uc74c(\ucd9c\uc0dd \uc2dc\uac01 \ubaa8\ub984)",
    "\uc591\ub825 \uae30\uc900\uc77c: " + c.solarDate,
    c.calendarType === "lunar" && c.lunarDate
      ? "\uc785\ub825 \uc74c\ub825: " + c.lunarDate
      : null,
    "\uc131\ubcc4: " +
      (c.gender === "female" ? "\uc5ec" : c.gender === "male" ? "\ub0a8" : "\ubbf8\uc9c0\uc815"),
    "\uace0\uc9c0: \ucc38\uace0\uc6a9 \uac04\uc774 \uacc4\uc0b0\uc774\uba70 \uc804\ubb38 \uc0c1\ub2f4\uc744 \ub300\uccb4\ud558\uc9c0 \uc54a\uc74c.",
    "\uc791\uc131 \uc2dc: \uc804\ubb38 \uc6a9\uc5b4\ubcf4\ub2e4 \uc77c\uc0c1 \ud55c\uad6d\uc5b4\ub97c \uc4f0\uace0, \uc6a9\uc5b4\uac00 \ud544\uc694\ud558\uba74 \u300c\uc77c\uac04(\ub098\ub97c \ub098\ud0c0\ub0b4\ub294 \uae30\uc6b4)\u300d\ucc98\ub7fc \uc9e7\uac8c\ub9cc \uad04\ud638\ub85c \ud480\uc5b4 \uc8fc\uc138\uc694.",
  ];
  return lines.filter(Boolean).join("\n");
}
