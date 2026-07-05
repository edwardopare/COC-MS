import { NextRequest } from "next/server";
import { eq, desc, count } from "drizzle-orm";
import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";
import { requireRole, apiError, apiSuccess } from "@/lib/api-utils";
import { logAction, getClientIp } from "@/lib/audit";
import { createEventSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  const { error } = requireRole(request.headers, ["admin_officer", "system_administrator", "finance_officer"]);
  if (error) return error;

  const url = new URL(request.url);
  const branchId = url.searchParams.get("branchId");
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1"));
  const limit = Math.min(100, parseInt(url.searchParams.get("limit") ?? "25"));

  const where = branchId ? eq(events.branchId, branchId) : undefined;
  const rows = await db.select().from(events).where(where).orderBy(desc(events.eventDate)).limit(limit).offset((page - 1) * limit);

  return apiSuccess(rows);
}

export async function POST(request: NextRequest) {
  const { session, error } = requireRole(request.headers, ["admin_officer", "system_administrator"]);
  if (error) return error;

  let body: unknown;
  try { body = await request.json(); } catch { return apiError("Invalid body"); }

  const parsed = createEventSchema.safeParse(body);
  if (!parsed.success) return apiError("Validation failed", 400);

  const [newEvent] = await db.insert(events).values({ ...parsed.data, eventDate: new Date(parsed.data.eventDate), endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null }).returning();

  await logAction({ userId: session!.userId, userEmail: session!.userEmail, action: "EVENT_CREATED", tableAffected: "events", recordId: newEvent.id, newValues: parsed.data, ipAddress: getClientIp(request.headers) });

  return apiSuccess(newEvent, 201);
}
