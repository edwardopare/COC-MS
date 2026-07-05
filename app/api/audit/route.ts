import { NextRequest } from "next/server";
import { eq, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { auditLogs, users } from "@/lib/db/schema";
import { requireRole, apiSuccess } from "@/lib/api-utils";

// GET /api/audit — System Administrator only
export async function GET(request: NextRequest) {
  const { session, error } = requireRole(request.headers, ["system_administrator"]);
  if (error) return error;

  const url = new URL(request.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1"));
  const limit = Math.min(100, parseInt(url.searchParams.get("limit") ?? "50"));

  const rows = await db.select().from(auditLogs).orderBy(desc(auditLogs.timestamp)).limit(limit).offset((page - 1) * limit);
  return apiSuccess(rows);
}
