"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { AuthGuard } from "@/components/auth/auth-guard";
import { JobCard } from "@/components/jobs/job-card";
import { JobListControls } from "@/components/jobs/job-list-controls";
import { JobPagination } from "@/components/jobs/job-pagination";
import { AppHeader } from "@/components/layout/app-header";
import { getJobs } from "@/lib/api/jobs";
import type {
  JobListResponse,
  JobSort,
  JobStatus,
  SortOrder,
} from "@/types/job";

const PAGE_SIZE = 20;

const JOB_STATUSES: JobStatus[] = [
  "interested",
  "planned",
  "applied",
  "screening",
  "interview",
  "offer",
  "rejected",
  "withdrawn",
];

const JOB_SORTS: JobSort[] = ["created_at", "updated_at", "next_action_date"];

const SORT_ORDERS: SortOrder[] = ["asc", "desc"];

function isJobStatus(value: string | null): value is JobStatus {
  return value !== null && JOB_STATUSES.includes(value as JobStatus);
}

function isJobSort(value: string | null): value is JobSort {
  return value !== null && JOB_SORTS.includes(value as JobSort);
}

function isSortOrder(value: string | null): value is SortOrder {
  return value !== null && SORT_ORDERS.includes(value as SortOrder);
}

function parsePage(value: string | null): number {
  const page = Number(value);

  if (!Number.isInteger(page) || page < 1) {
    return 1;
  }

  return page;
}

export default function JobsPage() {
  return (
    <AuthGuard>
      <JobsContent />
    </AuthGuard>
  );
}

function JobsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const q = searchParams.get("q")?.trim() ?? "";

  const statusParam = searchParams.get("status");

  const status = isJobStatus(statusParam) ? statusParam : "";

  const sortParam = searchParams.get("sort");

  const sort: JobSort = isJobSort(sortParam) ? sortParam : "created_at";

  const orderParam = searchParams.get("order");

  const order: SortOrder = isSortOrder(orderParam) ? orderParam : "desc";

  const page = parsePage(searchParams.get("page"));

  const [data, setData] = useState<JobListResponse | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const updateQuery = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      const query = params.toString();

      router.push(query ? `/jobs?${query}` : "/jobs");
    },
    [router, searchParams],
  );

  useEffect(() => {
    let isCancelled = false;

    async function loadJobs() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getJobs({
          q: q || undefined,
          status: status || undefined,
          sort,
          order,
          page,
          page_size: PAGE_SIZE,
        });

        if (!isCancelled) {
          setData(response);
        }
      } catch {
        if (!isCancelled) {
          setError("求人一覧の取得に失敗しました。");
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadJobs();

    return () => {
      isCancelled = true;
    };
  }, [q, status, sort, order, page]);

  function handleSearch(value: string) {
    updateQuery({
      q: value || null,
      page: null,
    });
  }

  function handleStatusChange(value: JobStatus | "") {
    updateQuery({
      status: value || null,
      page: null,
    });
  }

  function handleSortChange(value: JobSort) {
    updateQuery({
      sort: value === "created_at" ? null : value,
      page: null,
    });
  }

  function handleOrderChange(value: SortOrder) {
    updateQuery({
      order: value === "desc" ? null : value,
      page: null,
    });
  }

  function handlePageChange(nextPage: number) {
    updateQuery({
      page: nextPage <= 1 ? null : String(nextPage),
    });
  }

  function handleClear() {
    router.push("/jobs");
  }

  const hasFilters =
    Boolean(q) || Boolean(status) || sort !== "created_at" || order !== "desc";

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              求人応募
            </h1>

            <p className="mt-1 text-sm text-slate-600">
              応募中の求人や選考状況を管理します。
            </p>
          </div>

          <Link
            href="/jobs/new"
            className="inline-flex justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            求人を追加
          </Link>
        </div>

        <div className="mt-6">
          <JobListControls
            key={q}
            q={q}
            status={status}
            sort={sort}
            order={order}
            onSearch={handleSearch}
            onStatusChange={handleStatusChange}
            onSortChange={handleSortChange}
            onOrderChange={handleOrderChange}
            onClear={handleClear}
          />
        </div>

        {isLoading ? (
          <div className="mt-6 rounded-xl border border-slate-200 bg-white px-6 py-12 text-center">
            <p className="text-sm text-slate-600">
              求人一覧を読み込んでいます...
            </p>
          </div>
        ) : error ? (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-red-200 bg-red-50 px-6 py-5"
          >
            <p className="text-sm text-red-700">{error}</p>
          </div>
        ) : data ? (
          <>
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-slate-600">{data.total}件</p>
            </div>

            {data.items.length === 0 ? (
              <div className="mt-4 rounded-xl border border-slate-200 bg-white px-6 py-12 text-center">
                {hasFilters ? (
                  <>
                    <h2 className="text-lg font-semibold text-slate-900">
                      条件に一致する求人がありません
                    </h2>

                    <p className="mt-2 text-sm text-slate-600">
                      検索条件を変更するか、条件をクリアしてください。
                    </p>

                    <button
                      type="button"
                      onClick={handleClear}
                      className="mt-6 inline-flex cursor-pointer rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      検索条件をクリア
                    </button>
                  </>
                ) : (
                  <>
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
                  </>
                )}
              </div>
            ) : (
              <>
                <div className="mt-4 grid gap-4">
                  {data.items.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>

                <div className="mt-6 rounded-xl border border-slate-200 bg-white px-5 py-4">
                  <JobPagination
                    page={data.page}
                    pageSize={data.page_size}
                    total={data.total}
                    onPageChange={handlePageChange}
                  />
                </div>
              </>
            )}
          </>
        ) : null}
      </main>
    </div>
  );
}
