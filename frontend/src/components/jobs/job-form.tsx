"use client";

import Link from "next/link";
import { useState } from "react";
import type { FormEvent } from "react";

import { EMPLOYMENT_TYPE_LABELS, JOB_STATUS_LABELS } from "@/lib/jobs/labels";
import type { EmploymentType, JobCreateRequest, JobStatus } from "@/types/job";

export type JobFormValues = {
  companyName: string;
  jobTitle: string;
  status: JobStatus;
  jobUrl: string;
  location: string;
  employmentType: EmploymentType | "";
  salaryMin: string;
  salaryMax: string;
  nextAction: string;
  nextActionDate: string;
  memo: string;
};

type FieldErrors = {
  companyName?: string;
  jobTitle?: string;
  jobUrl?: string;
  location?: string;
  salaryMin?: string;
  salaryMax?: string;
  nextAction?: string;
  memo?: string;
};

type JobFormProps = {
  initialValues: JobFormValues;
  submitLabel: string;
  submittingLabel: string;
  cancelHref: string;
  apiError: string | null;
  onSubmit: (data: JobCreateRequest) => Promise<void>;
};

export function JobForm({
  initialValues,
  submitLabel,
  submittingLabel,
  cancelHref,
  apiError,
  onSubmit,
}: JobFormProps) {
  const [companyName, setCompanyName] = useState(initialValues.companyName);
  const [jobTitle, setJobTitle] = useState(initialValues.jobTitle);
  const [status, setStatus] = useState<JobStatus>(initialValues.status);
  const [jobUrl, setJobUrl] = useState(initialValues.jobUrl);
  const [location, setLocation] = useState(initialValues.location);
  const [employmentType, setEmploymentType] = useState<EmploymentType | "">(
    initialValues.employmentType,
  );
  const [salaryMin, setSalaryMin] = useState(initialValues.salaryMin);
  const [salaryMax, setSalaryMax] = useState(initialValues.salaryMax);
  const [nextAction, setNextAction] = useState(initialValues.nextAction);
  const [nextActionDate, setNextActionDate] = useState(
    initialValues.nextActionDate,
  );
  const [memo, setMemo] = useState(initialValues.memo);

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate(): boolean {
    const errors: FieldErrors = {};

    const trimmedCompanyName = companyName.trim();
    const trimmedJobTitle = jobTitle.trim();
    const trimmedJobUrl = jobUrl.trim();
    const trimmedLocation = location.trim();
    const trimmedNextAction = nextAction.trim();
    const trimmedMemo = memo.trim();

    if (!trimmedCompanyName) {
      errors.companyName = "企業名を入力してください。";
    } else if (trimmedCompanyName.length > 200) {
      errors.companyName = "企業名は200文字以内で入力してください。";
    }

    if (!trimmedJobTitle) {
      errors.jobTitle = "職種を入力してください。";
    } else if (trimmedJobTitle.length > 200) {
      errors.jobTitle = "職種は200文字以内で入力してください。";
    }

    if (trimmedJobUrl.length > 2048) {
      errors.jobUrl = "求人URLは2048文字以内で入力してください。";
    }

    if (trimmedLocation.length > 200) {
      errors.location = "勤務地は200文字以内で入力してください。";
    }

    if (trimmedNextAction.length > 300) {
      errors.nextAction = "次のアクションは300文字以内で入力してください。";
    }

    if (trimmedMemo.length > 5000) {
      errors.memo = "メモは5000文字以内で入力してください。";
    }

    const parsedSalaryMin = salaryMin === "" ? null : Number(salaryMin);

    const parsedSalaryMax = salaryMax === "" ? null : Number(salaryMax);

    if (
      parsedSalaryMin !== null &&
      (!Number.isInteger(parsedSalaryMin) || parsedSalaryMin < 0)
    ) {
      errors.salaryMin = "最低給与は0以上の整数で入力してください。";
    }

    if (
      parsedSalaryMax !== null &&
      (!Number.isInteger(parsedSalaryMax) || parsedSalaryMax < 0)
    ) {
      errors.salaryMax = "最高給与は0以上の整数で入力してください。";
    }

    if (
      parsedSalaryMin !== null &&
      parsedSalaryMax !== null &&
      parsedSalaryMax < parsedSalaryMin
    ) {
      errors.salaryMax = "最高給与は最低給与以上で入力してください。";
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    const data: JobCreateRequest = {
      company_name: companyName.trim(),
      job_title: jobTitle.trim(),
      status,
      job_url: jobUrl.trim() || null,
      location: location.trim() || null,
      employment_type: employmentType || null,
      salary_min: salaryMin === "" ? null : Number(salaryMin),
      salary_max: salaryMax === "" ? null : Number(salaryMax),
      next_action: nextAction.trim() || null,
      next_action_date: nextActionDate || null,
      memo: memo.trim() || null,
    };

    setIsSubmitting(true);

    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
    >
      {apiError && (
        <div
          role="alert"
          className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {apiError}
        </div>
      )}

      <section>
        <h2 className="text-lg font-semibold text-slate-900">基本情報</h2>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="company-name"
              className="block text-sm font-medium text-slate-700"
            >
              企業名
              <span className="ml-1 text-red-600">*</span>
            </label>

            <input
              id="company-name"
              type="text"
              value={companyName}
              onChange={(event) => setCompanyName(event.target.value)}
              autoComplete="organization"
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-500"
            />

            {fieldErrors.companyName && (
              <p className="mt-1 text-sm text-red-600">
                {fieldErrors.companyName}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="job-title"
              className="block text-sm font-medium text-slate-700"
            >
              職種
              <span className="ml-1 text-red-600">*</span>
            </label>

            <input
              id="job-title"
              type="text"
              value={jobTitle}
              onChange={(event) => setJobTitle(event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-500"
            />

            {fieldErrors.jobTitle && (
              <p className="mt-1 text-sm text-red-600">
                {fieldErrors.jobTitle}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-slate-700"
            >
              ステータス
            </label>

            <select
              id="status"
              value={status}
              onChange={(event) => setStatus(event.target.value as JobStatus)}
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-slate-500"
            >
              {Object.entries(JOB_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="employment-type"
              className="block text-sm font-medium text-slate-700"
            >
              雇用形態
            </label>

            <select
              id="employment-type"
              value={employmentType}
              onChange={(event) =>
                setEmploymentType(event.target.value as EmploymentType | "")
              }
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-slate-500"
            >
              <option value="">未設定</option>

              {Object.entries(EMPLOYMENT_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="location"
              className="block text-sm font-medium text-slate-700"
            >
              勤務地
            </label>

            <input
              id="location"
              type="text"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="例：大阪府大阪市"
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-500"
            />

            {fieldErrors.location && (
              <p className="mt-1 text-sm text-red-600">
                {fieldErrors.location}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="job-url"
              className="block text-sm font-medium text-slate-700"
            >
              求人URL
            </label>

            <input
              id="job-url"
              type="url"
              value={jobUrl}
              onChange={(event) => setJobUrl(event.target.value)}
              placeholder="https://example.com/jobs/..."
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-500"
            />

            {fieldErrors.jobUrl && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.jobUrl}</p>
            )}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 pt-8">
        <h2 className="text-lg font-semibold text-slate-900">給与</h2>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="salary-min"
              className="block text-sm font-medium text-slate-700"
            >
              最低給与
            </label>

            <input
              id="salary-min"
              type="number"
              min="0"
              step="1"
              value={salaryMin}
              onChange={(event) => setSalaryMin(event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-500"
            />

            {fieldErrors.salaryMin && (
              <p className="mt-1 text-sm text-red-600">
                {fieldErrors.salaryMin}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="salary-max"
              className="block text-sm font-medium text-slate-700"
            >
              最高給与
            </label>

            <input
              id="salary-max"
              type="number"
              min="0"
              step="1"
              value={salaryMax}
              onChange={(event) => setSalaryMax(event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-500"
            />

            {fieldErrors.salaryMax && (
              <p className="mt-1 text-sm text-red-600">
                {fieldErrors.salaryMax}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 pt-8">
        <h2 className="text-lg font-semibold text-slate-900">次のアクション</h2>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="next-action"
              className="block text-sm font-medium text-slate-700"
            >
              内容
            </label>

            <input
              id="next-action"
              type="text"
              value={nextAction}
              onChange={(event) => setNextAction(event.target.value)}
              placeholder="例：一次面接"
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-500"
            />

            {fieldErrors.nextAction && (
              <p className="mt-1 text-sm text-red-600">
                {fieldErrors.nextAction}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="next-action-date"
              className="block text-sm font-medium text-slate-700"
            >
              日付
            </label>

            <input
              id="next-action-date"
              type="date"
              value={nextActionDate}
              onChange={(event) => setNextActionDate(event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-500"
            />
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 pt-8">
        <label
          htmlFor="memo"
          className="block text-lg font-semibold text-slate-900"
        >
          メモ
        </label>

        <textarea
          id="memo"
          rows={6}
          value={memo}
          onChange={(event) => setMemo(event.target.value)}
          className="mt-3 w-full resize-y rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-500"
        />

        <div className="mt-1 flex justify-between">
          {fieldErrors.memo ? (
            <p className="text-sm text-red-600">{fieldErrors.memo}</p>
          ) : (
            <span />
          )}

          <p className="text-xs text-slate-500">{memo.length}/5000</p>
        </div>
      </section>

      <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
        <Link
          href={cancelHref}
          className="inline-flex justify-center rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          キャンセル
        </Link>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex cursor-pointer justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? submittingLabel : submitLabel}
        </button>
      </div>
    </form>
  );
}
