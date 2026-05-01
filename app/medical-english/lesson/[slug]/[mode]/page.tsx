import { notFound } from "next/navigation";
import { PracticePrototype } from "@/app/medical-english/_components/practice-prototype";
import { getMedicalEnglishLesson } from "@/lib/medical-english-data";

type PracticeMode = "speaking" | "reading" | "roleplay";

type PracticePageProps = {
  params: Promise<{
    slug: string;
    mode: string;
  }>;
};

function isPracticeMode(mode: string): mode is PracticeMode {
  return mode === "speaking" || mode === "reading" || mode === "roleplay";
}

export default async function MedicalEnglishPracticePage({
  params,
}: PracticePageProps) {
  const { slug, mode } = await params;
  const lesson = getMedicalEnglishLesson(slug);

  if (!lesson || !isPracticeMode(mode)) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <PracticePrototype lesson={lesson} mode={mode} />
    </main>
  );
}
