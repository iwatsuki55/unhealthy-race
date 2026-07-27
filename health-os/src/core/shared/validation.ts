import { z } from "zod";

export const nonEmptyStringSchema = z.string().trim().min(1);
export const optionalTextSchema = z.string().trim().optional();
export const positiveIntSchema = z.number().int().positive();
export const positiveNumberSchema = z.number().positive();
export const nonNegativeIntSchema = z.number().int().min(0);
export const ratingSchema = z.number().int().min(1).max(10);
export const dateStringSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
export const dateTimeStringSchema = z.string().datetime({ offset: true });
export const urlStringSchema = z.string().url();

export type ValidationResult<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      issues: z.ZodIssue[];
    };

export function validateInput<T>(schema: z.ZodType<T>, input: unknown): ValidationResult<T> {
  const result = schema.safeParse(input);

  if (result.success) {
    return {
      success: true,
      data: result.data
    };
  }

  return {
    success: false,
    issues: result.error.issues
  };
}
