import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { sendPasswordResetEmail } from "@/lib/email/resend";
import { forgotPasswordSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const { email } = parsed.data;

  // Always return the same response to prevent email enumeration
  const successResponse = NextResponse.json({
    message: "If that email exists, a reset link has been sent.",
  });

  const [user] = await db
    .select({ id: users.id, firstName: users.firstName, email: users.email })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user) return successResponse;

  // Generate a secure reset token (1-hour expiry)
  const token = crypto.randomBytes(32).toString("hex");
  const hashedToken = await bcrypt.hash(token, 10);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await db
    .update(users)
    .set({ passwordResetToken: hashedToken, passwordResetExpiresAt: expiresAt })
    .where(eq(users.id, user.id));

  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

  await sendPasswordResetEmail(user.email, user.firstName, resetLink);

  return successResponse;
}
