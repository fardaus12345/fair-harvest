import { prisma } from "../../../../../lib/server/db.js";
import { requireRole } from "../../../../../lib/server/auth.js";
import { ok, handleRoute } from "../../../../../lib/server/respond.js";

export async function GET(request) {
  return handleRoute(async () => {
    requireRole(request, ["ADMIN"]);

    const entries = await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 200
    });

    return ok({
      entries: entries.map((entry) => ({
        id: entry.id,
        actor_id: entry.actorId,
        actor_role: entry.actorRole,
        action: entry.action,
        target_type: entry.targetType,
        target_id: entry.targetId,
        metadata: entry.metadata ? JSON.parse(entry.metadata) : null,
        created_at: entry.createdAt
      }))
    });
  });
}
