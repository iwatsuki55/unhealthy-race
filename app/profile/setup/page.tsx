import { redirect } from "next/navigation";
import { LogoutButton } from "@/app/profile/setup/logout-button";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function ProfileSetupPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <header className="flex items-start justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          <div>
            <p className="text-sm font-semibold text-primary-700">
              認証に成功しました
            </p>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">
              初回プロフィール設定へ進む準備ができています
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Step 2 ではログイン状態の確認と画面遷移までを実装しています。
              Step 3 でこの画面にプロフィール入力フォームを追加します。
            </p>
          </div>
          <LogoutButton />
        </header>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          <dl className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-slate-500">
                ログイン中のメールアドレス
              </dt>
              <dd className="mt-1 text-base font-semibold text-slate-900">
                {user.email}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">
                次のステップ
              </dt>
              <dd className="mt-1 text-sm leading-6 text-slate-700">
                `profiles` テーブル作成とあわせて、ニックネーム必須の初回設定フォームを追加します。
              </dd>
            </div>
          </dl>
        </section>
      </div>
    </main>
  );
}

