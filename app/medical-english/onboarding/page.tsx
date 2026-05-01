import Link from "next/link";

const onboardingSteps = [
  {
    label: "Step 1",
    title: "現場で使う医療英語に絞る",
    description:
      "一般英会話ではなく、患者に安全に伝わる短い問診英語を優先して学びます。",
  },
  {
    label: "Step 2",
    title: "話す・読む・会話するを短時間で回す",
    description:
      "1回3分から10分で、スピーキング、リーディング、AIロールプレイを組み合わせます。",
  },
  {
    label: "Step 3",
    title: "苦手表現を復習に集約する",
    description:
      "確認漏れや不自然な質問順を蓄積して、次の問診で使える形へ整えていきます。",
  },
];

export default function MedicalEnglishOnboardingPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="overflow-hidden rounded-[2rem] border border-teal-100 bg-slate-950 text-white shadow-soft">
          <div className="bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.32),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(251,191,36,0.24),transparent_26%)] p-8 sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-200">
              Onboarding
            </p>
            <h2 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl">
              最初の3分で、
              <br />
              このアプリの使いどころをつかむ。
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-200 sm:text-base">
              このプロトタイプでは、学習アプリとしてどう始まって、どこから実戦的な
              問診練習につながるのかを短く確認できます。将来の問診支援アプリへ広げる
              前提で、まずは学習の体験を軽く触れる構成です。
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/medical-english"
                className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.02]"
              >
                ホームへ進む
              </Link>
              <Link
                href="/medical-english/lesson/fever-first-visit"
                className="rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                体験レッスンを始める
              </Link>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
            For MVP
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-900">
            今回の体験範囲
          </h3>
          <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-600">
            <li>カテゴリからレッスンを選ぶ</li>
            <li>スピーキング、リーディング、ロールプレイを試す</li>
            <li>簡易フィードバックと復習導線を確認する</li>
            <li>学習設定と将来の情報設計をざっくり見る</li>
          </ul>
        </div>
      </section>

      <section className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
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
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">
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
