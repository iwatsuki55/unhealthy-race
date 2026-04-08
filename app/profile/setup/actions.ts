"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  ageGroupOptions,
  genderOptions,
  type ProfileFormState,
} from "@/lib/profile-options";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function saveProfile(
  _: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const nickname = getStringValue(formData, "nickname");
  const ageGroup = getStringValue(formData, "age_group");
  const gender = getStringValue(formData, "gender");

  if (!nickname) {
    return {
      error: "ニックネームを入力してください。",
    };
  }

  if (nickname.length > 30) {
    return {
      error: "ニックネームは30文字以内で入力してください。",
    };
  }

  const validAgeGroupValues = new Set(ageGroupOptions.map((option) => option.value));
  const validGenderValues = new Set(genderOptions.map((option) => option.value));

  if (ageGroup && !validAgeGroupValues.has(ageGroup as (typeof ageGroupOptions)[number]["value"])) {
    return {
      error: "年代の値が不正です。",
    };
  }

  if (gender && !validGenderValues.has(gender as (typeof genderOptions)[number]["value"])) {
    return {
      error: "性別の値が不正です。",
    };
  }

  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      nickname,
      age_group: ageGroup || null,
      gender: gender || null,
    },
    {
      onConflict: "id",
    },
  );

  if (error) {
    return {
      error:
        "プロフィールの保存に失敗しました。SQL を適用済みか確認して、もう一度お試しください。",
    };
  }

  revalidatePath("/profile/setup");
  redirect("/home");
}
