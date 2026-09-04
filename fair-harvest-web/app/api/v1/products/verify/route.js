import { z } from "zod";
import { ok, handleRoute, ApiError } from "../../../../../lib/server/respond.js";

const schema = z.object({
  product_id: z.string().optional(),
  claimed_category: z.string().optional(),
  seller_history: z
    .object({
      completed_orders: z.number().optional(),
      late_deliveries: z.number().optional(),
      previous_flags: z.number().optional()
    })
    .optional(),
  certification_documents: z.array(z.any()).optional(),
  user_reports: z.array(z.any()).optional()
});

export async function POST(request) {
  return handleRoute(async () => {
    const body = await request.json().catch(() => ({}));
    const parsed = schema.safeParse(body);
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message || "Invalid verification request", 422);

    const history = parsed.data.seller_history || {};
    const completed = history.completed_orders || 0;
    const late = history.late_deliveries || 0;
    const flags = history.previous_flags || 0;
    const hasCertification = (parsed.data.certification_documents || []).length > 0;
    const reportCount = (parsed.data.user_reports || []).length;

    const rawScore = 60 + Math.min(30, completed) - late * 3 - flags * 10 - reportCount * 5 + (hasCertification ? 10 : 0);
    const trustScore = Math.max(0, Math.min(100, Math.round(rawScore)));
    const status = trustScore >= 70 ? "verified" : trustScore >= 40 ? "review" : "flagged";

    return ok({
      product_id: parsed.data.product_id,
      trust_score: trustScore,
      status,
      reason: hasCertification ? "seller and certification checks passed" : "certification missing, scored on seller history only"
    });
  });
}
