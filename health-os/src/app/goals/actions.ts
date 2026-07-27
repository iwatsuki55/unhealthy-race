"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentUserId } from "@/core/application/current-user";
import { durationInputToSeconds, kilometersInputToMeters } from "@/lib/format";
import type { CreateGoalInput, UpdateGoalInput } from "@/modules/goals/domain";
import { createGoalInputSchema } from "@/modules/goals/domain";
import { goalRepository } from "@/modules/goals/infrastructure";

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

function getRaceDistanceMeters(formData: FormData) {
  const value = kilometersInputToMeters(formData.get("raceDistanceKilometers"));

  return typeof value === "number" ? value : undefined;
}

function getRaceTargetTimeSeconds(formData: FormData) {
  const value = durationInputToSeconds(formData.get("raceTargetTime"));

  return typeof value === "number" ? value : undefined;
}

function parseGoalFormData(formData: FormData): CreateGoalInput {
  return createGoalInputSchema.parse({
    title: formData.get("title"),
    module: formData.get("module"),
    goalType: formData.get("goalType"),
    targetValue: getNumber(formData, "targetValue"),
    targetUnit: formData.get("targetUnit"),
    currentValue: getNumber(formData, "currentValue"),
    raceDate: getString(formData, "raceDate"),
    raceDistanceMeters: getRaceDistanceMeters(formData),
    raceTargetTimeSeconds: getRaceTargetTimeSeconds(formData),
    periodStart: formData.get("periodStart"),
    periodEnd: formData.get("periodEnd"),
    status: formData.get("status"),
    notes: getString(formData, "notes")
  });
}

export async function createGoalAction(formData: FormData) {
  const userId = await getCurrentUserId();
  const input = parseGoalFormData(formData);
  const goal = await goalRepository.create(userId, input);

  revalidatePath("/goals");
  revalidatePath("/today");
  redirect(`/goals/${goal.id}`);
}

export async function updateGoalAction(goalId: string, formData: FormData) {
  const userId = await getCurrentUserId();
  const input: UpdateGoalInput = parseGoalFormData(formData);
  const goal = await goalRepository.update(userId, goalId, input);

  revalidatePath("/goals");
  revalidatePath(`/goals/${goal.id}`);
  revalidatePath("/today");
  redirect(`/goals/${goal.id}`);
}

export async function deleteGoalAction(goalId: string) {
  const userId = await getCurrentUserId();

  await goalRepository.delete(userId, goalId);

  revalidatePath("/goals");
  revalidatePath("/today");
  redirect("/goals");
}
