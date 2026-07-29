import assert from "node:assert/strict";
import test from "node:test";

import {
  addImagesToImportSession,
  buildDuplicateKey,
  createImportSession,
  moveImportedImage,
  removeImportedImage,
  reorderImportedImages
} from "./workout-import-session.ts";

const now = new Date("2026-07-29T00:00:00.000Z");

function image(name: string, orderSeed: number) {
  return {
    id: name,
    name,
    type: "image/png",
    size: 1000 + orderSeed,
    lastModified: 2000 + orderSeed
  };
}

test("buildDuplicateKey identifies the same file metadata", () => {
  assert.equal(
    buildDuplicateKey(image("Workout.PNG", 1)),
    buildDuplicateKey(image("workout.png", 1))
  );
});

test("addImagesToImportSession preserves original order and prevents duplicates", () => {
  const session = createImportSession({ id: "session-1", now, userId: "user-1" });
  const next = addImagesToImportSession(session, [
    image("one.png", 1),
    image("one.png", 1),
    image("two.png", 2)
  ]);

  assert.equal(next.status, "ready");
  assert.equal(next.images.length, 2);
  assert.deepEqual(
    next.images.map((item) => item.originalOrder),
    [1, 2]
  );
});

test("moveImportedImage changes current order without changing original order", () => {
  const session = addImagesToImportSession(
    createImportSession({ id: "session-1", now, userId: "user-1" }),
    [image("one.png", 1), image("two.png", 2)]
  );
  const moved = moveImportedImage(session, "two.png", "up");

  assert.deepEqual(
    moved.images.map((item) => item.fileName),
    ["two.png", "one.png"]
  );
  assert.deepEqual(
    moved.images.map((item) => item.originalOrder),
    [2, 1]
  );
  assert.deepEqual(
    moved.images.map((item) => item.currentOrder),
    [1, 2]
  );
});

test("reorderImportedImages keeps omitted images at the end", () => {
  const session = addImagesToImportSession(
    createImportSession({ id: "session-1", now, userId: "user-1" }),
    [image("one.png", 1), image("two.png", 2), image("three.png", 3)]
  );
  const reordered = reorderImportedImages(session, ["three.png", "one.png"]);

  assert.deepEqual(
    reordered.images.map((item) => item.fileName),
    ["three.png", "one.png", "two.png"]
  );
});

test("removeImportedImage resets empty sessions to uploading", () => {
  const session = addImagesToImportSession(
    createImportSession({ id: "session-1", now, userId: "user-1" }),
    [image("one.png", 1)]
  );
  const next = removeImportedImage(session, "one.png");

  assert.equal(next.status, "uploading");
  assert.equal(next.images.length, 0);
});
