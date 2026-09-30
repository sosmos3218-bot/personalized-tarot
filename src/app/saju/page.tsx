"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import AuthGate from "@/components/AuthGate";
import ProgressSteps from "@/components/ProgressSteps";
import { buildSajuProfile } from "@/lib/saju";
import type { CalendarType, Gender, SajuProfile } from "@/lib/saju";
import { SAJU_DISCLAIMER } from "@/lib/saju";
import { getSajuProfile, saveSajuProfile } from "@/lib/storage";

const YEAR_MIN = 1900;
const YEAR_MAX = 2100;
const DEFAULT_YEAR = 1990;
const DEFAULT_MONTH = 1;
const DEFAULT_DAY = 1;

const selectStyle = {
  background: "var(--input-bg)",
  borderColor: "var(--input-border)",
  color: "var(--foreground)",
} as const;

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function toYmd(year: number, month: number, day: number): string {
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

function parseYmd(s: string): { year: number; month: number; day: number } | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s.trim());
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (
    year < YEAR_MIN ||
    year > YEAR_MAX ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > daysInMonth(year, month)
  ) {
    return null;
  }
  return { year, month, day };
}

const YEAR_OPTIONS = Array.from(
  { length: YEAR_MAX - YEAR_MIN + 1 },
  (_, i) => YEAR_MIN + i
);

export default function SajuPage() {
  return (
    <AuthGate>
      <Suspense
        fallback={
          <p className="text-center text-body animate-pulse">불러오는 중…</p>
        }
      >
        <SajuForm />
      </Suspense>
    </AuthGate>
  );
}

function SajuForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userId } = useAuth();
  const needSaju = searchParams.get("need") === "saju";
  const fromPath = searchParams.get("from");
  const fromLabel =
    fromPath === "/today"
      ? "오늘의 운세"
      : fromPath === "/draw"
        ? "카드 뽑기"
        : fromPath === "/onboarding"
          ? "맞춤 리딩"
          : fromPath === "/result"
            ? "리딩 결과"
            : null;
  const [year, setYear] = useState(DEFAULT_YEAR);
  const [month, setMonth] = useState(DEFAULT_MONTH);
  const [day, setDay] = useState(DEFAULT_DAY);
  const [birthTime, setBirthTime] = useState("");
  const [timeUnknown, setTimeUnknown] = useState(true);
  const [gender, setGender] = useState<Gender>("unspecified");
  const [calendarType, setCalendarType] = useState<CalendarType>("solar");
  const [error, setError] = useState<string | null>(null);
  const [existing, setExisting] = useState<SajuProfile | null>(null);
  const [preview, setPreview] = useState<SajuProfile | null>(null);
  const [justSaved, setJustSaved] = useState(false);

  const maxDay = daysInMonth(year, month);
  const birthDate = toYmd(year, month, Math.min(day, maxDay));

  useEffect(() => {
    if (day > maxDay) setDay(maxDay);
  }, [day, maxDay]);

  useEffect(() => {
    const profile = getSajuProfile(userId);
    if (profile) {
      setExisting(profile);
      const parsed = parseYmd(profile.input.birthDate);
      if (parsed) {
        setYear(parsed.year);
        setMonth(parsed.month);
        setDay(parsed.day);
      }
      setBirthTime(profile.input.birthTime ?? "");
      setTimeUnknown(Boolean(profile.input.timeUnknown) || !profile.input.birthTime);
      setGender(profile.input.gender ?? "unspecified");
      setCalendarType(profile.input.calendarType);
      setPreview(profile);
    }
  }, [userId]);

  const canSubmit = useMemo(() => Boolean(birthDate), [birthDate]);

  function computePreview() {
    setError(null);
    if (!birthDate) {
      setError("생년월일을 입력해 주세요.");
      return;
    }
    try {
      const profile = buildSajuProfile({
        birthDate,
        birthTime: timeUnknown ? null : birthTime || null,
        timeUnknown,
        gender,
        calendarType,
      });
      setPreview(profile);
    } catch (e) {
      setPreview(null);
      setError(e instanceof Error ? e.message : "사주 계산에 실패했습니다.");
    }
  }

  function saveAndContinue() {
    setError(null);
    if (!birthDate) {
      setError("생년월일을 입력해 주세요.");
      return;
    }
    try {
      const profile = buildSajuProfile({
        birthDate,
        birthTime: timeUnknown ? null : birthTime || null,
        timeUnknown,
        gender,
        calendarType,
      });
      saveSajuProfile(profile, userId);
      setExisting(profile);
      setPreview(profile);
      setJustSaved(true);
      // Prefer returning to the page that sent us here (e.g. /today)
      if (
        fromPath &&
        fromPath.startsWith("/") &&
        !fromPath.startsWith("//") &&
        fromPath !== "/saju"
      ) {
        const dest =
          fromPath === "/today" ? "/today?welcome=1" : fromPath;
        router.push(dest);
        return;
      }
      // Otherwise stay and show next-step recommendation (오늘의 운세 first)
    } catch (e) {
      setError(e instanceof Error ? e.message : "사주 저장에 실패했습니다.");
    }
  }

  if (justSaved) {
    return (
      <div className="mx-auto max-w-lg space-y-6 animate-fade-up">
        <ProgressSteps current="today" done={["saju"]} />
        <div className="text-center">
          <p className="text-[11px] tracking-[0.22em] text-accent font-medium">
            저장 완료
          </p>
          <h1 className="mt-2 text-xl font-bold text-heading sm:text-2xl leading-snug px-1">
            사주가 준비됐어요
          </h1>
          <p className="mt-2 text-sm text-body px-2 leading-relaxed">
            먼저 <strong className="text-heading font-semibold">오늘의 운세</strong>로
            하루 기운을 확인해 보세요. 깊이 있는 맞춤 리딩은 언제든 이어갈 수 있어요.
          </p>
        </div>
        <div className="card-panel space-y-3 !p-5">
          <Link href="/today?welcome=1" className="btn-primary w-full animate-glow block text-center">
            오늘의 운세 보기
          </Link>
          <Link href="/onboarding" className="btn-secondary w-full block text-center">
            맞춤 리딩 준비하기
          </Link>
          <Link
            href="/draw"
            className="block text-center text-sm text-muted hover:text-heading transition-colors pt-1"
          >
            바로 카드 뽑기
          </Link>
        </div>
        {preview && (
          <p className="text-center text-xs text-body px-2">{preview.summaryText}</p>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 animate-fade-up">
      <ProgressSteps current="saju" />

      {needSaju && (
        <div
          className="rounded-2xl border px-4 py-3 text-sm leading-relaxed"
          style={{
            borderColor: "var(--choice-selected-border)",
            background: "var(--choice-selected-bg)",
          }}
          role="status"
        >
          <p className="font-medium text-heading">
            {fromLabel
              ? `${fromLabel}을(를) 보려면 사주가 필요해요`
              : "사주를 먼저 등록해 주세요"}
          </p>
          <p className="mt-1 text-body text-[13px]">
            생년월일만 있으면 일간·오행을 계산해 타로+사주 퓨전 해석에 씁니다.
            저장 후 오늘의 운세부터 추천드려요.
          </p>
        </div>
      )}

      <div className="text-center">
        <p className="text-[11px] tracking-[0.22em] text-accent font-medium">
          1단계 · 사주
        </p>
        <h1 className="mt-2 text-xl font-bold text-heading sm:text-2xl leading-snug px-1">
          사주 프로필
        </h1>
        <p className="mt-2 text-sm text-body px-2 leading-relaxed">
          출생 정보를 입력하면 일간·간지를 계산해 오늘의 운세와 타로 해석에 함께
          씁니다.
        </p>
      </div>

      <div className="card-panel space-y-4 !p-4 sm:!p-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-heading">
            생년월일 <span className="text-accent">*</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            <label className="sr-only" htmlFor="saju-birth-year">
              년
            </label>
            <select
              id="saju-birth-year"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full rounded-xl border px-2 py-2.5 text-sm outline-none"
              style={selectStyle}
              required
            >
              {YEAR_OPTIONS.map((y) => (
                <option key={y} value={y}>
                  {y}년
                </option>
              ))}
            </select>
            <label className="sr-only" htmlFor="saju-birth-month">
              월
            </label>
            <select
              id="saju-birth-month"
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="w-full rounded-xl border px-2 py-2.5 text-sm outline-none"
              style={selectStyle}
              required
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {m}월
                </option>
              ))}
            </select>
            <label className="sr-only" htmlFor="saju-birth-day">
              일
            </label>
            <select
              id="saju-birth-day"
              value={Math.min(day, maxDay)}
              onChange={(e) => setDay(Number(e.target.value))}
              className="w-full rounded-xl border px-2 py-2.5 text-sm outline-none"
              style={selectStyle}
              required
            >
              {Array.from({ length: maxDay }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d}>
                  {d}일
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <span className="mb-1.5 block text-sm font-medium text-heading">
            달력
          </span>
          <div className="flex gap-2">
            {(
              [
                ["solar", "양력"],
                ["lunar", "음력"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setCalendarType(key)}
                className={`choice-btn flex-1 !py-2.5 ${
                  calendarType === key ? "choice-btn-selected" : ""
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          {calendarType === "lunar" && (
            <p className="mt-1.5 text-xs text-muted">
              음력은 1900–2100 테이블 변환(윤달 미선택). 하루 차이가 날 수
              있습니다.
            </p>
          )}
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <label className="text-sm font-medium text-heading">
              출생 시각{" "}
              <span className="font-normal text-muted">(선택)</span>
            </label>
            <label className="flex items-center gap-1.5 text-xs text-body cursor-pointer">
              <input
                type="checkbox"
                checked={timeUnknown}
                onChange={(e) => setTimeUnknown(e.target.checked)}
              />
              모름
            </label>
          </div>
          <input
            type="time"
            value={birthTime}
            disabled={timeUnknown}
            onChange={(e) => {
              setBirthTime(e.target.value);
              setTimeUnknown(false);
            }}
            className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none disabled:opacity-50"
            style={selectStyle}
          />
        </div>

        <div>
          <span className="mb-1.5 block text-sm font-medium text-heading">
            성별 <span className="font-normal text-muted">(선택)</span>
          </span>
          <div className="flex gap-2">
            {(
              [
                ["male", "남"],
                ["female", "여"],
                ["unspecified", "미지정"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setGender(key)}
                className={`choice-btn flex-1 !py-2.5 ${
                  gender === key ? "choice-btn-selected" : ""
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="text-sm" style={{ color: "var(--rose)" }} role="alert">
            {error}
          </p>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            className="btn-secondary flex-1"
            onClick={computePreview}
            disabled={!canSubmit}
          >
            미리보기
          </button>
          <button
            type="button"
            className="btn-primary flex-1"
            onClick={saveAndContinue}
            disabled={!canSubmit}
          >
            {existing ? "저장하고 다음으로" : "저장하고 다음으로"}
          </button>
        </div>
      </div>

      {preview && (
        <div className="card-panel space-y-3 !p-5">
          <h2 className="text-base font-semibold text-heading flex items-center gap-2">
            <span className="text-accent" aria-hidden>
              ✧
            </span>
            사주 요약
          </h2>
          <p className="text-sm text-heading font-medium">{preview.summaryText}</p>
          <dl className="grid grid-cols-2 gap-2 text-sm text-body">
            <div>
              <dt className="text-xs text-muted">일간</dt>
              <dd>
                {preview.chart.dayMaster.stemHan}(
                {preview.chart.dayMaster.stemKo}) ·{" "}
                {preview.chart.dayMaster.yinYangLabel} ·{" "}
                {preview.chart.dayMaster.elementLabel}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted">오행 기운</dt>
              <dd>{preview.chart.dayMaster.elementTrait}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">년주</dt>
              <dd>{preview.chart.year.label}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">월주</dt>
              <dd>{preview.chart.month.label}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">일주</dt>
              <dd>{preview.chart.day.label}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">시주</dt>
              <dd>
                {preview.chart.hour?.label ?? "미상 (출생 시각 없음)"}
              </dd>
            </div>
            <div className="col-span-2">
              <dt className="text-xs text-muted">양력 기준일</dt>
              <dd>{preview.chart.solarDate}</dd>
            </div>
            {preview.chart.tenGods && (
              <div className="col-span-2">
                <dt className="text-xs text-muted">십신 · 천간 / 지지 정기</dt>
                <dd className="mt-1 space-y-0.5">
                  <p>년 {preview.chart.tenGods.year.stemKo} / {preview.chart.tenGods.year.branchKo}</p>
                  <p>월 {preview.chart.tenGods.month.stemKo} / {preview.chart.tenGods.month.branchKo}</p>
                  <p>일 {preview.chart.tenGods.day.stemKo} / {preview.chart.tenGods.day.branchKo}</p>
                  <p>
                    시{" "}
                    {preview.chart.tenGods.hour
                      ? `${preview.chart.tenGods.hour.stemKo} / ${preview.chart.tenGods.hour.branchKo}`
                      : "미상"}
                  </p>
                </dd>
              </div>
            )}
            {preview.chart.jijanggan && (
              <div className="col-span-2 border-t border-[var(--card-border)] pt-2 mt-1">
                <dt className="text-xs text-muted">지장간 · 여기 / 중기 / 본기</dt>
                <dd className="mt-1 space-y-0.5 text-xs sm:text-sm">
                  <p>
                    <span className="text-muted">년</span>{" "}
                    {preview.chart.jijanggan.year.compact}
                  </p>
                  <p>
                    <span className="text-muted">월</span>{" "}
                    {preview.chart.jijanggan.month.compact}
                  </p>
                  <p>
                    <span className="text-muted">일</span>{" "}
                    {preview.chart.jijanggan.day.compact}
                  </p>
                  <p>
                    <span className="text-muted">시</span>{" "}
                    {preview.chart.jijanggan.hour
                      ? preview.chart.jijanggan.hour.compact
                      : "미상"}
                  </p>
                </dd>
              </div>
            )}
            {preview.chart.daeun ? (
              <div className="col-span-2 border-t border-[var(--card-border)] pt-2 mt-1">
                <dt className="text-xs text-muted">
                  대운 · {preview.chart.daeun.directionLabel} · 시작 만
                  {preview.chart.daeun.startAge}세 (
                  {preview.chart.daeun.boundaryTermName} 기준)
                </dt>
                <dd className="mt-1.5">
                  <ul className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs sm:text-sm">
                    {preview.chart.daeun.pillars.map((p) => (
                      <li key={p.index} className="flex justify-between gap-1">
                        <span className="font-medium text-heading">
                          {p.stemHan}
                          {p.branchHan}
                        </span>
                        <span className="text-muted tabular-nums">
                          {p.ageFrom}–{p.ageTo}세
                        </span>
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            ) : (
              preview.chart.gender === "unspecified" && (
                <div className="col-span-2 border-t border-[var(--card-border)] pt-2 mt-1">
                  <p className="text-xs text-muted">
                    대운은 성별을 선택하면 양남음녀·음남양녀 규칙으로 표시됩니다.
                  </p>
                </div>
              )
            )}
          </dl>
        </div>
      )}

      <p className="text-center text-xs text-muted leading-relaxed px-2">
        {SAJU_DISCLAIMER}
      </p>
    </div>
  );
}
