import { NextRequest } from "next/server";
import { eq, and, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { expenses, expenseCategories, users, approvals, systemSettings, budgetItems } from "@/lib/db/schema";
import { requireRole, apiError, apiSuccess, isPeriodLocked } from "@/lib/api-utils";
import { logAction, getClientIp } from "@/lib/audit";
import { createExpenseSchema } from "@/lib/validations";
import { sendExpenseSubmittedEmail, sendExpenseDecisionEmail } from "@/lib/email/resend";

// GET /api/finance/expenses
export async function GET(request: NextRequest) {
  const { session, error } = requireRole(request.headers, ["admin_officer", "finance_officer", "system_administrator"]);
  if (error) return error;

  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const branchId = url.searchParams.get("branchId");

  const conditions = [];
  if (status) conditions.push(eq(expenses.status, status as "pending"));
  if (branchId) conditions.push(eq(expenses.branchId, branchId));
  conditions.push(eq(expenses.isDeleted, false));

  // Admin Officers only see their own submissions
  if (session!.role === "admin_officer") {
    conditions.push(eq(expenses.initiatedByUserId, session!.userId));
  }

  const rows = await db.select().from(expenses).where(and(...conditions)).orderBy(desc(expenses.createdAt)).limit(50);
  return apiSuccess(rows);
}

// POST /api/finance/expenses — submit expense request
export async function POST(request: NextRequest) {
  const { session, error } = requireRole(request.headers, ["admin_officer", "finance_officer", "system_administrator"]);
  if (error) return error;

  let body: unknown;
  try { body = await request.json(); } catch { return apiError("Invalid body"); }

  const parsed = createExpenseSchema.safeParse(body);
  if (!parsed.success) return apiError("Validation failed", 400);

  // Check period lock
  const [lockSetting] = await db.select().from(systemSettings).where(eq(systemSettings.key, "locked_periods")).limit(1);
  const lockedPeriods: string[] = JSON.parse(lockSetting?.value ?? "[]");
  if (isPeriodLocked(lockedPeriods, parsed.data.periodMonth)) {
    return new Response(JSON.stringify({ error: `Period ${parsed.data.periodMonth} is locked. Contact your finance administrator.` }), { status: 423, headers: { "Content-Type": "application/json" } });
  }

  const [newExpense] = await db.insert(expenses).values({ ...parsed.data, amount: parsed.data.amount, initiatedByUserId: session!.userId, status: "pending" }).returning();

  // Notify all finance officers
  const financeUsers = await db.select({ email: users.email, firstName: users.firstName }).from(users).innerJoin(require("@/lib/db/schema").roles, eq(users.roleId, require("@/lib/db/schema").roles.id)).where(eq(require("@/lib/db/schema").roles.name, "finance_officer"));
  for (const fu of financeUsers) {
    await sendExpenseSubmittedEmail(fu.email, fu.firstName, newExpense.id, parsed.data.description, `${parsed.data.amount}`, `${session!.userEmail}`).catch(() => {});
  }

  await logAction({ userId: session!.userId, userEmail: session!.userEmail, action: "EXPENSE_SUBMITTED", tableAffected: "expenses", recordId: newExpense.id, newValues: parsed.data, ipAddress: getClientIp(request.headers) });

  return apiSuccess(newExpense, 201);
}
