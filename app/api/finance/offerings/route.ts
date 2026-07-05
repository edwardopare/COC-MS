import { NextRequest } from "next/server";
import { eq, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { offerings } from "@/lib/db/schema";
import { requireRole, apiError, apiSuccess } from "@/lib/api-utils";
import { logAction, getClientIp } from "@/lib/audit";
import { recordOfferingSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  const { error } = requireRole(request.headers, ["finance_officer", "system_administrator"]);
  if (error) return error;
  const rows = await db.select().from(offerings).where(eq(offerings.isDeleted, false)).orderBy(desc(offerings.createdAt)).limit(50);
  return apiSuccess(rows);
}

export async function POST(request: NextRequest) {
  const { session, error } = requireRole(request.headers, ["finance_officer", "system_administrator"]);
  if (error) return error;

  let body: unknown;
  try { body = await request.json(); } catch { return apiError("Invalid body"); }

  const parsed = recordOfferingSchema.safeParse(body);
  if (!parsed.success) return apiError("Validation failed", 400);

  const receiptNumber = `OFF-${Date.now()}`;
  const [newOffering] = await db.insert(offerings).values({ ...parsed.data, recordedByUserId: session!.userId, receiptNumber }).returning();

  await logAction({ userId: session!.userId, userEmail: session!.userEmail, action: "OFFERING_RECORDED", tableAffected: "offerings", recordId: newOffering.id, newValues: parsed.data, ipAddress: getClientIp(request.headers) });

  return apiSuccess({ id: newOffering.id, receiptNumber }, 201);
}
