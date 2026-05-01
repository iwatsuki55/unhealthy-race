import { prototypeUserProfile } from "@/lib/medical-english-data";

const settingCards = [
  {
    label: "職種",
    value: prototypeUserProfile.role,
    description: "将来は職種ごとにおすすめレッスンや言い回しを出し分ける。",
  },
  {
    label: "英語レベル",
    value: prototypeUserProfile.englishLevel,
    description: "MVPでは表示のみ。将来は難易度とヒント量に反映する。",
  },
  {
    label: "主な診療場面",
    value: prototypeUserProfile.primaryContexts.join(" / "),
    description: "外来、救急、受付などの場面タグにつなげる前提。",
  },
];

export default function MedicalEnglishSettingsPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">
            Profile
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-slate-900">
            学習設定のたたき台
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-700">
            この画面は、MVP仕様の「プロフィール / 学習設定」に対応する試作です。
            今は保存処理なしで、将来のパーソナライズ項目を見えるようにしています。
          </p>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-gradient-to-br from-teal-50 via-white to-amber-50 p-7 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">
            Focus
          </p>
          <h3 className="mt-3 text-2xl font-semibold text-slate-900">
            今の学習フォーカス
          </h3>
          <p className="mt-4 text-sm leading-7 text-slate-700">
            {prototypeUserProfile.learningFocus}
          </p>
          <div className="mt-5 rounded-3xl bg-white/80 p-4 text-sm leading-6 text-slate-700">
            週目標: {prototypeUserProfile.weeklyGoal}
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
          Settings
        </p>
        <h3 className="mt-2 text-2xl font-semibold text-slate-900">
          MVPで持たせたい基本情報
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
