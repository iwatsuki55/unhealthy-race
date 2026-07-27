import Link from "next/link";
import { NotebookPen, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getCurrentUserId } from "@/core/application/current-user";
import type { JournalEntryDto } from "@/modules/journal/domain";
import { journalEntryRepository } from "@/modules/journal/infrastructure";

function formatDate(entry: JournalEntryDto) {
  return entry.entryDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function formatRating(label: string, value: number | null) {
  return `${label} ${value ?? "-"}/10`;
}

function getExcerpt(body: string) {
  return body.length > 140 ? `${body.slice(0, 140)}...` : body;
}

export default async function JournalPage() {
  const userId = await getCurrentUserId();
  const entries = await journalEntryRepository.listByUser(userId);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Journal</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal">Daily Journal</h1>
        </div>
        <Button asChild>
          <Link href="/journal/new">
            <Plus className="h-4 w-4" aria-hidden="true" />
            New Entry
          </Link>
        </Button>
      </div>

      {entries.length === 0 ? (
        <section className="rounded-lg border border-border bg-card p-8">
          <NotebookPen className="h-5 w-5 text-primary" aria-hidden="true" />
          <h2 className="mt-4 text-xl font-semibold tracking-normal">Write today&apos;s note</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            Capture fatigue, recovery, mood, work stress, alcohol, sauna, or anything that may
            explain how your body feels.
          </p>
          <Button asChild className="mt-5">
            <Link href="/journal/new">Write the first entry</Link>
          </Button>
        </section>
      ) : (
        <section className="grid gap-3">
          {entries.map((entry) => (
            <Link
              className="grid gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary"
              href={`/journal/${entry.id}`}
              key={entry.id}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold tracking-normal">{formatDate(entry)}</h2>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {getExcerpt(entry.body)}
                  </p>
                </div>
                <span className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground">
                  {entry.tags.length > 0 ? entry.tags.slice(0, 2).join(", ") : "No tags"}
                </span>
              </div>
              <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-4">
                <span>{formatRating("Mood", entry.moodRating)}</span>
                <span>{formatRating("Fatigue", entry.fatigueRating)}</span>
                <span>{formatRating("Recovery", entry.recoveryRating)}</span>
                <span>{formatRating("Stress", entry.workStressRating)}</span>
              </div>
            </Link>
          ))}
        </section>
      )}
    </div>
  );
}
