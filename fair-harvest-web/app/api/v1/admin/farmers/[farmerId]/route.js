import { z } from "zod";
import { prisma } from "../../../../../../lib/server/db.js";
import { requireRole } from "../../../../../../lib/server/auth.js";
import { ok, handleRoute, ApiError } from "../../../../../../lib/server/respond.js";
import { toAdminFarmer } from "../../../../../../lib/server/serializers.js";

const patchSchema = z.object({ account_status: z.enum(["active", "suspended"]) });

export async function PATCH(request, { params }) {
  return handleRoute(async () => {
    requireRole(request, ["ADMIN"]);
    const { farmerId } = await params;

    const profile = await prisma.farmerProfile.findUnique({ where: { id: farmerId } });
    if (!profile) throw new ApiError("Farmer not found", 404);

    const body = await request.json().catch(() => ({}));
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message || "Invalid update", 422);

    await prisma.user.update({ where: { id: profile.userId }, data: { status: parsed.data.account_status.toUpperCase() } });

    const updated = await prisma.farmerProfile.findUnique({
      where: { id: farmerId },
      include: { user: true, _count: { select: { products: true } } }
    });

    return ok({ farmer: toAdminFarmer(updated) }, { message: "Farmer updated" });
  });
}
