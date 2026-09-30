"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import ProgressSteps from "@/components/ProgressSteps";
import { buildSajuProfile, SAJU_DISCLAIMER } from "@/lib/saju";
import type { CalendarType, Gender, SajuProfile } from "@/lib/saju";
import { getSajuProfile } from "@/lib/storage";
import { loadSajuProfile, syncSaveSaju } from "@/lib/sync";

const YEAR_MIN = 1900;
const YEAR_MAX = 2100;

function pad2(n: number) {
  return String(n).padStart(2, "0");
}
function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}
function toYmd(y: number, m: number, d: number) {
  return `${y}-${pad2(m)}-${pad2(d)}`;
}

export default function SajuForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userId } = useAuth();
  const fromPath = searchParams.get("from");
  const needSaju = searchParams.get("need") === "saju";

  const [year, setYear] = useState(1990);
  const [month, setMonth] = useState(1);
  const [day, setDay] = useState(1);
  const [birthTime, setBirthTime] = useState("");
  const [timeUnknown, setTimeUnknown] = useState(true);
  const [gender, setGender] = useState<Gender>("unspecified");
  const [calendarType, setCalendarType] = useState<CalendarType>("solar");
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<SajuProfile | null>(null);
  const [justSaved, setJustSaved] = useState(false);

  const maxDay = daysInMonth(year, month);
  const birthDate = toYmd(year, month, Math.min(day, maxDay));

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const profile = (await loadSajuProfile(userId)) ?? getSajuProfile(userId);
      if (cancelled || !profile) return;
      const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(profile.input.birthDate);
      if (m) {
        setYear(Number(m[1]));
        setMonth(Number(m[2]));
        setDay(Number(m[3]));
      }
      setBirthTime(profile.input.birthTime ?? "");
      setTimeUnknown(Boolean(profile.input.timeUnknown) || !profile.input.birthTime);
      setGender(profile.input.gender ?? "unspecified");
      setCalendarType(profile.input.calendarType);
      setPreview(profile);
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const canSubmit = useMemo(() => Boolean(birthDate), [birthDate]);

  function runCompute() {
    return buildSajuProfile({
      birthDate,
      birthTime: timeUnknown ? null : birthTime || null,
      timeUnknown,
      gender,
      calendarType,
    });
  }

  function computePreview() {
    setError(null);
    try {
      setPreview(runCompute());
    } catch (e) {
      setPreview(null);
      setError(e instanceof Error ? e.message : "사주 계산에 실패했습니다.");
    }
  }

  function saveAndContinue() {
    setError(null);
    try {
      const profile = runCompute();
      void syncSaveSaju(profile, userId);
      setPreview(profile);
      setJustSaved(true);
      if (
        fromPath &&
        fromPath.startsWith("/") &&
        !fromPath.startsWith("//") &&
        fromPath !== "/saju"
      ) {
        router.push(fromPath === "/today" ? "/today?welcome=1" : fromPath);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "사주 저장에 실패했습니다.");
    }
  }

  if (justSaved) {
    return (
      <div className="mx-auto max-w-lg space-y-6 animate-fade-up">
        <ProgressSteps current="today" done={["saju"]} />
        <div className="text-center space-y-2">
          <h1 className="text-xl font-bold text-heading">사주가 준비됐어요</h1>
          <p className="text-sm text-body">오늘의 운세부터 확인해 보세요.</p>
        </div>
        <Link href="/today?welcome=1" className="btn-primary w-full block text-center">
          오늘의 운세 보기
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 animate-fade-up">
      <ProgressSteps current="saju" />
      {needSaju && (
        <p className="text-sm text-body card-panel !p-4">
          사주를 먼저 등록해 주세요. 저장 후 오늘의 운세를 추천드려요.
        </p>
      )}
      <div className="text-center">
        <h1 className="text-xl font-bold text-heading">사주 프로필</h1>
      </div>
      <div className="card-panel space-y-4 !p-4">
        <div className="grid grid-cols-3 gap-2">
          <select
            className="rounded-xl border px-2 py-2.5 text-sm"
            style={{ background: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--foreground)" }}
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            {Array.from({ length: YEAR_MAX - YEAR_MIN + 1 }, (_, i) => YEAR_MIN + i).map((y) => (
              <option key={y} value={y}>{y}년</option>
            ))}
          </select>
          <select
            className="rounded-xl border px-2 py-2.5 text-sm"
            style={{ background: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--foreground)" }}
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>{m}월</option>
            ))}
          </select>
          <select
            className="rounded-xl border px-2 py-2.5 text-sm"
            style={{ background: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--foreground)" }}
            value={Math.min(day, maxDay)}
            onChange={(e) => setDay(Number(e.target.value))}
          >
            {Array.from({ length: maxDay }, (_, i) => i + 1).map((d) => (
              <option key={d} value={d}>{d}일</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          {(["solar", "lunar"] as const).map((key) => (
            <button
              key={key}
              type="button"
              className={`choice-btn flex-1 !py-2.5 ${calendarType === key ? "choice-btn-selected" : ""}`}
              onClick={() => setCalendarType(key)}
            >
              {key === "solar" ? "양력" : "음력"}
            </button>
          ))}
        </div>
        <div>
          <label className="flex items-center gap-2 text-sm text-body mb-1.5">
            <input
              type="checkbox"
              checked={timeUnknown}
              onChange={(e) => setTimeUnknown(e.target.checked)}
            />
            출생 시각 모름
          </label>
          <input
            type="time"
            value={birthTime}
            disabled={timeUnknown}
            onChange={(e) => {
              setBirthTime(e.target.value);
              setTimeUnknown(false);
            }}
            className="w-full rounded-xl border px-3 py-2.5 text-sm disabled:opacity-50"
            style={{ background: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--foreground)" }}
          />
        </div>
        <div className="flex gap-2">
          {([
            ["male", "남"],
            ["female", "여"],
            ["unspecified", "미지정"],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={`choice-btn flex-1 !py-2.5 ${gender === key ? "choice-btn-selected" : ""}`}
              onClick={() => setGender(key)}
            >
              {label}
            </button>
          ))}
        </div>
        {error && (
          <p className="text-sm" style={{ color: "var(--rose)" }} role="alert">
            {error}
          </p>
        )}
        <div className="flex gap-2">
          <button type="button" className="btn-secondary flex-1" onClick={computePreview} disabled={!canSubmit}>
            미리보기
          </button>
          <button type="button" className="btn-primary flex-1" onClick={saveAndContinue} disabled={!canSubmit}>
            저장하고 다음으로
          </button>
        </div>
      </div>
      {preview && (
        <div className="card-panel space-y-2 !p-5 text-sm">
          <p className="font-medium text-heading">{preview.summaryText}</p>
          <p className="text-body">
            일간 {preview.chart.dayMaster.stemHan}({preview.chart.dayMaster.stemKo}) ·{" "}
            {preview.chart.dayMaster.yinYangLabel} · {preview.chart.dayMaster.elementLabel}
          </p>
          {preview.chart.trueSolar && (
            <p className="text-xs text-muted">
              진태양시 {String(preview.chart.trueSolar.hour).padStart(2, "0")}:
              {String(preview.chart.trueSolar.minute).padStart(2, "0")} (보정{" "}
              {preview.chart.trueSolar.totalOffsetMin}분)
            </p>
          )}
          {preview.chart.yaja?.applied && (
            <p className="text-xs text-muted">
              {preview.chart.yaja.label} — {preview.chart.yaja.note}
            </p>
          )}
          {preview.chart.sinsal && preview.chart.sinsal.items.length > 0 && (
            <div className="text-xs space-y-1 border-t pt-2" style={{ borderColor: "var(--card-border)" }}>
              <p className="text-muted">신살 · 간이</p>
              {preview.chart.sinsal.items.map((s) => (
                <p key={s.key + s.where.join("")}>
                  <span className="text-heading font-medium">{s.nameKo}</span>
                  <span className="text-muted"> ({s.where.join("·")}) — {s.brief}</span>
                </p>
              ))}
            </div>
          )}
          <p className="text-xs text-muted pt-1">{SAJU_DISCLAIMER}</p>
        </div>
      )}
    </div>
  );
}
