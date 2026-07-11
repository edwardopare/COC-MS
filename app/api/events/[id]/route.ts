import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";
import { requireRole, apiError, apiSuccess } from "@/lib/api-utils";
import { logAction, getClientIp } from "@/lib/audit";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { session, error } = requireRole(request.headers, ["admin_officer", "system_administrator"]);
  if (error) return error;

  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return apiError("Invalid body"); }

  const [existing] = await db.select().from(events).where(eq(events.id, id)).limit(1);
  if (!existing) return apiError("Event not found", 404);

  const updateData: Record<string, unknown> = {};
  if (body.name) updateData.name = body.name;
  if (body.eventType) updateData.eventType = body.eventType;
  if (body.eventDate) updateData.eventDate = new Date(body.eventDate as string);
  if (body.endDate) updateData.endDate = new Date(body.endDate as string);
  if (body.location !== undefined) updateData.location = body.location || null;
  updateData.updatedAt = new Date();

  const [updated] = await db.update(events).set(updateData).where(eq(events.id, id)).returning();

  await logAction({ userId: session!.userId, userEmail: session!.userEmail, action: "EVENT_UPDATED", tableAffected: "events", recordId: id, oldValues: existing, newValues: updateData, ipAddress: getClientIp(request.headers) });

  return apiSuccess(updated);
}
