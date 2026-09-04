import { ok, handleRoute } from "../../../../../lib/server/respond.js";

export async function POST(request) {
  return handleRoute(async () => {
    const body = await request.json().catch(() => ({}));
    return ok({ status: "scheduled", delivery_days: body.delivery_days || [], budget_bdt: body.budget_bdt ?? null });
  });
}
