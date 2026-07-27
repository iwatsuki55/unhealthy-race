import assert from "node:assert/strict";
import test from "node:test";

import {
  dateStringSchema,
  positiveIntSchema,
  ratingSchema,
  urlStringSchema
} from "./validation.ts";

test("validation boundaries reject invalid values", () => {
  assert.equal(positiveIntSchema.safeParse(0).success, false);
  assert.equal(ratingSchema.safeParse(11).success, false);
  assert.equal(dateStringSchema.safeParse("07/27/2026").success, false);
  assert.equal(urlStringSchema.safeParse("not a url").success, false);
});

test("validation boundaries accept intended values", () => {
  assert.equal(positiveIntSchema.safeParse(1).success, true);
  assert.equal(ratingSchema.safeParse(10).success, true);
  assert.equal(dateStringSchema.safeParse("2026-07-27").success, true);
  assert.equal(urlStringSchema.safeParse("https://maps.google.com/example").success, true);
});
