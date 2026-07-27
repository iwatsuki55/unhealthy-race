import { z } from "zod";

import {
  dateStringSchema,
  dateTimeStringSchema,
  nonEmptyStringSchema,
  positiveIntSchema,
  ratingSchema
} from "@/core/shared";

export const runSchema = z
  .object({
    id: nonEmptyStringSchema,
    userId: nonEmptyStringSchema,
    routeId: nonEmptyStringSchema.nullable(),
    runDate: z.date(),
    startedAt: z.date().nullable(),
    durationSeconds: positiveIntSchema,
    distanceMeters: positiveIntSchema,
    averagePaceSecondsPerKm: positiveIntSchema,
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
    (run) =>
      run.averageHeartRate === null ||
      run.maximumHeartRate === null ||
      run.maximumHeartRate >= run.averageHeartRate,
    {
      message: "Maximum heart rate must be greater than or equal to average heart rate.",
      path: ["maximumHeartRate"]
    }
  );

const runInputBaseSchema = z.object({
  runDate: dateStringSchema,
  startedAt: dateTimeStringSchema.optional(),
  durationSeconds: positiveIntSchema,
  distanceMeters: positiveIntSchema,
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

function hasValidHeartRateRange(run: { averageHeartRate?: number; maximumHeartRate?: number }) {
  return (
    run.averageHeartRate === undefined ||
    run.maximumHeartRate === undefined ||
    run.maximumHeartRate >= run.averageHeartRate
  );
}

export const createRunInputSchema = runInputBaseSchema.refine(hasValidHeartRateRange, {
  message: "Maximum heart rate must be greater than or equal to average heart rate.",
  path: ["maximumHeartRate"]
});

export const updateRunInputSchema = runInputBaseSchema.partial().refine(hasValidHeartRateRange, {
  message: "Maximum heart rate must be greater than or equal to average heart rate.",
  path: ["maximumHeartRate"]
});

export const runFormSchema = z
  .object({
    runDate: dateStringSchema,
    startedAt: z.string().trim().optional(),
    durationSeconds: z.coerce.number().int().positive(),
    distanceMeters: z.coerce.number().int().positive(),
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
    (run) =>
      run.averageHeartRate === undefined ||
      run.maximumHeartRate === undefined ||
      run.maximumHeartRate >= run.averageHeartRate,
    {
      message: "Maximum heart rate must be greater than or equal to average heart rate.",
      path: ["maximumHeartRate"]
    }
  );

export type RunDto = z.infer<typeof runSchema>;
export type CreateRunInput = z.infer<typeof createRunInputSchema>;
export type UpdateRunInput = z.infer<typeof updateRunInputSchema>;
export type RunFormInput = z.infer<typeof runFormSchema>;
