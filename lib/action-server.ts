import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ActionMaster = {
  id: string;
  name: string;
  type: "healthy" | "unhealthy";
  category: string;
  point_value: number;
};

export const getActiveActions = cache(async () => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("actions")
    .select("id, name, type, category, point_value")
    .eq("is_active", true)
    .order("type", { ascending: false })
    .order("point_value", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as ActionMaster[];
});

