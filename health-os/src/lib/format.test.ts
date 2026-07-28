import assert from "node:assert/strict";
import test from "node:test";

import {
  formatDateInputValue,
  durationInputToSeconds,
  kilometersInputToMeters,
  metersToKilometersInput,
  normalizeDurationInput,
  secondsToDurationInput
} from "./format.ts";
import { calculateAveragePaceSecondsPerKm } from "../modules/running/domain/run-calculations.ts";

test("kilometersInputToMeters converts decimal kilometers to integer meters", () => {
  assert.equal(kilometersInputToMeters("3.12"), 3120);
  assert.equal(kilometersInputToMeters("6.0"), 6000);
  assert.equal(kilometersInputToMeters("10"), 10000);
});

test("kilometersInputToMeters rejects more than two decimals", () => {
  assert.equal(kilometersInputToMeters("3.123"), "3.123");
});

test("metersToKilometersInput formats meters for manual entry", () => {
  assert.equal(metersToKilometersInput(3120), "3.12");
  assert.equal(metersToKilometersInput(6000), "6");
});

test("durationInputToSeconds accepts mm:ss and hh:mm:ss", () => {
  assert.equal(durationInputToSeconds("35:00"), 2100);
  assert.equal(durationInputToSeconds("01:05:30"), 3930);
});

test("durationInputToSeconds accepts compact mobile-friendly digits", () => {
  assert.equal(durationInputToSeconds("35"), 2100);
  assert.equal(durationInputToSeconds("3500"), 2100);
  assert.equal(durationInputToSeconds("10530"), 3930);
});

test("durationInputToSeconds rejects invalid time formats", () => {
  assert.equal(durationInputToSeconds("3599"), "3599");
  assert.equal(durationInputToSeconds("35:99"), "35:99");
  assert.equal(durationInputToSeconds("01:75:30"), "01:75:30");
});

test("normalizeDurationInput formats compact mobile-friendly digits", () => {
  assert.equal(normalizeDurationInput("35"), "35:00");
  assert.equal(normalizeDurationInput("930"), "9:30");
  assert.equal(normalizeDurationInput("3500"), "35:00");
  assert.equal(normalizeDurationInput("10530"), "01:05:30");
  assert.equal(normalizeDurationInput("3599"), null);
});

test("secondsToDurationInput uses mm:ss under one hour and hh:mm:ss for longer durations", () => {
  assert.equal(secondsToDurationInput(2100), "35:00");
  assert.equal(secondsToDurationInput(3930), "01:05:30");
});

test("calculateAveragePaceSecondsPerKm rounds pace from meters and seconds", () => {
  assert.equal(calculateAveragePaceSecondsPerKm(5000, 1800), 360);
});

test("formatDateInputValue uses the configured timezone without UTC date shifts", () => {
  assert.equal(
    formatDateInputValue(new Date("2026-07-26T15:00:00.000Z"), "Asia/Tokyo"),
    "2026-07-27"
  );
});
