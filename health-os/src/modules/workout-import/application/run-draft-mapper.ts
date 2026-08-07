import type { CreateCardioSessionInput } from "../../cardio/domain/cardio-session.schema.ts";
import {
  cardioActivityTypeValues,
  type CardioActivityType
} from "../../cardio/domain/cardio-activity.ts";
import type { ImportField, RunImportDraft } from "../domain/workout-import.ts";

const monthByName = new Map(
  [
    "jan",
    "january",
    "feb",
    "february",
    "mar",
    "march",
    "apr",
    "april",
    "may",
    "jun",
    "june",
    "jul",
    "july",
    "aug",
    "august",
    "sep",
    "sept",
    "september",
    "oct",
    "october",
    "nov",
    "november",
    "dec",
    "december"
  ].map((name, index) => [
    name,
    [1, 1, 2, 2, 3, 3, 4, 4, 5, 6, 6, 7, 7, 8, 8, 9, 9, 9, 10, 10, 11, 11, 12, 12][index]
  ])
);

function isoDate(year: number, month: number, day: number) {
  if (year < 1900 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) {
    return undefined;
  }

  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return undefined;
  }

  return [
    year.toString().padStart(4, "0"),
    month.toString().padStart(2, "0"),
    day.toString().padStart(2, "0")
  ].join("-");
}

export function normalizeCardioImportDate(value: string | null) {
  const trimmed = value?.trim();

  if (!trimmed) {
    return undefined;
  }

  const isoMatch = /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/.exec(trimmed);

  if (isoMatch) {
    return isoDate(Number(isoMatch[1]), Number(isoMatch[2]), Number(isoMatch[3]));
  }

  const japaneseMatch = /^(\d{4})年\s*(\d{1,2})月\s*(\d{1,2})日?$/.exec(trimmed);

  if (japaneseMatch) {
    return isoDate(Number(japaneseMatch[1]), Number(japaneseMatch[2]), Number(japaneseMatch[3]));
  }

  const monthNameMatch = /^([A-Za-z]+)\.?\s+(\d{1,2})(?:st|nd|rd|th)?[,]?\s+(\d{4})$/.exec(trimmed);

  if (monthNameMatch) {
    const month = monthByName.get(monthNameMatch[1].toLowerCase());

    return month ? isoDate(Number(monthNameMatch[3]), month, Number(monthNameMatch[2])) : undefined;
  }

  const dayMonthNameMatch = /^(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-z]+)\.?,?\s+(\d{4})$/.exec(
    trimmed
  );

  if (dayMonthNameMatch) {
    const month = monthByName.get(dayMonthNameMatch[2].toLowerCase());

    return month
      ? isoDate(Number(dayMonthNameMatch[3]), month, Number(dayMonthNameMatch[1]))
      : undefined;
  }

  return undefined;
}

export function getCardioImportDraftSaveIssue(draft: RunImportDraft) {
  const dateIssue = getDateFieldSaveIssue(draft.runDate);

  if (dateIssue) {
    return dateIssue;
  }

  return null;
}

function getDateFieldSaveIssue(field: ImportField<string>) {
  if (field.confidence === "low") {
    return "Workout date is low confidence. Please review the screenshot date before saving.";
  }

  if (field.conflict) {
    return "Workout date has conflicting extracted values. Please review before saving.";
  }

  const normalizedDate = normalizeCardioImportDate(field.value);

  if (!normalizedDate) {
    return "Workout date must include an explicit year before saving.";
  }

  if (normalizedDate.startsWith("2020-")) {
    return "Workout date looks like a default 2020 year. Please correct the date before saving.";
  }

  return null;
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
  const runDate = normalizeCardioImportDate(draft.runDate.value);

  return {
    activityType: activityType(draft.activityType.value),
    ...(runDate ? { runDate } : {}),
    startedAt: runDate ? normalizeStartedAt(runDate, draft.startTime.value) : undefined,
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
