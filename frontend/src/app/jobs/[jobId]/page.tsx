"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { AuthGuard } from "@/components/auth/auth-guard";
import { AppHeader } from "@/components/layout/app-header";
import { ApiError } from "@/lib/api/api-error";
import { getJob } from "@/lib/api/jobs";
import { EMPLOYMENT_TYPE_LABELS, JOB_STATUS_LABELS } from "@/lib/jobs/labels";
import type { Job } from "@/types/job";

function formatDate(value: string | null): string {
  if (!value) {
    return "未設定";
  }

  const [year, month, day] = value.split("-");

  return `${year}/${month}/${day}`;
}

function formatDateTime(value: string): string {
  const date = new Date(value);

  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatSalary(
  salaryMin: number | null,
  salaryMax: number | null,
): string {
  if (salaryMin === null && salaryMax === null) {
    return "未設定";
  }

  const formatter = new Intl.NumberFormat("ja-JP");

  if (salaryMin !== null && salaryMax !== null) {
    return `${formatter.format(salaryMin)}円 〜 ${formatter.format(
      salaryMax,
    )}円`;
  }

  if (salaryMin !== null) {
    return `${formatter.format(salaryMin)}円以上`;
  }

  return `${formatter.format(salaryMax as number)}円以下`;
}

export default function JobDetailPage() {
  return (
    <AuthGuard>
      <JobDetailContent />
    </AuthGuard>
  );
}

function JobDetailContent() {
  const params = useParams<{
    jobId: string;
  }>();

  const jobId = params.jobId;

  const [job, setJob] = useState<Job | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const [errorType, setErrorType] = useState<"not-found" | "other" | null>(
    null,
  );

  useEffect(() => {
    async function loadJob() {
      try {
        const data = await getJob(jobId);

        setJob(data);
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          setErrorType("not-found");
        } else {
          setErrorType("other");
        }
      } finally {
        setIsLoading(false);
      }
    }

    void loadJob();
  }, [jobId]);

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        {isLoading ? (
          <div className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center">
            <p className="text-sm text-slate-600">
              求人情報を読み込んでいます...
            </p>
          </div>
        ) : errorType === "not-found" ? (
          <div className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center">
            <h1 className="text-xl font-semibold text-slate-900">
              求人が見つかりません
            </h1>

            <p className="mt-2 text-sm text-slate-600">
              この求人は存在しないか、 表示する権限がありません。
            </p>

            <Link
              href="/jobs"
              className="mt-6 inline-flex rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700"
            >
              求人一覧へ戻る
            </Link>
          </div>
        ) : errorType === "other" ? (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-6 py-5"
          >
            <p className="text-sm text-red-700">
              求人情報の取得に失敗しました。 もう一度お試しください。
            </p>

            <Link
              href="/jobs"
              className="mt-4 inline-flex text-sm font-medium text-red-700 underline"
            >
              求人一覧へ戻る
            </Link>
          </div>
        ) : job ? (
          <>
            <div className="mb-6">
              <Link
                href="/jobs"
                className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
              >
                ← 求人一覧へ戻る
              </Link>
            </div>

            <article className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 p-6 sm:p-8">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      {job.company_name}
                    </p>

                    <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                      {job.job_title}
                    </h1>

                    <span className="mt-4 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                      {JOB_STATUS_LABELS[job.status]}
                    </span>
                  </div>

                  <div className="flex gap-3">
                    <Link
                      href={`/jobs/${job.id}/edit`}
                      className="inline-flex rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      編集
                    </Link>

                    <button
                      type="button"
                      disabled
                      title="削除機能は次のフェーズで実装します"
                      className="inline-flex cursor-not-allowed rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-400 opacity-60"
                    >
                      削除
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-8 p-6 sm:p-8">
                <section>
                  <h2 className="text-lg font-semibold text-slate-900">
                    求人情報
                  </h2>

                  <dl className="mt-5 grid gap-6 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm text-slate-500">勤務地</dt>

                      <dd className="mt-1 text-sm text-slate-900">
                        {job.location ?? "未設定"}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-sm text-slate-500">雇用形態</dt>

                      <dd className="mt-1 text-sm text-slate-900">
                        {job.employment_type
                          ? EMPLOYMENT_TYPE_LABELS[job.employment_type]
                          : "未設定"}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-sm text-slate-500">給与</dt>

                      <dd className="mt-1 text-sm text-slate-900">
                        {formatSalary(job.salary_min, job.salary_max)}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-sm text-slate-500">求人URL</dt>

                      <dd className="mt-1 text-sm">
                        {job.job_url ? (
                          <a
                            href={job.job_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="break-all text-slate-900 underline underline-offset-2"
                          >
                            {job.job_url}
                          </a>
                        ) : (
                          <span className="text-slate-900">未設定</span>
                        )}
                      </dd>
                    </div>
                  </dl>
                </section>

                <section className="border-t border-slate-200 pt-8">
                  <h2 className="text-lg font-semibold text-slate-900">
                    次のアクション
                  </h2>

                  <dl className="mt-5 grid gap-6 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm text-slate-500">内容</dt>

                      <dd className="mt-1 text-sm text-slate-900">
                        {job.next_action ?? "未設定"}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-sm text-slate-500">日付</dt>

                      <dd className="mt-1 text-sm text-slate-900">
                        {formatDate(job.next_action_date)}
                      </dd>
                    </div>
                  </dl>
                </section>

                <section className="border-t border-slate-200 pt-8">
                  <h2 className="text-lg font-semibold text-slate-900">メモ</h2>

                  <div className="mt-4 whitespace-pre-wrap wrap-break-word rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                    {job.memo ?? "メモはありません。"}
                  </div>
                </section>

                <section className="border-t border-slate-200 pt-8">
                  <h2 className="text-lg font-semibold text-slate-900">
                    管理情報
                  </h2>

                  <dl className="mt-5 grid gap-6 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="text-slate-500">登録日時</dt>

                      <dd className="mt-1 text-slate-900">
                        {formatDateTime(job.created_at)}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-slate-500">更新日時</dt>

                      <dd className="mt-1 text-slate-900">
                        {formatDateTime(job.updated_at)}
                      </dd>
                    </div>
                  </dl>
                </section>
              </div>
            </article>
          </>
        ) : null}
      </main>
    </div>
  );
}
