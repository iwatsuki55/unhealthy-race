import Link from "next/link";
import { Plus, Route, Upload } from "lucide-react";

import { getCurrentUserId } from "@/core/application/current-user";
import { Button } from "@/components/ui/button";
import { formatDistance, formatPace, secondsToDurationInput } from "@/lib/format";
import { routeRepository } from "@/modules/routes/infrastructure";
import { getCardioActivityLabel } from "@/modules/cardio/domain";
import { cardioSessionRepository } from "@/modules/cardio/infrastructure";

function formatDuration(seconds: number) {
  return secondsToDurationInput(seconds);
}

export default async function CardioPage() {
  const userId = await getCurrentUserId();
  const [sessions, routes] = await Promise.all([
    cardioSessionRepository.listByUser(userId),
    routeRepository.listByUser(userId)
  ]);
  const routeNameById = new Map(routes.map((route) => [route.id, route.name]));

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Cardio</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal">Cardio Log</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/workout-import/new?type=cardio">
              <Upload className="h-4 w-4" aria-hidden="true" />
              Import Cardio
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/cardio/new">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Log Cardio
            </Link>
          </Button>
        </div>
      </div>

      {sessions.length === 0 ? (
        <section className="rounded-lg border border-border bg-card p-8">
          <Route className="h-5 w-5 text-primary" aria-hidden="true" />
          <h2 className="mt-4 text-xl font-semibold tracking-normal">
            Log your first cardio session
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            Capture the essentials first: activity type, date, and duration. Distance and route
            appear when they fit the activity.
          </p>
          <Button asChild className="mt-5">
            <Link href="/workout-import/new?type=cardio">Import the first cardio session</Link>
          </Button>
        </section>
      ) : (
        <section className="grid gap-3">
          {sessions.map((session) => (
            <Link
              className="grid gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary"
              href={`/cardio/${session.id}`}
              key={session.id}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold tracking-normal">
                    {getCardioActivityLabel(session.activityType)}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {session.runDate.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric"
                    })}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {session.routeId
                      ? (routeNameById.get(session.routeId) ?? "Unknown route")
                      : "No route"}
                  </p>
                </div>
                <span className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground">
                  RPE {session.perceivedEffort ?? "-"}
                </span>
              </div>
              <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-4">
                <span>{formatDistance(session.distanceMeters)}</span>
                <span>{formatDuration(session.durationSeconds)}</span>
                <span>{formatPace(session.averagePaceSecondsPerKm)}</span>
                <span>
                  {session.averageHeartRate ? `${session.averageHeartRate} bpm avg` : "No HR"}
                </span>
              </div>
            </Link>
          ))}
        </section>
      )}
    </div>
  );
}
