import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { incomeCategories } from "@/lib/db/schema";
import { requireRole, apiSuccess } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  const { error } = requireRole(request.headers, [
    "finance_officer",
    "system_administrator",
  ]);
  if (error) return error;

  const rows = await db.select().from(incomeCategories);
  return apiSuccess(rows);
}
