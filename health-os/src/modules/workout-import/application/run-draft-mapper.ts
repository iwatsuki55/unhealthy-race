import type { CreateCardioSessionInput } from "../../cardio/domain/cardio-session.schema.ts";
import {
  cardioActivityTypeValues,
  type CardioActivityType
} from "../../cardio/domain/cardio-activity.ts";
import type { RunImportDraft } from "../domain/workout-import.ts";

function todayDateInput() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
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

function finiteNumber(value: number | null) {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function rating(value: number | null) {
  return typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 10
    ? value
    : undefined;
}

function activityType(value: string | null): CardioActivityType {
  return cardioActivityTypeValues.includes(value as CardioActivityType)
    ? (value as CardioActivityType)
    : "outdoor_run";
}

export function mapRunImportDraftToRunInput(
  draft: RunImportDraft
): Partial<CreateCardioSessionInput> {
  const runDate = normalizeDate(draft.runDate.value);

  return {
    activityType: activityType(draft.activityType.value),
    runDate,
    startedAt: normalizeStartedAt(runDate, draft.startTime.value),
    distanceMeters: positiveInt(draft.distanceMeters.value),
    durationSeconds: positiveInt(draft.durationSeconds.value),
    averageHeartRate: positiveInt(draft.averageHeartRate.value),
    maximumHeartRate: positiveInt(draft.maximumHeartRate.value),
    cadenceStepsPerMinute: positiveInt(draft.cadenceStepsPerMinute.value),
    calories: positiveInt(draft.calories.value),
    temperatureCelsius: finiteNumber(draft.temperatureCelsius.value),
    humidityPercent: positiveInt(draft.humidityPercent.value),
    shoes: draft.shoes.value?.trim() || undefined,
    perceivedEffort: rating(draft.perceivedEffort.value),
    screenshotAttachmentRef: draft.sourceApplication.value ?? undefined,
    notes: draft.notes.value ?? undefined
  };
}
