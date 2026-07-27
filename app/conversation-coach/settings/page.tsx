import { prototypeConversationSettings } from "@/lib/conversation-coach-data";

const settingCards = [
  {
    label: "英語レベル",
    value: prototypeConversationSettings.level,
    description: "まずは返すことを優先できる難易度感に寄せる。",
  },
  {
    label: "伸ばしたいこと",
    value: prototypeConversationSettings.focus,
    description: "文法よりも、会話を止めない感覚を先に育てる。",
  },
  {
    label: "フィードバック",
    value: prototypeConversationSettings.feedbackStyle,
    description: "重い添削ではなく、次回すぐ使う一文だけを残す。",
  },
];

export default function ConversationCoachSettingsPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-600">
            Settings
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-slate-900">
            学習設定のたたき台
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-700">
            この画面は、将来のパーソナライズに向けた設定試作です。
            いまは表示中心ですが、会話のテンポやフィードバック量をあとで調整しやすい形にしています。
          </p>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-gradient-to-br from-orange-50 via-white to-sky-50 p-7 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-600">
            Focus
          </p>
          <h3 className="mt-3 text-2xl font-semibold text-slate-900">
            今の練習フォーカス
          </h3>
          <p className="mt-4 text-sm leading-7 text-slate-700">
            {prototypeConversationSettings.focus}
          </p>
          <div className="mt-5 rounded-3xl bg-white/80 p-4 text-sm leading-6 text-slate-700">
            会話時間の目安: {prototypeConversationSettings.sessionLength}
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-600">
          Profile
        </p>
        <h3 className="mt-2 text-2xl font-semibold text-slate-900">
          MVPで持たせたい基本設定
        </h3>

        <div className="mt-6 grid gap-4">
          {settingCards.map((card) => (
            <article
              key={card.label}
              className="rounded-[1.6rem] border border-slate-200 p-5"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                {card.label}
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{card.value}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{card.description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
