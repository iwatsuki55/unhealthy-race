"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { updateCommentTone, type CommentToneFormState } from "@/app/home/actions";
import { commentToneOptions } from "@/lib/profile-options";

const initialState: CommentToneFormState = {
  error: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="rounded-2xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-wait disabled:opacity-70"
      disabled={pending}
    >
      {pending ? "更新中..." : "トーンを更新"}
    </button>
  );
}

export function CommentToneForm({
  defaultValue,
}: {
  defaultValue: "gentle" | "sarcastic";
}) {
  const [state, formAction] = useActionState(updateCommentTone, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label
          htmlFor="comment_tone"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          コメントトーン
        </label>
        <select
          id="comment_tone"
          name="comment_tone"
          defaultValue={defaultValue}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
        >
          {commentToneOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
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
