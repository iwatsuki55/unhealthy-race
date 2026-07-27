import Link from "next/link";

const onboardingSteps = [
  {
    label: "Step 1",
    title: "まず返すことを優先する",
    description:
      "文法の正しさより、相手に返して会話を止めない感覚を先に育てます。",
  },
  {
    label: "Step 2",
    title: "短い会話を軽く回す",
    description:
      "1回3分から5分で、疲れる前に終わる短い会話練習を積み上げます。",
  },
  {
    label: "Step 3",
    title: "一言だけ持ち帰る",
    description:
      "会話後に、次回そのまま使いたい一文だけを残して復習につなげます。",
  },
];

export default function ConversationCoachOnboardingPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="overflow-hidden rounded-[2rem] border border-orange-100 bg-slate-950 text-white shadow-soft">
          <div className="bg-[radial-gradient(circle_at_top_left,rgba(251,146,60,0.28),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.18),transparent_26%)] p-8 sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-orange-200">
              Onboarding
            </p>
            <h2 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl">
              最初の3分で、
              <br />
              話し始めるハードルを下げる。
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-200 sm:text-base">
              このプロトタイプでは、AIと英語で返す練習を短く回しながら、
              「考え込みすぎて止まる」を減らすことを目的にしています。
              まずは気軽に1本話して、終わったあとに一言だけ持ち帰る構成です。
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/conversation-coach"
                className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.02]"
              >
                ホームへ進む
              </Link>
              <Link
                href="/conversation-coach/theme/coffee-chat/session"
                className="rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                体験会話を始める
              </Link>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-600">
            For MVP
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-900">
            今回の体験範囲
          </h3>
          <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-600">
            <li>テーマを選んでAIと短い会話をする</li>
            <li>音声入力またはテキスト入力で返す</li>
            <li>会話後に一言フィードバックを受け取る</li>
            <li>気になった表現を復習に残す</li>
          </ul>
        </div>
      </section>

      <section className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-600">
          Why This App
        </p>
        <h3 className="mt-2 text-2xl font-semibold text-slate-900">
          3つの考え方
        </h3>
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {onboardingSteps.map((step) => (
            <article
              key={step.title}
              className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-600">
                {step.label}
              </p>
              <h4 className="mt-3 text-xl font-semibold text-slate-900">
                {step.title}
              </h4>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
