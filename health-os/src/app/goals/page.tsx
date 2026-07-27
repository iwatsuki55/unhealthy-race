import Link from "next/link";
import { Flag, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getCurrentUserId } from "@/core/application/current-user";
import type { GoalDto } from "@/modules/goals/domain";
import { goalRepository } from "@/modules/goals/infrastructure";

function formatLabel(value: string) {
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatDateRange(goal: GoalDto) {
  return `${goal.periodStart.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric"
  })} - ${goal.periodEnd.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  })}`;
}

function formatProgress(goal: GoalDto) {
  if (goal.currentValue === null) {
    return "No current value";
  }

  return `${goal.currentValue} / ${goal.targetValue} ${goal.targetUnit}`;
}

export default async function GoalsPage() {
  const userId = await getCurrentUserId();
  const goals = await goalRepository.listByUser(userId);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Goals</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal">Goal Management</h1>
        </div>
        <Button asChild>
          <Link href="/goals/new">
            <Plus className="h-4 w-4" aria-hidden="true" />
            New Goal
          </Link>
        </Button>
      </div>

      {goals.length === 0 ? (
        <section className="rounded-lg border border-border bg-card p-8">
          <Flag className="h-5 w-5 text-primary" aria-hidden="true" />
          <h2 className="mt-4 text-xl font-semibold tracking-normal">Set your first goal</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            Give today&apos;s training a direction with a running, strength, race, weight, or custom
            health goal.
          </p>
          <Button asChild className="mt-5">
            <Link href="/goals/new">Create the first goal</Link>
          </Button>
        </section>
      ) : (
        <section className="grid gap-3">
          {goals.map((goal) => (
            <Link
              className="grid gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary"
              href={`/goals/${goal.id}`}
              key={goal.id}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold tracking-normal">{goal.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatLabel(goal.module)} / {formatLabel(goal.goalType)}
                  </p>
                </div>
                <span className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground">
                  {formatLabel(goal.status)}
                </span>
              </div>
              <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
                <span>{formatProgress(goal)}</span>
                <span>{formatDateRange(goal)}</span>
                <span>
                  {goal.raceDate ? `Race ${goal.raceDate.toLocaleDateString()}` : "No race date"}
                </span>
              </div>
            </Link>
          ))}
        </section>
      )}
    </div>
  );
}
