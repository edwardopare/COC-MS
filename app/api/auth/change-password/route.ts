import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { requireRole } from "@/lib/api-utils";
import { logAction, getClientIp } from "@/lib/audit";
import { signAccessToken, SESSION_COOKIE, cookieOptions } from "@/lib/auth/session";
import { z } from "zod";

const schema = z.object({
  password: z.string().min(8, "Min 8 characters").regex(/[A-Z]/, "Needs uppercase").regex(/[0-9]/, "Needs number"),
  confirmPassword: z.string(),
}).strict().refine(d => d.password === d.confirmPassword, { message: "Passwords do not match", path: ["confirmPassword"] });

export async function POST(request: NextRequest) {
  const { session, error } = requireRole(request.headers, ["system_administrator", "admin_officer", "finance_officer"]);
  if (error) return error;

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid password", details: parsed.error.flatten() }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  await db.update(users).set({ passwordHash, mustChangePassword: false, updatedAt: new Date() }).where(eq(users.id, session!.userId));

  await logAction({ userId: session!.userId, userEmail: session!.userEmail, action: "PASSWORD_CHANGED", tableAffected: "users", recordId: session!.userId, ipAddress: getClientIp(request.headers) });

  const token = await signAccessToken({
    userId: session!.userId,
    email: session!.userEmail,
    role: session!.role,
    mustChangePassword: false,
  });

  const response = NextResponse.json({ success: true });
  response.cookies.set(SESSION_COOKIE, token, cookieOptions);
  return response;
}
