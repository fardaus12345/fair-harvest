import { prisma } from "../../../../../lib/server/db.js";
import { requireUser } from "../../../../../lib/server/auth.js";
import { ok, handleRoute } from "../../../../../lib/server/respond.js";

// Status check — used by the wishlist heart icon on product cards.
export async function GET(request, { params }) {
  return handleRoute(async () => {
    const session = requireUser(request);
    const { productId } = await params;
    const item = await prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId: session.userId, productId } }
    });
    return ok({ wishlisted: Boolean(item) });
  });
}

export async function DELETE(request, { params }) {
  return handleRoute(async () => {
    const session = requireUser(request);
    const { productId } = await params;
    await prisma.wishlistItem.deleteMany({ where: { userId: session.userId, productId } });
    return ok({ removed: true }, { message: "Removed from wishlist" });
  });
}
