import { NextRequest } from "next/server";
import { eq, ilike, and, or, desc, count } from "drizzle-orm";
import { db } from "@/lib/db";
import { members, branches, systemSettings } from "@/lib/db/schema";
import { requireRole, apiError, apiSuccess } from "@/lib/api-utils";
import { logAction, getClientIp } from "@/lib/audit";
import { createMemberSchema } from "@/lib/validations";

// GET /api/members — paginated, searchable member list
export async function GET(request: NextRequest) {
  const { session, error } = requireRole(request.headers, ["admin_officer", "system_administrator", "finance_officer"]);
  if (error) return error;

  const url = new URL(request.url);
  const search = url.searchParams.get("q") ?? "";
  const branchId = url.searchParams.get("branchId");
  const status = url.searchParams.get("status") as "active" | "inactive" | null;
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1"));
  const limit = Math.min(100, parseInt(url.searchParams.get("limit") ?? "25"));
  const offset = (page - 1) * limit;

  const conditions = [];
  if (search) conditions.push(or(ilike(members.firstName, `%${search}%`), ilike(members.lastName, `%${search}%`), ilike(members.phone, `%${search}%`), ilike(members.memberId, `%${search}%`)));
  if (branchId) conditions.push(eq(members.branchId, branchId));
  if (status) conditions.push(eq(members.memberStatus, status));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, [total]] = await Promise.all([
    db.select({ id: members.id, memberId: members.memberId, firstName: members.firstName, lastName: members.lastName, phone: members.phone, email: members.email, memberStatus: members.memberStatus, branchId: members.branchId, createdAt: members.createdAt }).from(members).where(where).orderBy(desc(members.createdAt)).limit(limit).offset(offset),
    db.select({ count: count() }).from(members).where(where),
  ]);

  return apiSuccess({ data: rows, total: total.count, page, limit, pages: Math.ceil(total.count / limit) });
}

// POST /api/members — register new member (Admin Officer)
export async function POST(request: NextRequest) {
  const { session, error } = requireRole(request.headers, ["admin_officer", "system_administrator"]);
  if (error) return error;

  let body: unknown;
  try { body = await request.json(); } catch { return apiError("Invalid body"); }

  const parsed = createMemberSchema.safeParse(body);
  if (!parsed.success) return apiError("Validation failed", 400);

  // Generate unique member ID
  const [seqSetting] = await db.select().from(systemSettings).where(eq(systemSettings.key, "last_member_sequence")).limit(1);
  const [prefixSetting] = await db.select().from(systemSettings).where(eq(systemSettings.key, "member_id_prefix")).limit(1);
  const nextSeq = (parseInt(seqSetting?.value ?? "0") + 1);
  const prefix = prefixSetting?.value ?? "CHU";
  const year = new Date().getFullYear();
  const memberId = `${prefix}-${year}-${String(nextSeq).padStart(5, "0")}`;

  const [newMember] = await db.insert(members).values({ ...parsed.data, memberId }).returning({ id: members.id, memberId: members.memberId });

  await db.update(systemSettings).set({ value: String(nextSeq) }).where(eq(systemSettings.key, "last_member_sequence"));

  await logAction({ userId: session!.userId, userEmail: session!.userEmail, action: "MEMBER_CREATED", tableAffected: "members", recordId: newMember.id, newValues: parsed.data, ipAddress: getClientIp(request.headers) });

  return apiSuccess({ id: newMember.id, memberId: newMember.memberId }, 201);
}
