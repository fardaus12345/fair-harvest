import { ok, handleRoute } from "../../../../../lib/server/respond.js";

export async function POST(request) {
  return handleRoute(async () => {
    const body = await request.json().catch(() => ({}));
    const markers = body.markers || {};

    const compatibleFoods = ["leafy greens", "lentils", "organic eggs", "brown rice"];
    const avoidFoods = [];
    if (markers.lactose_intolerance) avoidFoods.push("milk");
    if (markers.gluten_sensitivity) avoidFoods.push("wheat");

    return ok({ compatible_foods: compatibleFoods, avoid_foods: avoidFoods });
  });
}
