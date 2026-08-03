import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, Pencil } from "lucide-react";

import { deleteRouteAction } from "@/app/routes/actions";
import { ConfirmDeleteButton } from "@/components/forms/confirm-delete-button";
import { getCurrentUserId } from "@/core/application/current-user";
import { Button } from "@/components/ui/button";
import { secondsToDurationInput } from "@/lib/format";
import { routeRepository } from "@/modules/routes/infrastructure";

interface RouteDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

function formatDistance(meters: number) {
  return `${(meters / 1000).toFixed(2)} km`;
}

function formatDuration(seconds: number | null) {
  return seconds ? secondsToDurationInput(seconds) : "No estimate";
}

export default async function RouteDetailPage({ params }: RouteDetailPageProps) {
  const { id } = await params;
  const userId = await getCurrentUserId();
  const route = await routeRepository.findById(userId, id);

  if (!route) {
    notFound();
  }

  const deleteRoute = deleteRouteAction.bind(null, route.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link className="text-sm text-muted-foreground hover:text-foreground" href="/routes">
            Back to routes
          </Link>
          <h1 className="mt-2 text-2xl font-semibold tracking-normal">{route.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {route.surfaceType} / {route.difficulty} / {route.isActive ? "active" : "inactive"}
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href={`/routes/${route.id}/edit`}>
            <Pencil className="h-4 w-4" aria-hidden="true" />
            Edit
          </Link>
        </Button>
      </div>

      <section className="grid gap-3 md:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Distance</p>
          <p className="mt-2 text-lg font-semibold">{formatDistance(route.distanceMeters)}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Estimated Time</p>
          <p className="mt-2 text-lg font-semibold">
            {formatDuration(route.estimatedDurationSeconds)}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Elevation</p>
          <p className="mt-2 text-lg font-semibold">
            {route.elevationGainMeters ? `${route.elevationGainMeters} m` : "Not set"}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Favorite</p>
          <p className="mt-2 text-lg font-semibold">{route.isFavorite ? "Yes" : "No"}</p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold tracking-normal">Description</h2>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
            {route.description || "No description yet."}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold tracking-normal">Notes</h2>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
            {route.notes || "No notes yet."}
          </p>
        </div>
      </section>

      {route.googleMapsUrl ? (
        <Button asChild variant="outline">
          <a href={route.googleMapsUrl} target="_blank" rel="noreferrer">
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
            Open in Google Maps
          </a>
        </Button>
      ) : null}

      <section className="rounded-lg border border-border bg-card p-4">
        <h2 className="text-sm font-semibold tracking-normal">Related cardio</h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Cardio Log is not implemented yet. Route-linked cardio sessions will appear here in a later
          milestone.
        </p>
      </section>

      <section className="rounded-lg border border-destructive bg-card p-4">
        <h2 className="text-sm font-semibold tracking-normal">Delete or deactivate route</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Unused routes are deleted. Routes with historical cardio sessions are deactivated to preserve your
          training history.
        </p>
        <form action={deleteRoute} className="mt-4">
          <ConfirmDeleteButton
            confirmMessage="Delete this route? If it has linked cardio sessions, it will be deactivated instead."
            label="Delete or deactivate route"
          />
        </form>
      </section>
    </div>
  );
}
