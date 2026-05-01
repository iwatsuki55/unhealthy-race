import Link from "next/link";
import { ReviewList } from "@/app/medical-english/review/review-list";
import {
  prototypeReviewItems,
  prototypeUserProfile,
} from "@/lib/medical-english-data";

export default function MedicalEnglishReviewPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">
            Review Queue
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-slate-900">
            苦手表現をまとめてやり直す
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-700">
            この画面は、MVP仕様の「復習一覧」を触れるようにした試作です。
            苦手の理由、次の復習タイミング、再挑戦への導線をまとめています。
          </p>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-7 text-white shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-200">
            Review Rule
          </p>
          <h3 className="mt-3 text-2xl font-semibold">今の学習方針</h3>
          <p className="mt-4 text-sm leading-7 text-slate-200">
            {prototypeUserProfile.learningFocus}
          </p>
          <div className="mt-6 rounded-3xl bg-white/10 p-4 text-sm leading-6 text-slate-100">
            週目標: {prototypeUserProfile.weeklyGoal}
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
              Items
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-900">
              復習候補
            </h3>
          </div>
          <Link href="/medical-english" className="text-sm font-semibold text-teal-700">
            ホームへ戻る
          </Link>
        </div>

        <ReviewList defaultItems={prototypeReviewItems} />
      </section>
    </main>
  );
}
