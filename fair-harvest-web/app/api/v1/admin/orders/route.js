import { prisma } from "../../../../../lib/server/db.js";
import { requireRole } from "../../../../../lib/server/auth.js";
import { ok, handleRoute } from "../../../../../lib/server/respond.js";
import { toAdminOrder } from "../../../../../lib/server/serializers.js";

export async function GET(request) {
  return handleRoute(async () => {
    requireRole(request, ["ADMIN"]);

    const orders = await prisma.order.findMany({
      include: { items: true, statusEvents: true, user: true },
      orderBy: { createdAt: "desc" }
    });

    return ok({ orders: orders.map(toAdminOrder) });
  });
}
