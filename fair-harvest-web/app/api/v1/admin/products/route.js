import { prisma } from "../../../../../lib/server/db.js";
import { requireRole } from "../../../../../lib/server/auth.js";
import { ok, handleRoute } from "../../../../../lib/server/respond.js";
import { toPublicProduct } from "../../../../../lib/server/serializers.js";

const CATEGORIES = ["vegetable", "fruit", "grain", "herb"];
const STATUSES = ["active", "out_of_stock", "archived"];

// Admin product listing. Unlike the public GET /products this returns every
// status, and supports the search and filter controls used by the admin
// product management screen.
export async function GET(request) {
  return handleRoute(async () => {
    requireRole(request, ["ADMIN"]);

    const { searchParams } = new URL(request.url);
    const search = (searchParams.get("search") || "").trim();
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const farmerId = searchParams.get("farmer_id");

    const where = {};
    if (category && CATEGORIES.includes(category)) where.category = category;
    if (status && STATUSES.includes(status)) where.status = status.toUpperCase();
    if (farmerId) where.farmerId = farmerId;
    if (search) {
      // Postgres LIKE is case sensitive, so `contains` alone would make
      // searching "spinach" miss "Organic Spinach". SQLite was case
      // insensitive for ASCII by default, which hid the difference until the
      // move to Postgres.
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { farmer: { user: { name: { contains: search, mode: "insensitive" } } } }
      ];
    }

    const products = await prisma.product.findMany({
      where,
      include: { farmer: { include: { user: true } } },
      orderBy: { createdAt: "desc" }
    });

    return ok({ products: products.map(toPublicProduct), count: products.length });
  });
}
