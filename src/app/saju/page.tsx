"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import AuthGate from "@/components/AuthGate";
import { buildSajuProfile } from "@/lib/saju";
import type { CalendarType, Gender, SajuProfile } from "@/lib/saju";
import { SAJU_DISCLAIMER } from "@/lib/saju";
import { getOnboarding, getSajuProfile, saveSajuProfile } from "@/lib/storage";

export default function SajuPage() {
  return (
    <AuthGate>
      <SajuForm />
    </AuthGate>
  );
}

function SajuForm() {
  const router = useRouter();
  const { userId } = useAuth();
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [timeUnknown, setTimeUnknown] = useState(true);
  const [gender, setGender] = useState<Gender>("unspecified");
  const [calendarType, setCalendarType] = useState<CalendarType>("solar");
  const [error, setError] = useState<string | null>(null);
  const [existing, setExisting] = useState<SajuProfile | null>(null);
  const [preview, setPreview] = useState<SajuProfile | null>(null);

  useEffect(() => {
    const profile = getSajuProfile(userId);
    if (profile) {
      setExisting(profile);
      setBirthDate(profile.input.birthDate);
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
      if (getOnboarding(userId)) {
        router.push("/draw");
      } else {
        router.push("/onboarding");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "사주 저장에 실패했습니다.");
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 animate-fade-up">
      <div className="text-center">
        <p className="text-[11px] tracking-[0.22em] text-accent font-medium">
          SAJU · 만세력
        </p>
        <h1 className="mt-2 text-xl font-bold text-heading sm:text-2xl leading-snug px-1">
          사주 프로필
        </h1>
        <p className="mt-2 text-sm text-body px-2 leading-relaxed">
          출생 정보를 입력하면 일간·간지를 계산해 타로 해석에 함께 씁니다.
        </p>
      </div>

      <div className="card-panel space-y-4 !p-4 sm:!p-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-heading">
            생년월일 <span className="text-accent">*</span>
          </label>
          <input
            type="date"
            value={birthDate}
            min="1900-01-01"
            max="2100-12-31"
            onChange={(e) => setBirthDate(e.target.value)}
            className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
            style={{
              background: "var(--input-bg)",
              borderColor: "var(--input-border)",
              color: "var(--foreground)",
            }}
            required
          />
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
            style={{
              background: "var(--input-bg)",
              borderColor: "var(--input-border)",
              color: "var(--foreground)",
            }}
          />
        </div>

        <div>
          <span className="mb-1.5 block text-sm font-medium text-heading">
            성별 <span className="font-normal text-muted">(선택)</span>
          </span>
          <div className="flex gap-2">
            {(
              [
                ["unspecified", "미지정"],
                ["female", "여"],
                ["male", "남"],
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
            {existing ? "저장 후 계속" : "저장하고 계속"}
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
          </dl>
        </div>
      )}

      <p className="text-center text-xs text-muted leading-relaxed px-2">
        {SAJU_DISCLAIMER}
      </p>
    </div>
  );
}
