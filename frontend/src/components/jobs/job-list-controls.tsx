"use client";

import { useState } from "react";

import { JOB_STATUS_LABELS } from "@/lib/jobs/labels";
import type { JobSort, JobStatus, SortOrder } from "@/types/job";

type JobListControlsProps = {
  q: string;
  status: JobStatus | "";
  sort: JobSort;
  order: SortOrder;
  onSearch: (q: string) => void;
  onStatusChange: (status: JobStatus | "") => void;
  onSortChange: (sort: JobSort) => void;
  onOrderChange: (order: SortOrder) => void;
  onClear: () => void;
};

export function JobListControls({
  q,
  status,
  sort,
  order,
  onSearch,
  onStatusChange,
  onSortChange,
  onOrderChange,
  onClear,
}: JobListControlsProps) {
  const [searchValue, setSearchValue] = useState(q);

  const hasConditions =
    Boolean(q) || Boolean(status) || sort !== "created_at" || order !== "desc";

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    onSearch(searchValue.trim());
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex-1">
            <label htmlFor="job-search" className="sr-only">
              企業名・職種を検索
            </label>

            <input
              id="job-search"
              type="search"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="企業名・職種を検索"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-500"
            />
          </div>

          <button
            type="submit"
            className="inline-flex justify-center cursor-pointer rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            検索
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label
              htmlFor="job-status"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              ステータス
            </label>

            <select
              id="job-status"
              value={status}
              onChange={(event) =>
                onStatusChange(event.target.value as JobStatus | "")
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-500"
            >
              <option value="">すべて</option>

              {Object.entries(JOB_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="job-sort"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              並び替え
            </label>

            <select
              id="job-sort"
              value={sort}
              onChange={(event) => onSortChange(event.target.value as JobSort)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-500"
            >
              <option value="created_at">作成日時</option>
              <option value="updated_at">更新日時</option>
              <option value="next_action_date">次のアクション日</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="job-order"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              並び順
            </label>

            <select
              id="job-order"
              value={order}
              onChange={(event) =>
                onOrderChange(event.target.value as SortOrder)
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-500"
            >
              <option value="desc">降順</option>
              <option value="asc">昇順</option>
            </select>
          </div>
        </div>

        {hasConditions && (
          <div>
            <button
              type="button"
              onClick={onClear}
              className="text-sm font-medium cursor-pointer text-slate-600 transition hover:text-slate-900"
            >
              検索条件をクリア
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
