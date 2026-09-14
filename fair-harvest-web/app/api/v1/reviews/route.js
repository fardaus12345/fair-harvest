import { z } from "zod";
import { prisma } from "../../../../lib/server/db.js";
import { requireUser } from "../../../../lib/server/auth.js";
import { ok, handleRoute, ApiError } from "../../../../lib/server/respond.js";
import { getReviewEligibility } from "../../../../lib/server/reviews.js";
import { recomputeFarmerReputation } from "../../../../lib/server/reputationSync.js";

function toPublicReview(review) {
  return {
    review_id: review.id,
    product_id: review.productId,
    farmer_id: review.farmerId,
    customer_name: review.customer?.name,
    rating: review.rating,
    comment: review.comment || "",
    status: review.status.toLowerCase(),
    created_at: review.createdAt
  };
}

function aggregate(reviews) {
  const count = reviews.length;
  const average = count > 0 ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / count).toFixed(2)) : 0;
  return { average_rating: average, review_count: count };
}

// Public read — anyone can see published reviews for a product or farmer.
export async function GET(request) {
  return handleRoute(async () => {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("product_id");
    const farmerId = searchParams.get("farmer_id");

    const where = { status: "PUBLISHED" };
    if (productId) where.productId = productId;
    if (farmerId) where.farmerId = farmerId;
    if (!productId && !farmerId) throw new ApiError("product_id or farmer_id is required", 422);

    const reviews = await prisma.review.findMany({
      where,
      include: { customer: true },
      orderBy: { createdAt: "desc" }
    });

    return ok({ reviews: reviews.map(toPublicReview), ...aggregate(reviews) });
  });
}

const createReviewSchema = z.object({
  product_id: z.string().min(1, "product_id is required"),
  rating: z.coerce.number().int().min(1, "Rating must be 1-5").max(5, "Rating must be 1-5"),
  comment: z.string().max(1000).optional()
});

// Only authenticated customers, and only for a product they have a
// DELIVERED order item for (see lib/server/reviews.js) — never trusted from
// the client, always re-derived server-side.
export async function POST(request) {
  return handleRoute(async () => {
    const session = requireUser(request);
    if (session.role !== "CONSUMER") throw new ApiError("Only customers can leave reviews", 403);

    const body = await request.json().catch(() => ({}));
    const parsed = createReviewSchema.safeParse(body);
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message || "Invalid review", 422);
    const { product_id: productId, rating, comment } = parsed.data;

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new ApiError("Product not found", 404);

    const eligibility = await getReviewEligibility(session.userId, productId);
    if (!eligibility.eligible) {
      const message =
        eligibility.reason === "already_reviewed"
          ? "You have already reviewed this product"
          : "You can only review products you have purchased and received";
      throw new ApiError(message, 403);
    }

    const review = await prisma.review.create({
      data: {
        customerId: session.userId,
        productId,
        farmerId: product.farmerId,
        orderItemId: eligibility.orderItemId,
        rating,
        comment: comment || null
      },
      include: { customer: true }
    });

    await recomputeFarmerReputation(product.farmerId);

    return ok({ review: toPublicReview(review) }, { message: "Review submitted", status: 201 });
  });
}
