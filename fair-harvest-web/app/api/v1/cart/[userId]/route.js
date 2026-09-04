import { prisma } from "../../../../../lib/server/db.js";
import { requireOwnerOrRole } from "../../../../../lib/server/auth.js";
import { ok, handleRoute } from "../../../../../lib/server/respond.js";
import { toPublicCart } from "../../../../../lib/server/serializers.js";

async function loadCart(userId) {
  return prisma.cart.findUnique({ where: { userId }, include: { items: { include: { product: true } } } });
}

export async function GET(request, { params }) {
  return handleRoute(async () => {
    const { userId } = await params;
    requireOwnerOrRole(request, userId, ["ADMIN"]);
    const cart = await loadCart(userId);
    return ok(toPublicCart(userId, cart));
  });
}

export async function DELETE(request, { params }) {
  return handleRoute(async () => {
    const { userId } = await params;
    requireOwnerOrRole(request, userId, ["ADMIN"]);
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (cart) await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    return ok(toPublicCart(userId, null), { message: "Cart cleared" });
  });
}
