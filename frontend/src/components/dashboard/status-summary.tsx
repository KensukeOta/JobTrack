import { JOB_STATUS_LABELS } from "@/lib/jobs/labels";
import type { JobStatus } from "@/types/job";

type StatusSummaryProps = {
  statusCounts: Record<JobStatus, number>;
};

const STATUS_ORDER: JobStatus[] = [
  "interested",
  "planned",
  "applied",
  "screening",
  "interview",
  "offer",
  "rejected",
  "withdrawn",
];

export function StatusSummary({ statusCounts }: StatusSummaryProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">応募ステータス</h2>

        <p className="mt-1 text-sm text-slate-600">
          現在登録している求人の状況です。
        </p>
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {STATUS_ORDER.map((status) => (
          <div key={status} className="rounded-lg bg-slate-50 px-4 py-4">
            <dt className="text-sm text-slate-600">
              {JOB_STATUS_LABELS[status]}
            </dt>

            <dd className="mt-1 text-xl font-semibold text-slate-900">
              {statusCounts[status]}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
