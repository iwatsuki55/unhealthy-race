import Link from "next/link";
import { redirect } from "next/navigation";
import { ActionLogForm } from "@/app/actions/new/action-log-form";
import { LogoutButton } from "@/app/profile/setup/logout-button";
import { getActiveActions } from "@/lib/action-server";
import { getProfileByUserId } from "@/lib/profile-server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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
          {actions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-6 text-sm leading-6 text-slate-600">
              行動マスタがまだありません。Supabase の SQL Editor で `supabase/seed.sql` を実行すると、
              初期データが入ります。
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

