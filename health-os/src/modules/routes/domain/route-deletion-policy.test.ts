import assert from "node:assert/strict";
import test from "node:test";

import { shouldDeactivateRouteOnDelete } from "./route-deletion-policy.ts";

test("shouldDeactivateRouteOnDelete is true when historical cardio sessions reference the route", () => {
  assert.equal(
    shouldDeactivateRouteOnDelete("route-1", [{ routeId: null }, { routeId: "route-1" }]),
    true
  );
});

test("shouldDeactivateRouteOnDelete is false when no runs reference the route", () => {
  assert.equal(shouldDeactivateRouteOnDelete("route-1", [{ routeId: "route-2" }]), false);
});
