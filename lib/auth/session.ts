import { SignJWT, jwtVerify, type JWTPayload } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);
const ACCESS_EXPIRY = (process.env.JWT_ACCESS_EXPIRY ?? "15m") as `${number}${"s" | "m" | "h" | "d"}`;
const REFRESH_EXPIRY = (process.env.JWT_REFRESH_EXPIRY ?? "7d") as `${number}${"s" | "m" | "h" | "d"}`;

export interface SessionPayload extends JWTPayload {
  userId: string;
  email: string;
  role: "system_administrator" | "admin_officer" | "finance_officer";
  mustChangePassword: boolean;
}

/**
 * Sign a short-lived access JWT (stored in httpOnly cookie)
 */
export async function signAccessToken(payload: Omit<SessionPayload, keyof JWTPayload>) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(ACCESS_EXPIRY)
    .sign(secret);
}

/**
 * Sign a long-lived refresh JWT
 */
export async function signRefreshToken(userId: string) {
  return new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(REFRESH_EXPIRY)
    .sign(secret);
}

/**
 * Verify and decode a JWT. Returns null if invalid or expired.
 */
export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

/**
 * Cookie configuration for the session token
 */
export const SESSION_COOKIE = "cms_session";
export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 7 days
};
