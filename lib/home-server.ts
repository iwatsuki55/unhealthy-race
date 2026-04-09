import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ActionLogWithAction = {
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

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function toSingleAction(
  action: ActionLogWithAction["actions"],
): { name: string; type: "healthy" | "unhealthy"; category: string } | null {
  if (!action) {
    return null;
  }

  return Array.isArray(action) ? action[0] ?? null : action;
}

function buildHomeComment({
  todayDelta,
  yesterdayDelta,
  weekLogs,
}: {
  todayDelta: number;
  yesterdayDelta: number;
  weekLogs: Array<
    ActionLogWithAction & {
      action: { name: string; type: "healthy" | "unhealthy"; category: string } | null;
    }
  >;
}) {
  const lateNightCount = weekLogs.filter((log) => log.action?.name === "夜更かし").length;
  if (lateNightCount >= 2) {
    return "今週は夜更かしが多めです";
  }

  const drinkingPoints = weekLogs
    .filter((log) => log.action?.category === "drinking" && log.point_value > 0)
    .reduce((sum, log) => sum + log.point_value, 0);
  if (drinkingPoints >= 15) {
    return "飲酒ポイントが高めです";
  }

  if (todayDelta < yesterdayDelta) {
    return "昨日より回復しています";
  }

  if (todayDelta <= 0) {
    return "少しずつ整ってきています";
  }

  return "今日はここから立て直そう";
}

export const getHomeSummary = cache(async (userId: string) => {
  const supabase = await createSupabaseServerClient();
  const now = new Date();
  const todayStart = startOfDay(now);
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 6);

  const [
    { data: allLogs, error: allLogsError },
    { data: todayLogs, error: todayLogsError },
    { data: yesterdayLogs, error: yesterdayLogsError },
    { data: recentLogs, error: recentLogsError },
    { data: weekLogs, error: weekLogsError },
  ] = await Promise.all([
    supabase.from("action_logs").select("point_value").eq("user_id", userId),
    supabase
      .from("action_logs")
      .select("point_value")
      .eq("user_id", userId)
      .gte("action_at", todayStart.toISOString())
      .lt("action_at", tomorrowStart.toISOString()),
    supabase
      .from("action_logs")
      .select("point_value")
      .eq("user_id", userId)
      .gte("action_at", yesterdayStart.toISOString())
      .lt("action_at", todayStart.toISOString()),
    supabase
      .from("action_logs")
      .select("id, point_value, memo, action_at, actions(name, type, category)")
      .eq("user_id", userId)
      .order("action_at", { ascending: false })
      .limit(5),
    supabase
      .from("action_logs")
      .select("id, point_value, memo, action_at, actions(name, type, category)")
      .eq("user_id", userId)
      .gte("action_at", weekStart.toISOString())
      .order("action_at", { ascending: false }),
  ]);

  if (
    allLogsError ||
    todayLogsError ||
    yesterdayLogsError ||
    recentLogsError ||
    weekLogsError
  ) {
    throw (
      allLogsError ||
      todayLogsError ||
      yesterdayLogsError ||
      recentLogsError ||
      weekLogsError
    );
  }

  const currentPoints = Math.max(
    0,
    (allLogs ?? []).reduce((sum, log) => sum + log.point_value, 0),
  );
  const todayDelta = (todayLogs ?? []).reduce((sum, log) => sum + log.point_value, 0);
  const yesterdayDelta = (yesterdayLogs ?? []).reduce(
    (sum, log) => sum + log.point_value,
    0,
  );

  const normalizedRecentLogs = ((recentLogs ?? []) as ActionLogWithAction[]).map((log) => ({
    ...log,
    action: toSingleAction(log.actions),
  }));
  const normalizedWeekLogs = ((weekLogs ?? []) as ActionLogWithAction[]).map((log) => ({
    ...log,
    action: toSingleAction(log.actions),
  }));
  const weekTrend = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + index);

    const dayStart = startOfDay(date);
    const nextDay = new Date(dayStart);
    nextDay.setDate(nextDay.getDate() + 1);

    const dailyDelta = normalizedWeekLogs
      .filter((log) => {
        const actionAt = new Date(log.action_at);
        return actionAt >= dayStart && actionAt < nextDay;
      })
      .reduce((sum, log) => sum + log.point_value, 0);

    return {
      label: dayStart.toLocaleDateString("ja-JP", { weekday: "short" }),
      dateLabel: dayStart.toLocaleDateString("ja-JP", {
        month: "numeric",
        day: "numeric",
      }),
      delta: dailyDelta,
    };
  });

  return {
    currentPoints,
    todayDelta,
    recentLogs: normalizedRecentLogs,
    weekTrend,
    comment: buildHomeComment({
      todayDelta,
      yesterdayDelta,
      weekLogs: normalizedWeekLogs,
    }),
  };
});
