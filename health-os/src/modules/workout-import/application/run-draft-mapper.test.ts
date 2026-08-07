import assert from "node:assert/strict";
import test from "node:test";

import type { RunImportDraft } from "../domain/workout-import.ts";

import {
  getCardioImportDraftSaveIssue,
  mapRunImportDraftToRunInput,
  normalizeCardioImportDate
} from "./run-draft-mapper.ts";

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

test("normalizeCardioImportDate preserves Aug 8, 2026 explicitly", () => {
  assert.equal(normalizeCardioImportDate("Aug 8, 2026"), "2026-08-08");
  assert.equal(normalizeCardioImportDate("August 8 2026"), "2026-08-08");
  assert.equal(normalizeCardioImportDate("2026-08-08"), "2026-08-08");
});

test("normalizeCardioImportDate handles Dec 31 / Jan 1 boundary dates", () => {
  assert.equal(normalizeCardioImportDate("Dec 31, 2026"), "2026-12-31");
  assert.equal(normalizeCardioImportDate("Jan 1, 2027"), "2027-01-01");
});

test("normalizeCardioImportDate rejects screenshots without a year", () => {
  assert.equal(normalizeCardioImportDate("Aug 8"), undefined);
  assert.equal(normalizeCardioImportDate("Saturday, Aug 8"), undefined);
});

test("mapRunImportDraftToRunInput does not default missing years to the current day", () => {
  const input = mapRunImportDraftToRunInput(
    draft({
      runDate: field("Aug 8", "high")
    })
  );

  assert.equal(input.runDate, undefined);
  assert.equal(input.startedAt, undefined);
});

test("getCardioImportDraftSaveIssue requires review for low-confidence or ambiguous dates", () => {
  assert.match(
    getCardioImportDraftSaveIssue(
      draft({
        runDate: field("2026-08-08", "low")
      })
    ) ?? "",
    /low confidence/
  );
  assert.match(
    getCardioImportDraftSaveIssue(
      draft({
        runDate: {
          ...field("Aug 8", "high"),
          alternatives: ["Aug 8, 2026"],
          conflict: true
        }
      })
    ) ?? "",
    /conflicting/
  );
});

test("getCardioImportDraftSaveIssue blocks suspicious default 2020 dates", () => {
  assert.match(
    getCardioImportDraftSaveIssue(
      draft({
        runDate: field("Aug 7, 2020", "high")
      })
    ) ?? "",
    /default 2020/
  );
});

test("current-day imports keep the detected year when present", () => {
  const input = mapRunImportDraftToRunInput(
    draft({
      runDate: field("2026-08-08", "high")
    })
  );

  assert.equal(input.runDate, "2026-08-08");
});

test("mapRunImportDraftToRunInput ignores image metadata-like source ids for workout date", () => {
  const input = mapRunImportDraftToRunInput(
    draft({
      runDate: {
        ...field("Aug 8, 2026", "high"),
        sourceImageIds: ["upload-2020-08-07T00:00:00Z", "exif-2020-08-07"]
      }
    })
  );

  assert.equal(input.runDate, "2026-08-08");
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
