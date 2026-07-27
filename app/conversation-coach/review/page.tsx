import Link from "next/link";
import { ConversationReviewList } from "@/app/conversation-coach/review/review-list";
import {
  prototypeConversationReviewItems,
  prototypeConversationSettings,
} from "@/lib/conversation-coach-data";

export default function ConversationCoachReviewPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-600">
            Review Queue
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-slate-900">
            次にそのまま使いたい一文を残す
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-700">
            この画面は、会話後に残したいフレーズを軽く見返すための試作です。
            添削の量より、次回すぐ口に出せる一文だけを持ち帰ることを優先しています。
          </p>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-7 text-white shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-200">
            Practice Rule
          </p>
          <h3 className="mt-3 text-2xl font-semibold">今の練習方針</h3>
          <p className="mt-4 text-sm leading-7 text-slate-200">
            {prototypeConversationSettings.focus}
          </p>
          <div className="mt-6 rounded-3xl bg-white/10 p-4 text-sm leading-6 text-slate-100">
            1回の目安: {prototypeConversationSettings.sessionLength}
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-600">
              Items
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-900">
              復習候補
            </h3>
          </div>
          <Link href="/conversation-coach" className="text-sm font-semibold text-orange-700">
            ホームへ戻る
          </Link>
        </div>

        <ConversationReviewList defaultItems={prototypeConversationReviewItems} />
      </section>
    </main>
  );
}
