import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, Pencil } from "lucide-react";

import { deleteCardioSessionAction } from "@/app/cardio/actions";
import { ConfirmDeleteButton } from "@/components/forms/confirm-delete-button";
import { getCurrentUserId } from "@/core/application/current-user";
import { Button } from "@/components/ui/button";
import { formatDistance, formatPace, secondsToDurationInput } from "@/lib/format";
import { getCardioActivityConfig, getCardioActivityLabel } from "@/modules/cardio/domain";
import { cardioSessionRepository } from "@/modules/cardio/infrastructure";
import { routeRepository } from "@/modules/routes/infrastructure";

interface CardioDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

function formatDuration(seconds: number) {
  return secondsToDurationInput(seconds);
}

function formatOptional(value: number | string | null, suffix = "") {
  return value === null || value === "" ? "Not set" : `${value}${suffix}`;
}

export default async function CardioDetailPage({ params }: CardioDetailPageProps) {
  const { id } = await params;
  const userId = await getCurrentUserId();
  const session = await cardioSessionRepository.findById(userId, id);

  if (!session) {
    notFound();
  }

  const config = getCardioActivityConfig(session.activityType);
  const route = session.routeId ? await routeRepository.findById(userId, session.routeId) : null;
  const deleteSession = deleteCardioSessionAction.bind(null, session.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link className="text-sm text-muted-foreground hover:text-foreground" href="/cardio">
            Back to cardio
          </Link>
          <h1 className="mt-2 text-2xl font-semibold tracking-normal">
            {getCardioActivityLabel(session.activityType)}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {session.runDate.toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric"
            })}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {route ? route.name : session.routeId ? "Unknown route" : "No route"}
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href={`/cardio/${session.id}/edit`}>
            <Pencil className="h-4 w-4" aria-hidden="true" />
            Edit
          </Link>
        </Button>
      </div>

      <section className="grid gap-3 md:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Distance</p>
          <p className="mt-2 text-lg font-semibold">{formatDistance(session.distanceMeters)}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Duration</p>
          <p className="mt-2 text-lg font-semibold">{formatDuration(session.durationSeconds)}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Pace</p>
          <p className="mt-2 text-lg font-semibold">
            {config.showsPace ? formatPace(session.averagePaceSecondsPerKm) : "Not shown"}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Effort</p>
          <p className="mt-2 text-lg font-semibold">{session.perceivedEffort ?? "Not set"}</p>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Average HR</p>
          <p className="mt-2 text-base font-semibold">
            {formatOptional(session.averageHeartRate, " bpm")}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Maximum HR</p>
          <p className="mt-2 text-base font-semibold">
            {formatOptional(session.maximumHeartRate, " bpm")}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Cadence</p>
          <p className="mt-2 text-base font-semibold">
            {config.supportsCadence
              ? formatOptional(session.cadenceStepsPerMinute, " spm")
              : "Not shown"}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Calories</p>
          <p className="mt-2 text-base font-semibold">{formatOptional(session.calories)}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Temperature</p>
          <p className="mt-2 text-base font-semibold">
            {formatOptional(session.temperatureCelsius, " °C")}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Humidity</p>
          <p className="mt-2 text-base font-semibold">
            {formatOptional(session.humidityPercent, "%")}
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold tracking-normal">Shoes</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {session.shoes || "Not set"}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold tracking-normal">Notes</h2>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
            {session.notes || "No notes yet."}
          </p>
        </div>
      </section>

      {session.screenshotAttachmentRef ? (
        <Button asChild variant="outline">
          <a href={session.screenshotAttachmentRef} target="_blank" rel="noreferrer">
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
            Open screenshot reference
          </a>
        </Button>
      ) : null}

      <section className="rounded-lg border border-destructive bg-card p-4">
        <h2 className="text-sm font-semibold tracking-normal">Delete cardio</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          This removes the manual cardio log.
        </p>
        <form action={deleteSession} className="mt-4">
          <ConfirmDeleteButton
            confirmMessage="Delete this cardio session? This cannot be undone."
            label="Delete cardio"
          />
        </form>
      </section>
    </div>
  );
}
