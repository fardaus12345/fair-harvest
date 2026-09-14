import { prisma } from "../../../../../../../../lib/server/db.js";
import { requireRole } from "../../../../../../../../lib/server/auth.js";
import { ok, handleRoute, ApiError } from "../../../../../../../../lib/server/respond.js";
import { toAdminFarmer } from "../../../../../../../../lib/server/serializers.js";
import { recordAudit } from "../../../../../../../../lib/server/audit.js";

export async function POST(request, { params }) {
  return handleRoute(async () => {
    const session = requireRole(request, ["ADMIN"]);
    const { farmerId } = await params;

    const profile = await prisma.farmerProfile.findUnique({ where: { id: farmerId } });
    if (!profile) throw new ApiError("Farmer not found", 404);

    const updated = await prisma.farmerProfile.update({
      where: { id: farmerId },
      data: {
        verificationStatus: "REJECTED",
        verificationMethod: "MANUAL",
        verifiedAt: null,
        verifiedByAdminId: session.userId
      },
      include: { user: true, _count: { select: { products: true } } }
    });

    await recordAudit({
      actorId: session.userId,
      actorRole: session.role,
      action: "farmer_verification_rejected",
      targetType: "FarmerProfile",
      targetId: farmerId
    });

    return ok({ farmer: toAdminFarmer(updated) }, { message: "Farmer verification rejected" });
  });
}
