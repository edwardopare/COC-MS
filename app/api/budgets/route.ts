import { NextRequest } from "next/server";
import { eq, desc, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { budgets, budgetItems, expenseCategories } from "@/lib/db/schema";
import { requireRole, apiError, apiSuccess } from "@/lib/api-utils";
import { logAction, getClientIp } from "@/lib/audit";
import { createBudgetSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  const { error } = requireRole(request.headers, ["finance_officer", "system_administrator"]);
  if (error) return error;

  const url = new URL(request.url);
  const branchId = url.searchParams.get("branchId");
  const where = branchId ? eq(budgets.branchId, branchId) : undefined;
  const rows = await db.select().from(budgets).where(where).orderBy(desc(budgets.createdAt));
  return apiSuccess(rows);
}

export async function POST(request: NextRequest) {
  const { session, error } = requireRole(request.headers, ["finance_officer", "system_administrator"]);
  if (error) return error;

  let body: unknown;
  try { body = await request.json(); } catch { return apiError("Invalid body"); }

  const parsed = createBudgetSchema.safeParse(body);
  if (!parsed.success) return apiError("Validation failed", 400);

  const { items, ...budgetData } = parsed.data;

  const [newBudget] = await db.insert(budgets).values({ ...budgetData, createdByUserId: session!.userId }).returning();

  if (items.length > 0) {
    await db.insert(budgetItems).values(items.map(item => ({ ...item, budgetId: newBudget.id })));
  }

  await logAction({ userId: session!.userId, userEmail: session!.userEmail, action: "BUDGET_CREATED", tableAffected: "budgets", recordId: newBudget.id, newValues: budgetData, ipAddress: getClientIp(request.headers) });

  return apiSuccess(newBudget, 201);
}
