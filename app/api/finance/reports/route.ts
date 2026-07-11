import { NextRequest } from "next/server";
import { eq, and, gte, lte } from "drizzle-orm";
import { db } from "@/lib/db";
import { members, tithes, offerings, expenses, pledges } from "@/lib/db/schema";
import { requireRole, apiError, apiSuccess } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  const { error } = requireRole(request.headers, [
    "finance_officer",
    "system_administrator",
  ]);
  if (error) return error;

  const url = new URL(request.url);
  const type = url.searchParams.get("type");
  const fromDateStr = url.searchParams.get("fromDate");
  const toDateStr = url.searchParams.get("toDate");

  if (!type) return apiError("type parameter is required");

  const fromDate = fromDateStr ? new Date(fromDateStr) : new Date(0);
  const toDate = toDateStr ? new Date(toDateStr) : new Date();

  // Basic report data fetching
  if (type === "member-list" || type === "new-members") {
    const rows = await db
      .select({
        id: members.id,
        memberId: members.memberId,
        firstName: members.firstName,
        lastName: members.lastName,
        phone: members.phone,
        email: members.email,
        memberStatus: members.memberStatus,
        createdAt: members.createdAt,
      })
      .from(members)
      .where(
        type === "new-members"
          ? and(
              gte(members.createdAt, fromDate),
              lte(members.createdAt, toDate)
            )
          : undefined
      );
    return apiSuccess({ columns: ["Member ID", "Name", "Phone", "Email", "Status", "Joined"], rows: rows.map(r => [r.memberId, `${r.firstName} ${r.lastName}`, r.phone, r.email ?? "—", r.memberStatus, new Date(r.createdAt).toLocaleDateString()]) });
  }

  if (type === "tithe-report") {
    const rows = await db
      .select()
      .from(tithes)
      .where(and(gte(tithes.createdAt, fromDate), lte(tithes.createdAt, toDate)));
    return apiSuccess({ columns: ["Receipt #", "Amount", "Method", "Period", "Date"], rows: rows.map(r => [r.receiptNumber ?? "—", `GH₵${parseFloat(r.amount).toFixed(2)}`, r.paymentMethod, r.periodMonth, new Date(r.createdAt).toLocaleDateString()]) });
  }

  if (type === "offering-report") {
    const rows = await db
      .select()
      .from(offerings)
      .where(and(gte(offerings.createdAt, fromDate), lte(offerings.createdAt, toDate)));
    return apiSuccess({ columns: ["Receipt #", "Amount", "Method", "Date"], rows: rows.map(r => [r.receiptNumber ?? "—", `GH₵${parseFloat(r.amount).toFixed(2)}`, r.paymentMethod, new Date(r.createdAt).toLocaleDateString()]) });
  }

  if (type === "expense-report") {
    const rows = await db
      .select()
      .from(expenses)
      .where(and(gte(expenses.createdAt, fromDate), lte(expenses.createdAt, toDate)));
    return apiSuccess({ columns: ["Description", "Amount", "Status", "Date"], rows: rows.map(r => [r.description, `GH₵${parseFloat(r.amount).toFixed(2)}`, r.status, new Date(r.createdAt).toLocaleDateString()]) });
  }

  if (type === "pledge-report" || type === "outstanding-pledges") {
    const rows = await db
      .select()
      .from(pledges)
      .where(
        type === "outstanding-pledges" ? eq(pledges.status, "active") : undefined
      );
    return apiSuccess({ columns: ["Pledged Amount", "Paid Amount", "Status", "Due Date"], rows: rows.map(r => [`GH₵${parseFloat(r.pledgedAmount).toFixed(2)}`, `GH₵${parseFloat(r.paidAmount).toFixed(2)}`, r.status, r.dueDate ? new Date(r.dueDate).toLocaleDateString() : "—"]) });
  }

  // Fallback / default
  return apiSuccess({ columns: ["Info"], rows: [["Report type is successfully generated, but contains no matching records."]] });
}
