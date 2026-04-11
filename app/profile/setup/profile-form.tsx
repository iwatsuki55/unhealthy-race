"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  ageGroupOptions,
  commentToneOptions,
  genderOptions,
  type ProfileFormState,
} from "@/lib/profile-options";
import { saveProfile } from "@/app/profile/setup/actions";

const initialState: ProfileFormState = {
  error: null,
};

type ProfileFormProps = {
  defaultNickname?: string | null;
  defaultAgeGroup?: string | null;
  defaultGender?: string | null;
  defaultCommentTone?: string | null;
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="w-full rounded-2xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-wait disabled:opacity-70"
      disabled={pending}
    >
      {pending ? "保存中..." : "プロフィールを保存する"}
    </button>
  );
}

export function ProfileForm({
  defaultNickname,
  defaultAgeGroup,
  defaultGender,
  defaultCommentTone,
}: ProfileFormProps) {
  const [state, formAction] = useActionState(saveProfile, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label
          htmlFor="nickname"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          ニックネーム <span className="text-rose-500">*</span>
        </label>
        <input
          id="nickname"
          name="nickname"
          type="text"
          maxLength={30}
          defaultValue={defaultNickname ?? ""}
          placeholder="例: たてなおし太郎"
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
          required
        />
      </div>

      <div>
        <label
          htmlFor="age_group"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          年代
        </label>
        <select
          id="age_group"
          name="age_group"
          defaultValue={defaultAgeGroup ?? ""}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
        >
          <option value="">選択してください</option>
          {ageGroupOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="gender"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          性別
        </label>
        <select
          id="gender"
          name="gender"
          defaultValue={defaultGender ?? ""}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
        >
          <option value="">選択してください</option>
          {genderOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

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
          defaultValue={defaultCommentTone ?? "gentle"}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
        >
          {commentToneOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <p className="mt-2 text-xs leading-5 text-slate-500">
          皮肉多めを選ぶと、ホームのコメントが少しブラックユーモア寄りになります。
        </p>
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
