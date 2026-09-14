// Farmer reputation, computed from real signals instead of the previously
// static `reputationScore` field. Kept pure (no Prisma import) so it can be
// unit-tested directly — see test/reputation.test.js.
//
// Signals used:
//  - verification status (the existing Farmer Card verification concept —
//    preserved, not replaced, as its own weighted component)
//  - average review rating (once at least one review exists)
//  - delivered-vs-total order item completion rate
//
// Before any reviews/orders exist, review/delivery scores fall back to a
// neutral baseline rather than 0, so a brand-new verified farmer isn't
// penalized for having no history yet.
function clamp(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function computeReputation({ verificationStatus, avgRating = null, reviewCount = 0, deliveredCount = 0, totalOrderItems = 0 }) {
  const verificationScore =
    verificationStatus === "VERIFIED" ? 90 : verificationStatus === "PENDING" ? 60 : 30;

  const reviewScore = reviewCount > 0 ? clamp((avgRating / 5) * 100) : 70;

  const deliveryScore = totalOrderItems > 0 ? clamp((deliveredCount / totalOrderItems) * 100) : 75;

  const overallScore = clamp(verificationScore * 0.35 + reviewScore * 0.4 + deliveryScore * 0.25);

  return {
    verification_score: verificationScore,
    review_score: reviewScore,
    delivery_score: deliveryScore,
    overall_score: overallScore
  };
}

export function badgeForScore(score) {
  if (score >= 90) return "Trusted Seller";
  if (score >= 75) return "Reliable Farmer";
  if (score >= 55) return "Growing Farmer";
  return "New Farmer";
}
