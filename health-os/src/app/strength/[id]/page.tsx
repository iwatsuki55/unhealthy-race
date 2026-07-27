import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";

import { deleteStrengthSessionAction } from "@/app/strength/actions";
import { Button } from "@/components/ui/button";
import { getCurrentUserId } from "@/core/application/current-user";
import { secondsToDurationInput } from "@/lib/format";
import { strengthSessionRepository } from "@/modules/strength/infrastructure";

interface StrengthDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

function formatWorkoutType(value: string) {
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatEquipmentType(value: string) {
  return formatWorkoutType(value);
}

function formatDuration(seconds: number | null) {
  return seconds ? secondsToDurationInput(seconds) : "Not set";
}

function formatOptional(value: number | string | null, suffix = "") {
  return value === null || value === "" ? "Not set" : `${value}${suffix}`;
}

export default async function StrengthDetailPage({ params }: StrengthDetailPageProps) {
  const { id } = await params;
  const userId = await getCurrentUserId();
  const session = await strengthSessionRepository.findById(userId, id);

  if (!session) {
    notFound();
  }

  const deleteSession = deleteStrengthSessionAction.bind(null, session.id);
  const setCount = session.exercises.reduce((total, exercise) => total + exercise.sets.length, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link className="text-sm text-muted-foreground hover:text-foreground" href="/strength">
            Back to strength
          </Link>
          <h1 className="mt-2 text-2xl font-semibold tracking-normal">
            {session.sessionDate.toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric"
            })}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatWorkoutType(session.workoutType)}
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href={`/strength/${session.id}/edit`}>
            <Pencil className="h-4 w-4" aria-hidden="true" />
            Edit
          </Link>
        </Button>
      </div>

      <section className="grid gap-3 md:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Workout type</p>
          <p className="mt-2 text-lg font-semibold">{formatWorkoutType(session.workoutType)}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Duration</p>
          <p className="mt-2 text-lg font-semibold">{formatDuration(session.durationSeconds)}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Exercises</p>
          <p className="mt-2 text-lg font-semibold">{session.exercises.length}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Sets</p>
          <p className="mt-2 text-lg font-semibold">{setCount}</p>
        </div>
      </section>

      <section className="grid gap-4">
        {session.exercises.map((exercise) => (
          <div className="rounded-lg border border-border bg-card p-4" key={exercise.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold tracking-normal">{exercise.exerciseName}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatEquipmentType(exercise.equipmentType)}
                </p>
              </div>
              <span className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground">
                {exercise.sets.length} sets
              </span>
            </div>

            <div className="mt-4 grid gap-2">
              {exercise.sets.map((set) => (
                <div
                  className="grid gap-2 rounded-md border border-border bg-background p-3 text-sm text-muted-foreground sm:grid-cols-5"
                  key={set.id}
                >
                  <span className="font-semibold text-foreground">Set {set.setOrder}</span>
                  <span>{set.reps} reps</span>
                  <span>{formatOptional(set.weightValue, ` ${set.weightUnit}`)}</span>
                  <span>{formatOptional(set.perceivedEffort, " RPE")}</span>
                  <span>{formatOptional(set.restSeconds, " sec rest")}</span>
                  {set.notes ? (
                    <p className="whitespace-pre-wrap leading-6 sm:col-span-5">{set.notes}</p>
                  ) : null}
                </div>
              ))}
            </div>

            {exercise.notes ? (
              <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                {exercise.notes}
              </p>
            ) : null}
          </div>
        ))}
      </section>

      <section className="rounded-lg border border-border bg-card p-4">
        <h2 className="text-sm font-semibold tracking-normal">Session notes</h2>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
          {session.notes || "No notes yet."}
        </p>
      </section>

      <section className="rounded-lg border border-destructive bg-card p-4">
        <h2 className="text-sm font-semibold tracking-normal">Delete session</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          This removes the manual strength training log.
        </p>
        <form action={deleteSession} className="mt-4">
          <Button type="submit" variant="outline">
            Delete session
          </Button>
        </form>
      </section>
    </div>
  );
}
