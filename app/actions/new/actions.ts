"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  calculateEffectivePointValue,
  MAX_HEALTHY_REDUCTION_PER_DAY,
  MAX_SAME_ACTION_PER_DAY,
} from "@/lib/point-rules";
import { getOrCreateCurrentRace } from "@/lib/race-server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ActionLogFormState = {
  error: string | null;
};

type ActionLogRow = {
  point_value: number;
};

function getTodayRange() {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return {
    startIso: start.toISOString(),
    endIso: end.toISOString(),
  };
}

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function saveActionLog(
  _: ActionLogFormState,
  formData: FormData,
): Promise<ActionLogFormState> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const currentRace = await getOrCreateCurrentRace(user.id);

  const actionId = getStringValue(formData, "action_id");
  const memo = getStringValue(formData, "memo");

  if (!actionId) {
    return {
      error: "行動を選択してください。",
    };
  }

  if (memo.length > 200) {
    return {
      error: "メモは200文字以内で入力してください。",
    };
  }

  const { data: action, error: actionError } = await supabase
    .from("actions")
    .select("id, point_value, is_active, type")
    .eq("id", actionId)
    .maybeSingle();

  if (actionError || !action || !action.is_active) {
    return {
      error: "選択した行動が見つかりません。画面を再読み込みしてお試しください。",
    };
  }

  const { startIso, endIso } = getTodayRange();

  const [{ count: sameActionCount, error: sameActionCountError }, { data: todayLogs, error: todayLogsError }, { data: allLogs, error: allLogsError }] =
    await Promise.all([
      supabase
        .from("action_logs")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("race_id", currentRace.id)
        .eq("action_id", action.id)
        .gte("action_at", startIso)
        .lt("action_at", endIso),
      supabase
        .from("action_logs")
        .select("point_value")
        .eq("user_id", user.id)
        .eq("race_id", currentRace.id)
        .gte("action_at", startIso)
        .lt("action_at", endIso),
      supabase
        .from("action_logs")
        .select("point_value")
        .eq("user_id", user.id)
        .eq("race_id", currentRace.id),
    ]);

  if (sameActionCountError || todayLogsError || allLogsError) {
    return {
      error: "ポイント計算に必要なデータ取得に失敗しました。もう一度お試しください。",
    };
  }

  if ((sameActionCount ?? 0) >= MAX_SAME_ACTION_PER_DAY) {
    return {
      error: "同じ行動は1日3回まで登録できます。明日以降にもう一度お試しください。",
    };
  }

  const healthyReductionUsedToday = (todayLogs as ActionLogRow[] | null)?.reduce(
    (sum, log) => (log.point_value < 0 ? sum + Math.abs(log.point_value) : sum),
    0,
  ) ?? 0;
  const currentTotalPointsRaw = (allLogs as ActionLogRow[] | null)?.reduce(
    (sum, log) => sum + log.point_value,
    0,
  ) ?? 0;
  const currentTotalPoints = Math.max(0, currentTotalPointsRaw);

  const effectivePointValue = calculateEffectivePointValue({
    currentTotalPoints,
    actionPointValue: action.point_value,
    healthyReductionUsedToday,
  });

  if (
    action.type === "healthy" &&
    effectivePointValue === 0 &&
    healthyReductionUsedToday >= MAX_HEALTHY_REDUCTION_PER_DAY
  ) {
    return {
      error: `健康行動による本日の減算は上限の-${MAX_HEALTHY_REDUCTION_PER_DAY}ptに達しています。`,
    };
  }

  if (action.type === "healthy" && effectivePointValue === 0 && currentTotalPoints <= 0) {
    return {
      error: "現在ポイントが0のため、これ以上は減算できません。",
    };
  }

  const { error } = await supabase.from("action_logs").insert({
    race_id: currentRace.id,
    user_id: user.id,
    action_id: action.id,
    point_value: effectivePointValue,
    memo: memo || null,
  });

  if (error) {
    return {
      error:
        "行動の保存に失敗しました。SQL を適用済みか確認して、もう一度お試しください。",
    };
  }

  revalidatePath("/actions/new");
  revalidatePath("/home");
  revalidatePath("/history");
  redirect("/home?action_saved=1");
}
