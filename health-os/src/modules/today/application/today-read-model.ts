import type { GoalDto, GoalProgressDto } from "@/modules/goals/domain";
import type { JournalEntryDto } from "@/modules/journal/domain";
import type { RunDto } from "@/modules/running/domain";
import type { StrengthSessionDto } from "@/modules/strength/domain";

export type TodayActivityType = "run" | "strength" | "journal";
export type TodaySectionKey = "running" | "strength" | "goals" | "journal" | "routes";

export interface TodayUserContext {
  id: string;
  displayName: string;
  timezone: string;
}

export interface TodayGoalProgress extends GoalProgressDto {
  progressPercent: number | null;
  direction: "more_is_better" | "less_is_better" | "manual";
  canCalculate: boolean;
}

export interface TodayFocus {
  goal: GoalDto | null;
  progress: TodayGoalProgress | null;
}

export interface TodayRecentActivity {
  id: string;
  type: TodayActivityType;
  date: Date;
  href: `/running/${string}` | `/strength/${string}` | `/journal/${string}`;
  run?: RunDto & {
    routeName: string | null;
  };
  strengthSession?: StrengthSessionDto;
  journalEntry?: JournalEntryDto;
}

export interface TodayWeeklyContext {
  weekStart: Date;
  weekEnd: Date;
  runningDistanceMeters: number;
  runCount: number;
  strengthSessionCount: number;
  journalEntryCount: number;
}

export interface TodaySectionError {
  section: TodaySectionKey;
  message: string;
}

export interface TodayHomeReadModel {
  date: Date;
  user: TodayUserContext;
  greeting: string;
  formattedDate: string;
  focus: TodayFocus;
  activeGoals: GoalDto[];
  goalProgress: TodayGoalProgress[];
  recentRuns: RunDto[];
  recentStrengthSessions: StrengthSessionDto[];
  recentJournalEntries: JournalEntryDto[];
  recentActivity: TodayRecentActivity[];
  latestJournalEntry: JournalEntryDto | null;
  weeklyContext: TodayWeeklyContext;
  sectionErrors: TodaySectionError[];
}
