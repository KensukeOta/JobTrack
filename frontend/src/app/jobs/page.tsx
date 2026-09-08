"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { AuthGuard } from "@/components/auth/auth-guard";
import { JobList } from "@/components/jobs/job-list";
import { JobsEmptyState } from "@/components/jobs/jobs-empty-state";
import { AppHeader } from "@/components/layout/app-header";
import { getJobs } from "@/lib/api/jobs";
import type { Job } from "@/types/job";

export default function JobsPage() {
  return (
    <AuthGuard>
      <JobsContent />
    </AuthGuard>
  );
}

function JobsContent() {
  const [jobs, setJobs] = useState<Job[]>([]);

  const [total, setTotal] = useState(0);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadJobs() {
      try {
        const data = await getJobs();

        setJobs(data.items);
        setTotal(data.total);
      } catch {
        setError("求人一覧の取得に失敗しました。もう一度お試しください。");
      } finally {
        setIsLoading(false);
      }
    }

    void loadJobs();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              求人一覧
            </h1>

            {!isLoading && !error && (
              <p className="mt-1 text-sm text-slate-600">{total}件の求人</p>
            )}
          </div>

          <Link
            href="/jobs/new"
            className="inline-flex w-fit rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            求人を登録
          </Link>
        </div>

        {isLoading ? (
          <div className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center">
            <p className="text-sm text-slate-600">
              求人一覧を読み込んでいます...
            </p>
          </div>
        ) : error ? (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-6 py-5 text-sm text-red-700"
          >
            {error}
          </div>
        ) : jobs.length === 0 ? (
          <JobsEmptyState />
        ) : (
          <JobList jobs={jobs} />
        )}
      </main>
    </div>
  );
}
