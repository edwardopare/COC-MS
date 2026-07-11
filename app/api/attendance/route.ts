import { NextRequest } from "next/server";
import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { attendance, branches, offerings } from "@/lib/db/schema";
import { requireRole, apiError, apiSuccess } from "@/lib/api-utils";
import { logAction, getClientIp } from "@/lib/audit";

export async function GET(request: NextRequest) {
  const { error } = requireRole(request.headers, [
    "admin_officer",
    "system_administrator",
  ]);
  if (error) return error;

  const rows = await db
    .select()
    .from(attendance)
    .orderBy(desc(attendance.attendanceDate));

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

  const {
    date,
    serviceType,
    male,
    female,
    children,
    visitors,
    total,
    offertoryAmount,
    notes,
  } = body as {
    date: string;
    serviceType: string;
    male: number;
    female: number;
    children: number;
    visitors: number;
    total: number;
    offertoryAmount?: number;
    notes?: string;
  };

  if (!serviceType || !date) {
    return apiError("serviceType and date are required");
  }

  // Find a branch (just use the first one for MVP)
  const [branch] = await db.select().from(branches).limit(1);
  if (!branch) return apiError("No active branch found in the system", 400);

  const parsedOffertory = Number(offertoryAmount) || 0;

  // Insert Attendance
  const [row] = await db
    .insert(attendance)
    .values({
      branchId: branch.id,
      serviceType,
      attendanceDate: new Date(date),
      maleCount: Number(male) || 0,
      femaleCount: Number(female) || 0,
      childrenCount: Number(children) || 0,
      visitorsCount: Number(visitors) || 0,
      totalCount: Number(total) || 0,
      offertoryAmount: parsedOffertory.toString(),
      notes: notes || null,
      recordedByUserId: session!.userId,
    })
    .returning();

  // Auto-record offering if amount > 0
  if (parsedOffertory > 0) {
    const serviceName = serviceType.replace("_", " ").toUpperCase();
    await db.insert(offerings).values({
      branchId: branch.id,
      amount: parsedOffertory.toString(),
      paymentMethod: "cash",
      recordedByUserId: session!.userId,
      notes: `Auto-recorded from ${serviceName} attendance on ${date}`,
      createdAt: new Date(date),
    });
  }

  await logAction({
    userId: session!.userId,
    userEmail: session!.userEmail,
    action: "ATTENDANCE_RECORDED",
    tableAffected: "attendance",
    recordId: row.id,
    newValues: row,
    ipAddress: getClientIp(request.headers),
  });

  return apiSuccess({ inserted: 1 }, 201);
}
