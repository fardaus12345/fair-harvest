// Pure earnings aggregation over a farmer's OrderItem rows. Deliberately
// calls this "earnings", never "paid out" or "balance" — no real payout
// processing exists in this system (COD/demo payment only), so we only ever
// report what has been sold, not money that has actually moved.
function round2(value) {
  return Number(value.toFixed(2));
}

export function summarizeEarnings(orderItems) {
  let totalSalesBdt = 0;
  let completedSalesBdt = 0;
  let pendingSalesBdt = 0;
  let completedCount = 0;
  let pendingCount = 0;
  let cancelledCount = 0;

  for (const item of orderItems) {
    if (item.orderStatus === "CANCELLED") {
      cancelledCount += 1;
      continue;
    }
    totalSalesBdt += item.lineTotalBdt;
    if (item.orderStatus === "DELIVERED") {
      completedSalesBdt += item.lineTotalBdt;
      completedCount += 1;
    } else {
      pendingSalesBdt += item.lineTotalBdt;
      pendingCount += 1;
    }
  }

  return {
    total_sales_bdt: round2(totalSalesBdt),
    completed_sales_bdt: round2(completedSalesBdt),
    pending_sales_bdt: round2(pendingSalesBdt),
    completed_order_items: completedCount,
    pending_order_items: pendingCount,
    cancelled_order_items: cancelledCount,
    note: "Reflects order value, not an actual payout — no payment gateway/payout processing exists in this system."
  };
}
