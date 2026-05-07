import Link from "next/link";
import { RecentReviewList } from "@/app/medical-english/home/recent-review-list";
import {
  medicalEnglishCategories,
  medicalEnglishLessons,
  prototypeReviewItems,
} from "@/lib/medical-english-data";

const recommendedLessons = medicalEnglishLessons.slice(0, 3);

export default function MedicalEnglishHomePage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-76px)] max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6">
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="overflow-hidden rounded-[2.25rem] border border-teal-100/80 bg-slate-950 text-white shadow-[0_20px_60px_rgba(15,23,42,0.16)]">
          <div className="bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.34),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(251,191,36,0.24),transparent_28%),linear-gradient(135deg,#020617_0%,#0f172a_58%,#123d42_100%)] p-7 sm:p-9">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-200">
              Medical Interview English MVP
            </p>
            <h2 className="mt-4 max-w-2xl text-4xl font-bold leading-tight sm:text-5xl">
              医療問診のための英語を、
              <br />
              短い実戦練習で積み上げる。
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-200 sm:text-base">
              このプロトタイプは、ホームからカテゴリ選択、レッスン詳細、
              スピーキング、リーディング、AIロールプレイまで一連で触れる
              たたき台です。今はダミーデータで流れを確認できる状態にしています。
            </p>

            <div className="mt-6 inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-teal-100">
              Friend Test Build
            </div>

            <div className="mt-4 max-w-xl rounded-[1.4rem] border border-white/10 bg-white/10 px-4 py-3 text-sm leading-6 text-slate-100 backdrop-blur">
              そのまま開いて、すぐにレッスンを試せます。まずは使い心地だけを軽く見てもらうための友人テスト版です。
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/medical-english/onboarding"
                className="rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                オンボーディングを見る
              </Link>
              <Link
                href="/medical-english/lesson/fever-first-visit"
                className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.02]"
              >
                おすすめレッスンを試す
              </Link>
              <Link
                href="/medical-english/category/intake-basics"
                className="rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                カテゴリを見る
              </Link>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {[
                { label: "学習カテゴリ", value: `${medicalEnglishCategories.length}` },
                { label: "試作レッスン", value: `${medicalEnglishLessons.length}` },
                { label: "練習モード", value: "3" },
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

        <div className="rounded-[2.25rem] border border-white/80 bg-[rgba(255,255,255,0.78)] p-6 shadow-[0_16px_50px_rgba(15,118,110,0.08)] backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
            Today&apos;s Focus
          </p>
          <h3 className="mt-3 text-3xl font-semibold text-slate-900">
            今日のおすすめ
          </h3>
          <div className="mt-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
            レッスン、音声入力、AIロールプレイ、復習一覧まで、そのまま続けて試せます。面倒な登録なしで流れを確認するためのMVPです。
          </div>
          <div className="mt-5 rounded-[1.8rem] border border-teal-100 bg-[linear-gradient(180deg,#edfffb_0%,#ffffff_100%)] p-5">
            <div className="flex flex-wrap items-center gap-2 text-xs text-teal-800">
              <span className="rounded-full bg-white px-3 py-1 font-semibold shadow-sm">
                First Visit
              </span>
              <span className="rounded-full bg-white px-3 py-1 font-semibold shadow-sm">
                Patient-friendly
              </span>
            </div>
            <p className="mt-4 text-base font-semibold text-teal-900">
              発熱で来院した患者の初診問診
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              受診理由、発熱の開始時期、咳や喉の痛みを短く安全に確認するレッスンです。
            </p>
            <div className="mt-4 flex items-center gap-3 text-xs text-slate-600">
              <span className="rounded-full bg-white px-3 py-1">6 min</span>
              <span className="rounded-full bg-white px-3 py-1">Beginner</span>
              <span className="rounded-full bg-white px-3 py-1">Speaking + Reading</span>
            </div>
            <Link
              href="/medical-english/lesson/fever-first-visit"
              className="mt-5 inline-flex rounded-full bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800"
            >
              レッスンを見る
            </Link>
          </div>

          <div className="mt-5 rounded-[1.8rem] border border-slate-200 bg-white/80 p-5">
            <p className="text-sm font-semibold text-slate-900">将来つながる拡張軸</p>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
              <li>症状タグを積み上げて現場向けフレーズ検索へ展開</li>
              <li>不足質問の記録を、問診支援ロジックの土台に活用</li>
              <li>診療科別シナリオを後から追加しやすい構成</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2.25rem] border border-white/80 bg-[rgba(255,255,255,0.82)] p-6 shadow-[0_16px_50px_rgba(15,118,110,0.08)] backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
                Categories
              </p>
              <h3 className="mt-2 text-3xl font-semibold text-slate-900">
                学習カテゴリ
              </h3>
            </div>
            <Link
              href="/medical-english/category/intake-basics"
              className="text-sm font-semibold text-teal-700"
            >
              最初のカテゴリへ
            </Link>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {medicalEnglishCategories.map((category) => (
              <Link
                key={category.slug}
                href={`/medical-english/category/${category.slug}`}
                className={`rounded-[1.9rem] border border-white bg-gradient-to-br ${category.accent} p-5 transition hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,118,110,0.12)]`}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-800">
                  {category.lessonCount} lessons
                </p>
                <h4 className="mt-3 text-xl font-semibold text-slate-900">
                  {category.name}
                </h4>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {category.description}
                </p>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-[2.25rem] border border-white/80 bg-[rgba(255,255,255,0.82)] p-6 shadow-[0_16px_50px_rgba(15,118,110,0.08)] backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
            Review Queue
          </p>
          <h3 className="mt-2 text-3xl font-semibold text-slate-900">復習リスト</h3>
          <RecentReviewList defaultItems={prototypeReviewItems} />
        </div>
      </section>

      <section className="rounded-[2.25rem] border border-white/80 bg-[rgba(255,255,255,0.82)] p-6 shadow-[0_16px_50px_rgba(15,118,110,0.08)] backdrop-blur">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
              Quick Start
            </p>
            <h3 className="mt-2 text-3xl font-semibold text-slate-900">
              すぐ試せるレッスン
            </h3>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {recommendedLessons.map((lesson) => (
            <Link
              key={lesson.slug}
              href={`/medical-english/lesson/${lesson.slug}`}
              className="rounded-[1.9rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fcfb_100%)] p-5 transition hover:-translate-y-1 hover:border-teal-200 hover:shadow-[0_18px_40px_rgba(15,118,110,0.10)]"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {lesson.difficulty}
                </span>
                <span className="text-sm text-slate-500">{lesson.estimatedMinutes} min</span>
              </div>
              <h4 className="mt-4 text-xl font-semibold text-slate-900">
                {lesson.title}
              </h4>
              <p className="mt-3 text-sm leading-6 text-slate-600">{lesson.objective}</p>
              <p className="mt-4 text-xs uppercase tracking-[0.18em] text-teal-700">
                tap to start
              </p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
