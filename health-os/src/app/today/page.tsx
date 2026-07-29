import Link from "next/link";
import type { Route as NextRoute } from "next";
import {
  Dumbbell,
  Flag,
  MapIcon,
  NotebookPen,
  Route,
  Target,
  Upload,
  type LucideIcon
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/core/application/current-user";
import { metersToKilometersInput, secondsToDurationInput } from "@/lib/format";
import type {
  TodayGoalProgress,
  TodayHomeReadModel,
  TodayRecentActivity
} from "@/modules/today/application";
import { todayQuery } from "@/modules/today/application";

const primaryQuickActions: Array<{
  href: NextRoute;
  label: string;
  icon: LucideIcon;
}> = [
  { href: "/workout-import/new", label: "Import Workout", icon: Upload },
  { href: "/running/new", label: "Log Run", icon: Route },
  { href: "/strength/new", label: "Log Strength", icon: Dumbbell },
  { href: "/journal/new", label: "Add Journal Entry", icon: NotebookPen }
];

const secondaryQuickActions: Array<{
  href: NextRoute;
  label: string;
  icon: LucideIcon;
}> = [
  { href: "/routes/new", label: "New Route", icon: MapIcon },
  { href: "/goals/new", label: "New Goal", icon: Flag }
];

function formatGoalType(value: string) {
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric"
  });
}

function formatLongDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  });
}

function formatDistance(meters: number) {
  return `${metersToKilometersInput(meters)} km`;
}

function formatPace(secondsPerKm: number) {
  const minutes = Math.floor(secondsPerKm / 60);
  const seconds = secondsPerKm % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")} /km`;
}

function getFirstName(displayName: string) {
  return displayName.split(" ")[0] ?? displayName;
}

function getProgressLabel(progress: TodayGoalProgress | undefined) {
  if (!progress) {
    return "Progress not available";
  }

  if (!progress.canCalculate || progress.progressPercent === null) {
    return progress.currentValue === null
      ? `Target ${progress.targetValue}`
      : `${progress.currentValue} / ${progress.targetValue}`;
  }

  return `${progress.progressPercent}%`;
}

function ProgressBar({ progress }: { progress: TodayGoalProgress | undefined }) {
  const value = progress?.progressPercent ?? 0;
  const label = getProgressLabel(progress);

  return (
    <div
      aria-label={`Goal progress: ${label}`}
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={progress?.progressPercent ?? undefined}
      className="h-2 overflow-hidden rounded-full bg-muted"
      role="progressbar"
    >
      <div className="h-full rounded-full bg-primary" style={{ width: `${value}%` }} />
    </div>
  );
}

function SectionErrorNotice({ model, section }: { model: TodayHomeReadModel; section: string }) {
  const error = model.sectionErrors.find((item) => item.section === section);

  return error ? (
    <p className="rounded-md border border-border bg-muted px-3 py-2 text-sm text-muted-foreground">
      {error.message}
    </p>
  ) : null;
}

function EmptyState({
  title,
  body,
  href,
  label
}: {
  title: string;
  body: string;
  href: NextRoute;
  label: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h3 className="text-base font-semibold tracking-normal">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
      <Button asChild className="mt-4">
        <Link href={href}>{label}</Link>
      </Button>
    </div>
  );
}

function QuickActions() {
  return (
    <section aria-labelledby="quick-actions-title" className="grid gap-3">
      <h2 id="quick-actions-title" className="text-lg font-semibold tracking-normal">
        Quick logging
      </h2>
      <div className="grid gap-3 sm:grid-cols-4">
        {primaryQuickActions.map((action) => {
          const Icon = action.icon;

          return (
            <Button
              asChild
              className="h-12 justify-start"
              key={action.href}
              variant={action.href === "/workout-import/new" ? "default" : "outline"}
            >
              <Link href={action.href}>
                <Icon className="h-4 w-4" aria-hidden="true" />
                {action.label}
              </Link>
            </Button>
          );
        })}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {secondaryQuickActions.map((action) => {
          const Icon = action.icon;

          return (
            <Button asChild className="h-11 justify-start" key={action.href} variant="outline">
              <Link href={action.href}>
                <Icon className="h-4 w-4" aria-hidden="true" />
                {action.label}
              </Link>
            </Button>
          );
        })}
      </div>
    </section>
  );
}

