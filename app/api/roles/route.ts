import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { roles } from "@/lib/db/schema";
import { requireRole, apiSuccess } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  const { error } = requireRole(request.headers, ["system_administrator"]);
  if (error) return error;

  const allRoles = await db.select().from(roles);
  return apiSuccess(allRoles);
}
