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

export const runImportDraftSchema = z.object({
  title: importFieldSchema(z.string()),
  activityType: importFieldSchema(
    z.enum([
      "outdoor_run",
      "treadmill_run",
      "outdoor_walk",
      "treadmill_walk",
      "exercise_bike",
      "outdoor_cycling",
      "hiking",
      "rowing",
      "swimming",
      "stair_climber",
      "elliptical",
      "other"
    ])
  ),
  runDate: importFieldSchema(z.string()),
  startTime: importFieldSchema(z.string()),
  distanceMeters: importFieldSchema(z.number()),
  durationSeconds: importFieldSchema(z.number()),
  averagePaceSecondsPerKm: importFieldSchema(z.number()),
  averageHeartRate: importFieldSchema(z.number()),
  maximumHeartRate: importFieldSchema(z.number()),
  cadenceStepsPerMinute: importFieldSchema(z.number()),
  calories: importFieldSchema(z.number()),
  temperatureCelsius: importFieldSchema(z.number()),
  humidityPercent: importFieldSchema(z.number()),
  shoes: importFieldSchema(z.string()),
  perceivedEffort: importFieldSchema(z.number()),
  notes: importFieldSchema(z.string()),
  sourceApplication: importFieldSchema(z.string())
});

export type WorkoutImportDraftResponse = z.infer<typeof workoutImportDraftSchema>;
export type RunImportDraftResponse = z.infer<typeof runImportDraftSchema>;

export function parseWorkoutImportDraft(value: unknown) {
  return workoutImportDraftSchema.parse(value);
}

export function parseRunImportDraft(value: unknown) {
  return runImportDraftSchema.parse(value);
}
