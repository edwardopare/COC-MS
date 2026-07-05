import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { notifications } from "@/lib/db/schema";
import { requireRole, apiError, apiSuccess } from "@/lib/api-utils";

// PATCH /api/notifications/[id]/read — mark single notification as read
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { session, error } = requireRole(request.headers, ["admin_officer", "finance_officer", "system_administrator"]);
  if (error) return error;

  const [notif] = await db.select().from(notifications).where(eq(notifications.id, id)).limit(1);
  if (!notif) return apiError("Notification not found", 404);
  if (notif.userId !== session!.userId) return apiError("Forbidden", 403);

  await db.update(notifications).set({ isRead: true, readAt: new Date() }).where(eq(notifications.id, id));
  return apiSuccess({ id, isRead: true });
}
