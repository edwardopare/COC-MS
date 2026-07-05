import { NextRequest } from "next/server";
import { eq, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { tithes } from "@/lib/db/schema";
import { requireRole, apiError, apiSuccess } from "@/lib/api-utils";
import { logAction, getClientIp } from "@/lib/audit";
import { recordTitheSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  const { error } = requireRole(request.headers, ["finance_officer", "system_administrator"]);
  if (error) return error;
  const url = new URL(request.url);
  const memberId = url.searchParams.get("memberId");
  const rows = await db.select().from(tithes).where(memberId ? eq(tithes.memberId, memberId) : eq(tithes.isDeleted, false)).orderBy(desc(tithes.createdAt)).limit(50);
  return apiSuccess(rows);
}

export async function POST(request: NextRequest) {
  const { session, error } = requireRole(request.headers, ["finance_officer", "system_administrator"]);
  if (error) return error;

  let body: unknown;
  try { body = await request.json(); } catch { return apiError("Invalid body"); }

  const parsed = recordTitheSchema.safeParse(body);
  if (!parsed.success) return apiError("Validation failed", 400);

  const receiptNumber = `TIT-${Date.now()}`;
  const [newTithe] = await db.insert(tithes).values({ ...parsed.data, recordedByUserId: session!.userId, receiptNumber }).returning();

  await logAction({ userId: session!.userId, userEmail: session!.userEmail, action: "TITHE_RECORDED", tableAffected: "tithes", recordId: newTithe.id, newValues: parsed.data, ipAddress: getClientIp(request.headers) });

  return apiSuccess({ id: newTithe.id, receiptNumber }, 201);
}
