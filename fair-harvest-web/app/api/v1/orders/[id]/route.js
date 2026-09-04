import { prisma } from "../../../../../lib/server/db.js";
import { requireOwnerOrRole } from "../../../../../lib/server/auth.js";
import { ok, handleRoute } from "../../../../../lib/server/respond.js";
import { toPublicOrder } from "../../../../../lib/server/serializers.js";

export async function GET(request, { params }) {
  return handleRoute(async () => {
    const { id: userId } = await params;
    requireOwnerOrRole(request, userId, ["ADMIN"]);

    const orders = await prisma.order.findMany({
      where: { userId },
      include: { items: true, statusEvents: true },
      orderBy: { createdAt: "desc" }
    });

    return ok({ orders: orders.map(toPublicOrder) });
  });
}
