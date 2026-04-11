"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { commentToneOptions } from "@/lib/profile-options";
import { createRaceForUser } from "@/lib/race-server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type StartRaceFormState = {
  error: string | null;
};

export type CommentToneFormState = {
  error: string | null;
};

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getPositiveIntValue(formData: FormData, key: string) {
  const value = formData.get(key);
  if (typeof value !== "string") {
    return null;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export async function startNewRace(
  _: StartRaceFormState,
  formData: FormData,
): Promise<StartRaceFormState> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const raceName = getStringValue(formData, "race_name");
  const durationDays = getPositiveIntValue(formData, "duration_days");
  const allowedDurations = new Set([7, 14, 30]);

  if (!raceName) {
    return {
      error: "新しいレース名を入力してください。",
    };
  }

  if (raceName.length > 40) {
    return {
      error: "レース名は40文字以内で入力してください。",
    };
  }

  if (!durationDays || !allowedDurations.has(durationDays)) {
    return {
      error: "レース期間を選択してください。",
    };
  }

  await createRaceForUser({
    userId: user.id,
    name: raceName,
    archiveCurrent: true,
    durationDays,
  });

  revalidatePath("/home");
  revalidatePath("/actions/new");
  revalidatePath("/history");
  redirect("/home?race_started=1");
}

export async function updateCommentTone(
  _: CommentToneFormState,
  formData: FormData,
): Promise<CommentToneFormState> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const commentTone = getStringValue(formData, "comment_tone");
  const validCommentToneValues = new Set(
    commentToneOptions.map((option) => option.value),
  );

  if (
    !commentTone ||
    !validCommentToneValues.has(
      commentTone as (typeof commentToneOptions)[number]["value"],
    )
  ) {
    return {
      error: "コメントトーンを選択してください。",
    };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ comment_tone: commentTone })
    .eq("id", user.id);

  if (error) {
    return {
      error: "コメントトーンの更新に失敗しました。もう一度お試しください。",
    };
  }

  revalidatePath("/home");
  redirect("/home?tone_updated=1");
}
