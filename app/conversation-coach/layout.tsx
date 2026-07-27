import Link from "next/link";

export default function ConversationCoachLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fffaf4_0%,#f8fcff_40%,#f5fff8_100%)] text-slate-900">
      <div className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[32rem] bg-[radial-gradient(circle_at_top_left,rgba(251,146,60,0.14),transparent_30%),radial-gradient(circle_at_top_right,rgba(56,189,248,0.12),transparent_26%),radial-gradient(circle_at_50%_12%,rgba(45,212,191,0.12),transparent_20%)]" />
      <header className="sticky top-0 z-20 border-b border-white/60 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <Link href="/conversation-coach" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#f97316_0%,#0f172a_100%)] text-lg font-bold text-white shadow-soft">
              CC
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-600">
                Prototype
              </p>
              <h1 className="text-lg font-semibold text-slate-900">
                Conversation Coach
              </h1>
            </div>
          </Link>

          <div className="flex flex-wrap items-center justify-end gap-3">
            <nav className="flex items-center gap-2 rounded-full border border-white/70 bg-white/70 p-1 text-sm text-slate-600 shadow-[0_10px_30px_rgba(15,118,110,0.08)]">
              <Link
                href="/conversation-coach"
                className="rounded-full px-4 py-2 transition hover:bg-slate-950 hover:text-white"
              >
                ホーム
              </Link>
              <Link
                href="/conversation-coach/theme"
                className="rounded-full px-4 py-2 transition hover:bg-slate-950 hover:text-white"
              >
                テーマ
              </Link>
              <Link
                href="/conversation-coach/review"
                className="rounded-full px-4 py-2 transition hover:bg-slate-950 hover:text-white"
              >
                復習
              </Link>
              <Link
                href="/conversation-coach/settings"
                className="rounded-full px-4 py-2 transition hover:bg-slate-950 hover:text-white"
              >
                設定
              </Link>
            </nav>
            <Link
              href="/conversation-coach/theme/coffee-chat/session"
              className="rounded-full bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
            >
              すぐ話す
            </Link>
          </div>
        </div>
      </header>

      {children}
    </div>
  );
}
