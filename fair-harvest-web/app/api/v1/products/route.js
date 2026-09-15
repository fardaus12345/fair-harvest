import { z } from "zod";
import { prisma } from "../../../../lib/server/db.js";
import { requireUser } from "../../../../lib/server/auth.js";
import { ok, handleRoute, ApiError } from "../../../../lib/server/respond.js";
import { toPublicProduct } from "../../../../lib/server/serializers.js";

const CATEGORIES = ["vegetable", "fruit", "grain", "herb"];

export async function GET(request) {
  return handleRoute(async () => {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const farmerId = searchParams.get("farmer_id");
    const minTrust = searchParams.get("min_trust");
    const maxPrice = searchParams.get("max_price");

    const where = {};
    if (category && CATEGORIES.includes(category)) where.category = category;
    if (farmerId) where.farmerId = farmerId;
    if (minTrust) where.trustScore = { gte: Number(minTrust) };
    if (maxPrice) where.priceBdt = { lte: Number(maxPrice) };
    // A farmer browsing their own listing sees every status; the public
    // marketplace only ever shows products the farmer marked active.
    if (!farmerId) where.status = "ACTIVE";

    const products = await prisma.product.findMany({
      where,
      include: { farmer: { include: { user: true } } },
      orderBy: { trustScore: "desc" }
    });

    return ok({ products: products.map(toPublicProduct), count: products.length });
  });
}

const createProductSchema = z.object({
  farmer_id: z.string().min(1, "farmer_id is required"),
  name: z.string().min(1, "Product name is required"),
  category: z.enum(CATEGORIES),
  description: z.string().optional(),
  price_bdt: z.coerce.number().positive("Price must be greater than 0"),
  quantity_kg: z.coerce.number().positive("Stock must be greater than 0"),
  freshness_window_days: z.coerce.number().int().positive().optional(),
  status: z.enum(["active", "out_of_stock", "archived"]).optional(),
  // Produced by POST /api/v1/uploads/product-image, or an absolute URL if the
  // deployment uses a remote storage provider.
  image_url: z.string().max(2048).optional().nullable()
});

export async function POST(request) {
  return handleRoute(async () => {
    const session = requireUser(request);
    const body = await request.json().catch(() => ({}));
    const parsed = createProductSchema.safeParse(body);
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message || "Invalid product data", 422);
    const data = parsed.data;

    const farmer = await prisma.farmerProfile.findUnique({ where: { id: data.farmer_id } });
    if (!farmer) throw new ApiError("Farmer profile not found", 404);
    if (farmer.userId !== session.userId && session.role !== "ADMIN") {
      throw new ApiError("You do not have permission to list products for this farmer", 403);
    }
    if (farmer.verificationStatus !== "VERIFIED") {
      throw new ApiError("Only verified farmers can list products", 403);
    }

    const product = await prisma.product.create({
      data: {
        farmerId: data.farmer_id,
        name: data.name,
        category: data.category,
        description: data.description,
        priceBdt: data.price_bdt,
        quantityKg: data.quantity_kg,
        freshnessWindowDays: data.freshness_window_days ?? 2,
        imageUrl: data.image_url || null,
        status: (data.status || "active").toUpperCase()
      },
      include: { farmer: { include: { user: true } } }
    });

    return ok({ product: toPublicProduct(product) }, { message: "Product listed", status: 201 });
  });
}
