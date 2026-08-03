import {
  calculateGoalProgress,
  getMondayWeekRange,
  isInRange,
  sortRecentActivity
} from "./today-calculations.ts";

export interface TodayAggregationUser {
  id: string;
  displayName: string;
  timezone: string;
}

export interface TodayAggregationGoal {
  id: string;
  module: string;
  goalType: string;
  currentValue: number | null;
  targetValue: number;
  periodEnd: Date;
  status: string;
}

export interface TodayAggregationCardioSession {
  id: string;
  routeId: string | null;
  activityType: string;
  runDate: Date;
  startedAt: Date | null;
  distanceMeters: number | null;
}

export interface TodayAggregationStrengthSession {
  id: string;
  sessionDate: Date;
  startedAt: Date | null;
}

export interface TodayAggregationJournalEntry {
  id: string;
  entryDate: Date;
}

export interface TodayAggregationRoute {
  id: string;
  name: string;
}

export interface TodayAggregationInput<
  TGoal extends TodayAggregationGoal,
  TCardioSession extends TodayAggregationCardioSession,
  TStrength extends TodayAggregationStrengthSession,
  TJournal extends TodayAggregationJournalEntry,
  TRoute extends TodayAggregationRoute
> {
  user: TodayAggregationUser;
  date: Date;
  goals: TGoal[];
  cardioSessions: TCardioSession[];
  strengthSessions: TStrength[];
  journalEntries: TJournal[];
  routes: TRoute[];
}

function getActivityDate(date: Date, fallback: Date | null) {
  return fallback ?? date;
}

function chooseFocusGoal<TGoal extends TodayAggregationGoal>(activeGoals: TGoal[]) {
  const priorityGoals = activeGoals
    .filter(
      (goal) =>
        goal.module === "race" ||
        goal.goalType === "pace" ||
        goal.goalType === "race_completion" ||
        goal.goalType === "race_time"
    )
    .toSorted((a, b) => a.periodEnd.getTime() - b.periodEnd.getTime());

  return (
    priorityGoals[0] ??
    activeGoals.toSorted((a, b) => a.periodEnd.getTime() - b.periodEnd.getTime())[0] ??
    null
  );
}

export function getTodayEmptyStates(input: {
  activeGoalCount: number;
  recentActivityCount: number;
  journalEntryCount: number;
}) {
  return {
    focus: input.activeGoalCount === 0,
    activeGoals: input.activeGoalCount === 0,
    recentActivity: input.recentActivityCount === 0,
    latestJournal: input.journalEntryCount === 0
  };
}

export function aggregateTodayData<
  TGoal extends TodayAggregationGoal,
  TCardioSession extends TodayAggregationCardioSession,
  TStrength extends TodayAggregationStrengthSession,
  TJournal extends TodayAggregationJournalEntry,
  TRoute extends TodayAggregationRoute
>(input: TodayAggregationInput<TGoal, TCardioSession, TStrength, TJournal, TRoute>) {
  const routeNameById = new Map(input.routes.map((route) => [route.id, route.name]));
  const weekRange = getMondayWeekRange(input.date, input.user.timezone);
  const weeklyCardioSessions = input.cardioSessions.filter((session) =>
    isInRange(getActivityDate(session.runDate, session.startedAt), weekRange)
  );
  const weeklyStrengthSessions = input.strengthSessions.filter((session) =>
    isInRange(getActivityDate(session.sessionDate, session.startedAt), weekRange)
  );
  const weeklyJournalEntries = input.journalEntries.filter((entry) =>
    isInRange(entry.entryDate, weekRange)
  );
  const goalProgress = input.goals.map((goal) =>
    calculateGoalProgress({
      goalId: goal.id,
      goalType: goal.goalType,
      currentValue: goal.currentValue,
      targetValue: goal.targetValue
    })
  );
  const progressByGoalId = new Map(goalProgress.map((progress) => [progress.goalId, progress]));
  const focusGoal = chooseFocusGoal(input.goals);
  const recentActivity = sortRecentActivity([
    ...input.cardioSessions.map((session) => ({
      id: session.id,
      type: "cardio" as const,
      date: getActivityDate(session.runDate, session.startedAt),
      href: `/cardio/${session.id}`,
      item: session,
      routeName: session.routeId ? (routeNameById.get(session.routeId) ?? "Unknown route") : null
    })),
    ...input.strengthSessions.map((session) => ({
      id: session.id,
      type: "strength" as const,
      date: getActivityDate(session.sessionDate, session.startedAt),
      href: `/strength/${session.id}`,
      item: session
    })),
    ...input.journalEntries.map((entry) => ({
      id: entry.id,
      type: "journal" as const,
      date: entry.entryDate,
      href: `/journal/${entry.id}`,
      item: entry
    }))
  ]).slice(0, 5);

  return {
    focusGoal,
    focusProgress: focusGoal ? (progressByGoalId.get(focusGoal.id) ?? null) : null,
    goalProgress,
    recentActivity,
    latestJournalEntry: input.journalEntries[0] ?? null,
    weeklyContext: {
      weekStart: weekRange.start,
      weekEnd: weekRange.end,
      cardioDistanceMeters: weeklyCardioSessions.reduce(
        (total, session) => total + (session.distanceMeters ?? 0),
        0
      ),
      cardioSessionCount: weeklyCardioSessions.length,
      strengthSessionCount: weeklyStrengthSessions.length,
      journalEntryCount: weeklyJournalEntries.length
    },
    emptyStates: getTodayEmptyStates({
      activeGoalCount: input.goals.length,
      recentActivityCount: recentActivity.length,
      journalEntryCount: input.journalEntries.length
    })
  };
}
