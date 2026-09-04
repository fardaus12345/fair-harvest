import { z } from "zod";
import { prisma } from "../../../../../lib/server/db.js";
import { requireUser } from "../../../../../lib/server/auth.js";
import { ok, handleRoute, ApiError } from "../../../../../lib/server/respond.js";
import { toPublicProduct } from "../../../../../lib/server/serializers.js";

async function loadProduct(productId) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { farmer: { include: { user: true } } }
  });
  if (!product) throw new ApiError("Product not found", 404);
  return product;
}

function assertOwnerOrAdmin(session, product) {
  if (session.role === "ADMIN") return;
  if (session.userId !== product.farmer.userId) {
    throw new ApiError("You do not have permission to modify this product", 403);
  }
}

export async function GET(request, { params }) {
  return handleRoute(async () => {
    const { productId } = await params;
    const product = await loadProduct(productId);
    return ok({ product: toPublicProduct(product) });
  });
}

const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  price_bdt: z.coerce.number().positive().optional(),
  quantity_kg: z.coerce.number().nonnegative().optional(),
  freshness_window_days: z.coerce.number().int().positive().optional(),
  status: z.enum(["active", "out_of_stock", "archived"]).optional()
});

export async function PATCH(request, { params }) {
  return handleRoute(async () => {
    const session = requireUser(request);
    const { productId } = await params;
    const product = await loadProduct(productId);
    assertOwnerOrAdmin(session, product);

    const body = await request.json().catch(() => ({}));
    const parsed = updateProductSchema.safeParse(body);
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message || "Invalid update", 422);
    const data = parsed.data;

    const updated = await prisma.product.update({
      where: { id: productId },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.price_bdt !== undefined ? { priceBdt: data.price_bdt } : {}),
        ...(data.quantity_kg !== undefined ? { quantityKg: data.quantity_kg } : {}),
        ...(data.freshness_window_days !== undefined ? { freshnessWindowDays: data.freshness_window_days } : {}),
        ...(data.status !== undefined ? { status: data.status.toUpperCase() } : {})
      },
      include: { farmer: { include: { user: true } } }
    });

    return ok({ product: toPublicProduct(updated) }, { message: "Product updated" });
  });
}

export async function DELETE(request, { params }) {
  return handleRoute(async () => {
    const session = requireUser(request);
    const { productId } = await params;
    const product = await loadProduct(productId);
    assertOwnerOrAdmin(session, product);

    // Soft delete: past OrderItems reference this product, so archiving
    // instead of a hard delete keeps order history intact.
    const archived = await prisma.product.update({
      where: { id: productId },
      data: { status: "ARCHIVED" },
      include: { farmer: { include: { user: true } } }
    });

    return ok({ product: toPublicProduct(archived) }, { message: "Product archived" });
  });
}
