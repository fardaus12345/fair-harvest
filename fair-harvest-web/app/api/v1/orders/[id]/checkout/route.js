import { z } from "zod";
import { prisma } from "../../../../../../lib/server/db.js";
import { requireOwnerOrRole } from "../../../../../../lib/server/auth.js";
import { ok, handleRoute, ApiError } from "../../../../../../lib/server/respond.js";
import { toPublicOrder } from "../../../../../../lib/server/serializers.js";

const checkoutSchema = z.object({
  delivery_address: z.object({
    line1: z.string().min(1, "Delivery address is required"),
    city: z.string().min(1, "City is required")
  }),
  delivery_fee_bdt: z.coerce.number().nonnegative().optional(),
  payment_method: z.enum(["cod", "demo_card"]).optional()
});

export async function POST(request, { params }) {
  return handleRoute(async () => {
    const { id: userId } = await params;
    requireOwnerOrRole(request, userId, ["ADMIN"]);

    const body = await request.json().catch(() => ({}));
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message || "Invalid checkout data", 422);
    const { delivery_address: address, delivery_fee_bdt: deliveryFeeInput, payment_method: paymentMethodInput } = parsed.data;

    const cart = await prisma.cart.findUnique({ where: { userId }, include: { items: { include: { product: true } } } });
    if (!cart || cart.items.length === 0) throw new ApiError("Your cart is empty", 400);

    for (const item of cart.items) {
      if (item.product.quantityKg < item.quantityKg) {
        throw new ApiError(`Not enough stock for ${item.product.name}`, 409);
      }
    }

    const deliveryFee = deliveryFeeInput ?? 60;
    const subtotal = cart.items.reduce((sum, item) => sum + item.unitPriceBdt * item.quantityKg, 0);
    const total = Number((subtotal + deliveryFee).toFixed(2));
    const method = paymentMethodInput === "cod" ? "COD" : "DEMO_CARD";
    const isDemoCardPaid = method === "DEMO_CARD";

    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          userId,
          totalBdt: total,
          deliveryFeeBdt: deliveryFee,
          deliveryLine1: address.line1,
          deliveryCity: address.city,
          paymentMethod: method,
          paymentStatus: isDemoCardPaid ? "PAID" : "PENDING",
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              farmerId: item.product.farmerId,
              nameSnapshot: item.product.name,
              quantityKg: item.quantityKg,
              unitPriceBdt: item.unitPriceBdt,
              lineTotalBdt: Number((item.unitPriceBdt * item.quantityKg).toFixed(2))
            }))
          },
          statusEvents: { create: [{ status: "PENDING", note: "Order placed" }] }
        },
        include: { items: { include: { product: true } }, statusEvents: true }
      });

      for (const item of cart.items) {
        await tx.product.update({ where: { id: item.productId }, data: { quantityKg: { decrement: item.quantityKg } } });
      }

      await tx.payment.create({
        data: {
          orderId: created.id,
          method,
          amountBdt: total,
          status: isDemoCardPaid ? "PAID" : "PENDING",
          demoTransactionRef: `DEMO-${created.id.slice(0, 8)}`,
          paidAt: isDemoCardPaid ? new Date() : null
        }
      });

      await tx.rewardsLedger.create({ data: { userId, points: 20, reason: "Healthy purchase" } });

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return created;
    });

    return ok({ order: toPublicOrder(order) }, { message: "Order placed", status: 201 });
  });
}
