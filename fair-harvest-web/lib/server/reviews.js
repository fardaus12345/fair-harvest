import { prisma } from "./db.js";
import { decideEligibility } from "./reviewEligibility.js";

export { decideEligibility };

// A customer may review a product only once they have a DELIVERED order
// item for it, and only once per product overall (enforced again at the DB
// level by Review's unique constraints — this is the friendly pre-check).
export async function getReviewEligibility(customerId, productId) {
  const [deliveredOrderItem, existingReview] = await Promise.all([
    prisma.orderItem.findFirst({
      where: { productId, order: { userId: customerId, status: "DELIVERED" } },
      orderBy: { id: "desc" }
    }),
    prisma.review.findUnique({ where: { customerId_productId: { customerId, productId } } })
  ]);

  return decideEligibility({ deliveredOrderItem, alreadyReviewed: Boolean(existingReview) });
}
