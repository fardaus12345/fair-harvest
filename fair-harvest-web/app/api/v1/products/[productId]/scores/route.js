import { prisma } from "../../../../../../lib/server/db.js";
import { ok, handleRoute, ApiError } from "../../../../../../lib/server/respond.js";

function clamp(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export async function GET(request, { params }) {
  return handleRoute(async () => {
    const { productId } = await params;
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new ApiError("Product not found", 404);

    const trust = product.trustScore;
    return ok({
      product_id: product.id,
      eco_score: clamp(trust - 6),
      health_score: clamp(trust + 4),
      pesticide_score: clamp(100 - trust)
    });
  });
}
