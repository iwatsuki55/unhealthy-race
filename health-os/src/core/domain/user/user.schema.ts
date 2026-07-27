import { z } from "zod";

import { nonEmptyStringSchema } from "@/core/shared/validation";
import { unitSystems } from "@/core/shared/domain-primitives";

export const userSchema = z.object({
  id: nonEmptyStringSchema,
  email: z.string().email(),
  displayName: nonEmptyStringSchema,
  timezone: nonEmptyStringSchema,
  unitSystem: z.enum(unitSystems),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const upsertUserInputSchema = z.object({
  email: z.string().email(),
  displayName: nonEmptyStringSchema,
  timezone: nonEmptyStringSchema.default("Asia/Tokyo"),
  unitSystem: z.enum(unitSystems).default("metric")
});

export type UserDto = z.infer<typeof userSchema>;
export type UpsertUserInput = z.infer<typeof upsertUserInputSchema>;
