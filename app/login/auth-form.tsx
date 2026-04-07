"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { submitAuth, type AuthFormState } from "@/app/login/actions";

type AuthFormProps = {
  nextPath: string;
};

const initialAuthFormState: AuthFormState = {
  mode: "login",
  error: null,
  success: null,
};

function SubmitButton({ mode }: { mode: AuthFormState["mode"] }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="w-full rounded-2xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-wait disabled:opacity-70"
      disabled={pending}
    >
      {pending
        ? "送信中..."
        : mode === "signup"
          ? "新規登録する"
          : "ログインする"}
    </button>
  );
}

export function AuthForm({ nextPath }: AuthFormProps) {
  const [state, formAction] = useActionState(submitAuth, initialAuthFormState);
  const [mode, setMode] = useState<AuthFormState["mode"]>(state.mode);

  useEffect(() => {
    setMode(state.mode);
  }, [state.mode]);

  return (
    <form action={formAction} className="mt-8 space-y-4">
      <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`rounded-2xl px-4 py-2 text-sm font-medium transition ${
            mode === "login"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500"
          }`}
        >
          ログイン
        </button>
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={`rounded-2xl px-4 py-2 text-sm font-medium transition ${
            mode === "signup"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500"
          }`}
        >
          新規登録
        </button>
      </div>

      <input type="hidden" name="mode" value={mode} />
      <input type="hidden" name="next" value={nextPath} />

      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          メールアドレス
        </label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
          required
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          パスワード
        </label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="8文字以上"
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          minLength={8}
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
          required
        />
      </div>

      {state.error ? (
        <p className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {state.error}
        </p>
      ) : null}

      {state.success ? (
        <p className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {state.success}
        </p>
      ) : null}

      <SubmitButton mode={mode} />
    </form>
  );
}
