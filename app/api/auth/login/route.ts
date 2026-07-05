import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, roles } from "@/lib/db/schema";
import { signAccessToken, SESSION_COOKIE, cookieOptions } from "@/lib/auth/session";
import { loginSchema } from "@/lib/validations";
import { logAction, getClientIp } from "@/lib/audit";

// Simple in-memory rate limiter (use Upstash Redis in production for multi-instance)
const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 10;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = loginAttempts.get(ip);
  if (!record || now > record.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  if (record.count >= MAX_ATTEMPTS) return true;
  record.count++;
  return false;
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers);

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many login attempts. Please try again later." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid credentials", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { email, password } = parsed.data;

  // Fetch user with role
  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      passwordHash: users.passwordHash,
      status: users.status,
      mustChangePassword: users.mustChangePassword,
      firstName: users.firstName,
      lastName: users.lastName,
      roleId: users.roleId,
      roleName: roles.name,
    })
    .from(users)
    .innerJoin(roles, eq(users.roleId, roles.id))
    .where(eq(users.email, email))
    .limit(1);

  if (!user) {
    // Constant-time response to prevent user enumeration
    await bcrypt.compare(password, "$2b$12$invalidhashtopreventtiming00000000000000000");
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  if (user.status === "suspended") {
    return NextResponse.json(
      { error: "Your account has been suspended. Contact your administrator." },
      { status: 403 }
    );
  }

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatch) {
    await logAction({
      userId: user.id,
      userEmail: user.email,
      action: "LOGIN_FAILED",
      ipAddress: ip,
    });
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  // Update last login
  await db
    .update(users)
    .set({ lastLoginAt: new Date() })
    .where(eq(users.id, user.id));

  const token = await signAccessToken({
    userId: user.id,
    email: user.email,
    role: user.roleName,
    mustChangePassword: user.mustChangePassword,
  });

  await logAction({
    userId: user.id,
    userEmail: user.email,
    action: "LOGIN_SUCCESS",
    ipAddress: ip,
    userAgent: request.headers.get("user-agent") ?? undefined,
  });

  const response = NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.roleName,
      mustChangePassword: user.mustChangePassword,
    },
  });

  response.cookies.set(SESSION_COOKIE, token, cookieOptions);
  return response;
}
