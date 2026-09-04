import { ok, handleRoute } from "../../../../../lib/server/respond.js";

export async function POST(request) {
  return handleRoute(async () => {
    const body = await request.json().catch(() => ({}));
    const quantityKg = body.quantity_kg || 1;

    return ok({
      status: "donated",
      impact_metrics: {
        meals_equivalent: Math.round(quantityKg * 2.4),
        co2_saved_kg: Number((quantityKg * 1.9).toFixed(1))
      }
    });
  });
}
