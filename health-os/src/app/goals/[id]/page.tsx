import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";

import { deleteGoalAction } from "@/app/goals/actions";
import { ConfirmDeleteButton } from "@/components/forms/confirm-delete-button";
import { Button } from "@/components/ui/button";
import { getCurrentUserId } from "@/core/application/current-user";
import { metersToKilometersInput, secondsToDurationInput } from "@/lib/format";
import type { GoalDto } from "@/modules/goals/domain";
import { goalRepository } from "@/modules/goals/infrastructure";

interface GoalDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

function formatLabel(value: string) {
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatDate(date: Date | null) {
  return date
    ? date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric"
      })
    : "Not set";
}

function getProgressPercent(goal: GoalDto) {
  if (goal.currentValue === null) {
    return null;
  }

  return Math.max(0, Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100)));
}

export default async function GoalDetailPage({ params }: GoalDetailPageProps) {
  const { id } = await params;
  const userId = await getCurrentUserId();
  const goal = await goalRepository.findById(userId, id);

  if (!goal) {
    notFound();
  }

  const deleteGoal = deleteGoalAction.bind(null, goal.id);
  const progressPercent = getProgressPercent(goal);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link className="text-sm text-muted-foreground hover:text-foreground" href="/goals">
            Back to goals
          </Link>
          <h1 className="mt-2 text-2xl font-semibold tracking-normal">{goal.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatLabel(goal.module)} / {formatLabel(goal.goalType)} / {formatLabel(goal.status)}
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href={`/goals/${goal.id}/edit`}>
            <Pencil className="h-4 w-4" aria-hidden="true" />
            Edit
          </Link>
        </Button>
      </div>

      <section className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">Progress</p>
            <p className="mt-2 text-lg font-semibold">
              {goal.currentValue === null
                ? `Target ${goal.targetValue} ${goal.targetUnit}`
                : `${goal.currentValue} / ${goal.targetValue} ${goal.targetUnit}`}
            </p>
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            {progressPercent === null ? "Not started" : `${progressPercent}%`}
          </p>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${progressPercent ?? 0}%` }}
          />
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Start</p>
          <p className="mt-2 text-lg font-semibold">{formatDate(goal.periodStart)}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">End</p>
          <p className="mt-2 text-lg font-semibold">{formatDate(goal.periodEnd)}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Race date</p>
          <p className="mt-2 text-lg font-semibold">{formatDate(goal.raceDate)}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Race distance</p>
          <p className="mt-2 text-lg font-semibold">
            {goal.raceDistanceMeters
              ? `${metersToKilometersInput(goal.raceDistanceMeters)} km`
              : "Not set"}
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold tracking-normal">Race target time</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {secondsToDurationInput(goal.raceTargetTimeSeconds) || "Not set"}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold tracking-normal">Notes</h2>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
            {goal.notes || "No notes yet."}
          </p>
        </div>
      </section>

      <section className="rounded-lg border border-destructive bg-card p-4">
        <h2 className="text-sm font-semibold tracking-normal">Delete goal</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          This removes the manual goal record.
        </p>
        <form action={deleteGoal} className="mt-4">
          <ConfirmDeleteButton
            confirmMessage="Delete this goal? This cannot be undone."
            label="Delete goal"
          />
        </form>
      </section>
    </div>
  );
}
