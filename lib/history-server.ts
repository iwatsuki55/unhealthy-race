import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type HistoryRow = {
  id: string;
  point_value: number;
  memo: string | null;
  action_at: string;
  actions:
    | {
        name: string;
        type: "healthy" | "unhealthy";
        category: string;
      }
    | {
        name: string;
        type: "healthy" | "unhealthy";
        category: string;
      }[]
    | null;
};

function toSingleAction(
  action: HistoryRow["actions"],
): { name: string; type: "healthy" | "unhealthy"; category: string } | null {
  if (!action) {
    return null;
  }

  return Array.isArray(action) ? action[0] ?? null : action;
}

export const getHistoryLogs = cache(async (userId: string, raceId: string) => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("action_logs")
    .select("id, point_value, memo, action_at, actions(name, type, category)")
    .eq("user_id", userId)
    .eq("race_id", raceId)
    .order("action_at", { ascending: false });

  if (error) {
    throw error;
  }

  return ((data ?? []) as HistoryRow[]).map((log) => ({
    ...log,
    action: toSingleAction(log.actions),
  }));
});
