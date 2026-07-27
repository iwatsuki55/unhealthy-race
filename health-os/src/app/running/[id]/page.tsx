import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, Pencil } from "lucide-react";

import { deleteRunAction } from "@/app/running/actions";
import { ConfirmDeleteButton } from "@/components/forms/confirm-delete-button";
import { getCurrentUserId } from "@/core/application/current-user";
import { Button } from "@/components/ui/button";
import { secondsToDurationInput } from "@/lib/format";
import { routeRepository } from "@/modules/routes/infrastructure";
import { runRepository } from "@/modules/running/infrastructure";

interface RunDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

function formatDistance(meters: number) {
  return `${(meters / 1000).toFixed(2)} km`;
}

function formatDuration(seconds: number) {
  return secondsToDurationInput(seconds);
}

function formatPace(secondsPerKm: number) {
  const minutes = Math.floor(secondsPerKm / 60);
  const seconds = secondsPerKm % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")} / km`;
}

function formatOptional(value: number | string | null, suffix = "") {
  return value === null || value === "" ? "Not set" : `${value}${suffix}`;
}

export default async function RunDetailPage({ params }: RunDetailPageProps) {
  const { id } = await params;
  const userId = await getCurrentUserId();
  const run = await runRepository.findById(userId, id);

  if (!run) {
    notFound();
  }

  const route = run.routeId ? await routeRepository.findById(userId, run.routeId) : null;
  const deleteRun = deleteRunAction.bind(null, run.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link className="text-sm text-muted-foreground hover:text-foreground" href="/running">
            Back to running
          </Link>
          <h1 className="mt-2 text-2xl font-semibold tracking-normal">
            {run.runDate.toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric"
            })}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {route ? route.name : run.routeId ? "Unknown route" : "No route"}
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href={`/running/${run.id}/edit`}>
            <Pencil className="h-4 w-4" aria-hidden="true" />
            Edit
          </Link>
        </Button>
      </div>

      <section className="grid gap-3 md:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Distance</p>
          <p className="mt-2 text-lg font-semibold">{formatDistance(run.distanceMeters)}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Duration</p>
          <p className="mt-2 text-lg font-semibold">{formatDuration(run.durationSeconds)}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Pace</p>
          <p className="mt-2 text-lg font-semibold">{formatPace(run.averagePaceSecondsPerKm)}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Effort</p>
          <p className="mt-2 text-lg font-semibold">{run.perceivedEffort ?? "Not set"}</p>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Average HR</p>
          <p className="mt-2 text-base font-semibold">
            {formatOptional(run.averageHeartRate, " bpm")}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Maximum HR</p>
          <p className="mt-2 text-base font-semibold">
            {formatOptional(run.maximumHeartRate, " bpm")}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Cadence</p>
          <p className="mt-2 text-base font-semibold">
            {formatOptional(run.cadenceStepsPerMinute, " spm")}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Calories</p>
          <p className="mt-2 text-base font-semibold">{formatOptional(run.calories)}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Temperature</p>
          <p className="mt-2 text-base font-semibold">
            {formatOptional(run.temperatureCelsius, " °C")}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Humidity</p>
          <p className="mt-2 text-base font-semibold">{formatOptional(run.humidityPercent, "%")}</p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold tracking-normal">Shoes</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">{run.shoes || "Not set"}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold tracking-normal">Notes</h2>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
            {run.notes || "No notes yet."}
          </p>
        </div>
      </section>

      {run.screenshotAttachmentRef ? (
        <Button asChild variant="outline">
          <a href={run.screenshotAttachmentRef} target="_blank" rel="noreferrer">
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
            Open screenshot reference
          </a>
        </Button>
      ) : null}

      <section className="rounded-lg border border-destructive bg-card p-4">
        <h2 className="text-sm font-semibold tracking-normal">Delete run</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          This removes the manual running log.
        </p>
        <form action={deleteRun} className="mt-4">
          <ConfirmDeleteButton
            confirmMessage="Delete this run? This cannot be undone."
            label="Delete run"
          />
        </form>
      </section>
    </div>
  );
}
