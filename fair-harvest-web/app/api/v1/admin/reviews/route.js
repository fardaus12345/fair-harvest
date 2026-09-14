import { prisma } from "../../../../../lib/server/db.js";
import { requireRole } from "../../../../../lib/server/auth.js";
import { ok, handleRoute } from "../../../../../lib/server/respond.js";

export async function GET(request) {
  return handleRoute(async () => {
    requireRole(request, ["ADMIN"]);

    const reviews = await prisma.review.findMany({
      include: { customer: true, product: true },
      orderBy: { createdAt: "desc" }
    });

    return ok({
      reviews: reviews.map((review) => ({
        review_id: review.id,
        product_id: review.productId,
        product_name: review.product?.name,
        farmer_id: review.farmerId,
        customer_name: review.customer?.name,
        rating: review.rating,
        comment: review.comment || "",
        status: review.status.toLowerCase(),
        created_at: review.createdAt
      }))
    });
  });
}
