import { prisma } from "./db.js";

// Best-effort admin audit trail. Never blocks or fails the calling request —
// an audit-log write failure must not prevent a real admin action (e.g. a
// farmer verification decision) from completing.
export async function recordAudit({ actorId, actorRole, action, targetType, targetId, metadata }) {
  try {
    await prisma.auditLog.create({
      data: {
        actorId,
        actorRole,
        action,
        targetType,
        targetId,
        metadata: metadata ? JSON.stringify(metadata) : null
      }
    });
  } catch (error) {
    console.error("Failed to record audit log entry", error);
  }
}
