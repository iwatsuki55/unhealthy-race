"use client";

import { FormActions } from "@/components/forms/form-actions";
import { TextUnitInput } from "@/components/forms/manual-entry-inputs";
import { RequiredMark } from "@/components/ui/required-mark";
import { formatDateInputValue, todayDateInputValue } from "@/lib/format";
import type { JournalEntryDto } from "@/modules/journal/domain";

interface JournalEntryFormProps {
  action: (formData: FormData) => void | Promise<void>;
  cancelHref: `/journal` | `/journal/${string}`;
  entry?: JournalEntryDto;
  submitLabel: string;
}

const inputClass =
  "h-11 w-full rounded-md border border-input bg-background px-3 text-base outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring sm:text-sm";

const textareaClass =
  "min-h-32 w-full rounded-md border border-input bg-background px-3 py-3 text-base outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring sm:text-sm";

const labelClass = "grid gap-2 text-sm font-medium text-muted-foreground";

export function JournalEntryForm({
  action,
  cancelHref,
  entry,
  submitLabel
}: JournalEntryFormProps) {
  return (
    <form action={action} className="grid gap-7">
      <section className="grid gap-5 rounded-lg border border-border bg-card p-4 sm:p-5">
        <div className="grid gap-5 md:grid-cols-2">
          <label className={labelClass} htmlFor="journal-date">
            Date <RequiredMark />
            <input
              className={inputClass}
              id="journal-date"
              name="entryDate"
              required
              type="date"
              defaultValue={formatDateInputValue(entry?.entryDate) || todayDateInputValue()}
            />
          </label>

          <label className={labelClass} htmlFor="journal-tags">
            Tags
            <input
              className={inputClass}
              id="journal-tags"
              name="tags"
              placeholder="fatigue, sauna, alcohol"
              defaultValue={entry?.tags.join(", ") ?? ""}
            />
          </label>
        </div>

        <label className={labelClass} htmlFor="journal-body">
          Notes <RequiredMark />
          <textarea
            className={textareaClass}
            id="journal-body"
            name="body"
            placeholder="Fatigue, recovery, mood, work stress, alcohol, sauna..."
            required
            defaultValue={entry?.body ?? ""}
          />
        </label>
      </section>

      <details className="rounded-lg border border-border bg-card p-4 sm:p-5">
        <summary className="cursor-pointer text-sm font-semibold tracking-normal">
          Daily signals
        </summary>
        <div className="mt-5 grid gap-5 md:grid-cols-4">
          <label className={labelClass} htmlFor="journal-mood">
            Mood
            <TextUnitInput
              id="journal-mood"
              inputMode="numeric"
              max={10}
              min={1}
              name="moodRating"
              pattern="^([1-9]|10)$"
              placeholder="7"
              title="Use a 1-10 rating."
              unit="/10"
              defaultValue={entry?.moodRating?.toString() ?? ""}
            />
          </label>

          <label className={labelClass} htmlFor="journal-fatigue">
            Fatigue
            <TextUnitInput
              id="journal-fatigue"
              inputMode="numeric"
              max={10}
              min={1}
              name="fatigueRating"
              pattern="^([1-9]|10)$"
              placeholder="5"
              title="Use a 1-10 rating."
              unit="/10"
              defaultValue={entry?.fatigueRating?.toString() ?? ""}
            />
          </label>

          <label className={labelClass} htmlFor="journal-recovery">
            Recovery
            <TextUnitInput
              id="journal-recovery"
              inputMode="numeric"
              max={10}
              min={1}
              name="recoveryRating"
              pattern="^([1-9]|10)$"
              placeholder="8"
              title="Use a 1-10 rating."
              unit="/10"
              defaultValue={entry?.recoveryRating?.toString() ?? ""}
            />
          </label>

          <label className={labelClass} htmlFor="journal-work-stress">
            Work stress
            <TextUnitInput
              id="journal-work-stress"
              inputMode="numeric"
              max={10}
              min={1}
              name="workStressRating"
              pattern="^([1-9]|10)$"
              placeholder="6"
              title="Use a 1-10 rating."
              unit="/10"
              defaultValue={entry?.workStressRating?.toString() ?? ""}
            />
          </label>
        </div>
      </details>

      <section className="grid gap-5 rounded-lg border border-border bg-card p-4 sm:p-5 md:grid-cols-2">
        <label className={labelClass} htmlFor="journal-alcohol">
          Alcohol
          <textarea
            className={textareaClass}
            id="journal-alcohol"
            name="alcoholNote"
            placeholder="Beer, wine, amount, timing..."
            defaultValue={entry?.alcoholNote ?? ""}
          />
        </label>

        <label className={labelClass} htmlFor="journal-sauna">
          Sauna
          <textarea
            className={textareaClass}
            id="journal-sauna"
            name="saunaNote"
            placeholder="Rounds, temperature, how it felt..."
            defaultValue={entry?.saunaNote ?? ""}
          />
        </label>
      </section>

      <div>
        <FormActions cancelHref={cancelHref} submitLabel={submitLabel} />
      </div>
    </form>
  );
}
