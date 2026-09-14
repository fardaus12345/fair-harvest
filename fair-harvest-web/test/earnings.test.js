import assert from "node:assert/strict";
import test from "node:test";

import { summarizeEarnings } from "../lib/server/earnings.js";

test("splits sales into completed, pending and cancelled", () => {
  const result = summarizeEarnings([
    { lineTotalBdt: 100, orderStatus: "DELIVERED" },
    { lineTotalBdt: 50, orderStatus: "SHIPPED" },
    { lineTotalBdt: 30, orderStatus: "CANCELLED" }
  ]);

  assert.equal(result.completed_sales_bdt, 100);
  assert.equal(result.pending_sales_bdt, 50);
  assert.equal(result.completed_order_items, 1);
  assert.equal(result.pending_order_items, 1);
  assert.equal(result.cancelled_order_items, 1);
  assert.equal(result.total_sales_bdt, 150);
});

test("returns zeros for no order items", () => {
  const result = summarizeEarnings([]);
  assert.equal(result.total_sales_bdt, 0);
  assert.equal(result.completed_sales_bdt, 0);
  assert.equal(result.pending_sales_bdt, 0);
});

test("never calls this a payout", () => {
  const result = summarizeEarnings([]);
  assert.match(result.note, /not an actual payout/i);
});
