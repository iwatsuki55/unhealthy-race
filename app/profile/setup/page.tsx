import { redirect } from "next/navigation";
import { ProfileForm } from "@/app/profile/setup/profile-form";
import { LogoutButton } from "@/app/profile/setup/logout-button";
import { getProfileByUserId } from "@/lib/profile-server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function ProfileSetupPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await getProfileByUserId(user.id).catch(() => null);

  if (profile?.nickname) {
    redirect("/home");
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
              初回プロフィールを設定しましょう
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              ニックネームは必須です。年代と性別はあとからでも調整できるよう、
              任意入力にしています。
            </p>
          </div>
          <LogoutButton />
        </header>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          <dl className="space-y-4 border-b border-slate-100 pb-6">
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
                保存後の遷移先
              </dt>
              <dd className="mt-1 text-sm leading-6 text-slate-700">
                いったん仮のホーム画面へ移動します。Step 6 で本実装に置き換えます。
              </dd>
            </div>
          </dl>

          <div className="pt-6">
            <ProfileForm defaultCommentTone={profile?.comment_tone ?? "gentle"} />
          </div>
        </section>
      </div>
    </main>
  );
}
