import assert from "node:assert/strict";
import test from "node:test";

import { getCardioActivityConfig } from "./cardio-activity.ts";

test("outdoor run keeps distance, route, pace, and cadence behavior", () => {
  const config = getCardioActivityConfig("outdoor_run");

  assert.equal(config.requiresDistance, true);
  assert.equal(config.supportsRoute, true);
  assert.equal(config.showsPace, true);
  assert.equal(config.supportsCadence, true);
});

test("exercise bike is cardio without required distance or pace", () => {
  const config = getCardioActivityConfig("exercise_bike");

  assert.equal(config.requiresDistance, false);
  assert.equal(config.supportsRoute, false);
  assert.equal(config.showsPace, false);
});

test("swimming hides pace and keeps distance optional for MVP", () => {
  const config = getCardioActivityConfig("swimming");

  assert.equal(config.supportsDistance, true);
  assert.equal(config.requiresDistance, false);
  assert.equal(config.showsPace, false);
});
