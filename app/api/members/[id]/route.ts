import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { members, memberFamilies, memberDepartments, memberCellGroups, tithes, offerings, donations, attendance } from "@/lib/db/schema";
import { requireRole, apiError, apiSuccess } from "@/lib/api-utils";
import { logAction, getClientIp } from "@/lib/audit";
import { updateMemberSchema } from "@/lib/validations";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error } = requireRole(request.headers, ["admin_officer", "system_administrator", "finance_officer"]);
  if (error) return error;

  const [member] = await db.select().from(members).where(eq(members.id, id)).limit(1);
  if (!member) return apiError("Member not found", 404);

  const [families, depts, cells] = await Promise.all([
    db.select().from(memberFamilies).where(eq(memberFamilies.memberId, id)),
    db.select().from(memberDepartments).where(eq(memberDepartments.memberId, id)),
    db.select().from(memberCellGroups).where(eq(memberCellGroups.memberId, id)),
  ]);

  return apiSuccess({ ...member, families, departments: depts, cellGroups: cells });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { session, error } = requireRole(request.headers, ["admin_officer", "system_administrator"]);
  if (error) return error;

  let body: unknown;
  try { body = await request.json(); } catch { return apiError("Invalid body"); }

  const parsed = updateMemberSchema.safeParse(body);
  if (!parsed.success) return apiError("Validation failed", 400);

  const [existing] = await db.select().from(members).where(eq(members.id, id)).limit(1);
  if (!existing) return apiError("Member not found", 404);

  const [updated] = await db.update(members).set({ ...parsed.data, updatedAt: new Date() }).where(eq(members.id, id)).returning();

  await logAction({ userId: session!.userId, userEmail: session!.userEmail, action: "MEMBER_UPDATED", tableAffected: "members", recordId: id, oldValues: existing, newValues: parsed.data, ipAddress: getClientIp(request.headers) });

  return apiSuccess(updated);
}
