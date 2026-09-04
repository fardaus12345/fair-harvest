import { prisma } from "../../../../../../lib/server/db.js";
import { requireOwnerOrRole } from "../../../../../../lib/server/auth.js";
import { ok, handleRoute } from "../../../../../../lib/server/respond.js";
import { toPublicRewards } from "../../../../../../lib/server/serializers.js";

export async function GET(request, { params }) {
  return handleRoute(async () => {
    const { userId } = await params;
    requireOwnerOrRole(request, userId, ["ADMIN"]);

    const entries = await prisma.rewardsLedger.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
    return ok(toPublicRewards(userId, entries));
  });
}
