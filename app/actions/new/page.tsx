import Link from "next/link";
import { redirect } from "next/navigation";
import { ActionLogForm } from "@/app/actions/new/action-log-form";
import { LogoutButton } from "@/app/profile/setup/logout-button";
import { getActiveActions } from "@/lib/action-server";
import { getProfileByUserId } from "@/lib/profile-server";
import { getOrCreateCurrentRace } from "@/lib/race-server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function isRacePastDue(endAt: string | null) {
  if (!endAt) {
    return false;
  }

  return new Date(endAt).getTime() < Date.now();
}

export default async function NewActionPage() {
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

  const currentRace = await getOrCreateCurrentRace(user.id);
  const raceIsPastDue = isRacePastDue(currentRace.end_at);

  const actions = await getActiveActions().catch(() => []);
  const healthyActions = actions.filter((action) => action.type === "healthy");
  const unhealthyActions = actions.filter((action) => action.type === "unhealthy");

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="flex items-start justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          <div>
            <p className="text-sm font-semibold text-primary-700">行動登録</p>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">
              今日の行動を記録しましょう
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              不健康行動も健康行動も、どちらも同じように記録できます。Step 4 では保存処理までを実装し、
              回数制限や上限ルールは Step 5 で追加します。
            </p>
            <p className="mt-3 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
              現在のレース: {currentRace.name}
            </p>
            {raceIsPastDue ? (
              <p className="mt-3 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                このレースは終了待ちです。いまの記録は結果確定前の暫定扱いになります。
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/home"
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
            >
              ホームへ戻る
            </Link>
            <LogoutButton />
          </div>
        </header>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          {raceIsPastDue ? (
            <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-800">
              終了予定日を過ぎています。オーナーが新しいレースを開始するまでは、まだ記録を続けられます。
              ただし、この間の順位やポイントはすべて暫定です。
            </div>
          ) : null}
          {actions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-6 text-sm leading-6 text-slate-600">
              行動マスタまたはレースデータがまだありません。Supabase の SQL Editor で `supabase/seed.sql`
              と Step 9 の migration を実行すると、初期データが入ります。
            </div>
          ) : (
            <ActionLogForm
              healthyActions={healthyActions}
              unhealthyActions={unhealthyActions}
            />
          )}
        </section>
      </div>
    </main>
  );
}
