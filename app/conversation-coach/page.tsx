import Link from "next/link";
import { ConversationRecentReviewList } from "@/app/conversation-coach/review/recent-review-list";
import {
  conversationCoachThemes,
  prototypeConversationReviewItems,
} from "@/lib/conversation-coach-data";

const featuredThemes = conversationCoachThemes.slice(0, 3);

export default function ConversationCoachHomePage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-76px)] max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6">
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="overflow-hidden rounded-[2.25rem] border border-orange-100/80 bg-slate-950 text-white shadow-[0_20px_60px_rgba(15,23,42,0.16)]">
          <div className="bg-[radial-gradient(circle_at_top_left,rgba(251,146,60,0.28),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.18),transparent_26%),linear-gradient(135deg,#020617_0%,#0f172a_60%,#3f2c1f_100%)] p-7 sm:p-9">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-orange-200">
              Daily Speaking MVP
            </p>
            <h2 className="mt-4 max-w-2xl text-4xl font-bold leading-tight sm:text-5xl">
              英語を返す瞬間を、
              <br />
              毎日少しずつ軽くする。
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-200 sm:text-base">
              このプロトタイプは、テーマを選んでAIと短い会話を続け、
              最後に一言だけ改善ポイントを持ち帰るための練習版です。
              気楽に話して、止まらず返す感覚を育てることを優先しています。
            </p>

            <div className="mt-6 inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-orange-100">
              Personal Practice Build
            </div>

            <div className="mt-4 max-w-xl rounded-[1.4rem] border border-white/10 bg-white/10 px-4 py-3 text-sm leading-6 text-slate-100 backdrop-blur">
              ログインなしでそのまま試せます。1回3分から5分で、
              会話を続ける練習だけに集中するための試作です。
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/conversation-coach/onboarding"
                className="rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                使い方を見る
              </Link>
              <Link
                href="/conversation-coach/theme/coffee-chat/session"
                className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.02]"
              >
                まず1本話す
              </Link>
              <Link
                href="/conversation-coach/theme"
                className="rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                テーマを見る
              </Link>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {[
                { label: "会話テーマ", value: `${conversationCoachThemes.length}` },
                { label: "会話時間", value: "3-5 min" },
                { label: "入力方法", value: "Voice + Text" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-[1.4rem] border border-white/10 bg-white/10 px-4 py-4 backdrop-blur"
                >
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-300">
                    {item.label}
                  </p>
                  <p className="mt-3 text-3xl font-semibold">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-[2.25rem] border border-white/80 bg-[rgba(255,255,255,0.78)] p-6 shadow-[0_16px_50px_rgba(249,115,22,0.08)] backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-600">
            Today&apos;s Focus
          </p>
          <h3 className="mt-3 text-3xl font-semibold text-slate-900">
            今日のおすすめ
          </h3>
          <div className="mt-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
            毎ターン添削するより、まず返して会話を続ける感覚を優先します。終わったあとに短く振り返るだけの軽い設計です。
          </div>
          <div className="mt-5 rounded-[1.8rem] border border-orange-100 bg-[linear-gradient(180deg,#fff7ed_0%,#ffffff_100%)] p-5">
            <div className="flex flex-wrap items-center gap-2 text-xs text-orange-800">
              <span className="rounded-full bg-white px-3 py-1 font-semibold shadow-sm">
                Friendly
              </span>
              <span className="rounded-full bg-white px-3 py-1 font-semibold shadow-sm">
                Low pressure
              </span>
            </div>
            <p className="mt-4 text-base font-semibold text-orange-900">
              カフェで気軽に雑談する
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              短い返答で終わらず、好みや理由を1つ足して返す練習に向いています。
            </p>
            <div className="mt-4 flex items-center gap-3 text-xs text-slate-600">
              <span className="rounded-full bg-white px-3 py-1">4 min</span>
              <span className="rounded-full bg-white px-3 py-1">Beginner</span>
              <span className="rounded-full bg-white px-3 py-1">Interactive</span>
            </div>
            <Link
              href="/conversation-coach/theme/coffee-chat/session"
              className="mt-5 inline-flex rounded-full bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
            >
              このテーマで話す
            </Link>
          </div>

          <div className="mt-5 rounded-[1.8rem] border border-slate-200 bg-white/80 p-5">
            <p className="text-sm font-semibold text-slate-900">MVPで特に試したいこと</p>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
              <li>話し始めるまでの心理的ハードルが下がるか</li>
              <li>短い返答でも会話が続く感覚を得られるか</li>
              <li>会話後の一言フィードバックで次回の一文が残るか</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2.25rem] border border-white/80 bg-[rgba(255,255,255,0.82)] p-6 shadow-[0_16px_50px_rgba(249,115,22,0.08)] backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-600">
                Themes
              </p>
              <h3 className="mt-2 text-3xl font-semibold text-slate-900">
                会話テーマ
              </h3>
            </div>
            <Link
              href="/conversation-coach/theme"
              className="text-sm font-semibold text-orange-700"
            >
              テーマ一覧へ
            </Link>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {conversationCoachThemes.map((theme) => (
              <Link
                key={theme.slug}
                href={`/conversation-coach/theme/${theme.slug}`}
                className={`rounded-[1.9rem] border border-white bg-gradient-to-br ${theme.accent} p-5 transition hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(249,115,22,0.12)]`}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-800">
                  {theme.tone}
                </p>
                <h4 className="mt-3 text-xl font-semibold text-slate-900">
                  {theme.title}
                </h4>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {theme.description}
                </p>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-[2.25rem] border border-white/80 bg-[rgba(255,255,255,0.82)] p-6 shadow-[0_16px_50px_rgba(249,115,22,0.08)] backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-600">
            Review Queue
          </p>
          <h3 className="mt-2 text-3xl font-semibold text-slate-900">復習メモ</h3>
          <ConversationRecentReviewList defaultItems={prototypeConversationReviewItems} />
        </div>
      </section>

      <section className="rounded-[2.25rem] border border-white/80 bg-[rgba(255,255,255,0.82)] p-6 shadow-[0_16px_50px_rgba(249,115,22,0.08)] backdrop-blur">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-600">
              Quick Start
            </p>
            <h3 className="mt-2 text-3xl font-semibold text-slate-900">
              すぐ試せる会話
            </h3>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {featuredThemes.map((theme) => (
            <Link
              key={theme.slug}
              href={`/conversation-coach/theme/${theme.slug}/session`}
              className="rounded-[1.9rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#fffaf4_100%)] p-5 transition hover:-translate-y-1 hover:border-orange-200 hover:shadow-[0_18px_40px_rgba(249,115,22,0.10)]"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {theme.difficulty}
                </span>
                <span className="text-sm text-slate-500">{theme.estimatedMinutes} min</span>
              </div>
              <h4 className="mt-4 text-xl font-semibold text-slate-900">
                {theme.title}
              </h4>
              <p className="mt-3 text-sm leading-6 text-slate-600">{theme.scene}</p>
              <p className="mt-4 text-xs uppercase tracking-[0.18em] text-orange-700">
                tap to start
              </p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
