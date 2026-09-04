import { prisma } from "../../../../../../lib/server/db.js";
import { requireUser } from "../../../../../../lib/server/auth.js";
import { ok, handleRoute, ApiError } from "../../../../../../lib/server/respond.js";
import { toPublicOrder } from "../../../../../../lib/server/serializers.js";

export async function GET(request, { params }) {
  return handleRoute(async () => {
    const session = requireUser(request);
    const { id: orderId } = await params;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, statusEvents: true, payment: true }
    });
    if (!order) throw new ApiError("Order not found", 404);
    if (session.role !== "ADMIN" && session.userId !== order.userId) {
      throw new ApiError("You do not have permission to view this order", 403);
    }

    return ok({ order: toPublicOrder(order) });
  });
}
