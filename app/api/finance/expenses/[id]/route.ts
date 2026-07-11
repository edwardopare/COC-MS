import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { expenses, approvals, budgetItems, notifications, users, roles } from "@/lib/db/schema";
import { requireRole, apiError, apiSuccess } from "@/lib/api-utils";
import { logAction, getClientIp } from "@/lib/audit";
import { approveExpenseSchema } from "@/lib/validations";
import { sendExpenseDecisionEmail } from "@/lib/email/resend";
import { sendBudgetAlertEmail } from "@/lib/email/resend";

// GET /api/finance/expenses/[id]
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error } = requireRole(request.headers, ["admin_officer", "finance_officer", "system_administrator"]);
  if (error) return error;

  const [expense] = await db.select().from(expenses).where(eq(expenses.id, id)).limit(1);
  if (!expense) return apiError("Expense not found", 404);

  const expenseApprovals = await db.select().from(approvals).where(eq(approvals.expenseId, id));
  return apiSuccess({ ...expense, approvals: expenseApprovals });
}

// PUT /api/finance/expenses/[id] — approve or reject
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { session, error } = requireRole(request.headers, ["finance_officer", "system_administrator"]);
  if (error) return error;

  let body: unknown;
  try { body = await request.json(); } catch { return apiError("Invalid body"); }

  const parsed = approveExpenseSchema.safeParse(body);
  if (!parsed.success) return apiError("Validation failed", 400);

  const [expense] = await db.select().from(expenses).where(eq(expenses.id, id)).limit(1);
  if (!expense) return apiError("Expense not found", 404);
  if (expense.status !== "pending") return apiError("Only pending expenses can be reviewed", 400);

  // Separation of duties: cannot approve own submission
  if (expense.initiatedByUserId === session!.userId) {
    return apiError("You cannot approve your own expense request", 403);
  }

  const { action, comments } = parsed.data;
  const newStatus = action === "approved" ? "approved" : "rejected";

  await db.update(expenses).set({
    status: newStatus, approvedByUserId: session!.userId,
    approvedAt: new Date(), approvalComments: comments ?? null, updatedAt: new Date(),
  }).where(eq(expenses.id, id));

  await db.insert(approvals).values({ expenseId: id, reviewedByUserId: session!.userId, action, comments: comments ?? null });

  // Deduct from budget if approved
  if (action === "approved" && expense.categoryId) {
    const threshold = parseFloat(process.env.BUDGET_ALERT_THRESHOLD ?? "0.8");
    const budgetItem = await db.select().from(budgetItems).where(eq(budgetItems.categoryId, expense.categoryId)).limit(1);
    if (budgetItem[0]) {
      const newActual = parseFloat(budgetItem[0].actualAmount) + parseFloat(expense.amount);
      await db.update(budgetItems).set({ actualAmount: String(newActual), updatedAt: new Date() }).where(eq(budgetItems.id, budgetItem[0].id));

      const pct = newActual / parseFloat(budgetItem[0].allocatedAmount);
      if (pct >= threshold) {
        const financeUsers = await db.select({ email: users.email, firstName: users.firstName }).from(users).innerJoin(roles, eq(users.roleId, roles.id)).where(eq(roles.name, "finance_officer"));
        for (const fu of financeUsers) {
          await sendBudgetAlertEmail(fu.email, fu.firstName, "Budget", expense.categoryId, Math.round(pct * 100)).catch(() => {});
        }
      }
    }
  }

  // Notify the initiator
  const [initiator] = await db.select({ email: users.email, firstName: users.firstName }).from(users).where(eq(users.id, expense.initiatedByUserId)).limit(1);
  if (initiator) {
    await sendExpenseDecisionEmail(initiator.email, initiator.firstName, id, action, comments).catch(() => {});
  }

  await logAction({ userId: session!.userId, userEmail: session!.userEmail, action: `EXPENSE_${action.toUpperCase()}`, tableAffected: "expenses", recordId: id, newValues: { action, comments }, ipAddress: getClientIp(request.headers) });

  return apiSuccess({ id, status: newStatus });
}

// PATCH /api/finance/expenses/[id] — edit pending expense details
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { session, error } = requireRole(request.headers, ["admin_officer", "system_administrator"]);
  if (error) return error;

  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return apiError("Invalid body"); }

  const [expense] = await db.select().from(expenses).where(eq(expenses.id, id)).limit(1);
  if (!expense) return apiError("Expense not found", 404);
  if (expense.status !== "pending") return apiError("Only pending expenses can be edited", 400);

  const updateData: Record<string, unknown> = {};
  if (body.description) updateData.description = body.description;
  if (body.amount) updateData.amount = body.amount;
  if (body.periodMonth) updateData.periodMonth = body.periodMonth;
  updateData.updatedAt = new Date();

  const [updated] = await db.update(expenses).set(updateData).where(eq(expenses.id, id)).returning();

  await logAction({ userId: session!.userId, userEmail: session!.userEmail, action: "EXPENSE_UPDATED", tableAffected: "expenses", recordId: id, oldValues: expense, newValues: updateData, ipAddress: getClientIp(request.headers) });

  return apiSuccess(updated);
}
