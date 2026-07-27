import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";

import { deleteJournalEntryAction } from "@/app/journal/actions";
import { Button } from "@/components/ui/button";
import { getCurrentUserId } from "@/core/application/current-user";
import { journalEntryRepository } from "@/modules/journal/infrastructure";

interface JournalEntryDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  });
}

function formatRating(value: number | null) {
  return value === null ? "Not set" : `${value}/10`;
}

export default async function JournalEntryDetailPage({ params }: JournalEntryDetailPageProps) {
  const { id } = await params;
  const userId = await getCurrentUserId();
  const entry = await journalEntryRepository.findById(userId, id);

  if (!entry) {
    notFound();
  }

  const deleteEntry = deleteJournalEntryAction.bind(null, entry.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link className="text-sm text-muted-foreground hover:text-foreground" href="/journal">
            Back to journal
          </Link>
          <h1 className="mt-2 text-2xl font-semibold tracking-normal">
            {formatDate(entry.entryDate)}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {entry.tags.length > 0 ? entry.tags.join(", ") : "No tags"}
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href={`/journal/${entry.id}/edit`}>
            <Pencil className="h-4 w-4" aria-hidden="true" />
            Edit
          </Link>
        </Button>
      </div>

      <section className="grid gap-3 md:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Mood</p>
          <p className="mt-2 text-lg font-semibold">{formatRating(entry.moodRating)}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Fatigue</p>
          <p className="mt-2 text-lg font-semibold">{formatRating(entry.fatigueRating)}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Recovery</p>
          <p className="mt-2 text-lg font-semibold">{formatRating(entry.recoveryRating)}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Work stress</p>
          <p className="mt-2 text-lg font-semibold">{formatRating(entry.workStressRating)}</p>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-4">
        <h2 className="text-sm font-semibold tracking-normal">Notes</h2>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
          {entry.body}
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold tracking-normal">Alcohol</h2>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
            {entry.alcoholNote || "Not set"}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold tracking-normal">Sauna</h2>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
            {entry.saunaNote || "Not set"}
          </p>
        </div>
      </section>

      <section className="rounded-lg border border-destructive bg-card p-4">
        <h2 className="text-sm font-semibold tracking-normal">Delete entry</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          This removes the manual journal entry.
        </p>
        <form action={deleteEntry} className="mt-4">
          <Button type="submit" variant="outline">
            Delete entry
          </Button>
        </form>
      </section>
    </div>
  );
}
