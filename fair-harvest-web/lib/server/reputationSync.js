import { prisma } from "./db.js";
import { computeReputation, badgeForScore } from "./reputation.js";

// Recomputes and persists a farmer's reputationScore/badge from real signals
// (verification status, review ratings, delivered-order completion rate).
// Called after events that change one of those signals: a new review, a
// farmer verification decision, or an order status update. Replaces the
// previous behavior where reputationScore only ever changed via direct
// admin edits or the initial seed value.
// Side-effect-free: computes the current breakdown without writing. Safe to
// call from a GET route.
export async function getFarmerReputationBreakdown(farmerId) {
  const [profile, reviews, orderItems] = await Promise.all([
    prisma.farmerProfile.findUnique({ where: { id: farmerId } }),
    prisma.review.findMany({ where: { farmerId, status: "PUBLISHED" } }),
    prisma.orderItem.findMany({ where: { farmerId }, include: { order: { select: { status: true } } } })
  ]);
  if (!profile) return null;

  const reviewCount = reviews.length;
  const avgRating = reviewCount > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount : null;
  const totalOrderItems = orderItems.length;
  const deliveredCount = orderItems.filter((item) => item.order.status === "DELIVERED").length;

  const breakdown = computeReputation({
    verificationStatus: profile.verificationStatus,
    avgRating,
    reviewCount,
    deliveredCount,
    totalOrderItems
  });

  return { profile, breakdown, reviewCount, avgRating, deliveredCount, totalOrderItems };
}

// Recomputes and persists — call after an event that changes a signal (a
// new review, a verification decision, an order status update).
export async function recomputeFarmerReputation(farmerId) {
  const result = await getFarmerReputationBreakdown(farmerId);
  if (!result) return null;

  const updated = await prisma.farmerProfile.update({
    where: { id: farmerId },
    data: { reputationScore: result.breakdown.overall_score, badge: badgeForScore(result.breakdown.overall_score) }
  });

  return { ...result, profile: updated };
}
