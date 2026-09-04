import { prisma } from "../../../../../lib/server/db.js";
import { requireUser } from "../../../../../lib/server/auth.js";
import { ok, handleRoute, ApiError } from "../../../../../lib/server/respond.js";
import { toPublicUser } from "../../../../../lib/server/serializers.js";

export async function GET(request) {
  return handleRoute(async () => {
    const session = requireUser(request);
    const user = await prisma.user.findUnique({ where: { id: session.userId }, include: { farmerProfile: true } });
    if (!user) throw new ApiError("Account not found", 404);
    return ok({ user: toPublicUser(user) });
  });
}
