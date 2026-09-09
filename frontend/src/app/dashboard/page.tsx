"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { AuthGuard } from "@/components/auth/auth-guard";
import { SummaryCard } from "@/components/dashboard/summary-card";
import { StatusSummary } from "@/components/dashboard/status-summary";
import { UpcomingActions } from "@/components/dashboard/upcoming-actions";
import { AppHeader } from "@/components/layout/app-header";
import { getDashboardSummary } from "@/lib/api/dashboard";
import type { DashboardSummary } from "@/types/dashboard";

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}

function DashboardContent() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function loadDashboard() {
      setIsLoading(true);
      setError(null);

      try {
        const data = await getDashboardSummary();

        if (!isCancelled) {
          setSummary(data);
        }
      } catch {
        if (!isCancelled) {
          setError("ダッシュボードの取得に失敗しました。");
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadDashboard();

    return () => {
      isCancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              ダッシュボード
            </h1>

            <p className="mt-1 text-sm text-slate-600">
              求人応募の状況と今後の予定を確認できます。
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              href="/jobs"
              className="inline-flex justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              求人一覧
            </Link>

            <Link
              href="/jobs/new"
              className="inline-flex justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700"
            >
              求人を追加
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div className="mt-6 rounded-xl border border-slate-200 bg-white px-6 py-12 text-center">
            <p className="text-sm text-slate-600">
              ダッシュボードを読み込んでいます...
            </p>
          </div>
        ) : error ? (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-red-200 bg-red-50 px-6 py-5"
          >
            <p className="text-sm text-red-700">{error}</p>
          </div>
        ) : summary ? (
          summary.total_jobs === 0 ? (
            <div className="mt-6 rounded-xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">
                求人がまだありません
              </h2>

              <p className="mt-2 text-sm text-slate-600">
                最初の求人を登録して、応募状況の管理を始めましょう。
              </p>

              <Link
                href="/jobs/new"
                className="mt-6 inline-flex rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700"
              >
                求人を追加
              </Link>
            </div>
          ) : (
            <>
              <section
                aria-label="求人応募サマリー"
                className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
              >
                <SummaryCard
                  label="全求人"
                  value={summary.total_jobs}
                  description="登録している求人"
                />

                <SummaryCard
                  label="アクティブ"
                  value={summary.active_jobs}
                  description="進行中の求人"
                />

                <SummaryCard
                  label="面接"
                  value={summary.status_counts.interview}
                  description="面接ステータス"
                />

                <SummaryCard
                  label="内定"
                  value={summary.status_counts.offer}
                  description="内定ステータス"
                />
              </section>

              <div className="mt-6 space-y-6">
                <StatusSummary statusCounts={summary.status_counts} />

                <UpcomingActions actions={summary.upcoming_actions} />
              </div>
            </>
          )
        ) : null}
      </main>
    </div>
  );
}
