import Link from "next/link";
import { notFound } from "next/navigation";

import { updateJournalEntryAction } from "@/app/journal/actions";
import { getCurrentUserId } from "@/core/application/current-user";
import { journalEntryRepository } from "@/modules/journal/infrastructure";
import { JournalEntryForm } from "@/modules/journal/presentation/journal-entry-form";

interface EditJournalEntryPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditJournalEntryPage({ params }: EditJournalEntryPageProps) {
  const { id } = await params;
  const userId = await getCurrentUserId();
  const entry = await journalEntryRepository.findById(userId, id);

  if (!entry) {
    notFound();
  }

  const updateEntry = updateJournalEntryAction.bind(null, entry.id);

  return (
    <div className="space-y-8">
      <div>
        <Link
          className="text-sm text-muted-foreground hover:text-foreground"
          href={`/journal/${entry.id}`}
        >
          Back to entry
        </Link>
        <h1 className="mt-3 text-3xl font-semibold tracking-normal">Edit Journal Entry</h1>
      </div>

      <section>
        <JournalEntryForm
          action={updateEntry}
          cancelHref={`/journal/${entry.id}`}
          entry={entry}
          submitLabel="Save entry"
        />
      </section>
    </div>
  );
}
