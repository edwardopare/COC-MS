import { NextRequest } from "next/server";
import { eq, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { pledges } from "@/lib/db/schema";
import { requireRole, apiError, apiSuccess } from "@/lib/api-utils";
import { logAction, getClientIp } from "@/lib/audit";

export async function GET(request: NextRequest) {
  const { error } = requireRole(request.headers, [
    "finance_officer",
    "system_administrator",
    "admin_officer",
  ]);
  if (error) return error;

  const rows = await db.select().from(pledges).orderBy(desc(pledges.createdAt));
  return apiSuccess(rows);
}

export async function POST(request: NextRequest) {
  const { session, error } = requireRole(request.headers, [
    "finance_officer",
    "system_administrator",
  ]);
  if (error) return error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("Invalid body");
  }

  const { campaignId, memberId, pledgedAmount, dueDate, notes } = body as {
    campaignId: string;
    memberId: string;
    pledgedAmount: string;
    dueDate?: string;
    notes?: string;
  };

  if (!campaignId || !memberId || !pledgedAmount) {
    return apiError("campaignId, memberId, and pledgedAmount are required");
  }

  const [newPledge] = await db
    .insert(pledges)
    .values({
      campaignId,
      memberId,
      pledgedAmount,
      paidAmount: "0",
      dueDate: dueDate ? new Date(dueDate) : null,
      notes: notes ?? null,
      status: "active",
      recordedByUserId: session!.userId,
    })
    .returning();

  await logAction({
    userId: session!.userId,
    userEmail: session!.userEmail,
    action: "PLEDGE_RECORDED",
    tableAffected: "pledges",
    recordId: newPledge.id,
    newValues: { campaignId, memberId, pledgedAmount },
    ipAddress: getClientIp(request.headers),
  });

  return apiSuccess(newPledge, 201);
}
