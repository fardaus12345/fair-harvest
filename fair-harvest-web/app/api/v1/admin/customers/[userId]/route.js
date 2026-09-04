import { z } from "zod";
import { prisma } from "../../../../../../lib/server/db.js";
import { requireRole } from "../../../../../../lib/server/auth.js";
import { ok, handleRoute, ApiError } from "../../../../../../lib/server/respond.js";
import { toAdminCustomer } from "../../../../../../lib/server/serializers.js";

const patchSchema = z.object({ status: z.enum(["active", "suspended"]) });

export async function PATCH(request, { params }) {
  return handleRoute(async () => {
    requireRole(request, ["ADMIN"]);
    const { userId } = await params;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new ApiError("Customer not found", 404);

    const body = await request.json().catch(() => ({}));
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message || "Invalid update", 422);

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { status: parsed.data.status.toUpperCase() },
      include: { _count: { select: { orders: true } } }
    });

    return ok({ customer: toAdminCustomer(updated) }, { message: "Customer updated" });
  });
}
