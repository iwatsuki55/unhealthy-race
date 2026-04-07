"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AuthFormState = {
  mode: "login" | "signup";
  error: string | null;
  success: string | null;
};

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function submitAuth(
  _: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const mode = getStringValue(formData, "mode") === "signup" ? "signup" : "login";
  const email = getStringValue(formData, "email");
  const password = getStringValue(formData, "password");
  const nextPath = getStringValue(formData, "next") || "/profile/setup";

  if (!email) {
    return {
      mode,
      error: "メールアドレスを入力してください。",
      success: null,
    };
  }

  if (!password || password.length < 8) {
    return {
      mode,
      error: "パスワードは8文字以上で入力してください。",
      success: null,
    };
  }

  const supabase = await createSupabaseServerClient();

  if (mode === "signup") {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return {
        mode,
        error: error.message,
        success: null,
      };
    }

    if (!data.session) {
      return {
        mode,
        error: null,
        success:
          "確認メールを送信しました。Supabase でメール確認を有効にしている場合は、メール内リンクを開いてからログインしてください。",
      };
    }
  }

  if (mode === "login") {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return {
        mode,
        error: error.message,
        success: null,
      };
    }
  }

  redirect(nextPath);
}
