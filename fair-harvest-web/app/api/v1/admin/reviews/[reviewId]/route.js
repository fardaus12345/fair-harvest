import { z } from "zod";
import { prisma } from "../../../../../../lib/server/db.js";
import { requireRole } from "../../../../../../lib/server/auth.js";
import { ok, handleRoute, ApiError } from "../../../../../../lib/server/respond.js";
import { recomputeFarmerReputation } from "../../../../../../lib/server/reputationSync.js";

const updateSchema = z.object({ status: z.enum(["published", "hidden"]) });

// Admin moderation: hide/republish a review. Never deletes review history —
// hiding just removes it from public reviews.js GET queries (status filter).
export async function PATCH(request, { params }) {
  return handleRoute(async () => {
    requireRole(request, ["ADMIN"]);
    const { reviewId } = await params;

    const body = await request.json().catch(() => ({}));
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message || "Invalid update", 422);

    const review = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) throw new ApiError("Review not found", 404);

    const updated = await prisma.review.update({
      where: { id: reviewId },
      data: { status: parsed.data.status.toUpperCase() }
    });

    await recomputeFarmerReputation(updated.farmerId);

    return ok({ review_id: updated.id, status: updated.status.toLowerCase() }, { message: "Review updated" });
  });
}
