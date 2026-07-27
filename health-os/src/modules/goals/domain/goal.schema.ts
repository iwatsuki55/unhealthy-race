import { z } from "zod";

import {
  dateStringSchema,
  nonEmptyStringSchema,
  positiveIntSchema,
  positiveNumberSchema
} from "@/core/shared";

import { goalModules, goalStatuses, goalTypes } from "./goal";

const goalDateRangeSchema = z
  .object({
    periodStart: dateStringSchema,
    periodEnd: dateStringSchema
  })
  .refine((goal) => Date.parse(goal.periodEnd) > Date.parse(goal.periodStart), {
    message: "Goal period end must be after period start.",
    path: ["periodEnd"]
  });

export const goalSchema = z
  .object({
    id: nonEmptyStringSchema,
    userId: nonEmptyStringSchema,
    title: nonEmptyStringSchema,
    module: z.enum(goalModules),
    goalType: z.enum(goalTypes),
    targetValue: positiveNumberSchema,
    targetUnit: nonEmptyStringSchema,
    currentValue: z.number().nullable(),
    raceDate: z.date().nullable(),
    raceDistanceMeters: positiveIntSchema.nullable(),
    raceTargetTimeSeconds: positiveIntSchema.nullable(),
    periodStart: z.date(),
    periodEnd: z.date(),
    status: z.enum(goalStatuses),
    notes: z.string().trim().nullable(),
    createdAt: z.date(),
    updatedAt: z.date()
  })
  .refine((goal) => goal.periodEnd > goal.periodStart, {
    message: "Goal period end must be after period start.",
    path: ["periodEnd"]
  });

export const createGoalInputSchema = z
  .object({
    title: nonEmptyStringSchema,
    module: z.enum(goalModules),
    goalType: z.enum(goalTypes),
    targetValue: positiveNumberSchema,
    targetUnit: nonEmptyStringSchema,
    currentValue: z.number().optional(),
    raceDate: dateStringSchema.optional(),
    raceDistanceMeters: positiveIntSchema.optional(),
    raceTargetTimeSeconds: positiveIntSchema.optional(),
    status: z.enum(goalStatuses).default("active"),
    notes: z.string().trim().optional()
  })
  .and(goalDateRangeSchema);

export const updateGoalInputSchema = z
  .object({
    title: nonEmptyStringSchema.optional(),
    module: z.enum(goalModules).optional(),
    goalType: z.enum(goalTypes).optional(),
    targetValue: positiveNumberSchema.optional(),
    targetUnit: nonEmptyStringSchema.optional(),
    currentValue: z.number().optional(),
    raceDate: dateStringSchema.optional(),
    raceDistanceMeters: positiveIntSchema.optional(),
    raceTargetTimeSeconds: positiveIntSchema.optional(),
    periodStart: dateStringSchema.optional(),
    periodEnd: dateStringSchema.optional(),
    status: z.enum(goalStatuses).optional(),
    notes: z.string().trim().optional()
  })
  .refine(
    (goal) =>
      goal.periodStart === undefined ||
      goal.periodEnd === undefined ||
      Date.parse(goal.periodEnd) > Date.parse(goal.periodStart),
    {
      message: "Goal period end must be after period start.",
      path: ["periodEnd"]
    }
  );

export const goalProgressSchema = z.object({
  goalId: nonEmptyStringSchema,
  currentValue: z.number().nullable(),
  targetValue: positiveNumberSchema,
  progressRatio: z.number().min(0).nullable()
});

export type GoalDto = z.infer<typeof goalSchema>;
export type CreateGoalInput = z.infer<typeof createGoalInputSchema>;
export type UpdateGoalInput = z.infer<typeof updateGoalInputSchema>;
export type GoalProgressDto = z.infer<typeof goalProgressSchema>;
