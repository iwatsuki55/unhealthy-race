"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";
import { startNewRace, type StartRaceFormState } from "@/app/home/actions";

const initialState: StartRaceFormState = {
  error: null,
};

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-wait disabled:opacity-70"
      disabled={pending}
    >
      {pending ? "開始中..." : label}
    </button>
  );
}

export function StartRaceForm({
  submitLabel = "新しいレースを開始",
  helperText,
}: {
  submitLabel?: string;
  helperText?: string;
}) {
  const [state, formAction] = React.useActionState(startNewRace, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label
          htmlFor="race_name"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          新しいレース名
        </label>
        <input
          id="race_name"
          name="race_name"
          type="text"
          maxLength={40}
          placeholder="例: 4月リセットレース"
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
          required
        />
      </div>

      <div>
        <label
          htmlFor="duration_days"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          レース期間
        </label>
        <select
          id="duration_days"
          name="duration_days"
          defaultValue="7"
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
        >
          <option value="7">7日レース</option>
          <option value="14">14日レース</option>
          <option value="30">30日レース</option>
        </select>
      </div>

      {state.error ? (
        <p className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {state.error}
        </p>
      ) : null}

      <p className="text-sm leading-6 text-slate-600">
        {helperText ||
          "今のレースは終了し、新しいレースでポイントがゼロから再スタートします。過去ログ自体は削除されません。期間が終わる前でも、新しいレース開始で結果は確定します。"}
      </p>

      <SubmitButton label={submitLabel} />
    </form>
  );
}
