import { z } from "zod";
import { prisma } from "../../../../lib/server/db.js";
import { requireUser } from "../../../../lib/server/auth.js";
import { ok, handleRoute, ApiError } from "../../../../lib/server/respond.js";
import { toPublicProduct } from "../../../../lib/server/serializers.js";

// A user's wishlist is private — always scoped to the authenticated
// session, never to a client-supplied user id.
export async function GET(request) {
  return handleRoute(async () => {
    const session = requireUser(request);
    const items = await prisma.wishlistItem.findMany({
      where: { userId: session.userId },
      include: { product: { include: { farmer: { include: { user: true } } } } },
      orderBy: { createdAt: "desc" }
    });

    return ok({
      items: items.map((item) => ({
        wishlist_item_id: item.id,
        product: toPublicProduct(item.product),
        added_at: item.createdAt
      })),
      count: items.length
    });
  });
}

const addSchema = z.object({ product_id: z.string().min(1, "product_id is required") });

export async function POST(request) {
  return handleRoute(async () => {
    const session = requireUser(request);
    const body = await request.json().catch(() => ({}));
    const parsed = addSchema.safeParse(body);
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message || "Invalid request", 422);

    const product = await prisma.product.findUnique({ where: { id: parsed.data.product_id } });
    if (!product) throw new ApiError("Product not found", 404);

    const item = await prisma.wishlistItem.upsert({
      where: { userId_productId: { userId: session.userId, productId: parsed.data.product_id } },
      create: { userId: session.userId, productId: parsed.data.product_id },
      update: {}
    });

    return ok({ wishlist_item_id: item.id }, { message: "Added to wishlist", status: 201 });
  });
}
