import { NextRequest, NextResponse } from "next/server";
import { verifyToken, SESSION_COOKIE } from "@/lib/auth/session";

// ─────────────────────────────────────────────────────────
// Route access matrix
// ─────────────────────────────────────────────────────────

const ROLE_ROUTES: Record<string, string[]> = {
  "/admin": ["admin_officer", "system_administrator"],
  "/finance": ["finance_officer", "system_administrator"],
  "/system": ["system_administrator"],
};

// Public routes that don't require authentication
const PUBLIC_PATHS = [
  "/login",
  "/forgot-password",
  "/reset-password",
  "/change-password",
  "/unauthorized",
  "/api/auth/login",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
];

/**
 * Next.js 16 proxy function (replaces middleware).
 * Runs on every request to enforce auth and role-based access.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths through without auth check
  const isPublic = PUBLIC_PATHS.some((path) => pathname.startsWith(path));
  if (isPublic) return NextResponse.next();

  // Read session cookie
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Verify JWT
  const payload = await verifyToken(token);
  if (!payload) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete(SESSION_COOKIE);
    return response;
  }

  // Force password change — redirect everywhere except the change page and API routes
  if (payload.mustChangePassword && pathname !== "/change-password" && !pathname.startsWith("/api/")) {
    return NextResponse.redirect(new URL("/change-password", request.url));
  }

  // Role-based route enforcement
  for (const [routePrefix, allowedRoles] of Object.entries(ROLE_ROUTES)) {
    if (pathname.startsWith(routePrefix)) {
      if (!allowedRoles.includes(payload.role)) {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
      break;
    }
  }

  // Forward user identity to route handlers via headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-user-id", payload.userId);
  requestHeaders.set("x-user-email", payload.email);
  requestHeaders.set("x-user-role", payload.role);

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    // Match all paths except Next.js internals and static files
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
