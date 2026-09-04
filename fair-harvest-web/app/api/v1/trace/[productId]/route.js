import { prisma } from "../../../../../lib/server/db.js";
import { ok, handleRoute, ApiError } from "../../../../../lib/server/respond.js";
import { toPublicTrace } from "../../../../../lib/server/serializers.js";

export async function GET(request, { params }) {
  return handleRoute(async () => {
    const { productId } = await params;
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { farmer: { include: { user: true } }, traceEvents: true }
    });
    if (!product) throw new ApiError("Product not found", 404);

    return ok(toPublicTrace(product, product.traceEvents));
  });
}
