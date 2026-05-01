import Link from "next/link";
import { notFound } from "next/navigation";
import { getMedicalEnglishLesson } from "@/lib/medical-english-data";

type LessonPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const modeCards = [
  {
    slug: "speaking",
    title: "スピーキング練習",
    description: "日本語の問いかけを、患者に通じる英語へ変換して練習する。",
  },
  {
    slug: "reading",
    title: "リーディング練習",
    description: "患者の短い英語文から、重要情報を読み取る。",
  },
  {
    slug: "roleplay",
    title: "AIロールプレイ",
    description: "患者役との会話フローを追いながら、質問の順番を身につける。",
  },
];

export default async function MedicalEnglishLessonPage({
  params,
}: LessonPageProps) {
  const { slug } = await params;
  const lesson = getMedicalEnglishLesson(slug);

  if (!lesson) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[2.25rem] border border-white/80 bg-[rgba(255,255,255,0.82)] p-7 shadow-[0_16px_50px_rgba(15,118,110,0.08)] backdrop-blur">
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span className="rounded-full bg-teal-50 px-3 py-1 font-semibold text-teal-700">
              {lesson.difficulty}
            </span>
            <span>{lesson.estimatedMinutes} min</span>
            <span>{lesson.categorySlug}</span>
          </div>
          <h2 className="mt-4 text-4xl font-semibold text-slate-900">
            {lesson.title}
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-700">{lesson.objective}</p>

          <div className="mt-6 rounded-[1.6rem] border border-teal-100 bg-[linear-gradient(180deg,#f0fffb_0%,#ffffff_100%)] p-5">
            <p className="text-sm font-semibold text-slate-900">患者向けの言い方メモ</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {lesson.patientFriendlyTip}
            </p>
          </div>
        </div>

        <div className="rounded-[2.25rem] border border-teal-900/20 bg-[linear-gradient(135deg,#04151d_0%,#0f172a_55%,#164e63_100%)] p-7 text-white shadow-[0_20px_60px_rgba(15,23,42,0.16)]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-200">
            Key Phrases
          </p>
          <ul className="mt-4 space-y-3">
            {lesson.keyPhrases.map((phrase) => (
              <li
                key={phrase}
                className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm leading-6 text-slate-100"
              >
                {phrase}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-6 rounded-[2.25rem] border border-white/80 bg-[rgba(255,255,255,0.82)] p-6 shadow-[0_16px_50px_rgba(15,118,110,0.08)] backdrop-blur">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
              Practice Modes
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-900">
              学習モードを選ぶ
            </h3>
          </div>
          <Link href="/medical-english" className="text-sm font-semibold text-teal-700">
            ホームへ戻る
          </Link>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {modeCards.map((mode) => (
            <Link
              key={mode.slug}
              href={`/medical-english/lesson/${lesson.slug}/${mode.slug}`}
              className="rounded-[1.8rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbfb_100%)] p-5 transition hover:-translate-y-1 hover:border-teal-200 hover:shadow-[0_18px_40px_rgba(15,118,110,0.10)]"
            >
              <h4 className="text-lg font-semibold text-slate-900">{mode.title}</h4>
              <p className="mt-3 text-sm leading-6 text-slate-600">{mode.description}</p>
              <p className="mt-4 text-xs uppercase tracking-[0.18em] text-teal-700">
                start mode
              </p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
