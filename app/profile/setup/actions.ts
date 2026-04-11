"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  ageGroupOptions,
  commentToneOptions,
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
  const commentTone = getStringValue(formData, "comment_tone") || "gentle";

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
  const validCommentToneValues = new Set(
    commentToneOptions.map((option) => option.value),
  );

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

  if (
    commentTone &&
    !validCommentToneValues.has(
      commentTone as (typeof commentToneOptions)[number]["value"],
    )
  ) {
    return {
      error: "コメントトーンの値が不正です。",
    };
  }

  const profilePayload = {
    id: user.id,
    nickname,
    age_group: ageGroup || null,
    gender: gender || null,
    comment_tone: commentTone,
  };

  const { data: updatedProfile, error: updateError } = await supabase
    .from("profiles")
    .update(profilePayload)
    .eq("id", user.id)
    .select("id")
    .maybeSingle();

  if (updateError) {
    return {
      error:
        "プロフィールの保存に失敗しました。SQL を適用済みか確認して、もう一度お試しください。",
    };
  }

  if (!updatedProfile) {
    const { error: insertError } = await supabase.from("profiles").insert(profilePayload);

    if (insertError) {
      return {
        error:
          "プロフィールの保存に失敗しました。SQL を適用済みか確認して、もう一度お試しください。",
      };
    }
  }

  revalidatePath("/profile/setup");
  redirect("/home");
}
