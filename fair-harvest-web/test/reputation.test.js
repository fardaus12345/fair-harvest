import assert from "node:assert/strict";
import test from "node:test";

import { computeReputation, badgeForScore } from "../lib/server/reputation.js";

test("computeReputation gives a neutral baseline with no signals", () => {
  const breakdown = computeReputation({
    verificationStatus: "PENDING",
    avgRating: null,
    reviewCount: 0,
    deliveredCount: 0,
    totalOrderItems: 0
  });
  assert.ok(breakdown.overall_score > 0 && breakdown.overall_score <= 100);
});

test("computeReputation rewards verification and good reviews", () => {
  const verified = computeReputation({ verificationStatus: "VERIFIED", avgRating: 5, reviewCount: 10, deliveredCount: 10, totalOrderItems: 10 });
  const pending = computeReputation({ verificationStatus: "REJECTED", avgRating: 2, reviewCount: 10, deliveredCount: 2, totalOrderItems: 10 });
  assert.ok(verified.overall_score > pending.overall_score);
});

test("computeReputation stays within 0-100 bounds", () => {
  const high = computeReputation({ verificationStatus: "VERIFIED", avgRating: 5, reviewCount: 100, deliveredCount: 100, totalOrderItems: 100 });
  assert.ok(high.overall_score <= 100);
  const low = computeReputation({ verificationStatus: "REJECTED", avgRating: 1, reviewCount: 5, deliveredCount: 0, totalOrderItems: 10 });
  assert.ok(low.overall_score >= 0);
});

test("badgeForScore maps score ranges to labels", () => {
  assert.equal(badgeForScore(95), "Trusted Seller");
  assert.equal(badgeForScore(80), "Reliable Farmer");
  assert.equal(badgeForScore(60), "Growing Farmer");
  assert.equal(badgeForScore(30), "New Farmer");
});
