import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { attendance } from "@/lib/db/schema";
import { requireRole, apiError, apiSuccess } from "@/lib/api-utils";
import { logAction, getClientIp } from "@/lib/audit";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { session, error } = requireRole(request.headers, ["admin_officer", "system_administrator"]);
  if (error) return error;

  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return apiError("Invalid body"); }

  const [existing] = await db.select().from(attendance).where(eq(attendance.id, id)).limit(1);
  if (!existing) return apiError("Attendance record not found", 404);

  const updateData: Record<string, unknown> = {};
  if (body.serviceType) updateData.serviceType = body.serviceType;
  if (body.date) updateData.attendanceDate = new Date(body.date as string);
  if (body.male !== undefined) updateData.maleCount = Number(body.male) || 0;
  if (body.female !== undefined) updateData.femaleCount = Number(body.female) || 0;
  if (body.children !== undefined) updateData.childrenCount = Number(body.children) || 0;
  if (body.visitors !== undefined) updateData.visitorsCount = Number(body.visitors) || 0;

  // Recalculate total
  const m = body.male !== undefined ? Number(body.male) || 0 : existing.maleCount;
  const f = body.female !== undefined ? Number(body.female) || 0 : existing.femaleCount;
  const c = body.children !== undefined ? Number(body.children) || 0 : existing.childrenCount;
  const v = body.visitors !== undefined ? Number(body.visitors) || 0 : existing.visitorsCount;
  updateData.totalCount = m + f + c + v;

  if (body.notes !== undefined) updateData.notes = body.notes || null;

  const [updated] = await db.update(attendance).set(updateData).where(eq(attendance.id, id)).returning();

  await logAction({ userId: session!.userId, userEmail: session!.userEmail, action: "ATTENDANCE_UPDATED", tableAffected: "attendance", recordId: id, oldValues: existing, newValues: updateData, ipAddress: getClientIp(request.headers) });

  return apiSuccess(updated);
}
