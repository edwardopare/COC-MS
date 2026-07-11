import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { branches } from "@/lib/db/schema";
import { requireRole, apiSuccess } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  const { error } = requireRole(request.headers, [
    "admin_officer",
    "system_administrator",
    "finance_officer",
  ]);
  if (error) return error;

  const rows = await db.select().from(branches);
  return apiSuccess(rows);
}
