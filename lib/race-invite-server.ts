import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type RaceInvite = {
  id: string;
  code: string;
  relationship_type: "friend" | "rival";
  created_at: string;
};

export async function createRaceInvite({
  raceId,
  userId,
  relationshipType,
}: {
  raceId: string;
  userId: string;
  relationshipType: "friend" | "rival";
}) {
  const supabase = await createSupabaseServerClient();
  const code = crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase();

  const { data, error } = await supabase
    .from("race_invites")
    .insert({
      race_id: raceId,
      created_by: userId,
      code,
      relationship_type: relationshipType,
      status: "active",
    })
    .select("id, code, relationship_type, created_at")
    .single();

  if (error || !data) {
    throw error ?? new Error("Failed to create race invite.");
  }

  return data as RaceInvite;
}

export const getRaceInvites = cache(async (raceId: string, userId: string) => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("race_invites")
    .select("id, code, relationship_type, created_at")
    .eq("race_id", raceId)
    .eq("created_by", userId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    throw error;
  }

  return (data ?? []) as RaceInvite[];
});

