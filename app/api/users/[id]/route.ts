import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { requireRole, apiError, apiSuccess } from "@/lib/api-utils";
import { logAction, getClientIp } from "@/lib/audit";
import { updateUserSchema } from "@/lib/validations";

// PUT /api/users/[id] — update user details
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { session, error } = requireRole(request.headers, ["system_administrator"]);
  if (error) return error;

  let body: unknown;
  try { body = await request.json(); } catch { return apiError("Invalid body"); }

  const parsed = updateUserSchema.safeParse(body);
  if (!parsed.success) return apiError("Invalid data", 400);

  const [existing] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  if (!existing) return apiError("User not found", 404);

  const [updated] = await db.update(users).set({ ...parsed.data, updatedAt: new Date() }).where(eq(users.id, id)).returning();

  await logAction({ userId: session!.userId, userEmail: session!.userEmail, action: "USER_UPDATED", tableAffected: "users", recordId: id, oldValues: existing, newValues: parsed.data, ipAddress: getClientIp(request.headers) });

  return apiSuccess(updated);
}

// PATCH /api/users/[id] — toggle active/suspended status
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { session, error } = requireRole(request.headers, ["system_administrator"]);
  if (error) return error;

  const [existing] = await db.select({ id: users.id, status: users.status, email: users.email }).from(users).where(eq(users.id, id)).limit(1);
  if (!existing) return apiError("User not found", 404);
  if (existing.id === session!.userId) return apiError("You cannot suspend your own account", 400);

  const newStatus = existing.status === "active" ? "suspended" : "active";
  await db.update(users).set({ status: newStatus, updatedAt: new Date() }).where(eq(users.id, id));

  await logAction({ userId: session!.userId, userEmail: session!.userEmail, action: `USER_${newStatus.toUpperCase()}`, tableAffected: "users", recordId: id, ipAddress: getClientIp(request.headers) });

  return apiSuccess({ id, status: newStatus });
}
