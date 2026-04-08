import { redirect } from "next/navigation";
import { LogoutButton } from "@/app/profile/setup/logout-button";
import { getProfileByUserId } from "@/lib/profile-server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function HomePlaceholderPage() {
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

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <header className="flex items-start justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          <div>
            <p className="text-sm font-semibold text-primary-700">プロフィール保存完了</p>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">
              {profile.nickname} さん、準備が整いました
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Step 3 では初回プロフィール設定までを実装しています。Step 6 でこの仮ホームを
              ダッシュボード本体に置き換えます。
            </p>
          </div>
          <LogoutButton />
        </header>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          <dl className="space-y-4">
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
        </section>
      </div>
    </main>
  );
}
