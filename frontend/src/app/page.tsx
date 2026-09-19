import Link from "next/link";

const features = [
  {
    title: "求人を一元管理",
    description:
      "企業名、職種、選考状況、次のアクションなど、応募に必要な情報をまとめて管理できます。",
  },
  {
    title: "選考状況を見える化",
    description:
      "応募前から面接・内定まで、現在のステータスを一覧で確認できます。",
  },
  {
    title: "次の行動を整理",
    description:
      "次回の面接や連絡予定などを登録し、今後やるべきことを把握しやすくします。",
  },
];

export default function Home() {
  return (
    <main className="flex flex-1 flex-col bg-white text-zinc-900">
      <section className="border-b border-zinc-200 bg-gradient-to-b from-blue-50 to-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-6 py-24 text-center sm:py-32">
          <div className="mb-6 rounded-full border border-blue-200 bg-white px-4 py-2 text-sm font-medium text-blue-700 shadow-sm">
            Job Application Management
          </div>

          <h1 className="max-w-4xl text-4xl font-bold tracking-tight sm:text-6xl">
            就職活動を、
            <span className="text-blue-600">もっとシンプルに。</span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-600 sm:text-xl">
            JobTrackは、求人への応募状況や選考進捗、
            次に行うアクションを一元管理できるWebアプリケーションです。
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex h-12 items-center justify-center rounded-lg bg-blue-600 px-6 font-semibold text-white transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              無料で始める
            </Link>

            <Link
              href="/login"
              className="inline-flex h-12 items-center justify-center rounded-lg border border-zinc-300 bg-white px-6 font-semibold text-zinc-900 transition hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              ログイン
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-20">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
            Features
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight">
            応募管理に必要な情報をひとつに
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-zinc-600">
            求人情報・選考状況・予定をまとめて管理し、
            就職活動全体の進捗を把握しやすくします。
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
            >
              <h3 className="text-lg font-semibold">{feature.title}</h3>
              <p className="mt-3 leading-7 text-zinc-600">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-zinc-950">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-6 py-20 text-center text-white">
          <h2 className="text-3xl font-bold tracking-tight">
            応募状況を整理して、次の行動を明確に
          </h2>

          <p className="mt-4 max-w-2xl leading-7 text-zinc-300">
            求人を登録して、選考ステータスや予定を管理。
            JobTrackで就職活動をひとつの場所にまとめましょう。
          </p>

          <Link
            href="/register"
            className="mt-8 inline-flex h-12 items-center justify-center rounded-lg bg-white px-6 font-semibold text-zinc-950 transition hover:bg-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
          >
            JobTrackを始める
          </Link>
        </div>
      </section>
    </main>
  );
}
