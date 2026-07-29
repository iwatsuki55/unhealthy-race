"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentUserId } from "@/core/application/current-user";
import { durationInputToSeconds } from "@/lib/format";
import type {
  CreateStrengthSessionInput,
  UpdateStrengthSessionInput
} from "@/modules/strength/domain";
import { createStrengthSessionInputSchema } from "@/modules/strength/domain";
import { strengthSessionRepository } from "@/modules/strength/infrastructure";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function normalizeNumericString(value: string) {
  return value.replace(/[０-９]/g, (digit) => String.fromCharCode(digit.charCodeAt(0) - 0xfee0));
}

function getNumber(formData: FormData, key: string) {
  const value = getString(formData, key);

  if (!value) {
    return undefined;
  }

  const numberValue = Number(normalizeNumericString(value));

  return Number.isFinite(numberValue) ? numberValue : undefined;
}

function toIsoDateTimeWithOffset(value: string | undefined) {
  if (!value) {
    return undefined;
  }

  return `${value}:00+09:00`;
}

function parseStrengthFormData(formData: FormData): CreateStrengthSessionInput {
  const exerciseCount = Number(formData.get("exerciseCount") ?? 0);
  const exercises = Array.from({ length: exerciseCount }, (_, exerciseIndex) => {
    const setCount = Number(formData.get(`setCount_${exerciseIndex}`) ?? 0);

    return {
      exerciseName: getString(formData, `exerciseName_${exerciseIndex}`),
      exerciseOrder: exerciseIndex + 1,
      equipmentType: getString(formData, `equipmentType_${exerciseIndex}`),
      notes: getString(formData, `exerciseNotes_${exerciseIndex}`),
      sets: Array.from({ length: setCount }, (_, setIndex) => ({
        setOrder: setIndex + 1,
        reps: getNumber(formData, `reps_${exerciseIndex}_${setIndex}`),
        weightValue: getNumber(formData, `weightValue_${exerciseIndex}_${setIndex}`),
        weightUnit: getString(formData, `weightUnit_${exerciseIndex}_${setIndex}`) ?? "kg",
        restSeconds: getNumber(formData, `restSeconds_${exerciseIndex}_${setIndex}`),
        perceivedEffort: getNumber(formData, `perceivedEffort_${exerciseIndex}_${setIndex}`),
        notes: getString(formData, `setNotes_${exerciseIndex}_${setIndex}`)
      }))
    };
  });

  const durationValue = durationInputToSeconds(formData.get("duration"));

  return createStrengthSessionInputSchema.parse({
    sessionDate: formData.get("sessionDate"),
    startedAt: toIsoDateTimeWithOffset(getString(formData, "startedAt")),
    durationSeconds: typeof durationValue === "number" ? durationValue : undefined,
    workoutType: formData.get("workoutType"),
    location: getString(formData, "location"),
    notes: getString(formData, "notes"),
    exercises
  });
}

export async function createStrengthSessionAction(formData: FormData) {
  const userId = await getCurrentUserId();
  const input = parseStrengthFormData(formData);
  const session = await strengthSessionRepository.create(userId, input);

  revalidatePath("/strength");
  redirect(`/strength/${session.id}`);
}

export async function updateStrengthSessionAction(sessionId: string, formData: FormData) {
  const userId = await getCurrentUserId();
  const input: UpdateStrengthSessionInput = parseStrengthFormData(formData);
  const session = await strengthSessionRepository.update(userId, sessionId, input);

  revalidatePath("/strength");
  revalidatePath(`/strength/${session.id}`);
  redirect(`/strength/${session.id}`);
}

export async function deleteStrengthSessionAction(sessionId: string) {
  const userId = await getCurrentUserId();

  await strengthSessionRepository.delete(userId, sessionId);

  revalidatePath("/strength");
  redirect("/strength");
}
