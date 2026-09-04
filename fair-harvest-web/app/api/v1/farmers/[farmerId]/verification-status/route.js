import { prisma } from "../../../../../../lib/server/db.js";
import { requireOwnerOrRole } from "../../../../../../lib/server/auth.js";
import { ok, handleRoute, ApiError } from "../../../../../../lib/server/respond.js";
import { toPublicFarmerProfile } from "../../../../../../lib/server/serializers.js";

export async function GET(request, { params }) {
  return handleRoute(async () => {
    const { farmerId } = await params;
    const profile = await prisma.farmerProfile.findUnique({ where: { id: farmerId }, include: { user: true } });
    if (!profile) throw new ApiError("Farmer profile not found", 404);

    requireOwnerOrRole(request, profile.userId, ["ADMIN"]);

    return ok({ farmer: toPublicFarmerProfile(profile) });
  });
}
