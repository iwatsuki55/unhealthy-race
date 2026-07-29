import Link from "next/link";
import { Plus, Route, Upload } from "lucide-react";

import { getCurrentUserId } from "@/core/application/current-user";
import { Button } from "@/components/ui/button";
import { secondsToDurationInput } from "@/lib/format";
import { routeRepository } from "@/modules/routes/infrastructure";
import { runRepository } from "@/modules/running/infrastructure";

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

export default async function RunningPage() {
  const userId = await getCurrentUserId();
  const [runs, routes] = await Promise.all([
    runRepository.listByUser(userId),
    routeRepository.listByUser(userId)
  ]);
  const routeNameById = new Map(routes.map((route) => [route.id, route.name]));

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Running</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal">Running Log</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/workout-import/new?type=running">
              <Upload className="h-4 w-4" aria-hidden="true" />
              Import Run
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/running/new">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Log Run
            </Link>
          </Button>
        </div>
      </div>

      {runs.length === 0 ? (
        <section className="rounded-lg border border-border bg-card p-8">
          <Route className="h-5 w-5 text-primary" aria-hidden="true" />
          <h2 className="mt-4 text-xl font-semibold tracking-normal">Log your first run</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            Capture the essentials first: date, distance, duration, and route. Extra details can
            wait until they matter.
          </p>
          <Button asChild className="mt-5">
            <Link href="/workout-import/new?type=running">Import the first run</Link>
          </Button>
        </section>
      ) : (
        <section className="grid gap-3">
          {runs.map((run) => (
            <Link
              className="grid gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary"
              href={`/running/${run.id}`}
              key={run.id}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold tracking-normal">
                    {run.runDate.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric"
                    })}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {run.routeId ? (routeNameById.get(run.routeId) ?? "Unknown route") : "No route"}
                  </p>
                </div>
                <span className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground">
                  RPE {run.perceivedEffort ?? "-"}
                </span>
              </div>
              <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-4">
                <span>{formatDistance(run.distanceMeters)}</span>
                <span>{formatDuration(run.durationSeconds)}</span>
                <span>{formatPace(run.averagePaceSecondsPerKm)}</span>
                <span>{run.averageHeartRate ? `${run.averageHeartRate} bpm avg` : "No HR"}</span>
              </div>
            </Link>
          ))}
        </section>
      )}
    </div>
  );
}
