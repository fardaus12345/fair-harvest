import assert from "node:assert/strict";
import test from "node:test";

import { enforceRateLimit } from "../lib/server/rateLimit.js";

function fakeRequest(ip) {
  return { headers: { get: (name) => (name === "x-forwarded-for" ? ip : null) } };
}

test("allows requests under the limit", () => {
  const req = fakeRequest("10.0.0.1");
  const scope = `test-scope-${Date.now()}-a`;
  for (let i = 0; i < 5; i += 1) {
    assert.doesNotThrow(() => enforceRateLimit(req, scope, { max: 5, windowMs: 60_000 }));
  }
});

test("throws 429 once the limit is exceeded", () => {
  const req = fakeRequest("10.0.0.2");
  const scope = `test-scope-${Date.now()}-b`;
  for (let i = 0; i < 3; i += 1) enforceRateLimit(req, scope, { max: 3, windowMs: 60_000 });

  assert.throws(() => enforceRateLimit(req, scope, { max: 3, windowMs: 60_000 }), (err) => err.statusCode === 429 || err.status === 429);
});

test("tracks separate IPs independently", () => {
  const scope = `test-scope-${Date.now()}-c`;
  const reqA = fakeRequest("10.0.0.3");
  const reqB = fakeRequest("10.0.0.4");
  enforceRateLimit(reqA, scope, { max: 1, windowMs: 60_000 });
  assert.doesNotThrow(() => enforceRateLimit(reqB, scope, { max: 1, windowMs: 60_000 }));
  assert.throws(() => enforceRateLimit(reqA, scope, { max: 1, windowMs: 60_000 }));
});
