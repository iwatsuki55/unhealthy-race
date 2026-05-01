import { createSupabaseServerClient } from "@/lib/supabase/server";

export type PracticeSessionPayload = {
  lessonSlug: string;
  lessonTitle: string;
  mode: "speaking" | "reading" | "roleplay";
  averageScore: number;
  completedCount: number;
  totalCount: number;
  reviewItemCount: number;
  summary: string;
};

export async function saveMedicalEnglishPracticeSessionForCurrentUser(
  session: PracticeSessionPayload,
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

  const { error } = await supabase.from("medical_english_practice_sessions").insert({
    user_id: user.id,
    lesson_slug: session.lessonSlug,
    lesson_title: session.lessonTitle,
    mode: session.mode,
    average_score: session.averageScore,
    completed_count: session.completedCount,
    total_count: session.totalCount,
    review_item_count: session.reviewItemCount,
    summary: session.summary,
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
