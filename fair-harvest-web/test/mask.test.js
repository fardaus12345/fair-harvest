import assert from "node:assert/strict";
import test from "node:test";

import { maskIdentifier } from "../lib/server/mask.js";

test("masks all but the last 4 characters", () => {
  assert.equal(maskIdentifier("BD-FARM-0001"), "********0001");
});

test("masks entirely when 4 characters or fewer", () => {
  assert.equal(maskIdentifier("1234"), "****");
  assert.equal(maskIdentifier("12"), "**");
});

test("returns null for empty input", () => {
  assert.equal(maskIdentifier(null), null);
  assert.equal(maskIdentifier(undefined), null);
  assert.equal(maskIdentifier(""), null);
});

test("never returns the original value unmasked", () => {
  const input = "BD-FARM-9999-SECRET";
  const masked = maskIdentifier(input);
  assert.notEqual(masked, input);
  assert.ok(masked.endsWith("CRET"));
});
