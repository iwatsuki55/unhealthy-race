import type { EntityId, Timestamped, UserOwned } from "@/core/shared";

export interface JournalEntry extends Timestamped, UserOwned {
  id: EntityId;
  entryDate: Date;
  moodRating: number | null;
  fatigueRating: number | null;
  recoveryRating: number | null;
  workStressRating: number | null;
  alcoholNote: string | null;
  saunaNote: string | null;
  tags: string[];
  body: string;
}
