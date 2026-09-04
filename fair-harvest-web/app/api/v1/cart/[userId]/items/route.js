import { z } from "zod";
import { prisma } from "../../../../../../lib/server/db.js";
import { requireOwnerOrRole } from "../../../../../../lib/server/auth.js";
import { ok, handleRoute, ApiError } from "../../../../../../lib/server/respond.js";
import { toPublicCart } from "../../../../../../lib/server/serializers.js";

const addItemSchema = z.object({
  product_id: z.string().min(1),
  quantity_kg: z.coerce.number().positive("Quantity must be greater than 0"),
  source: z.enum(["direct", "meal_plan", "prescription"]).optional()
});

export async function POST(request, { params }) {
  return handleRoute(async () => {
    const { userId } = await params;
    requireOwnerOrRole(request, userId, ["ADMIN"]);

    const body = await request.json().catch(() => ({}));
    const parsed = addItemSchema.safeParse(body);
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message || "Invalid cart item", 422);
    const { product_id: productId, quantity_kg: quantityKg, source } = parsed.data;

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || product.status !== "ACTIVE") throw new ApiError("Product is not available", 404);

    const cart = await prisma.cart.upsert({ where: { userId }, create: { userId }, update: {} });
    const sourceValue = (source || "direct").toUpperCase();

    const existing = await prisma.cartItem.findUnique({
      where: { cartId_productId_source: { cartId: cart.id, productId, source: sourceValue } }
    });

    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantityKg: existing.quantityKg + quantityKg, unitPriceBdt: product.priceBdt }
      });
    } else {
      await prisma.cartItem.create({
        data: { cartId: cart.id, productId, quantityKg, unitPriceBdt: product.priceBdt, source: sourceValue }
      });
    }

    const full = await prisma.cart.findUnique({ where: { userId }, include: { items: { include: { product: true } } } });
    return ok(toPublicCart(userId, full), { message: "Added to cart", status: 201 });
  });
}
