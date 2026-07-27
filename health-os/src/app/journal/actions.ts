"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentUserId } from "@/core/application/current-user";
import type { CreateJournalEntryInput, UpdateJournalEntryInput } from "@/modules/journal/domain";
import { createJournalEntryInputSchema } from "@/modules/journal/domain";
import { journalEntryRepository } from "@/modules/journal/infrastructure";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function getNumber(formData: FormData, key: string) {
  const value = getString(formData, key);

  if (!value) {
    return undefined;
  }

  const numberValue = Number(value);

  return Number.isFinite(numberValue) ? numberValue : undefined;
}

function getTags(formData: FormData) {
  const value = getString(formData, "tags");

  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function parseJournalFormData(formData: FormData): CreateJournalEntryInput {
  return createJournalEntryInputSchema.parse({
    entryDate: formData.get("entryDate"),
    moodRating: getNumber(formData, "moodRating"),
    fatigueRating: getNumber(formData, "fatigueRating"),
    recoveryRating: getNumber(formData, "recoveryRating"),
    workStressRating: getNumber(formData, "workStressRating"),
    alcoholNote: getString(formData, "alcoholNote"),
    saunaNote: getString(formData, "saunaNote"),
    tags: getTags(formData),
    body: formData.get("body")
  });
}

export async function createJournalEntryAction(formData: FormData) {
  const userId = await getCurrentUserId();
  const input = parseJournalFormData(formData);
  const entry = await journalEntryRepository.create(userId, input);

  revalidatePath("/journal");
  revalidatePath("/today");
  redirect(`/journal/${entry.id}`);
}

export async function updateJournalEntryAction(entryId: string, formData: FormData) {
  const userId = await getCurrentUserId();
  const input: UpdateJournalEntryInput = parseJournalFormData(formData);
  const entry = await journalEntryRepository.update(userId, entryId, input);

  revalidatePath("/journal");
  revalidatePath(`/journal/${entry.id}`);
  revalidatePath("/today");
  redirect(`/journal/${entry.id}`);
}

export async function deleteJournalEntryAction(entryId: string) {
  const userId = await getCurrentUserId();

  await journalEntryRepository.delete(userId, entryId);

  revalidatePath("/journal");
  revalidatePath("/today");
  redirect("/journal");
}
