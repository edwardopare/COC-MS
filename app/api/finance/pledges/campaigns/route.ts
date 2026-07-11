import { NextRequest } from "next/server";
import { eq, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { pledgeCampaigns } from "@/lib/db/schema";
import { requireRole, apiError, apiSuccess } from "@/lib/api-utils";
import { logAction, getClientIp } from "@/lib/audit";

export async function GET(request: NextRequest) {
  const { error } = requireRole(request.headers, [
    "finance_officer",
    "system_administrator",
    "admin_officer",
  ]);
  if (error) return error;

  const rows = await db
    .select()
    .from(pledgeCampaigns)
    .orderBy(desc(pledgeCampaigns.createdAt));

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

  const { name, description, targetAmount, startDate, endDate, branchId } =
    body as {
      name: string;
      description?: string;
      targetAmount?: string;
      startDate: string;
      endDate?: string;
      branchId: string;
    };

  if (!name || !startDate || !branchId) {
    return apiError("name, startDate, and branchId are required");
  }

  const [newCampaign] = await db
    .insert(pledgeCampaigns)
    .values({
      name,
      description: description ?? null,
      targetAmount: targetAmount ?? null,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      branchId,
      createdByUserId: session!.userId,
      isActive: true,
    })
    .returning();

  await logAction({
    userId: session!.userId,
    userEmail: session!.userEmail,
    action: "PLEDGE_CAMPAIGN_CREATED",
    tableAffected: "pledge_campaigns",
    recordId: newCampaign.id,
    newValues: { name, targetAmount },
    ipAddress: getClientIp(request.headers),
  });

  return apiSuccess(newCampaign, 201);
}
