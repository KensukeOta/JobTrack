import Link from "next/link";

import { JOB_STATUS_LABELS } from "@/lib/jobs/labels";
import type { UpcomingAction } from "@/types/dashboard";

type UpcomingActionsProps = {
  actions: UpcomingAction[];
};

function formatDate(value: string): string {
  const [year, month, day] = value.split("-");

  return `${year}/${month}/${day}`;
}

export function UpcomingActions({ actions }: UpcomingActionsProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            今後のアクション
          </h2>

          <p className="mt-1 text-sm text-slate-600">
            予定されている対応を日付順に表示します。
          </p>
        </div>

        <Link
          href="/jobs"
          className="shrink-0 text-sm font-medium text-slate-600 transition hover:text-slate-900"
        >
          求人一覧 →
        </Link>
      </div>

      {actions.length === 0 ? (
        <div className="mt-6 rounded-lg bg-slate-50 px-5 py-8 text-center">
          <p className="text-sm font-medium text-slate-700">
            予定されているアクションはありません
          </p>

          <p className="mt-1 text-sm text-slate-500">
            求人詳細から次のアクションを設定できます。
          </p>
        </div>
      ) : (
        <div className="mt-6 divide-y divide-slate-100">
          {actions.map((action) => (
            <Link
              key={action.job_id}
              href={`/jobs/${action.job_id}`}
              className="block py-4 transition first:pt-0 last:pb-0 hover:bg-slate-50 sm:px-3 sm:hover:rounded-lg"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-slate-900">
                      {action.company_name}
                    </p>

                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                      {JOB_STATUS_LABELS[action.status]}
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-slate-600">
                    {action.job_title}
                  </p>

                  <p className="mt-2 text-sm font-medium text-slate-800">
                    {action.next_action ?? "アクション内容未設定"}
                  </p>
                </div>

                <time
                  dateTime={action.next_action_date}
                  className="shrink-0 text-sm font-medium text-slate-600"
                >
                  {formatDate(action.next_action_date)}
                </time>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
