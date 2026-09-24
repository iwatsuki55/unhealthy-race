import assert from "node:assert/strict";
import test from "node:test";

import { getSupportedWorkoutImageMimeType, isHeicWorkoutImage } from "./workout-image-format.ts";

test("recognizes iPhone HEIC images that require conversion", () => {
  assert.equal(isHeicWorkoutImage({ name: "IMG_1001.HEIC", type: "" }), true);
  assert.equal(isHeicWorkoutImage({ name: "IMG_1001", type: "image/heif" }), true);
});

test("normalizes supported workout image MIME types", () => {
  assert.equal(getSupportedWorkoutImageMimeType({ name: "run.JPG", type: "" }), "image/jpeg");
  assert.equal(
    getSupportedWorkoutImageMimeType({ name: "run.dat", type: "image/webp" }),
    "image/webp"
  );
});

test("does not pass HEIC through as a supported OpenAI image", () => {
  assert.equal(
    getSupportedWorkoutImageMimeType({ name: "IMG_1001.HEIC", type: "image/heic" }),
    undefined
  );
});
