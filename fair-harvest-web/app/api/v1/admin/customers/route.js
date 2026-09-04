import { prisma } from "../../../../../lib/server/db.js";
import { requireRole } from "../../../../../lib/server/auth.js";
import { ok, handleRoute } from "../../../../../lib/server/respond.js";
import { toAdminCustomer } from "../../../../../lib/server/serializers.js";

export async function GET(request) {
  return handleRoute(async () => {
    requireRole(request, ["ADMIN"]);

    const customers = await prisma.user.findMany({
      where: { role: "CONSUMER" },
      include: { _count: { select: { orders: true } } },
      orderBy: { createdAt: "desc" }
    });

    return ok({ customers: customers.map(toAdminCustomer) });
  });
}
