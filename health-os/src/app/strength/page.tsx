import Link from "next/link";
import { Dumbbell, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getCurrentUserId } from "@/core/application/current-user";
import { secondsToDurationInput } from "@/lib/format";
import { strengthSessionRepository } from "@/modules/strength/infrastructure";

function formatWorkoutType(value: string) {
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatDuration(seconds: number | null) {
  return seconds ? secondsToDurationInput(seconds) : "No duration";
}

export default async function StrengthPage() {
  const userId = await getCurrentUserId();
  const sessions = await strengthSessionRepository.listByUser(userId);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Strength</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal">Strength Training Log</h1>
        </div>
        <Button asChild>
          <Link href="/strength/new">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Log Session
          </Link>
        </Button>
      </div>

      {sessions.length === 0 ? (
        <section className="rounded-lg border border-border bg-card p-8">
          <Dumbbell className="h-5 w-5 text-primary" aria-hidden="true" />
          <h2 className="mt-4 text-xl font-semibold tracking-normal">Log your first lift</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            Start with workout type, exercises, sets, reps, and weights. Keep it simple, then add
            notes when they help.
          </p>
          <Button asChild className="mt-5">
            <Link href="/strength/new">Log the first session</Link>
          </Button>
        </section>
      ) : (
        <section className="grid gap-3">
          {sessions.map((session) => {
            const setCount = session.exercises.reduce(
              (total, exercise) => total + exercise.sets.length,
              0
            );

            return (
              <Link
                className="grid gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary"
                href={`/strength/${session.id}`}
                key={session.id}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold tracking-normal">
                      {session.sessionDate.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatWorkoutType(session.workoutType)}
                    </p>
                  </div>
                  <span className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground">
                    {session.location ?? "No location"}
                  </span>
                </div>
                <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
                  <span>{session.exercises.length} exercises</span>
                  <span>{setCount} sets</span>
                  <span>{formatDuration(session.durationSeconds)}</span>
                </div>
              </Link>
            );
          })}
        </section>
      )}
    </div>
  );
}
