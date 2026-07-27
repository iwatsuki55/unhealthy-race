import assert from "node:assert/strict";
import test from "node:test";

import {
  durationInputToSeconds,
  kilometersInputToMeters,
  metersToKilometersInput,
  secondsToDurationInput
} from "./format.ts";

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

test("durationInputToSeconds rejects invalid time formats", () => {
  assert.equal(durationInputToSeconds("35"), "35");
  assert.equal(durationInputToSeconds("35:99"), "35:99");
  assert.equal(durationInputToSeconds("01:75:30"), "01:75:30");
});

test("secondsToDurationInput uses mm:ss under one hour and hh:mm:ss for longer durations", () => {
  assert.equal(secondsToDurationInput(2100), "35:00");
  assert.equal(secondsToDurationInput(3930), "01:05:30");
});
