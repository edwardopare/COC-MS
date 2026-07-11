import { NextRequest } from "next/server";
import { count, eq, gte, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { members, events, expenses, tithes, offerings } from "@/lib/db/schema";
import { requireRole, apiSuccess } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  const { error } = requireRole(request.headers, [
    "admin_officer",
    "finance_officer",
    "system_administrator",
  ]);
  if (error) return error;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfWeek = new Date(now.getTime() - now.getDay() * 24 * 60 * 60 * 1000);

  // Total members
  const [totalMem] = await db.select({ count: count() }).from(members);

  // New members this month
  const [newMem] = await db
    .select({ count: count() })
    .from(members)
    .where(gte(members.createdAt, startOfMonth));

  // Events this week
  const [eventsThisWeek] = await db
    .select({ count: count() })
    .from(events)
    .where(gte(events.eventDate, startOfWeek));

  // Pending expenses
  const [pendingExp] = await db
    .select({ count: count() })
    .from(expenses)
    .where(eq(expenses.status, "pending"));

  // Calculate Income sums (tithes + offerings)
  const tithesRows = await db.select({ amount: tithes.amount }).from(tithes);
  const offeringsRows = await db.select({ amount: offerings.amount }).from(offerings);

  const totalTithe = tithesRows.reduce((sum, r) => sum + parseFloat(r.amount), 0);
  const totalOffering = offeringsRows.reduce((sum, r) => sum + parseFloat(r.amount), 0);
  const totalIncome = totalTithe + totalOffering;

  return apiSuccess({
    totalMembers: totalMem.count,
    newMembersThisMonth: newMem.count,
    eventsThisWeek: eventsThisWeek.count,
    pendingExpenses: pendingExp.count,
    totalIncome,
  });
}
