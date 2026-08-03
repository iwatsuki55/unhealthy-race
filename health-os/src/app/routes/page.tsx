import Link from "next/link";
import { Map, Plus, Star } from "lucide-react";

import { getCurrentUserId } from "@/core/application/current-user";
import { Button } from "@/components/ui/button";
import { secondsToDurationInput } from "@/lib/format";
import { routeRepository } from "@/modules/routes/infrastructure";

function formatDistance(meters: number) {
  return `${(meters / 1000).toFixed(2)} km`;
}

function formatDuration(seconds: number | null) {
  return seconds ? secondsToDurationInput(seconds) : "No estimate";
}

export default async function RoutesPage() {
  const userId = await getCurrentUserId();
  const routes = await routeRepository.listByUser(userId);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Routes</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal">Route Management</h1>
        </div>
        <Button asChild>
          <Link href="/routes/new">
            <Plus className="h-4 w-4" aria-hidden="true" />
            New Route
          </Link>
        </Button>
      </div>

      {routes.length === 0 ? (
        <section className="rounded-lg border border-border bg-card p-8">
          <Map className="h-5 w-5 text-primary" aria-hidden="true" />
          <h2 className="mt-4 text-xl font-semibold tracking-normal">Start with a favorite loop</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            Save your usual routes once, then attach them to future cardio sessions with a single choice.
          </p>
          <Button asChild className="mt-5">
            <Link href="/routes/new">Create the first route</Link>
          </Button>
        </section>
      ) : (
        <section className="grid gap-3">
          {routes.map((route) => (
            <Link
              className="grid gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary"
              href={`/routes/${route.id}`}
              key={route.id}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-semibold tracking-normal">{route.name}</h2>
                    {route.isFavorite ? (
                      <Star className="h-4 w-4 fill-secondary text-secondary" aria-hidden="true" />
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {route.surfaceType} / {route.difficulty}
                  </p>
                </div>
                <span className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground">
                  {route.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
                <span>{formatDistance(route.distanceMeters)}</span>
                <span>{formatDuration(route.estimatedDurationSeconds)}</span>
                <span>
                  {route.elevationGainMeters
                    ? `${route.elevationGainMeters} m gain`
                    : "No elevation"}
                </span>
              </div>
            </Link>
          ))}
        </section>
      )}
    </div>
  );
}
