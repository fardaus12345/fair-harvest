import assert from "node:assert/strict";
import test from "node:test";

import { decideEligibility } from "../lib/server/reviewEligibility.js";

test("rejects a customer who already reviewed the product", () => {
  const result = decideEligibility({ deliveredOrderItem: { id: "oi1" }, alreadyReviewed: true });
  assert.equal(result.eligible, false);
  assert.equal(result.reason, "already_reviewed");
});

test("rejects a customer with no delivered order item", () => {
  const result = decideEligibility({ deliveredOrderItem: null, alreadyReviewed: false });
  assert.equal(result.eligible, false);
  assert.equal(result.reason, "not_purchased");
});

test("allows a customer with a delivered order item and no prior review", () => {
  const result = decideEligibility({ deliveredOrderItem: { id: "oi1" }, alreadyReviewed: false });
  assert.equal(result.eligible, true);
  assert.equal(result.orderItemId, "oi1");
});
