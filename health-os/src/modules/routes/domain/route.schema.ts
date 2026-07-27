import { z } from "zod";

import { difficulties, nonEmptyStringSchema, positiveIntSchema } from "@/core/shared";

import { surfaceTypes } from "./route";

export const routeSchema = z.object({
  id: nonEmptyStringSchema,
  userId: nonEmptyStringSchema,
  name: nonEmptyStringSchema,
  distanceMeters: positiveIntSchema,
  estimatedDurationSeconds: positiveIntSchema.nullable(),
  elevationGainMeters: positiveIntSchema.nullable(),
  description: z.string().trim().nullable(),
  surfaceType: z.enum(surfaceTypes),
  difficulty: z.enum(difficulties),
  googleMapsUrl: z.string().url().nullable(),
  isFavorite: z.boolean(),
  isActive: z.boolean(),
  notes: z.string().trim().nullable(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const createRouteInputSchema = z.object({
  name: nonEmptyStringSchema,
  distanceMeters: positiveIntSchema,
  estimatedDurationSeconds: positiveIntSchema.optional(),
  elevationGainMeters: positiveIntSchema.optional(),
  description: z.string().trim().optional(),
  surfaceType: z.enum(surfaceTypes).default("unknown"),
  difficulty: z.enum(difficulties).default("moderate"),
  googleMapsUrl: z.string().url().optional(),
  isFavorite: z.boolean().default(false),
  isActive: z.boolean().default(true),
  notes: z.string().trim().optional()
});

export const updateRouteInputSchema = createRouteInputSchema.partial();

export type RouteDto = z.infer<typeof routeSchema>;
export type CreateRouteInput = z.infer<typeof createRouteInputSchema>;
export type UpdateRouteInput = z.infer<typeof updateRouteInputSchema>;
