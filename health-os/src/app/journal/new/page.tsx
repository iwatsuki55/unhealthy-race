import Link from "next/link";

import { createJournalEntryAction } from "@/app/journal/actions";
import { JournalEntryForm } from "@/modules/journal/presentation/journal-entry-form";

export default function NewJournalEntryPage() {
  return (
    <div className="space-y-8">
      <div>
        <Link className="text-sm text-muted-foreground hover:text-foreground" href="/journal">
          Back to journal
        </Link>
        <h1 className="mt-3 text-3xl font-semibold tracking-normal">New Journal Entry</h1>
      </div>

      <section>
        <JournalEntryForm action={createJournalEntryAction} submitLabel="Save entry" />
      </section>
    </div>
  );
}
