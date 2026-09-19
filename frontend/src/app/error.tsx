"use client";

import Link from "next/link";
import { useEffect } from "react";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-lg text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-red-600">
          Error
        </p>

        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          エラーが発生しました
        </h1>

        <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
          ページの表示中に問題が発生しました。
          一時的な問題の可能性がありますので、もう一度お試しください。
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-11 items-center justify-center rounded-lg bg-slate-900 px-5 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            もう一度試す
          </button>

          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            トップページへ戻る
          </Link>
        </div>
      </div>
    </main>
  );
}
