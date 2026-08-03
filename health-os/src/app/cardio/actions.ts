"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentUserId } from "@/core/application/current-user";
import { durationInputToSeconds, kilometersInputToMeters } from "@/lib/format";
import type { CreateCardioSessionInput, UpdateCardioSessionInput } from "@/modules/cardio/domain";
import { cardioSessionFormSchema } from "@/modules/cardio/domain";
import { cardioSessionRepository } from "@/modules/cardio/infrastructure";

function getOptionalString(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" && value.trim().length > 0 ? value : undefined;
}

function toIsoDateTimeWithOffset(value: string | undefined) {
  if (!value) {
    return undefined;
  }

  return `${value}:00+09:00`;
}

function parseCardioSessionFormData(formData: FormData): CreateCardioSessionInput {
  const input = cardioSessionFormSchema.parse({
    activityType: formData.get("activityType"),
    runDate: formData.get("runDate"),
    startedAt: getOptionalString(formData, "startedAt"),
    durationSeconds: durationInputToSeconds(formData.get("duration")),
    distanceMeters: kilometersInputToMeters(formData.get("distanceKm")),
    routeId: formData.get("routeId"),
    averageHeartRate: formData.get("averageHeartRate"),
    maximumHeartRate: formData.get("maximumHeartRate"),
    cadenceStepsPerMinute: formData.get("cadenceStepsPerMinute"),
    calories: formData.get("calories"),
    temperatureCelsius: formData.get("temperatureCelsius"),
    humidityPercent: formData.get("humidityPercent"),
    shoes: formData.get("shoes"),
    screenshotAttachmentRef: formData.get("screenshotAttachmentRef"),
    perceivedEffort: formData.get("perceivedEffort"),
    notes: formData.get("notes")
  });

  return {
    ...input,
    startedAt: toIsoDateTimeWithOffset(input.startedAt)
  };
}

export async function createRunAction(formData: FormData) {
  const userId = await getCurrentUserId();
  const input = parseCardioSessionFormData(formData);
  const session = await cardioSessionRepository.create(userId, input);

  revalidatePath("/cardio");
  redirect(`/cardio/${session.id}`);
}

export async function updateRunAction(sessionId: string, formData: FormData) {
  const userId = await getCurrentUserId();
  const input: UpdateCardioSessionInput = parseCardioSessionFormData(formData);
  const session = await cardioSessionRepository.update(userId, sessionId, input);

  revalidatePath("/cardio");
  revalidatePath(`/cardio/${session.id}`);
  redirect(`/cardio/${session.id}`);
}

export async function deleteRunAction(sessionId: string) {
  const userId = await getCurrentUserId();

  await cardioSessionRepository.delete(userId, sessionId);

  revalidatePath("/cardio");
  redirect("/cardio");
}

export const createCardioSessionAction = createRunAction;
export const updateCardioSessionAction = updateRunAction;
export const deleteCardioSessionAction = deleteRunAction;
