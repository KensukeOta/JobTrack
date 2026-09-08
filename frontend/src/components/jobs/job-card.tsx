import { EMPLOYMENT_TYPE_LABELS, JOB_STATUS_LABELS } from "@/lib/jobs/labels";
import type { Job } from "@/types/job";

type JobCardProps = {
  job: Job;
};

function formatDate(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const [year, month, day] = value.split("-");

  return `${year}/${month}/${day}`;
}

export function JobCard({ job }: JobCardProps) {
  const nextActionDate = formatDate(job.next_action_date);

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {job.company_name}
          </p>

          <h2 className="mt-1 text-lg font-semibold text-slate-900">
            {job.job_title}
          </h2>
        </div>

        <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
          {JOB_STATUS_LABELS[job.status]}
        </span>
      </div>

      <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-slate-500">勤務地</dt>

          <dd className="mt-1 text-slate-900">{job.location ?? "未設定"}</dd>
        </div>

        <div>
          <dt className="text-slate-500">雇用形態</dt>

          <dd className="mt-1 text-slate-900">
            {job.employment_type
              ? EMPLOYMENT_TYPE_LABELS[job.employment_type]
              : "未設定"}
          </dd>
        </div>

        <div>
          <dt className="text-slate-500">次のアクション</dt>

          <dd className="mt-1 text-slate-900">{job.next_action ?? "未設定"}</dd>
        </div>

        <div>
          <dt className="text-slate-500">次のアクション日</dt>

          <dd className="mt-1 text-slate-900">{nextActionDate ?? "未設定"}</dd>
        </div>
      </dl>
    </article>
  );
}
