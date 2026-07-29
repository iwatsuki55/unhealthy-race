import assert from "node:assert/strict";
import test from "node:test";

import { parseWorkoutImportDraft } from "./workout-extraction-schema.ts";

const field = <T>(value: T, confidence: "high" | "medium" | "low" = "high") => ({
  value,
  confidence,
  sourceImageIds: ["image-1"]
});

test("parseWorkoutImportDraft accepts a structured strength workout draft", () => {
  const draft = parseWorkoutImportDraft({
    title: field("Upper Body"),
    workoutDate: field("2026-07-29"),
    startTime: field("07:30"),
    durationSeconds: field(3600),
    workoutType: field("upper"),
    calories: field(320),
    totalVolume: field(4200),
    prCount: field(1),
    notes: field("Extracted from screenshots", "medium"),
    sourceApplication: field("Strong"),
    exercises: [
      {
        id: "exercise-1",
        exerciseName: field("Bench Press"),
        equipmentType: field("free_weight"),
        order: 1,
        sets: [
          {
            setNumber: 1,
            weightValue: field(60),
            reps: field(8),
            pr: field(false, "medium")
          }
        ]
      }
    ]
  });

  assert.equal(draft.exercises[0]?.sets[0]?.reps.value, 8);
});

test("parseWorkoutImportDraft rejects malformed extraction responses", () => {
  assert.throws(() =>
    parseWorkoutImportDraft({
      title: { value: "Broken", confidence: "certain", sourceImageIds: [] },
      exercises: []
    })
  );
});
