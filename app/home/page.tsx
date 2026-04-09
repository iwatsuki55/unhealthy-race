import Link from "next/link";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/app/profile/setup/logout-button";
import { getHomeSummary } from "@/lib/home-server";
import { getProfileByUserId } from "@/lib/profile-server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type HomePageProps = {
  searchParams?: Promise<{
    action_saved?: string;
  }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await getProfileByUserId(user.id).catch(() => null);

  if (!profile?.nickname) {
    redirect("/profile/setup");
  }

  const summary = await getHomeSummary(user.id).catch(() => ({
    currentPoints: 0,
    todayDelta: 0,
    recentLogs: [],
    weekTrend: [],
    comment: "今日はここから立て直そう",
  }));
  const resolvedSearchParams = await searchParams;
  const actionSaved = resolvedSearchParams?.action_saved === "1";
  const maxTrendValue = Math.max(
    1,
    ...summary.weekTrend.map((item) => Math.abs(item.delta)),
  );

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="flex items-start justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          <div>
            <p className="text-sm font-semibold text-primary-700">ホーム</p>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">
              {profile.nickname} さん、今日はここから整えましょう
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              現在ポイント、今日の増減、最近の登録をまとめて見られるホーム画面です。
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/history"
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
            >
              履歴を見る
            </Link>
            <Link
              href="/actions/new"
              className="rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
            >
              行動を登録する
            </Link>
            <LogoutButton />
          </div>
        </header>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          {actionSaved ? (
            <div className="mb-5 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              行動を保存しました。
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-3xl bg-primary-900 p-6 text-white">
              <p className="text-sm font-semibold tracking-[0.16em] text-primary-100">
                CURRENT POINTS
              </p>
              <p className="mt-4 text-4xl font-bold">{summary.currentPoints} pt</p>
              <p className="mt-3 text-sm leading-6 text-primary-100">{summary.comment}</p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <p className="text-sm font-semibold text-slate-500">今日の増減</p>
              <p
                className={`mt-4 text-3xl font-bold ${
                  summary.todayDelta > 0
                    ? "text-amber-600"
                    : summary.todayDelta < 0
                      ? "text-emerald-600"
                      : "text-slate-900"
                }`}
              >
                {summary.todayDelta > 0 ? `+${summary.todayDelta}` : summary.todayDelta} pt
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                不健康行動で加算、健康行動で減算した今日の合計です。
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
            <h2 className="text-lg font-semibold text-slate-900">プロフィール</h2>
            <dl className="mt-5 space-y-4">
              <div>
                <dt className="text-sm font-medium text-slate-500">ニックネーム</dt>
                <dd className="mt-1 text-base font-semibold text-slate-900">
                  {profile.nickname}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-slate-500">年代</dt>
                <dd className="mt-1 text-sm text-slate-700">
                  {profile.age_group || "未設定"}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-slate-500">性別</dt>
                <dd className="mt-1 text-sm text-slate-700">
                  {profile.gender || "未設定"}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-slate-900">直近の登録行動</h2>
              <div className="flex items-center gap-3">
                <Link
                  href="/history"
                  className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
                >
                  すべて見る
                </Link>
                <Link
                  href="/actions/new"
                  className="text-sm font-medium text-primary-700 transition hover:text-primary-800"
                >
                  新しく登録する
                </Link>
              </div>
            </div>

            {summary.recentLogs.length === 0 ? (
              <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm leading-6 text-slate-600">
                まだ登録がありません。まずは今日の行動を1つ記録してみましょう。
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {summary.recentLogs.map((log) => (
                  <article
                    key={log.id}
                    className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {log.action?.name ?? "不明な行動"}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {new Date(log.action_at).toLocaleString("ja-JP")}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          log.point_value > 0
                            ? "bg-amber-100 text-amber-700"
                            : log.point_value < 0
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {log.point_value > 0 ? `+${log.point_value}` : log.point_value} pt
                      </span>
                    </div>
                    {log.memo ? (
                      <p className="mt-3 text-sm leading-6 text-slate-600">{log.memo}</p>
                    ) : null}
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="text-lg font-semibold text-slate-900">今日のひとこと</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">{summary.comment}</p>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">今週の推移</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                1日ごとの増減ポイントをシンプルに表示しています。
              </p>
            </div>
          </div>

          {summary.weekTrend.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm leading-6 text-slate-600">
              まだ今週の記録がありません。行動を登録すると推移が表示されます。
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-7 gap-3">
              {summary.weekTrend.map((item) => {
                const heightPercent = Math.max(
                  8,
                  (Math.abs(item.delta) / maxTrendValue) * 100,
                );

                return (
                  <div
                    key={`${item.dateLabel}-${item.label}`}
                    className="flex flex-col items-center gap-3"
                  >
                    <div className="flex h-36 w-full items-end justify-center rounded-2xl bg-slate-50 px-2 py-3">
                      <div
                        className={`w-full rounded-xl ${
                          item.delta > 0
                            ? "bg-amber-400"
                            : item.delta < 0
                              ? "bg-emerald-400"
                              : "bg-slate-300"
                        }`}
                        style={{ height: `${item.delta === 0 ? 10 : heightPercent}%` }}
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-medium text-slate-500">{item.label}</p>
                      <p className="mt-1 text-xs text-slate-400">{item.dateLabel}</p>
                      <p
                        className={`mt-2 text-sm font-semibold ${
                          item.delta > 0
                            ? "text-amber-600"
                            : item.delta < 0
                              ? "text-emerald-600"
                              : "text-slate-600"
                        }`}
                      >
                        {item.delta > 0 ? `+${item.delta}` : item.delta}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
