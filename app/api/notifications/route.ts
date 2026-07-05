import { NextRequest } from "next/server";
import { eq, and, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { notifications } from "@/lib/db/schema";
import { requireRole, apiError, apiSuccess } from "@/lib/api-utils";

// GET /api/notifications — current user's unread notifications
export async function GET(request: NextRequest) {
  const { session, error } = requireRole(request.headers, ["admin_officer", "finance_officer", "system_administrator"]);
  if (error) return error;

  const rows = await db.select().from(notifications)
    .where(and(eq(notifications.userId, session!.userId), eq(notifications.isRead, false)))
    .orderBy(desc(notifications.createdAt))
    .limit(20);

  return apiSuccess(rows);
}
