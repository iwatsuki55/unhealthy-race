import assert from "node:assert/strict";
import test from "node:test";

import {
  calculateGoalProgress,
  getMondayWeekRange,
  sortRecentActivity
} from "./today-calculations.ts";
import { aggregateTodayData, getTodayEmptyStates } from "./today-aggregation.ts";

test("getMondayWeekRange returns a Monday-start week in the user timezone", () => {
  const range = getMondayWeekRange(new Date("2026-07-27T03:00:00.000Z"), "Asia/Tokyo");

  assert.equal(range.start.toISOString(), "2026-07-26T15:00:00.000Z");
  assert.equal(range.end.toISOString(), "2026-08-02T15:00:00.000Z");
});

test("sortRecentActivity orders items by date descending", () => {
  const sorted = sortRecentActivity([
    { id: "old", date: new Date("2026-07-20T00:00:00.000Z") },
    { id: "new", date: new Date("2026-07-27T00:00:00.000Z") },
    { id: "middle", date: new Date("2026-07-25T00:00:00.000Z") }
  ]);

  assert.deepEqual(
    sorted.map((item) => item.id),
    ["new", "middle", "old"]
  );
});

test("calculateGoalProgress handles more-is-better goals", () => {
  const progress = calculateGoalProgress({
    goalId: "running-distance",
    goalType: "running_distance",
    currentValue: 40,
    targetValue: 100
  });

  assert.equal(progress.direction, "more_is_better");
  assert.equal(progress.progressPercent, 40);
  assert.equal(progress.canCalculate, true);
});

test("calculateGoalProgress handles less-is-better goals", () => {
  const progress = calculateGoalProgress({
    goalId: "pace",
    goalType: "pace",
    currentValue: 360,
    targetValue: 300
  });

  assert.equal(progress.direction, "less_is_better");
  assert.equal(progress.progressPercent, 83);
  assert.equal(progress.canCalculate, true);
});

test("calculateGoalProgress avoids invented percentages for manual goals", () => {
  const progress = calculateGoalProgress({
    goalId: "custom",
    goalType: "custom_health",
    currentValue: 2,
    targetValue: 5
  });

  assert.equal(progress.direction, "manual");
  assert.equal(progress.progressPercent, null);
  assert.equal(progress.canCalculate, false);
});

test("getTodayEmptyStates identifies empty sections", () => {
  assert.deepEqual(
    getTodayEmptyStates({
      activeGoalCount: 0,
      recentActivityCount: 0,
      journalEntryCount: 0
    }),
    {
      focus: true,
      activeGoals: true,
      recentActivity: true,
      latestJournal: true
    }
  );
});

test("aggregateTodayData combines weekly summary, focus, activity, and journal context", () => {
  const result = aggregateTodayData({
    user: {
      id: "user-1",
      displayName: "Hidetaka",
      timezone: "Asia/Tokyo"
    },
    date: new Date("2026-07-27T03:00:00.000Z"),
    goals: [
      {
        id: "goal-1",
        module: "running",
        goalType: "running_distance",
        currentValue: 25,
        targetValue: 100,
        periodEnd: new Date("2026-08-31T00:00:00.000Z"),
        status: "active"
      },
      {
        id: "goal-2",
        module: "race",
        goalType: "race_time",
        currentValue: 3600,
        targetValue: 3300,
        periodEnd: new Date("2026-09-15T00:00:00.000Z"),
        status: "active"
      }
    ],
    runs: [
      {
        id: "run-1",
        routeId: "route-1",
        runDate: new Date("2026-07-27T00:00:00.000Z"),
        startedAt: null,
        distanceMeters: 6000
      }
    ],
    strengthSessions: [
      {
        id: "strength-1",
        sessionDate: new Date("2026-07-28T00:00:00.000Z"),
        startedAt: null
      }
    ],
    journalEntries: [
      {
        id: "journal-1",
        entryDate: new Date("2026-07-29T00:00:00.000Z")
      }
    ],
    routes: [
      {
        id: "route-1",
        name: "River Loop"
      }
    ]
  });

  assert.equal(result.focusGoal?.id, "goal-2");
  assert.equal(result.weeklyContext.runningDistanceMeters, 6000);
  assert.equal(result.weeklyContext.runCount, 1);
  assert.equal(result.weeklyContext.strengthSessionCount, 1);
  assert.equal(result.weeklyContext.journalEntryCount, 1);
  assert.deepEqual(
    result.recentActivity.map((item) => item.type),
    ["journal", "strength", "run"]
  );
  assert.equal(result.latestJournalEntry?.id, "journal-1");
});
