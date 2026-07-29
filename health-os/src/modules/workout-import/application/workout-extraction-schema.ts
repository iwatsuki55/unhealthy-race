import { z } from "zod";

const confidenceSchema = z.enum(["high", "medium", "low"]);

function importFieldSchema<T extends z.ZodType>(valueSchema: T) {
  return z.object({
    value: valueSchema.nullable(),
    confidence: confidenceSchema,
    sourceImageIds: z.array(z.string()),
    alternatives: z.array(valueSchema).optional(),
    conflict: z.boolean().optional()
  });
}

export const workoutImportDraftSchema = z.object({
  title: importFieldSchema(z.string()),
  workoutDate: importFieldSchema(z.string()),
  startTime: importFieldSchema(z.string()),
  durationSeconds: importFieldSchema(z.number()),
  workoutType: importFieldSchema(z.string()),
  calories: importFieldSchema(z.number()),
  totalVolume: importFieldSchema(z.number()),
  prCount: importFieldSchema(z.number()),
  notes: importFieldSchema(z.string()),
  sourceApplication: importFieldSchema(z.string()),
  exercises: z.array(
    z.object({
      id: z.string(),
      exerciseName: importFieldSchema(z.string()),
      equipmentType: importFieldSchema(z.enum(["machine", "free_weight", "bodyweight"]).nullable()),
      order: z.number(),
      sets: z.array(
        z.object({
          setNumber: z.number(),
          weightValue: importFieldSchema(z.number()),
          reps: importFieldSchema(z.number()),
          durationSeconds: importFieldSchema(z.number()).optional(),
          distanceMeters: importFieldSchema(z.number()).optional(),
          pr: importFieldSchema(z.boolean()).optional()
        })
      )
    })
  )
});

export type WorkoutImportDraftResponse = z.infer<typeof workoutImportDraftSchema>;

export function parseWorkoutImportDraft(value: unknown) {
  return workoutImportDraftSchema.parse(value);
}
