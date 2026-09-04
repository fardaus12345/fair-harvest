import { prisma } from "../../../../../../lib/server/db.js";
import { ok, handleRoute, ApiError } from "../../../../../../lib/server/respond.js";

function clamp(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export async function GET(request, { params }) {
  return handleRoute(async () => {
    const { farmerId } = await params;
    const profile = await prisma.farmerProfile.findUnique({ where: { id: farmerId }, include: { user: true } });
    if (!profile) throw new ApiError("Farmer profile not found", 404);

    const base = profile.reputationScore;
    return ok({
      farmer_id: profile.id,
      name: profile.user.name,
      reputation_score: base,
      badge: profile.badge,
      verification_status: profile.verificationStatus.toLowerCase(),
      breakdown: {
        quality_score: clamp(base),
        delivery_score: clamp(base - 4),
        review_score: clamp(base + 2),
        cert_score: clamp(profile.verificationStatus === "VERIFIED" ? base + 7 : base - 10)
      }
    });
  });
}
