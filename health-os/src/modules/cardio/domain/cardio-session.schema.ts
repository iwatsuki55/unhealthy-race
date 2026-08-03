import { z } from "zod";

import {
  dateStringSchema,
  dateTimeStringSchema,
  nonEmptyStringSchema,
  positiveIntSchema,
  ratingSchema
} from "@/core/shared";

import { cardioActivityTypeValues, getCardioActivityConfig } from "./cardio-activity";

export const cardioActivityTypeSchema = z.enum(cardioActivityTypeValues);

export const cardioSessionSchema = z
  .object({
    id: nonEmptyStringSchema,
    userId: nonEmptyStringSchema,
    routeId: nonEmptyStringSchema.nullable(),
    activityType: cardioActivityTypeSchema,
    runDate: z.date(),
    startedAt: z.date().nullable(),
    durationSeconds: positiveIntSchema,
    distanceMeters: positiveIntSchema.nullable(),
    averagePaceSecondsPerKm: positiveIntSchema.nullable(),
    averageHeartRate: positiveIntSchema.nullable(),
    maximumHeartRate: positiveIntSchema.nullable(),
    cadenceStepsPerMinute: positiveIntSchema.nullable(),
    calories: positiveIntSchema.nullable(),
    temperatureCelsius: z.number().nullable(),
    humidityPercent: z.number().int().min(0).max(100).nullable(),
    shoes: z.string().trim().nullable(),
    screenshotAttachmentRef: z.string().trim().nullable(),
    perceivedEffort: ratingSchema.nullable(),
    notes: z.string().trim().nullable(),
    createdAt: z.date(),
    updatedAt: z.date()
  })
  .refine(
    (session) =>
      session.averageHeartRate === null ||
      session.maximumHeartRate === null ||
      session.maximumHeartRate >= session.averageHeartRate,
    {
      message: "Maximum heart rate must be greater than or equal to average heart rate.",
      path: ["maximumHeartRate"]
    }
  );

const optionalDistanceSchema = positiveIntSchema.optional();

const cardioSessionInputBaseSchema = z.object({
  activityType: cardioActivityTypeSchema.default("outdoor_run"),
  runDate: dateStringSchema,
  startedAt: dateTimeStringSchema.optional(),
  durationSeconds: positiveIntSchema,
  distanceMeters: optionalDistanceSchema,
  routeId: nonEmptyStringSchema.optional(),
  averageHeartRate: positiveIntSchema.optional(),
  maximumHeartRate: positiveIntSchema.optional(),
  cadenceStepsPerMinute: positiveIntSchema.optional(),
  calories: positiveIntSchema.optional(),
  temperatureCelsius: z.number().optional(),
  humidityPercent: z.number().int().min(0).max(100).optional(),
  shoes: z.string().trim().optional(),
  screenshotAttachmentRef: z.string().trim().optional(),
  perceivedEffort: ratingSchema.optional(),
  notes: z.string().trim().optional()
});

function hasValidHeartRateRange(session: { averageHeartRate?: number; maximumHeartRate?: number }) {
  return (
    session.averageHeartRate === undefined ||
    session.maximumHeartRate === undefined ||
    session.maximumHeartRate >= session.averageHeartRate
  );
}

function hasRequiredDistance(session: {
  activityType: z.infer<typeof cardioActivityTypeSchema>;
  distanceMeters?: number;
}) {
  const config = getCardioActivityConfig(session.activityType);

  return !config.requiresDistance || typeof session.distanceMeters === "number";
}

export const createCardioSessionInputSchema = cardioSessionInputBaseSchema
  .refine(hasValidHeartRateRange, {
    message: "Maximum heart rate must be greater than or equal to average heart rate.",
    path: ["maximumHeartRate"]
  })
  .refine(hasRequiredDistance, {
    message: "Distance is required for this cardio type.",
    path: ["distanceMeters"]
  });

export const updateCardioSessionInputSchema = cardioSessionInputBaseSchema
  .partial()
  .refine(hasValidHeartRateRange, {
    message: "Maximum heart rate must be greater than or equal to average heart rate.",
    path: ["maximumHeartRate"]
  });

export const cardioSessionFormSchema = z
  .object({
    activityType: cardioActivityTypeSchema.default("outdoor_run"),
    runDate: dateStringSchema,
    startedAt: z.string().trim().optional(),
    durationSeconds: z.coerce.number().int().positive(),
    distanceMeters: z.preprocess(
      (value) => (value === "" || value === null ? undefined : value),
      z.coerce.number().int().positive().optional()
    ),
    routeId: z.preprocess(
      (value) => (value === "" ? undefined : value),
      nonEmptyStringSchema.optional()
    ),
    averageHeartRate: z.preprocess(
      (value) => (value === "" ? undefined : value),
      z.coerce.number().int().positive().optional()
    ),
    maximumHeartRate: z.preprocess(
      (value) => (value === "" ? undefined : value),
      z.coerce.number().int().positive().optional()
    ),
    cadenceStepsPerMinute: z.preprocess(
      (value) => (value === "" ? undefined : value),
      z.coerce.number().int().positive().optional()
    ),
    calories: z.preprocess(
      (value) => (value === "" ? undefined : value),
      z.coerce.number().int().positive().optional()
    ),
    temperatureCelsius: z.preprocess(
      (value) => (value === "" ? undefined : value),
      z.coerce.number().optional()
    ),
    humidityPercent: z.preprocess(
      (value) => (value === "" ? undefined : value),
      z.coerce.number().int().min(0).max(100).optional()
    ),
    shoes: z.string().trim().optional(),
    screenshotAttachmentRef: z.string().trim().optional(),
    perceivedEffort: z.preprocess(
      (value) => (value === "" ? undefined : value),
      z.coerce.number().int().min(1).max(10).optional()
    ),
    notes: z.string().trim().optional()
  })
  .refine(
    (session) =>
      session.averageHeartRate === undefined ||
      session.maximumHeartRate === undefined ||
      session.maximumHeartRate >= session.averageHeartRate,
    {
      message: "Maximum heart rate must be greater than or equal to average heart rate.",
      path: ["maximumHeartRate"]
    }
  )
  .refine(hasRequiredDistance, {
    message: "Distance is required for this cardio type.",
    path: ["distanceMeters"]
  });

export type CardioSessionDto = z.infer<typeof cardioSessionSchema>;
export type CreateCardioSessionInput = z.infer<typeof createCardioSessionInputSchema>;
export type UpdateCardioSessionInput = z.infer<typeof updateCardioSessionInputSchema>;
export type CardioSessionFormInput = z.infer<typeof cardioSessionFormSchema>;

export const runSchema = cardioSessionSchema;
export const createRunInputSchema = createCardioSessionInputSchema;
export const updateRunInputSchema = updateCardioSessionInputSchema;
export const runFormSchema = cardioSessionFormSchema;
export type RunDto = CardioSessionDto;
export type CreateRunInput = CreateCardioSessionInput;
export type UpdateRunInput = UpdateCardioSessionInput;
export type RunFormInput = CardioSessionFormInput;
