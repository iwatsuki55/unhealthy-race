import Link from "next/link";
import { conversationCoachThemes } from "@/lib/conversation-coach-data";

export default function ConversationThemeIndexPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <section className="rounded-[2.25rem] border border-white/80 bg-[rgba(255,255,255,0.82)] p-6 shadow-[0_16px_50px_rgba(249,115,22,0.08)] backdrop-blur">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-600">
              Theme Library
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">
              今日はどんな会話を練習する？
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
              話し始めやすい場面から選んで、短い返答を積み上げるためのテーマ一覧です。
              まずは気になったものを1本だけ選んで、最後まで会話を続ける感覚をつかみます。
            </p>
          </div>
          <Link
            href="/conversation-coach/theme/coffee-chat/session"
            className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
          >
            おすすめから始める
          </Link>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {conversationCoachThemes.map((theme) => (
            <article
              key={theme.slug}
              className={`rounded-[2rem] border border-white bg-gradient-to-br ${theme.accent} p-5 transition hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(249,115,22,0.12)]`}
            >
              <div className="flex flex-wrap items-center gap-2 text-xs text-orange-800">
                <span className="rounded-full bg-white px-3 py-1 font-semibold shadow-sm">
                  {theme.tone}
                </span>
                <span className="rounded-full bg-white px-3 py-1 font-semibold shadow-sm">
                  {theme.difficulty}
                </span>
                <span className="rounded-full bg-white px-3 py-1 font-semibold shadow-sm">
                  {theme.estimatedMinutes} min
                </span>
              </div>
              <h3 className="mt-4 text-2xl font-semibold text-slate-900">
                {theme.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {theme.description}
              </p>
              <div className="mt-5 rounded-[1.4rem] border border-white/70 bg-white/70 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Scene
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-700">{theme.scene}</p>
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href={`/conversation-coach/theme/${theme.slug}`}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-orange-200 hover:text-orange-700"
                >
                  詳細を見る
                </Link>
                <Link
                  href={`/conversation-coach/theme/${theme.slug}/session`}
                  className="rounded-full bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
                >
                  すぐ話す
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
