import { db } from "@/lib/db";
import { auditLogs } from "@/lib/db/schema";

interface AuditParams {
  userId?: string;
  userEmail?: string;
  action: string;
  tableAffected?: string;
  recordId?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Append-only audit logger.
 * IMPORTANT: This function only inserts — it never updates or deletes.
 * Called at the end of every mutation route handler.
 */
export async function logAction(params: AuditParams): Promise<void> {
  try {
    await db.insert(auditLogs).values({
      userId: params.userId ?? null,
      userEmail: params.userEmail ?? null,
      action: params.action,
      tableAffected: params.tableAffected ?? null,
      recordId: params.recordId ? (params.recordId as `${string}-${string}-${string}-${string}-${string}`) : null,
      oldValues: params.oldValues ? JSON.stringify(params.oldValues) : null,
      newValues: params.newValues ? JSON.stringify(params.newValues) : null,
      ipAddress: params.ipAddress ?? null,
      userAgent: params.userAgent ?? null,
    });
  } catch (error) {
    // Audit failures must not crash the main request — log to stderr only
    console.error("[AUDIT] Failed to write audit log:", error);
  }
}

/**
 * Helper to extract client IP from Next.js request headers.
 */
export function getClientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headers.get("x-real-ip") ??
    "unknown"
  );
}
