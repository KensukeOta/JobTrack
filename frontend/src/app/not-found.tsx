import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-lg text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
          404
        </p>

        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          ページが見つかりません
        </h1>

        <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
          お探しのページは削除されたか、 URLが変更されている可能性があります。
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-slate-900 px-5 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            トップページへ戻る
          </Link>

          <Link
            href="/dashboard"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            ダッシュボードへ
          </Link>
        </div>
      </div>
    </main>
  );
}