function TodayFocus({ model }: { model: TodayHomeReadModel }) {
  const goal = model.focus.goal;
  const progress = model.focus.progress ?? undefined;

  return (
    <section
      aria-labelledby="today-focus-title"
      className="rounded-lg border border-primary bg-card p-5 shadow-sm"
    >
      <div className="flex items-center gap-2">
        <Target className="h-5 w-5 text-primary" aria-hidden="true" />
        <h2 id="today-focus-title" className="text-xl font-semibold tracking-normal">
          Today&apos;s Focus
        </h2>
      </div>

      {goal ? (
        <div className="mt-5 grid gap-4">
          <p className="text-sm font-medium text-muted-foreground">Current focus</p>
          <div>
            <h3 className="text-2xl font-semibold tracking-normal">{goal.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{formatGoalType(goal.goalType)}</p>
          </div>
          <ProgressBar progress={progress} />
          <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
            <span>Progress: {getProgressLabel(progress)}</span>
            <span>
              Target: {goal.targetValue} {goal.targetUnit}
            </span>
            <span>Ends: {formatLongDate(goal.periodEnd)}</span>
          </div>
          <Button asChild className="justify-self-start" variant="outline">
            <Link href={`/goals/${goal.id}`}>View goal</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-5">
          <EmptyState
            body="Create a goal to give Today a clear focus."
            href="/goals/new"
            label="Create a goal"
            title="No focus set yet"
          />
        </div>
      )}
    </section>
  );
}

function WeeklySummary({ model }: { model: TodayHomeReadModel }) {
  const summary = model.weeklyContext;
  const hasNoWeeklyActivity =
    summary.runCount === 0 && summary.strengthSessionCount === 0 && summary.journalEntryCount === 0;

  return (
    <section aria-labelledby="weekly-summary-title" className="grid gap-3">
      <div>
        <h2 id="weekly-summary-title" className="text-lg font-semibold tracking-normal">
          Weekly summary
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Monday week: {formatDate(summary.weekStart)} - {formatDate(summary.weekEnd)}
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Running distance</p>
          <p className="mt-2 text-xl font-semibold">
            {formatDistance(summary.runningDistanceMeters)}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Runs</p>
          <p className="mt-2 text-xl font-semibold">{summary.runCount}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Strength sessions</p>
          <p className="mt-2 text-xl font-semibold">{summary.strengthSessionCount}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Journal entries</p>
          <p className="mt-2 text-xl font-semibold">{summary.journalEntryCount}</p>
        </div>
      </div>
      {hasNoWeeklyActivity ? (
        <div className="grid gap-3 md:grid-cols-3">
          <EmptyState
            body="Log your first run to start building your training history."
            href="/running/new"
            label="Log run"
            title="No runs this week"
          />
          <EmptyState
            body="Add your first strength session."
            href="/strength/new"
            label="Log strength"
            title="No strength sessions this week"
          />
          <EmptyState
            body="Add a short note about how you feel today."
            href="/journal/new"
            label="Add journal entry"
            title="No journal entries this week"
          />
        </div>
      ) : null}
    </section>
  );
}

function ActivityIcon({ type }: { type: TodayRecentActivity["type"] }) {
  if (type === "run") {
    return <Route className="h-4 w-4 text-primary" aria-hidden="true" />;
  }

  if (type === "strength") {
    return <Dumbbell className="h-4 w-4 text-primary" aria-hidden="true" />;
  }

  return <NotebookPen className="h-4 w-4 text-primary" aria-hidden="true" />;
}

function ActivityDetails({ activity }: { activity: TodayRecentActivity }) {
  if (activity.run) {
    return (
      <>
        <span>{formatDistance(activity.run.distanceMeters)}</span>
        <span>{secondsToDurationInput(activity.run.durationSeconds)}</span>
        <span>{formatPace(activity.run.averagePaceSecondsPerKm)}</span>
        <span>
          {activity.run.averageHeartRate ? `${activity.run.averageHeartRate} bpm avg` : "No HR"}
        </span>
        <span>{activity.run.routeName ?? "No route"}</span>
      </>
    );
  }

  if (activity.strengthSession) {
    const setCount = activity.strengthSession.exercises.reduce(
      (total, exercise) => total + exercise.sets.length,
      0
    );

    return (
      <>
        <span>{formatGoalType(activity.strengthSession.workoutType)}</span>
        <span>{activity.strengthSession.exercises.length} exercises</span>
        <span>{setCount} sets</span>
        <span>
          {secondsToDurationInput(activity.strengthSession.durationSeconds) || "No duration"}
        </span>
      </>
    );
  }

  if (activity.journalEntry) {
    return (
      <>
        <span>{activity.journalEntry.body.slice(0, 90)}</span>
        {activity.journalEntry.moodRating ? (
          <span>Mood {activity.journalEntry.moodRating}/10</span>
        ) : null}
        {activity.journalEntry.fatigueRating ? (
          <span>Fatigue {activity.journalEntry.fatigueRating}/10</span>
        ) : null}
        {activity.journalEntry.recoveryRating ? (
          <span>Recovery {activity.journalEntry.recoveryRating}/10</span>
        ) : null}
      </>
    );
  }

  return null;
}

function RecentActivity({ model }: { model: TodayHomeReadModel }) {
  return (
    <section aria-labelledby="recent-activity-title" className="grid gap-3">
      <h2 id="recent-activity-title" className="text-lg font-semibold tracking-normal">
        Recent activity
      </h2>
      <SectionErrorNotice model={model} section="running" />
      <SectionErrorNotice model={model} section="strength" />
      <SectionErrorNotice model={model} section="journal" />
      <SectionErrorNotice model={model} section="routes" />
      {model.recentActivity.length > 0 ? (
        <div className="grid gap-3">
          {model.recentActivity.map((activity) => (
            <Link
              className="grid gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary"
              href={activity.href}
              key={`${activity.type}-${activity.id}`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <ActivityIcon type={activity.type} />
                  <h3 className="truncate text-base font-semibold tracking-normal">
                    {activity.type === "run"
                      ? "Run"
                      : activity.type === "strength"
                        ? "Strength"
                        : "Journal"}
                  </h3>
                </div>
                <span className="shrink-0 text-sm text-muted-foreground">
                  {formatDate(activity.date)}
                </span>
              </div>
              <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2 lg:grid-cols-5">
                <ActivityDetails activity={activity} />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          body="Log your first run, strength session, or journal entry to start building your daily history."
          href="/running/new"
          label="Log your first run"
          title="No recent activity yet"
        />
      )}
    </section>
  );
}

function ActiveGoals({ model }: { model: TodayHomeReadModel }) {
  const progressByGoalId = new Map(
    model.goalProgress.map((progress) => [progress.goalId, progress])
  );

  return (
    <section aria-labelledby="active-goals-title" className="grid gap-3">
      <h2 id="active-goals-title" className="text-lg font-semibold tracking-normal">
        Active goals
      </h2>
      <SectionErrorNotice model={model} section="goals" />
      {model.activeGoals.length > 0 ? (
        <div className="grid gap-3">
          {model.activeGoals.map((goal) => {
            const progress = progressByGoalId.get(goal.id);

            return (
              <Link
                className="grid gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary"
                href={`/goals/${goal.id}`}
                key={goal.id}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold tracking-normal">{goal.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatGoalType(goal.goalType)}
                    </p>
                  </div>
                  <span className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground">
                    {formatGoalType(goal.status)}
                  </span>
                </div>
                <ProgressBar progress={progress} />
                <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
                  <span>{getProgressLabel(progress)}</span>
                  <span>
                    Current {goal.currentValue ?? "not set"} {goal.targetUnit}
                  </span>
                  <span>
                    Target {goal.targetValue} {goal.targetUnit}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">Ends {formatDate(goal.periodEnd)}</p>
              </Link>
            );
          })}
        </div>
      ) : (
        <EmptyState
          body="Create a goal to give Today a clear focus."
          href="/goals/new"
          label="Create a goal"
          title="No active goals"
        />
      )}
    </section>
  );
}

function LatestJournal({ model }: { model: TodayHomeReadModel }) {
  const entry = model.latestJournalEntry;

  return (
    <section aria-labelledby="latest-journal-title" className="grid gap-3">
      <h2 id="latest-journal-title" className="text-lg font-semibold tracking-normal">
        Latest journal context
      </h2>
      <SectionErrorNotice model={model} section="journal" />
      {entry ? (
        <Link
          className="grid gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary"
          href={`/journal/${entry.id}`}
        >
          <div>
            <h3 className="text-base font-semibold tracking-normal">
              {formatLongDate(entry.entryDate)}
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {entry.body.length > 180 ? `${entry.body.slice(0, 180)}...` : entry.body}
            </p>
          </div>
          <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-4">
            {entry.moodRating ? <span>Mood {entry.moodRating}/10</span> : null}
            {entry.fatigueRating ? <span>Fatigue {entry.fatigueRating}/10</span> : null}
            {entry.recoveryRating ? <span>Recovery {entry.recoveryRating}/10</span> : null}
            {entry.workStressRating ? <span>Stress {entry.workStressRating}/10</span> : null}
          </div>
        </Link>
      ) : (
        <EmptyState
          body="Add a short note about how you feel today."
          href="/journal/new"
          label="Add journal entry"
          title="No journal entries yet"
        />
      )}
    </section>
  );
}

export default async function TodayPage() {
  const user = await getCurrentUser();
  const model = await todayQuery.getToday(user, new Date());

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Today</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal text-foreground">
            {model.greeting}, {getFirstName(model.user.displayName)}
          </h1>
          <p className="mt-2 text-lg text-foreground">{model.formattedDate}</p>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            Your training and health context for today.
          </p>
        </div>
        <QuickActions />
      </section>

      <TodayFocus model={model} />
      <WeeklySummary model={model} />

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <RecentActivity model={model} />
        <div className="grid content-start gap-6">
          <ActiveGoals model={model} />
          <LatestJournal model={model} />
        </div>
      </section>
    </div>
  );
}
