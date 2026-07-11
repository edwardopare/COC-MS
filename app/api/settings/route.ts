import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { systemSettings } from "@/lib/db/schema";
import { requireRole, apiError, apiSuccess } from "@/lib/api-utils";
import { logAction, getClientIp } from "@/lib/audit";

export async function GET(request: NextRequest) {
  const { error } = requireRole(request.headers, ["system_administrator"]);
  if (error) return error;

  const rows = await db.select().from(systemSettings);
  return apiSuccess(rows);
}

export async function POST(request: NextRequest) {
  const { session, error } = requireRole(request.headers, [
    "system_administrator",
  ]);
  if (error) return error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("Invalid body");
  }

  const { key, value } = body as { key: string; value: string };
  if (!key || value === undefined) {
    return apiError("key and value are required");
  }

  const [existing] = await db
    .select()
    .from(systemSettings)
    .where(eq(systemSettings.key, key))
    .limit(1);

  if (!existing) {
    return apiError("Setting key not found", 404);
  }

  const [updated] = await db
    .update(systemSettings)
    .set({ value, updatedAt: new Date() })
    .where(eq(systemSettings.key, key))
    .returning();

  await logAction({
    userId: session!.userId,
    userEmail: session!.userEmail,
    action: "SETTING_UPDATED",
    tableAffected: "system_settings",
    recordId: key,
    oldValues: { value: existing.value },
    newValues: { value },
    ipAddress: getClientIp(request.headers),
  });

  return apiSuccess(updated);
}
