import { z } from "zod";

import { dateStringSchema, nonEmptyStringSchema, ratingSchema } from "@/core/shared";

export const journalTagSchema = z.string().trim().min(1);

export const journalEntrySchema = z.object({
  id: nonEmptyStringSchema,
  userId: nonEmptyStringSchema,
  entryDate: z.date(),
  moodRating: ratingSchema.nullable(),
  fatigueRating: ratingSchema.nullable(),
  recoveryRating: ratingSchema.nullable(),
  workStressRating: ratingSchema.nullable(),
  alcoholNote: z.string().trim().nullable(),
  saunaNote: z.string().trim().nullable(),
  tags: z.array(journalTagSchema),
  body: nonEmptyStringSchema,
  createdAt: z.date(),
  updatedAt: z.date()
});

export const createJournalEntryInputSchema = z.object({
  entryDate: dateStringSchema,
  moodRating: ratingSchema.optional(),
  fatigueRating: ratingSchema.optional(),
  recoveryRating: ratingSchema.optional(),
  workStressRating: ratingSchema.optional(),
  alcoholNote: z.string().trim().optional(),
  saunaNote: z.string().trim().optional(),
  tags: z.array(journalTagSchema).default([]),
  body: nonEmptyStringSchema
});

export const updateJournalEntryInputSchema = createJournalEntryInputSchema.partial();

export type JournalEntryDto = z.infer<typeof journalEntrySchema>;
export type CreateJournalEntryInput = z.infer<typeof createJournalEntryInputSchema>;
export type UpdateJournalEntryInput = z.infer<typeof updateJournalEntryInputSchema>;
