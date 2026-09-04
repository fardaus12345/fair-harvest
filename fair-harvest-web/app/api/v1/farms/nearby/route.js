import { prisma } from "../../../../../lib/server/db.js";
import { ok, handleRoute } from "../../../../../lib/server/respond.js";

export async function GET() {
  return handleRoute(async () => {
    const farmers = await prisma.farmerProfile.findMany({
      where: { verificationStatus: "VERIFIED" },
      include: { user: true },
      take: 10,
      orderBy: { reputationScore: "desc" }
    });

    const farms = farmers.map((farmer, index) => ({
      farmer_id: farmer.id,
      name: farmer.user.name,
      district: farmer.district,
      reputation_score: farmer.reputationScore,
      distance_km: Number((3 + index * 2.4).toFixed(1))
    }));

    return ok({ farms, count: farms.length });
  });
}
