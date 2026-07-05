import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, roles } from "@/lib/db/schema";
import { requireRole, apiError, apiSuccess } from "@/lib/api-utils";
import { logAction, getClientIp } from "@/lib/audit";
import { createUserSchema, updateUserSchema } from "@/lib/validations";
import { sendWelcomeEmail } from "@/lib/email/resend";

// GET /api/users — list all users (System Admin only)
export async function GET(request: NextRequest) {
  const { session, error } = requireRole(request.headers, ["system_administrator"]);
  if (error) return error;

  const allUsers = await db
    .select({
      id: users.id, firstName: users.firstName, lastName: users.lastName,
      email: users.email, status: users.status, mustChangePassword: users.mustChangePassword,
      lastLoginAt: users.lastLoginAt, createdAt: users.createdAt,
      roleId: users.roleId, roleName: roles.name,
    })
    .from(users)
    .innerJoin(roles, eq(users.roleId, roles.id))
    .orderBy(users.createdAt);

  return apiSuccess(allUsers);
}

// POST /api/users — create a new user (System Admin only)
export async function POST(request: NextRequest) {
  const { session, error } = requireRole(request.headers, ["system_administrator"]);
  if (error) return error;

  let body: unknown;
  try { body = await request.json(); } catch { return apiError("Invalid body"); }

  const parsed = createUserSchema.safeParse(body);
  if (!parsed.success) return apiError(parsed.error.flatten().fieldErrors as unknown as string, 400);

  const { firstName, lastName, email, roleId } = parsed.data;

  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing) return apiError("A user with this email already exists", 409);

  const [role] = await db.select({ id: roles.id }).from(roles).where(eq(roles.id, roleId)).limit(1);
  if (!role) return apiError("Invalid role ID", 400);

  const tempPassword = crypto.randomBytes(6).toString("base64").slice(0, 10) + "A1!";
  const passwordHash = await bcrypt.hash(tempPassword, 12);

  const [newUser] = await db.insert(users).values({
    firstName, lastName, email, passwordHash, roleId, mustChangePassword: true, status: "active",
  }).returning({ id: users.id, email: users.email });

  await sendWelcomeEmail(email, firstName, tempPassword);

  await logAction({
    userId: session!.userId, userEmail: session!.userEmail,
    action: "USER_CREATED", tableAffected: "users", recordId: newUser.id,
    newValues: { firstName, lastName, email, roleId },
    ipAddress: getClientIp(request.headers),
  });

  return apiSuccess({ id: newUser.id, email: newUser.email }, 201);
}
