import assert from "node:assert/strict";
import test from "node:test";

import type { RunImportDraft } from "../domain/workout-import.ts";

import { mapRunImportDraftToRunInput } from "./run-draft-mapper.ts";

const field = <T>(value: T | null, confidence: "high" | "medium" | "low" = "high") => ({
  value,
  confidence,
  sourceImageIds: ["image-1"]
});

function draft(overrides: Partial<RunImportDraft> = {}): RunImportDraft {
  return {
    title: field("Morning Run"),
    activityType: field("outdoor_run"),
    runDate: field("2026-07-29"),
    startTime: field("06:45"),
    distanceMeters: field(5000),
    durationSeconds: field(1800),
    averagePaceSecondsPerKm: field(360),
    averageHeartRate: field(145),
    maximumHeartRate: field(171),
    cadenceStepsPerMinute: field(174),
    calories: field(320),
    temperatureCelsius: field(28),
    humidityPercent: field(72),
    shoes: field("Nike Pegasus 41"),
    perceivedEffort: field(6),
    notes: field("Imported from screenshots"),
    sourceApplication: field("Apple Fitness"),
    ...overrides
  };
}

test("mapRunImportDraftToRunInput converts extracted run fields", () => {
  const input = mapRunImportDraftToRunInput(draft());

  assert.equal(input.runDate, "2026-07-29");
  assert.equal(input.activityType, "outdoor_run");
  assert.equal(input.startedAt, "2026-07-29T06:45:00+09:00");
  assert.equal(input.distanceMeters, 5000);
  assert.equal(input.durationSeconds, 1800);
  assert.equal(input.averageHeartRate, 145);
  assert.equal(input.shoes, "Nike Pegasus 41");
});

test("mapRunImportDraftToRunInput preserves supported cardio activity type", () => {
  const input = mapRunImportDraftToRunInput(
    draft({
      activityType: field("outdoor_cycling")
    })
  );

  assert.equal(input.activityType, "outdoor_cycling");
});

test("mapRunImportDraftToRunInput leaves missing required values for schema validation", () => {
  const input = mapRunImportDraftToRunInput(
    draft({
      distanceMeters: field(null, "low"),
      durationSeconds: field(null, "low")
    })
  );

  assert.equal(input.distanceMeters, undefined);
  assert.equal(input.durationSeconds, undefined);
});
