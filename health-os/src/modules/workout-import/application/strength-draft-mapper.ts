import type { CreateStrengthSessionInput } from "../../strength/domain/strength-session.schema.ts";
import type { WorkoutImportDraft } from "../domain/workout-import.ts";

const workoutTypeMap: Record<string, CreateStrengthSessionInput["workoutType"]> = {
  full_body: "full_body",
  "full body": "full_body",
  whole_body: "full_body",
  "whole body": "full_body",
  upper: "upper",
  "upper body": "upper",
  lower: "lower",
  "lower body": "lower",
  push: "push",
  pull: "pull",
  legs: "legs"
};

const equipmentTypeMap: Record<
  string,
  CreateStrengthSessionInput["exercises"][number]["equipmentType"]
> = {
  machine: "machine",
  free_weight: "free_weight",
  "free weight": "free_weight",
  barbell: "free_weight",
  dumbbell: "free_weight",
  bodyweight: "bodyweight",
  "body weight": "bodyweight"
};

function todayDateInput() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
}

function normalizeWorkoutType(value: string | null) {
  if (!value) {
    return "full_body";
  }

  return workoutTypeMap[value.trim().toLowerCase()] ?? "full_body";
}

function normalizeEquipmentType(value: string | null) {
  if (!value) {
    return "free_weight";
  }

  return equipmentTypeMap[value.trim().toLowerCase()] ?? "free_weight";
}

function normalizeDate(value: string | null) {
  if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  return todayDateInput();
}

function normalizeStartedAt(date: string, value: string | null) {
  if (!value) {
    return undefined;
  }

  if (/^\d{2}:\d{2}$/.test(value)) {
    return `${date}T${value}:00+09:00`;
  }

  if (/^\d{2}:\d{2}:\d{2}$/.test(value)) {
    return `${date}T${value}+09:00`;
  }

  return undefined;
}

function positiveInt(value: number | null) {
  return typeof value === "number" && Number.isInteger(value) && value > 0 ? value : undefined;
}

function positiveNumber(value: number | null) {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : undefined;
}

type DraftStrengthSet = CreateStrengthSessionInput["exercises"][number]["sets"][number];

function compact<T>(value: T | null): value is T {
  return value !== null;
}

function toStrengthSet(
  set: WorkoutImportDraft["exercises"][number]["sets"][number],
  setIndex: number
): DraftStrengthSet | null {
  const reps = positiveInt(set.reps.value);

  if (!reps) {
    return null;
  }

  return {
    setOrder: setIndex + 1,
    reps,
    weightValue: positiveNumber(set.weightValue.value),
    weightUnit: "kg",
    notes: set.pr?.value ? "PR" : undefined
  };
}

export function mapWorkoutImportDraftToStrengthInput(
  draft: WorkoutImportDraft
): CreateStrengthSessionInput {
  const sessionDate = normalizeDate(draft.workoutDate.value);
  const exercises = draft.exercises
    .map((exercise, exerciseIndex) => ({
      exerciseName: exercise.exerciseName.value?.trim() || `Exercise ${exerciseIndex + 1}`,
      exerciseOrder: exerciseIndex + 1,
      equipmentType: normalizeEquipmentType(exercise.equipmentType.value),
      sets: exercise.sets.map(toStrengthSet).filter(compact)
    }))
    .filter((exercise) => exercise.sets.length > 0);

  return {
    sessionDate,
    startedAt: normalizeStartedAt(sessionDate, draft.startTime.value),
    durationSeconds: positiveInt(draft.durationSeconds.value),
    workoutType: normalizeWorkoutType(draft.workoutType.value),
    notes: draft.notes.value ?? undefined,
    exercises
  };
}
