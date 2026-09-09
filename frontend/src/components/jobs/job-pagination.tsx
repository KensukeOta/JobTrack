"use client";

type JobPaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
};

export function JobPagination({
  page,
  pageSize,
  total,
  onPageChange,
}: JobPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const isFirstPage = page <= 1;

  const isLastPage = page >= totalPages;

  return (
    <nav
      aria-label="求人一覧のページネーション"
      className="flex flex-col items-center justify-between gap-3 sm:flex-row"
    >
      <p className="text-sm text-slate-600">
        {page} / {totalPages} ページ
      </p>

      <div className="flex gap-2">
        <button
          type="button"
          disabled={isFirstPage}
          onClick={() => onPageChange(page - 1)}
          className="rounded-lg border cursor-pointer border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          前へ
        </button>

        <button
          type="button"
          disabled={isLastPage}
          onClick={() => onPageChange(page + 1)}
          className="rounded-lg border cursor-pointer border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          次へ
        </button>
      </div>
    </nav>
  );
}
