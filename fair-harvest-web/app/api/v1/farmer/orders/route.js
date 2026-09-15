import { prisma } from "../../../../../lib/server/db.js";
import { requireUser } from "../../../../../lib/server/auth.js";
import { ok, handleRoute, ApiError } from "../../../../../lib/server/respond.js";

// The farmer's own "My Orders" view — resolves the farmer profile from the
// authenticated session (never a client-supplied farmerId), then returns
// only the line items that belong to them out of any multi-farmer order, so
// one farmer never sees another farmer's items or a customer's full order.
export async function GET(request) {
  return handleRoute(async () => {
    const session = requireUser(request);
    if (session.role !== "FARMER") throw new ApiError("Only farmers can view this", 403);

    const farmerProfile = await prisma.farmerProfile.findUnique({ where: { userId: session.userId } });
    if (!farmerProfile) throw new ApiError("Farmer profile not found", 404);

    const items = await prisma.orderItem.findMany({
      where: { farmerId: farmerProfile.id },
      include: {
        product: { select: { imageUrl: true } },
        order: { select: { id: true, status: true, createdAt: true, deliveryLine1: true, deliveryCity: true, user: { select: { name: true } } } }
      },
      orderBy: { id: "desc" }
    });

    return ok({
      order_items: items.map((item) => ({
        order_item_id: item.id,
        order_id: item.orderId,
        product_id: item.productId,
        product_name: item.nameSnapshot,
        image_url: item.product?.imageUrl || null,
        quantity_kg: item.quantityKg,
        line_total_bdt: item.lineTotalBdt,
        order_status: item.order.status.toLowerCase(),
        customer_name: item.order.user.name,
        delivery_address: `${item.order.deliveryLine1}, ${item.order.deliveryCity}`,
        created_at: item.order.createdAt
      }))
    });
  });
}
