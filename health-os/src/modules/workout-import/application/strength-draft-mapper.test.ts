import assert from "node:assert/strict";
import test from "node:test";

import type { WorkoutImportDraft } from "../domain/workout-import.ts";

import { mapWorkoutImportDraftToStrengthInput } from "./strength-draft-mapper.ts";

const field = <T>(value: T | null, confidence: "high" | "medium" | "low" = "high") => ({
  value,
  confidence,
  sourceImageIds: ["image-1"]
});

function draft(overrides: Partial<WorkoutImportDraft> = {}): WorkoutImportDraft {
  return {
    title: field("Whole Body Free Weight"),
    workoutDate: field("2026-07-28"),
    startTime: field("15:59"),
    durationSeconds: field(5220),
    workoutType: field("Whole Body"),
    calories: field(null, "low"),
    totalVolume: field(46461),
    prCount: field(9),
    notes: field(null, "low"),
    sourceApplication: field("Workout screenshot app"),
    exercises: [
      {
        id: "exercise-1",
        exerciseName: field("Leg Press"),
        equipmentType: field("machine"),
        order: 1,
        sets: [
          {
            setNumber: 1,
            weightValue: field(60),
            reps: field(20),
            pr: field(false)
          },
          {
            setNumber: 2,
            weightValue: field(260),
            reps: field(10),
            pr: field(false)
          }
        ]
      }
    ],
    ...overrides
  };
}

test("mapWorkoutImportDraftToStrengthInput converts extracted sets into strength input", () => {
  const input = mapWorkoutImportDraftToStrengthInput(draft());

  assert.equal(input.sessionDate, "2026-07-28");
  assert.equal(input.startedAt, "2026-07-28T15:59:00+09:00");
  assert.equal(input.durationSeconds, 5220);
  assert.equal(input.workoutType, "full_body");
  assert.equal(input.exercises[0]?.exerciseName, "Leg Press");
  assert.equal(input.exercises[0]?.equipmentType, "machine");
  assert.deepEqual(
    input.exercises[0]?.sets.map((set) => ({
      reps: set.reps,
      weightValue: set.weightValue,
      weightUnit: set.weightUnit
    })),
    [
      { reps: 20, weightValue: 60, weightUnit: "kg" },
      { reps: 10, weightValue: 260, weightUnit: "kg" }
    ]
  );
});

test("mapWorkoutImportDraftToStrengthInput drops sets without valid reps", () => {
  const input = mapWorkoutImportDraftToStrengthInput(
    draft({
      exercises: [
        {
          id: "exercise-1",
          exerciseName: field("Push Up"),
          equipmentType: field("bodyweight"),
          order: 1,
          sets: [
            {
              setNumber: 1,
              weightValue: field(null, "low"),
              reps: field(12)
            },
            {
              setNumber: 2,
              weightValue: field(null, "low"),
              reps: field(null, "low")
            }
          ]
        }
      ]
    })
  );

  assert.equal(input.exercises[0]?.sets.length, 1);
  assert.equal(input.exercises[0]?.sets[0]?.weightValue, undefined);
});
