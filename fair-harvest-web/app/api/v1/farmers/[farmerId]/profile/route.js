import { prisma } from "../../../../../../lib/server/db.js";
import { ok, handleRoute, ApiError } from "../../../../../../lib/server/respond.js";
import { toPublicProduct } from "../../../../../../lib/server/serializers.js";
import { maskIdentifier } from "../../../../../../lib/server/mask.js";
import { getFarmerReputationBreakdown } from "../../../../../../lib/server/reputationSync.js";

// Public farmer profile — real data, but never the full NID or Farmer Card
// number (masked, matching the platform-wide rule). Combines what used to
// require three separate calls (score, products, reviews) into one page load.
export async function GET(request, { params }) {
  return handleRoute(async () => {
    const { farmerId } = await params;
    const profile = await prisma.farmerProfile.findUnique({ where: { id: farmerId }, include: { user: true } });
    if (!profile) throw new ApiError("Farmer profile not found", 404);

    const [products, reviews, reputation] = await Promise.all([
      prisma.product.findMany({
        where: { farmerId, status: "ACTIVE" },
        include: { farmer: { include: { user: true } } },
        orderBy: { createdAt: "desc" }
      }),
      prisma.review.findMany({
        where: { farmerId, status: "PUBLISHED" },
        include: { customer: true },
        orderBy: { createdAt: "desc" },
        take: 20
      }),
      getFarmerReputationBreakdown(farmerId)
    ]);

    const reviewCount = reviews.length;
    const averageRating = reviewCount > 0 ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount).toFixed(2)) : null;

    return ok({
      farmer: {
        farmer_id: profile.id,
        name: profile.user.name,
        district: profile.district,
        verification_status: profile.verificationStatus.toLowerCase(),
        verified_at: profile.verifiedAt,
        badge: profile.badge,
        reputation_score: reputation?.breakdown.overall_score ?? profile.reputationScore,
        farmer_card_number_masked: maskIdentifier(profile.farmerCardNumber),
        average_rating: averageRating,
        review_count: reviewCount
      },
      products: products.map(toPublicProduct),
      reviews: reviews.map((review) => ({
        review_id: review.id,
        product_id: review.productId,
        customer_name: review.customer.name,
        rating: review.rating,
        comment: review.comment || "",
        created_at: review.createdAt
      }))
    });
  });
}
