"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";
import { saveActionLog, type ActionLogFormState } from "@/app/actions/new/actions";
import type { ActionMaster } from "@/lib/action-server";

const initialState: ActionLogFormState = {
  error: null,
};

type ActionLogFormProps = {
  healthyActions: ActionMaster[];
  unhealthyActions: ActionMaster[];
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="w-full rounded-2xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-wait disabled:opacity-70"
      disabled={pending}
    >
      {pending ? "保存中..." : "行動を登録する"}
    </button>
  );
}

function ActionOptionGroup({
  title,
  description,
  actions,
  selectedActionId,
  onSelect,
  tone,
}: {
  title: string;
  description: string;
  actions: ActionMaster[];
  selectedActionId: string;
  onSelect: (actionId: string) => void;
  tone: "healthy" | "unhealthy";
}) {
  const selectedClasses =
    tone === "healthy"
      ? "border-emerald-300 bg-emerald-50"
      : "border-amber-300 bg-amber-50";

  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {actions.map((action) => (
          <label
            key={action.id}
            className={`cursor-pointer rounded-2xl border px-4 py-4 transition ${
              selectedActionId === action.id
                ? selectedClasses
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <input
              type="radio"
              name="action_id"
              value={action.id}
              checked={selectedActionId === action.id}
              onChange={() => onSelect(action.id)}
              className="sr-only"
            />
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">{action.name}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-400">
                  {action.category}
                </p>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                  tone === "healthy"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {action.point_value > 0 ? `+${action.point_value}` : action.point_value}
              </span>
            </div>
          </label>
        ))}
      </div>
    </section>
  );
}

export function ActionLogForm({
  healthyActions,
  unhealthyActions,
}: ActionLogFormProps) {
  const [state, formAction] = React.useActionState(saveActionLog, initialState);
  const [selectedActionId, setSelectedActionId] = React.useState("");

  return (
    <form action={formAction} className="space-y-6">
      <ActionOptionGroup
        title="不健康行動"
        description="まずは今日の乱れをそのまま記録します。責めずに見える化するための登録です。"
        actions={unhealthyActions}
        selectedActionId={selectedActionId}
        onSelect={setSelectedActionId}
        tone="unhealthy"
      />

      <ActionOptionGroup
        title="健康行動"
        description="整え直そうとした行動も同じように記録できます。"
        actions={healthyActions}
        selectedActionId={selectedActionId}
        onSelect={setSelectedActionId}
        tone="healthy"
      />

      <div>
        <label
          htmlFor="memo"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          メモ
        </label>
        <textarea
          id="memo"
          name="memo"
          rows={4}
          maxLength={200}
          placeholder="例: 会食でつい食べすぎた、帰りに10分歩けた など"
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
        />
        <p className="mt-2 text-xs text-slate-500">任意入力、200文字までです。</p>
      </div>

      {state.error ? (
        <p className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {state.error}
        </p>
      ) : null}

      <SubmitButton />
    </form>
  );
}
