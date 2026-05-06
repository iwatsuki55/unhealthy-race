import Link from "next/link";
import { LogoutButton } from "@/app/profile/setup/logout-button";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function MedicalEnglishLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#eef8f7_0%,#f8fcfb_38%,#fff8ef_100%)] text-slate-900">
      <div className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[32rem] bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.18),transparent_30%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.12),transparent_24%),radial-gradient(circle_at_55%_18%,rgba(251,191,36,0.12),transparent_18%)]" />
      <header className="sticky top-0 z-20 border-b border-white/60 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <Link href="/medical-english" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0f766e_0%,#0f172a_100%)] text-lg font-bold text-white shadow-soft">
              ME
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-700">
                Prototype
              </p>
              <h1 className="text-lg font-semibold text-slate-900">
                Medical English Coach
              </h1>
            </div>
          </Link>

          <div className="flex flex-wrap items-center justify-end gap-3">
            <nav className="flex items-center gap-2 rounded-full border border-white/70 bg-white/70 p-1 text-sm text-slate-600 shadow-[0_10px_30px_rgba(15,118,110,0.08)]">
              <Link
                href="/medical-english"
                className="rounded-full px-4 py-2 transition hover:bg-slate-950 hover:text-white"
              >
                ホーム
              </Link>
              <Link
                href="/medical-english/category/intake-basics"
                className="rounded-full px-4 py-2 transition hover:bg-slate-950 hover:text-white"
              >
                学習
              </Link>
              <Link
                href="/medical-english/review"
                className="rounded-full px-4 py-2 transition hover:bg-slate-950 hover:text-white"
              >
                復習
              </Link>
              <Link
                href="/medical-english/settings"
                className="rounded-full px-4 py-2 transition hover:bg-slate-950 hover:text-white"
              >
                設定
              </Link>
            </nav>

            {user ? (
              <div className="flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                <span className="font-semibold">保存オン</span>
                <LogoutButton />
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-end gap-2">
                <Link
                  href="/medical-english/lesson/fever-first-visit"
                  className="rounded-full bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800"
                >
                  まず試す
                </Link>
                <Link
                  href="/login?next=/medical-english"
                  className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-teal-200 hover:text-teal-800"
                >
                  保存したい人はログイン
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {children}
    </div>
  );
}
