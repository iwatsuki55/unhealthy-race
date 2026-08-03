import assert from "node:assert/strict";
import test from "node:test";

import { parseRunImportDraft, parseWorkoutImportDraft } from "./workout-extraction-schema.ts";

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

test("parseRunImportDraft accepts a structured cardio draft", () => {
  const draft = parseRunImportDraft({
    title: field("Evening Ride"),
    activityType: field("outdoor_cycling"),
    runDate: field("2026-07-29"),
    startTime: field("18:30"),
    distanceMeters: field(12000),
    durationSeconds: field(2400),
    averagePaceSecondsPerKm: field(null, "low"),
    averageHeartRate: field(138),
    maximumHeartRate: field(166),
    cadenceStepsPerMinute: field(null, "low"),
    calories: field(420),
    temperatureCelsius: field(29),
    humidityPercent: field(70),
    shoes: field(null, "low"),
    perceivedEffort: field(null, "low"),
    notes: field("Extracted from cycling screenshots", "medium"),
    sourceApplication: field("Apple Fitness")
  });

  assert.equal(draft.activityType.value, "outdoor_cycling");
});

test("parseWorkoutImportDraft rejects malformed extraction responses", () => {
  assert.throws(() =>
    parseWorkoutImportDraft({
      title: { value: "Broken", confidence: "certain", sourceImageIds: [] },
      exercises: []
    })
  );
});
