import { prisma } from "../../../../../lib/server/db.js";
import { requireUser } from "../../../../../lib/server/auth.js";
import { ok, handleRoute, ApiError } from "../../../../../lib/server/respond.js";
import { summarizeEarnings } from "../../../../../lib/server/earnings.js";

export async function GET(request) {
  return handleRoute(async () => {
    const session = requireUser(request);
    if (session.role !== "FARMER") throw new ApiError("Only farmers can view earnings", 403);

    const farmerProfile = await prisma.farmerProfile.findUnique({ where: { userId: session.userId } });
    if (!farmerProfile) throw new ApiError("Farmer profile not found", 404);

    const items = await prisma.orderItem.findMany({
      where: { farmerId: farmerProfile.id },
      include: { order: { select: { status: true } } }
    });

    const earnings = summarizeEarnings(items.map((item) => ({ lineTotalBdt: item.lineTotalBdt, orderStatus: item.order.status })));
    return ok(earnings);
  });
}
