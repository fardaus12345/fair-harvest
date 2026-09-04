import { ok, handleRoute } from "../../../../../../lib/server/respond.js";

export async function POST(request) {
  return handleRoute(async () => {
    const body = await request.json().catch(() => ({}));
    return ok({ status: "requested", specialist_type: body.specialist_type || null, preferred_date: body.preferred_date || null });
  });
}
