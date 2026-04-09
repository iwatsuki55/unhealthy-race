import Link from "next/link";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/app/profile/setup/logout-button";
import { getHistoryLogs } from "@/lib/history-server";
import { getProfileByUserId } from "@/lib/profile-server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function HistoryPage() {
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

  const logs = await getHistoryLogs(user.id).catch(() => []);

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="flex items-start justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          <div>
            <p className="text-sm font-semibold text-primary-700">履歴一覧</p>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">
              登録した行動をまとめて確認できます
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              日付、行動名、健康・不健康の区分、増減ポイント、メモを一覧で見られます。
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/home"
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
            >
              ホームへ戻る
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
          {logs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-6 text-sm leading-6 text-slate-600">
              まだ履歴がありません。まずは行動を1件登録すると、ここに一覧表示されます。
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => (
                <article
                  key={log.id}
                  className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2">
                      <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                        {new Date(log.action_at).toLocaleString("ja-JP")}
                      </p>
                      <h2 className="text-base font-semibold text-slate-900">
                        {log.action?.name ?? "不明な行動"}
                      </h2>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            log.action?.type === "healthy"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {log.action?.type === "healthy" ? "健康" : "不健康"}
                        </span>
                        {log.action?.category ? (
                          <span className="rounded-full bg-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600">
                            {log.action.category}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="md:text-right">
                      <p className="text-sm font-medium text-slate-500">増減ポイント</p>
                      <p
                        className={`mt-1 text-lg font-bold ${
                          log.point_value > 0
                            ? "text-amber-600"
                            : log.point_value < 0
                              ? "text-emerald-600"
                              : "text-slate-900"
                        }`}
                      >
                        {log.point_value > 0 ? `+${log.point_value}` : log.point_value} pt
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl bg-white px-4 py-3">
                    <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                      メモ
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {log.memo || "メモはありません"}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

