import { prisma } from "../../../../../../lib/server/db.js";
import { requireRole } from "../../../../../../lib/server/auth.js";
import { ok, handleRoute } from "../../../../../../lib/server/respond.js";
import { toAdminFarmer } from "../../../../../../lib/server/serializers.js";

export async function GET(request) {
  return handleRoute(async () => {
    requireRole(request, ["ADMIN"]);

    const profiles = await prisma.farmerProfile.findMany({
      where: { verificationStatus: "PENDING" },
      include: { user: true, _count: { select: { products: true } } },
      orderBy: { createdAt: "asc" }
    });

    return ok({ farmers: profiles.map(toAdminFarmer) });
  });
}
