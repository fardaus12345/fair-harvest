import { prisma } from "../../../../../lib/server/db.js";
import { requireRole } from "../../../../../lib/server/auth.js";
import { ok, handleRoute } from "../../../../../lib/server/respond.js";
import { toPublicProduct } from "../../../../../lib/server/serializers.js";

export async function GET(request) {
  return handleRoute(async () => {
    requireRole(request, ["ADMIN"]);

    const products = await prisma.product.findMany({
      include: { farmer: { include: { user: true } } },
      orderBy: { createdAt: "desc" }
    });

    return ok({ products: products.map(toPublicProduct) });
  });
}
