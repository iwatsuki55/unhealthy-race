import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getLessonsByCategory,
  getMedicalEnglishCategory,
} from "@/lib/medical-english-data";

type CategoryPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function MedicalEnglishCategoryPage({
  params,
}: CategoryPageProps) {
  const { slug } = await params;
  const category = getMedicalEnglishCategory(slug);

  if (!category) {
    notFound();
  }

  const lessons = getLessonsByCategory(category.slug);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <section className={`rounded-[2.25rem] border border-white bg-gradient-to-br ${category.accent} p-7 shadow-[0_18px_50px_rgba(15,118,110,0.10)]`}>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-800">
          Category
        </p>
        <h2 className="mt-3 text-4xl font-semibold text-slate-900">{category.name}</h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-700">
          {category.description}
        </p>
      </section>

      <section className="mt-6 rounded-[2.25rem] border border-white/80 bg-[rgba(255,255,255,0.82)] p-6 shadow-[0_16px_50px_rgba(15,118,110,0.08)] backdrop-blur">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
              Lessons
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-900">
              レッスン一覧
            </h3>
          </div>
          <Link href="/medical-english" className="text-sm font-semibold text-teal-700">
            ホームへ戻る
          </Link>
        </div>

        <div className="mt-6 grid gap-4">
          {lessons.map((lesson) => (
            <Link
              key={lesson.slug}
              href={`/medical-english/lesson/${lesson.slug}`}
              className="rounded-[1.8rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fcfb_100%)] p-5 transition hover:-translate-y-1 hover:border-teal-200 hover:bg-teal-50/50 hover:shadow-[0_18px_40px_rgba(15,118,110,0.10)]"
            >
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">
                  {lesson.difficulty}
                </span>
                <span>{lesson.estimatedMinutes} min</span>
                <span>{lesson.speakingPrompts.length} speaking prompts</span>
                <span>{lesson.readingQuestions.length} reading questions</span>
              </div>
              <h4 className="mt-4 text-xl font-semibold text-slate-900">{lesson.title}</h4>
              <p className="mt-2 text-sm leading-6 text-slate-600">{lesson.objective}</p>
              <p className="mt-4 text-xs uppercase tracking-[0.18em] text-teal-700">
                choose lesson
              </p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
