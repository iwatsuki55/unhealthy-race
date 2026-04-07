import { AuthForm } from "@/app/login/auth-form";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const featureItems = [
  "不健康行動と健康行動を記録",
  "ポイントの増減で見える化",
  "今日はここから立て直そう、を支える設計",
];

type LoginPageProps = {
  searchParams?: Promise<{
    next?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = await searchParams;
  const nextPath = resolvedSearchParams?.next || "/profile/setup";
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
              メールアドレスで登録・ログインできます。ログイン後は、
              初回プロフィール設定画面へ進みます。
            </p>

            <AuthForm nextPath={nextPath} />

            <div className="mt-6 rounded-2xl bg-slate-50 px-4 py-3 text-xs leading-6 text-slate-500">
              {user
                ? "ログイン済みです。必要なら別タブでプロフィール設定画面を開いてください。"
                : "Supabase URL / Anon Key は .env.local で管理します。"}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
