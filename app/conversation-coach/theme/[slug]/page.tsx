import Link from "next/link";
import { notFound } from "next/navigation";
import { conversationCoachThemeMap } from "@/lib/conversation-coach-data";

export default async function ConversationThemePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const theme = conversationCoachThemeMap[slug];

  if (!theme) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] border border-orange-100 bg-slate-950 p-7 text-white shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-200">
            Theme Detail
          </p>
          <h2 className="mt-3 text-3xl font-semibold">{theme.title}</h2>
          <p className="mt-4 text-sm leading-7 text-slate-200">{theme.description}</p>
          <div className="mt-6 flex flex-wrap gap-2 text-xs text-orange-100">
            <span className="rounded-full bg-white/10 px-3 py-1">{theme.tone}</span>
            <span className="rounded-full bg-white/10 px-3 py-1">{theme.difficulty}</span>
            <span className="rounded-full bg-white/10 px-3 py-1">
              {theme.estimatedMinutes} min
            </span>
          </div>
          <div className="mt-6 rounded-[1.5rem] bg-white/10 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-300">
              Scene
            </p>
            <p className="mt-2 text-sm leading-6 text-white">{theme.scene}</p>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-600">
            Goal
          </p>
          <h3 className="mt-3 text-2xl font-semibold text-slate-900">
            この会話で意識したいこと
          </h3>
          <p className="mt-4 text-sm leading-7 text-slate-700">{theme.coachGoal}</p>

          <div className="mt-6 rounded-[1.6rem] border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-900">よく出る話題</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {theme.suggestedTopics.map((topic) => (
                <span
                  key={topic}
                  className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-[1.6rem] border border-orange-100 bg-orange-50 p-5">
            <p className="text-sm font-semibold text-orange-900">最初の一言</p>
            <p className="mt-3 text-sm leading-6 text-slate-700">{theme.openingLine}</p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={`/conversation-coach/theme/${theme.slug}/session`}
              className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
            >
              このテーマで話す
            </Link>
            <Link
              href="/conversation-coach"
              className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700"
            >
              ホームへ戻る
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
