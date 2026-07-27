"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentUserId } from "@/core/application/current-user";
import { durationInputToSeconds, kilometersInputToMeters } from "@/lib/format";
import type { CreateRunInput, UpdateRunInput } from "@/modules/running/domain";
import { runFormSchema } from "@/modules/running/domain";
import { runRepository } from "@/modules/running/infrastructure";

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

function parseRunFormData(formData: FormData): CreateRunInput {
  const input = runFormSchema.parse({
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
  const input = parseRunFormData(formData);
  const run = await runRepository.create(userId, input);

  revalidatePath("/running");
  redirect(`/running/${run.id}`);
}

export async function updateRunAction(runId: string, formData: FormData) {
  const userId = await getCurrentUserId();
  const input: UpdateRunInput = parseRunFormData(formData);
  const run = await runRepository.update(userId, runId, input);

  revalidatePath("/running");
  revalidatePath(`/running/${run.id}`);
  redirect(`/running/${run.id}`);
}

export async function deleteRunAction(runId: string) {
  const userId = await getCurrentUserId();

  await runRepository.delete(userId, runId);

  revalidatePath("/running");
  redirect("/running");
}
