import type { PrototypeReviewItem } from "@/lib/medical-english-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type MedicalEnglishReviewRow = {
  lesson_slug: string;
  lesson_title: string;
  mode: PrototypeReviewItem["mode"];
  reason: string;
  recommended_action: string;
  next_review_window: string;
};

export async function getMedicalEnglishReviewItemsForCurrentUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      user: null,
      items: [] as PrototypeReviewItem[],
    };
  }

  const { data, error } = await supabase
    .from("medical_english_review_items")
    .select(
      "lesson_slug, lesson_title, mode, reason, recommended_action, next_review_window",
    )
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) {
    return {
      user,
      items: [] as PrototypeReviewItem[],
    };
  }

  const items = (data as MedicalEnglishReviewRow[]).map((row) => ({
    lessonSlug: row.lesson_slug,
    lessonTitle: row.lesson_title,
    mode: row.mode,
    reason: row.reason,
    recommendedAction: row.recommended_action,
    nextReviewWindow: row.next_review_window,
  })) as PrototypeReviewItem[];

  return {
    user,
    items,
  };
}

export async function saveMedicalEnglishReviewItemsForCurrentUser(
  items: PrototypeReviewItem[],
) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false as const,
      reason: "unauthenticated" as const,
    };
  }

  const payload = items.map((item) => ({
    user_id: user.id,
    lesson_slug: item.lessonSlug,
    lesson_title: item.lessonTitle,
    mode: item.mode,
    reason: item.reason,
    recommended_action: item.recommendedAction,
    next_review_window: item.nextReviewWindow,
  }));

  const { error } = await supabase
    .from("medical_english_review_items")
    .upsert(payload, {
      onConflict: "user_id,lesson_slug,mode,reason",
    });

  if (error) {
    return {
      ok: false as const,
      reason: "database_error" as const,
    };
  }

  return {
    ok: true as const,
  };
}
