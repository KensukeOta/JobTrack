import Link from "next/link";

export function JobsEmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
      <h2 className="text-lg font-semibold text-slate-900">
        まだ求人が登録されていません
      </h2>

      <p className="mt-2 text-sm text-slate-600">
        応募を検討している求人を登録すると、 ここで進捗を管理できます。
      </p>

      <Link
        href="/jobs/new"
        className="mt-6 inline-flex rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700"
      >
        求人を登録
      </Link>
    </div>
  );
}
