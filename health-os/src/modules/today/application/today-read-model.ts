import type { GoalDto, GoalProgressDto } from "@/modules/goals/domain";
import type { JournalEntryDto } from "@/modules/journal/domain";
import type { RunDto } from "@/modules/running/domain";
import type { StrengthSessionDto } from "@/modules/strength/domain";

export interface TodayWorkoutFocus {
  title: string;
  description: string;
}

export interface TodayWeeklyContext {
  runningDistanceMeters: number;
  runCount: number;
  strengthSessionCount: number;
}

export interface TodayHomeReadModel {
  date: Date;
  workoutFocus: TodayWorkoutFocus | null;
  activeGoals: GoalDto[];
  goalProgress: GoalProgressDto[];
  recentRuns: RunDto[];
  recentStrengthSessions: StrengthSessionDto[];
  latestJournalEntry: JournalEntryDto | null;
  weeklyContext: TodayWeeklyContext;
}
