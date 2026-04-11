import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const getProfileByUserId = cache(async (userId: string) => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, nickname, age_group, gender, comment_tone, created_at")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
});
