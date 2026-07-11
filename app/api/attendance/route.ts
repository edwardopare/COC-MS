import { NextRequest } from "next/server";
import { eq, and, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { attendance, events } from "@/lib/db/schema";
import { requireRole, apiError, apiSuccess } from "@/lib/api-utils";
import { logAction, getClientIp } from "@/lib/audit";

export async function GET(request: NextRequest) {
  const { error } = requireRole(request.headers, [
    "admin_officer",
    "system_administrator",
  ]);
  if (error) return error;

  const url = new URL(request.url);
  const eventId = url.searchParams.get("eventId");
  if (!eventId) return apiError("eventId is required");

  const rows = await db
    .select()
    .from(attendance)
    .where(eq(attendance.eventId, eventId))
    .orderBy(desc(attendance.createdAt));

  return apiSuccess(rows);
}

export async function POST(request: NextRequest) {
  const { session, error } = requireRole(request.headers, [
    "admin_officer",
    "system_administrator",
  ]);
  if (error) return error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("Invalid body");
  }

  const { eventId, branchId, records } = body as {
    eventId: string;
    branchId: string;
    records: { memberId: string; isPresent: boolean; notes?: string }[];
  };

  if (!eventId || !branchId || !Array.isArray(records) || records.length === 0) {
    return apiError("eventId, branchId, and records[] are required");
  }

  // Verify event exists
  const [evt] = await db
    .select()
    .from(events)
    .where(eq(events.id, eventId))
    .limit(1);
  if (!evt) return apiError("Event not found", 404);

  const inserted = [];
  for (const rec of records) {
    const [row] = await db
      .insert(attendance)
      .values({
        eventId,
        branchId,
        memberId: rec.memberId,
        isPresent: rec.isPresent,
        recordedByUserId: session!.userId,
        notes: rec.notes ?? null,
      })
      .returning();
    inserted.push(row);
  }

  await logAction({
    userId: session!.userId,
    userEmail: session!.userEmail,
    action: "ATTENDANCE_RECORDED",
    tableAffected: "attendance",
    recordId: eventId,
    newValues: { eventId, count: inserted.length },
    ipAddress: getClientIp(request.headers),
  });

  return apiSuccess({ inserted: inserted.length }, 201);
}
