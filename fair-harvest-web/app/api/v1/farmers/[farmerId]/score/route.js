import { handleRoute, ApiError, ok } from "../../../../../../lib/server/respond.js";
import { getFarmerReputationBreakdown } from "../../../../../../lib/server/reputationSync.js";

export async function GET(request, { params }) {
  return handleRoute(async () => {
    const { farmerId } = await params;
    const result = await getFarmerReputationBreakdown(farmerId);
    if (!result) throw new ApiError("Farmer profile not found", 404);
    const { profile, breakdown, reviewCount, avgRating } = result;

    return ok({
      farmer_id: profile.id,
      reputation_score: breakdown.overall_score,
      badge: profile.badge,
      verification_status: profile.verificationStatus.toLowerCase(),
      review_count: reviewCount,
      average_rating: avgRating !== null ? Number(avgRating.toFixed(2)) : null,
      breakdown: {
        quality_score: breakdown.review_score,
        delivery_score: breakdown.delivery_score,
        review_score: breakdown.review_score,
        cert_score: breakdown.verification_score
      }
    });
  });
}
