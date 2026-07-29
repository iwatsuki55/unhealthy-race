import type { ImportedImage, WorkoutImportDraft } from "@/modules/workout-import/domain";

function field<T>(
  value: T | null,
  confidence: "high" | "medium" | "low",
  sourceImageIds: string[],
  conflict = false
) {
  return {
    value,
    confidence,
    sourceImageIds,
    conflict
  };
}

export function mockExtractWorkoutDraft(images: ImportedImage[]): WorkoutImportDraft {
  const sourceImageIds = images.map((image) => image.id);
  const firstImageId = sourceImageIds[0] ? [sourceImageIds[0]] : [];

  return {
    title: field("Imported Strength Workout", "medium", firstImageId),
    workoutDate: field(null, "low", firstImageId),
    startTime: field(null, "low", firstImageId),
    durationSeconds: field(null, "low", sourceImageIds),
    workoutType: field("full_body", "medium", sourceImageIds),
    calories: field(null, "low", sourceImageIds),
    totalVolume: field(null, "low", sourceImageIds),
    prCount: field(null, "low", sourceImageIds),
    notes: field(
      "Mock extraction result. Review and edit before saving.",
      "medium",
      sourceImageIds
    ),
    sourceApplication: field("Unknown screenshot source", "low", sourceImageIds),
    exercises: [
      {
        id: "mock-exercise-1",
        exerciseName: field("Bench Press", "medium", firstImageId),
        equipmentType: field("free_weight", "medium", firstImageId),
        order: 1,
        sets: [
          {
            setNumber: 1,
            weightValue: field(60, "medium", firstImageId),
            reps: field(8, "medium", firstImageId),
            pr: field(false, "low", firstImageId)
          }
        ]
      }
    ]
  };
}

export function getMockExtractionWarnings(images: ImportedImage[]) {
  const warnings = [
    "Stage 1 uses a mock extraction provider. No screenshot pixels are analyzed yet.",
    "Review all fields before saving. Saving to Strength is intentionally disabled in Stage 1."
  ];

  if (images.length === 0) {
    warnings.push("Add at least one screenshot before analysis.");
  }

  return warnings;
}
