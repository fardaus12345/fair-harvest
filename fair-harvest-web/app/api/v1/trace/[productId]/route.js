import { z } from "zod";
import { prisma } from "../../../../../lib/server/db.js";
import { requireUser } from "../../../../../lib/server/auth.js";
import { ok, handleRoute, ApiError } from "../../../../../lib/server/respond.js";
import { toPublicTrace } from "../../../../../lib/server/serializers.js";

const TRACE_STAGES = ["PLANTED", "HARVESTED", "LAB_TESTED", "PACKAGED", "SHIPPED", "LISTED"];

async function loadProductWithTrace(productId) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { farmer: { include: { user: true } }, traceEvents: { orderBy: { timestamp: "asc" } } }
  });
  if (!product) throw new ApiError("Product not found", 404);
  return product;
}

export async function GET(request, { params }) {
  return handleRoute(async () => {
    const { productId } = await params;
    const product = await loadProductWithTrace(productId);
    return ok(toPublicTrace(product, product.traceEvents));
  });
}

const addEventSchema = z.object({
  stage: z.enum(TRACE_STAGES),
  note: z.string().max(500).optional(),
  gps_lat: z.coerce.number().min(-90).max(90).optional(),
  gps_lng: z.coerce.number().min(-180).max(180).optional()
});

// Farmer-driven traceability event. Reuses the existing TraceEvent table —
// no blockchain write, no external ledger, no fabricated hash. Only the
// product's own farmer (or an admin) may add an event.
export async function POST(request, { params }) {
  return handleRoute(async () => {
    const session = requireUser(request);
    const { productId } = await params;
    const product = await loadProductWithTrace(productId);

    if (session.role !== "ADMIN" && session.userId !== product.farmer.userId) {
      throw new ApiError("You do not have permission to update this product's trace", 403);
    }

    const body = await request.json().catch(() => ({}));
    const parsed = addEventSchema.safeParse(body);
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message || "Invalid trace event", 422);
    const data = parsed.data;

    await prisma.traceEvent.create({
      data: {
        productId,
        stage: data.stage,
        note: data.note || null,
        gpsLat: data.gps_lat ?? null,
        gpsLng: data.gps_lng ?? null
      }
    });

    const refreshed = await loadProductWithTrace(productId);
    return ok(toPublicTrace(refreshed, refreshed.traceEvents), { message: "Trace event added", status: 201 });
  });
}
