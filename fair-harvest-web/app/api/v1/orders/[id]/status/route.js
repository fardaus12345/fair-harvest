import { z } from "zod";
import { prisma } from "../../../../../../lib/server/db.js";
import { requireUser } from "../../../../../../lib/server/auth.js";
import { ok, handleRoute, ApiError } from "../../../../../../lib/server/respond.js";
import { toPublicOrder } from "../../../../../../lib/server/serializers.js";
import { recomputeFarmerReputation } from "../../../../../../lib/server/reputationSync.js";

const statusSchema = z.object({
  status: z.enum(["pending", "confirmed", "shipped", "delivered", "cancelled"]),
  note: z.string().optional()
});

export async function PATCH(request, { params }) {
  return handleRoute(async () => {
    const { id: orderId } = await params;
    const session = requireUser(request);

    const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
    if (!order) throw new ApiError("Order not found", 404);

    if (session.role !== "ADMIN") {
      const farmerProfile = await prisma.farmerProfile.findUnique({ where: { userId: session.userId } });
      const ownsAnItem = farmerProfile && order.items.some((item) => item.farmerId === farmerProfile.id);
      if (!ownsAnItem) throw new ApiError("You do not have permission to update this order", 403);
    }

    const body = await request.json().catch(() => ({}));
    const parsed = statusSchema.safeParse(body);
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message || "Invalid status", 422);

    const nextStatus = parsed.data.status.toUpperCase();
    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: nextStatus,
        statusEvents: { create: { status: nextStatus, note: parsed.data.note } }
      },
      include: { items: true, statusEvents: true }
    });

    if (nextStatus === "DELIVERED" || nextStatus === "CANCELLED") {
      const farmerIds = [...new Set(updated.items.map((item) => item.farmerId))];
      await Promise.all(farmerIds.map((id) => recomputeFarmerReputation(id)));
    }

    return ok({ order: toPublicOrder(updated) }, { message: "Order updated" });
  });
}
