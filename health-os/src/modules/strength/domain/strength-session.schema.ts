import { z } from "zod";

import {
  dateStringSchema,
  dateTimeStringSchema,
  nonEmptyStringSchema,
  nonNegativeIntSchema,
  positiveIntSchema,
  positiveNumberSchema,
  ratingSchema,
  weightUnits
} from "@/core/shared";

import { equipmentTypes, workoutTypes } from "./strength-session";

export const strengthSetSchema = z.object({
  id: nonEmptyStringSchema,
  exerciseId: nonEmptyStringSchema,
  setOrder: positiveIntSchema,
  reps: positiveIntSchema,
  weightValue: positiveNumberSchema.nullable(),
  weightUnit: z.enum(weightUnits),
  restSeconds: nonNegativeIntSchema.nullable(),
  perceivedEffort: ratingSchema.nullable(),
  notes: z.string().trim().nullable(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const strengthExerciseSchema = z.object({
  id: nonEmptyStringSchema,
  sessionId: nonEmptyStringSchema,
  exerciseName: nonEmptyStringSchema,
  exerciseOrder: positiveIntSchema,
  equipmentType: z.enum(equipmentTypes),
  notes: z.string().trim().nullable(),
  sets: z.array(strengthSetSchema),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const strengthSessionSchema = z.object({
  id: nonEmptyStringSchema,
  userId: nonEmptyStringSchema,
  sessionDate: z.date(),
  startedAt: z.date().nullable(),
  durationSeconds: positiveIntSchema.nullable(),
  workoutType: z.enum(workoutTypes),
  location: z.string().trim().nullable(),
  notes: z.string().trim().nullable(),
  exercises: z.array(strengthExerciseSchema),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const createStrengthSetInputSchema = z.object({
  setOrder: positiveIntSchema,
  reps: positiveIntSchema,
  weightValue: positiveNumberSchema.optional(),
  weightUnit: z.enum(weightUnits).default("kg"),
  restSeconds: nonNegativeIntSchema.optional(),
  perceivedEffort: ratingSchema.optional(),
  notes: z.string().trim().optional()
});

export const createStrengthExerciseInputSchema = z.object({
  exerciseName: nonEmptyStringSchema,
  exerciseOrder: positiveIntSchema,
  equipmentType: z.enum(equipmentTypes),
  notes: z.string().trim().optional(),
  sets: z.array(createStrengthSetInputSchema).min(1)
});

export const createStrengthSessionInputSchema = z.object({
  sessionDate: dateStringSchema,
  startedAt: dateTimeStringSchema.optional(),
  durationSeconds: positiveIntSchema.optional(),
  workoutType: z.enum(workoutTypes),
  location: z.string().trim().optional(),
  notes: z.string().trim().optional(),
  exercises: z.array(createStrengthExerciseInputSchema).min(1)
});

export const updateStrengthSessionInputSchema = createStrengthSessionInputSchema.partial();

export type StrengthSetDto = z.infer<typeof strengthSetSchema>;
export type StrengthExerciseDto = z.infer<typeof strengthExerciseSchema>;
export type StrengthSessionDto = z.infer<typeof strengthSessionSchema>;
export type CreateStrengthSetInput = z.infer<typeof createStrengthSetInputSchema>;
export type CreateStrengthExerciseInput = z.infer<typeof createStrengthExerciseInputSchema>;
export type CreateStrengthSessionInput = z.infer<typeof createStrengthSessionInputSchema>;
export type UpdateStrengthSessionInput = z.infer<typeof updateStrengthSessionInputSchema>;
