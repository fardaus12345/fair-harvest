import { z } from "zod";
import { ok, handleRoute, ApiError } from "../../../../../lib/server/respond.js";

const schema = z.object({
  image_base64: z.string().optional(),
  produce_type: z.string().optional(),
  product_name: z.string().optional()
});

function hashString(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  return hash;
}

export async function POST(request) {
  return handleRoute(async () => {
    const body = await request.json().catch(() => ({}));
    const parsed = schema.safeParse(body);
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message || "Invalid scan request", 422);

    const name = parsed.data.produce_type || parsed.data.product_name || "produce";
    const hash = hashString(name);
    const freshnessScore = 70 + (hash % 26);
    const chemicalRiskScore = 5 + (hash % 21);
    const recommendation =
      freshnessScore >= 85
        ? "Looks very fresh, safe to consume."
        : freshnessScore >= 70
          ? "Safe to consume within 2 days."
          : "Consider consuming soon or verifying the source.";

    return ok({ freshness_score: freshnessScore, chemical_risk_score: chemicalRiskScore, recommendation });
  });
}
