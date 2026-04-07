const featureItems = [
  "不健康行動と健康行動を記録",
  "ポイントの増減で見える化",
  "今日はここから立て直そう、を支える設計",
];

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-3xl bg-primary-900 p-8 text-white shadow-soft sm:p-10">
          <p className="text-sm font-semibold tracking-[0.2em] text-primary-100">
            UNHEALTHY RACE MVP
          </p>
          <h1 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl">
            乱れを責めずに、
            <br />
            少しずつ整え直す。
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-primary-100 sm:text-base">
            アンヘルシーレース（仮）は、不摂生を見える化しながら、
            健康行動で「戻す」ことを楽しく続けるための記録アプリです。
          </p>
          <ul className="mt-8 space-y-3 text-sm text-primary-50 sm:text-base">
            {featureItems.map((item) => (
              <li
                key={item}
                className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur"
              >
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
          <div className="mx-auto max-w-md">
            <p className="text-sm font-semibold text-primary-700">ログイン</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              まずはアカウントを作成しましょう
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Step 1 では画面の土台のみ実装しています。次のステップで
              Supabase Auth と接続し、登録・ログインを動かします。
            </p>

            <form className="mt-8 space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  メールアドレス
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                  disabled
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  パスワード
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="8文字以上"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                  disabled
                />
              </div>

              <button
                type="button"
                className="w-full rounded-2xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
                disabled
              >
                Step 2 で有効になります
              </button>
            </form>

            <div className="mt-6 rounded-2xl bg-slate-50 px-4 py-3 text-xs leading-6 text-slate-500">
              Supabase URL / Anon Key は
              <code className="mx-1 rounded bg-white px-1 py-0.5">
                .env.local
              </code>
              で管理します。
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

