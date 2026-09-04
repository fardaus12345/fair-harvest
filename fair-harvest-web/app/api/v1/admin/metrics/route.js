import { prisma } from "../../../../../lib/server/db.js";
import { requireRole } from "../../../../../lib/server/auth.js";
import { ok, handleRoute } from "../../../../../lib/server/respond.js";

export async function GET(request) {
  return handleRoute(async () => {
    requireRole(request, ["ADMIN"]);

    const [totalUsers, totalFarmers, pendingVerifications, activeProducts, totalOrders, revenue] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "FARMER" } }),
      prisma.farmerProfile.count({ where: { verificationStatus: "PENDING" } }),
      prisma.product.count({ where: { status: "ACTIVE" } }),
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { totalBdt: true }, where: { paymentStatus: "PAID" } })
    ]);

    return ok({
      total_users: totalUsers,
      total_farmers: totalFarmers,
      pending_verifications: pendingVerifications,
      active_products: activeProducts,
      total_orders: totalOrders,
      revenue_bdt: revenue._sum.totalBdt || 0
    });
  });
}
