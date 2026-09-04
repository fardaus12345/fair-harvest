import { z } from "zod";
import { prisma } from "../../../../../../../lib/server/db.js";
import { requireOwnerOrRole } from "../../../../../../../lib/server/auth.js";
import { ok, handleRoute, ApiError } from "../../../../../../../lib/server/respond.js";
import { toPublicCart } from "../../../../../../../lib/server/serializers.js";

async function assertOwnedItem(userId, itemId) {
  const item = await prisma.cartItem.findUnique({ where: { id: itemId }, include: { cart: true } });
  if (!item || item.cart.userId !== userId) throw new ApiError("Cart item not found", 404);
  return item;
}

const updateItemSchema = z.object({ quantity_kg: z.coerce.number().positive("Quantity must be greater than 0") });

export async function PATCH(request, { params }) {
  return handleRoute(async () => {
    const { userId, itemId } = await params;
    requireOwnerOrRole(request, userId, ["ADMIN"]);
    await assertOwnedItem(userId, itemId);

    const body = await request.json().catch(() => ({}));
    const parsed = updateItemSchema.safeParse(body);
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message || "Invalid quantity", 422);

    await prisma.cartItem.update({ where: { id: itemId }, data: { quantityKg: parsed.data.quantity_kg } });
    const full = await prisma.cart.findUnique({ where: { userId }, include: { items: { include: { product: true } } } });
    return ok(toPublicCart(userId, full), { message: "Cart updated" });
  });
}

export async function DELETE(request, { params }) {
  return handleRoute(async () => {
    const { userId, itemId } = await params;
    requireOwnerOrRole(request, userId, ["ADMIN"]);
    await assertOwnedItem(userId, itemId);

    await prisma.cartItem.delete({ where: { id: itemId } });
    const full = await prisma.cart.findUnique({ where: { userId }, include: { items: { include: { product: true } } } });
    return ok(toPublicCart(userId, full), { message: "Item removed" });
  });
}
