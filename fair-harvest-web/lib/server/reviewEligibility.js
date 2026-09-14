// Pure decision function, deliberately kept dependency-free (no Prisma
// import) so it can be unit-tested without a database connection — see
// test/reviews.test.js. Re-exported from reviews.js for the Prisma-backed
// lookup that uses it.
export function decideEligibility({ deliveredOrderItem, alreadyReviewed }) {
  if (alreadyReviewed) return { eligible: false, reason: "already_reviewed" };
  if (!deliveredOrderItem) return { eligible: false, reason: "not_purchased" };
  return { eligible: true, orderItemId: deliveredOrderItem.id };
}
