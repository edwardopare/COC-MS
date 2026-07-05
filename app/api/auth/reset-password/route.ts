import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { resetPasswordSchema } from "@/lib/validations";
import { logAction, getClientIp } from "@/lib/audit";

export async function POST(request: NextRequest) {
  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data", details: parsed.error.flatten() }, { status: 400 });
  }

  const { token, password } = parsed.data;
  const email = (body as Record<string, string>).email;

  const [user] = await db
    .select({ id: users.id, email: users.email, firstName: users.firstName, passwordResetToken: users.passwordResetToken, passwordResetExpiresAt: users.passwordResetExpiresAt })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user?.passwordResetToken || !user.passwordResetExpiresAt) {
    return NextResponse.json({ error: "Invalid or expired reset token" }, { status: 400 });
  }

  if (new Date() > user.passwordResetExpiresAt) {
    return NextResponse.json({ error: "Reset token has expired. Please request a new one." }, { status: 400 });
  }

  const tokenMatch = await bcrypt.compare(token, user.passwordResetToken);
  if (!tokenMatch) {
    return NextResponse.json({ error: "Invalid or expired reset token" }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await db.update(users).set({
    passwordHash,
    passwordResetToken: null,
    passwordResetExpiresAt: null,
    mustChangePassword: false,
    updatedAt: new Date(),
  }).where(eq(users.id, user.id));

  await logAction({
    userId: user.id,
    userEmail: user.email,
    action: "PASSWORD_RESET",
    tableAffected: "users",
    recordId: user.id,
    ipAddress: getClientIp(request.headers),
  });

  return NextResponse.json({ success: true });
}
