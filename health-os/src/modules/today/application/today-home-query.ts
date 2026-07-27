import type { RouteRepository } from "@/modules/routes/application";
import type { GoalRepository } from "@/modules/goals/application";
import type { JournalEntryRepository } from "@/modules/journal/application";
import type { RunRepository } from "@/modules/running/application";
import type { StrengthSessionRepository } from "@/modules/strength/application";
import { goalRepository } from "@/modules/goals/infrastructure";
import { journalEntryRepository } from "@/modules/journal/infrastructure";
import { routeRepository } from "@/modules/routes/infrastructure";
import { runRepository } from "@/modules/running/infrastructure";
import { strengthSessionRepository } from "@/modules/strength/infrastructure";

import { aggregateTodayData } from "./today-aggregation";
import type { TodayQuery } from "./today-query";
import type {
  TodayHomeReadModel,
  TodayRecentActivity,
  TodaySectionError,
  TodayUserContext
} from "./today-read-model";

interface TodayHomeQueryDependencies {
  runs: RunRepository;
  strengthSessions: StrengthSessionRepository;
  goals: GoalRepository;
  journalEntries: JournalEntryRepository;
  routes: RouteRepository;
}

function sectionError(section: TodaySectionError["section"]): TodaySectionError {
  return {
    section,
    message: "This section could not be loaded."
  };
}

async function safeQuery<T>(
  section: TodaySectionError["section"],
  query: () => Promise<T>,
  fallback: T,
  errors: TodaySectionError[]
) {
  try {
    return await query();
  } catch (error) {
    console.error(`Today ${section} query failed.`, error);
    errors.push(sectionError(section));

    return fallback;
  }
}

function getGreeting(date: Date, timezone: string) {
  const hour = Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "numeric",
      hourCycle: "h23"
    }).format(date)
  );

  if (hour < 12) {
    return "Good morning";
  }

  if (hour < 18) {
    return "Good afternoon";
  }

  return "Good evening";
}

function getFormattedDate(date: Date, timezone: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "long",
    month: "long",
    day: "numeric"
  }).format(date);
}

export class TodayHomeQuery implements TodayQuery {
  constructor(private readonly dependencies: TodayHomeQueryDependencies) {}

  async getToday(user: TodayUserContext, date: Date): Promise<TodayHomeReadModel> {
    const errors: TodaySectionError[] = [];
    const [runs, strengthSessions, activeGoals, journalEntries, routes] = await Promise.all([
      safeQuery("running", () => this.dependencies.runs.listByUser(user.id), [], errors),
      safeQuery(
        "strength",
        () => this.dependencies.strengthSessions.listByUser(user.id),
        [],
        errors
      ),
      safeQuery("goals", () => this.dependencies.goals.listActiveByUser(user.id), [], errors),
      safeQuery("journal", () => this.dependencies.journalEntries.listByUser(user.id), [], errors),
      safeQuery("routes", () => this.dependencies.routes.listByUser(user.id), [], errors)
    ]);
    const aggregation = aggregateTodayData({
      user,
      date,
      goals: activeGoals,
      runs,
      strengthSessions,
      journalEntries,
      routes
    });
    const recentActivity = aggregation.recentActivity.map((activity) => {
      if (activity.type === "run") {
        return {
          id: activity.id,
          type: activity.type,
          date: activity.date,
          href: activity.href as `/running/${string}`,
          run: {
            ...activity.item,
            routeName: activity.routeName
          }
        };
      }

      if (activity.type === "strength") {
        return {
          id: activity.id,
          type: activity.type,
          date: activity.date,
          href: activity.href as `/strength/${string}`,
          strengthSession: activity.item
        };
      }

      return {
        id: activity.id,
        type: activity.type,
        date: activity.date,
        href: activity.href as `/journal/${string}`,
        journalEntry: activity.item
      };
    }) satisfies TodayRecentActivity[];

    return {
      date,
      user,
      greeting: getGreeting(date, user.timezone),
      formattedDate: getFormattedDate(date, user.timezone),
      focus: {
        goal: aggregation.focusGoal,
        progress: aggregation.focusProgress
      },
      activeGoals: activeGoals.slice(0, 3),
      goalProgress: aggregation.goalProgress,
      recentRuns: runs.slice(0, 5),
      recentStrengthSessions: strengthSessions.slice(0, 5),
      recentJournalEntries: journalEntries.slice(0, 5),
      recentActivity,
      latestJournalEntry: aggregation.latestJournalEntry,
      weeklyContext: aggregation.weeklyContext,
      sectionErrors: errors
    };
  }
}

export const todayQuery = new TodayHomeQuery({
  runs: runRepository,
  strengthSessions: strengthSessionRepository,
  goals: goalRepository,
  journalEntries: journalEntryRepository,
  routes: routeRepository
});
