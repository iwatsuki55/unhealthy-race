import assert from "node:assert/strict";
import test from "node:test";

import { dateOnlyStringToUtcDate } from "./cardio-session-dates.ts";

test("dateOnlyStringToUtcDate creates the session date in the user's timezone", () => {
  assert.equal(
    dateOnlyStringToUtcDate("2026-08-08", "Asia/Tokyo").toISOString(),
    "2026-08-07T15:00:00.000Z"
  );
});

test("dateOnlyStringToUtcDate handles Dec 31 / Jan 1 timezone boundaries", () => {
  assert.equal(
    dateOnlyStringToUtcDate("2026-12-31", "Asia/Tokyo").toISOString(),
    "2026-12-30T15:00:00.000Z"
  );
  assert.equal(
    dateOnlyStringToUtcDate("2027-01-01", "Asia/Tokyo").toISOString(),
    "2026-12-31T15:00:00.000Z"
  );
});

test("dateOnlyStringToUtcDate respects non-JST user timezones", () => {
  assert.equal(
    dateOnlyStringToUtcDate("2026-08-08", "America/Los_Angeles").toISOString(),
    "2026-08-08T07:00:00.000Z"
  );
});
