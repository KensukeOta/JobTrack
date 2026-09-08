"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { AuthGuard } from "@/components/auth/auth-guard";
import { JobForm, type JobFormValues } from "@/components/jobs/job-form";
import { AppHeader } from "@/components/layout/app-header";
import { ApiError } from "@/lib/api/api-error";
import { getJob, updateJob } from "@/lib/api/jobs";
import type { Job, JobCreateRequest } from "@/types/job";

function toFormValues(job: Job): JobFormValues {
  return {
    companyName: job.company_name,
    jobTitle: job.job_title,
    status: job.status,
    jobUrl: job.job_url ?? "",
    location: job.location ?? "",
    employmentType: job.employment_type ?? "",
    salaryMin: job.salary_min === null ? "" : String(job.salary_min),
    salaryMax: job.salary_max === null ? "" : String(job.salary_max),
    nextAction: job.next_action ?? "",
    nextActionDate: job.next_action_date ?? "",
    memo: job.memo ?? "",
  };
}

export default function EditJobPage() {
  return (
    <AuthGuard>
      <EditJobContent />
    </AuthGuard>
  );
}

function EditJobContent() {
  const params = useParams<{
    jobId: string;
  }>();

  const router = useRouter();
  const jobId = params.jobId;

  const [job, setJob] = useState<Job | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const [errorType, setErrorType] = useState<"not-found" | "other" | null>(
    null,
  );

  const [apiError, setApiError] = useState<string | null>(null);

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

  async function handleSubmit(data: JobCreateRequest) {
    setApiError(null);

    try {
      await updateJob(jobId, data);

      router.push(`/jobs/${jobId}`);
      router.refresh();
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          setErrorType("not-found");
          return;
        }

        if (error.status === 403) {
          setApiError(
            "セキュリティ情報を確認できませんでした。再ログインしてお試しください。",
          );
          return;
        }

        if (error.status === 422) {
          setApiError("入力内容を確認してください。");
          return;
        }
      }

      setApiError("求人の更新に失敗しました。もう一度お試しください。");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
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
              この求人は存在しないか、 編集する権限がありません。
            </p>

            <Link
              href="/jobs"
              className="mt-6 inline-flex rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white"
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
              求人情報の取得に失敗しました。
            </p>
          </div>
        ) : job ? (
          <>
            <div className="mb-8">
              <Link
                href={`/jobs/${job.id}`}
                className="text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                ← 求人詳細へ戻る
              </Link>

              <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
                求人を編集
              </h1>

              <p className="mt-2 text-sm text-slate-600">
                {job.company_name} の求人情報を編集します。
              </p>
            </div>

            <JobForm
              initialValues={toFormValues(job)}
              submitLabel="変更を保存"
              submittingLabel="保存しています..."
              cancelHref={`/jobs/${job.id}`}
              apiError={apiError}
              onSubmit={handleSubmit}
            />
          </>
        ) : null}
      </main>
    </div>
  );
}
