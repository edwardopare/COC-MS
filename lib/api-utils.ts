/**
 * Helper to extract session data forwarded by middleware via request headers.
 * Call this at the top of any server-side API route handler.
 */
export function getSessionFromHeaders(headers: Headers) {
  const userId = headers.get("x-user-id");
  const userEmail = headers.get("x-user-email");
  const userRole = headers.get("x-user-role") as
    | "system_administrator"
    | "admin_officer"
    | "finance_officer"
    | null;

  if (!userId || !userEmail || !userRole) {
    return null;
  }

  return { userId, userEmail, role: userRole };
}

/**
 * Guard a route handler to a specific set of roles.
 * Returns a 403 Response if the role doesn't match.
 */
export function requireRole(
  headers: Headers,
  allowedRoles: ("system_administrator" | "admin_officer" | "finance_officer")[]
) {
  const session = getSessionFromHeaders(headers);
  if (!session) {
    return {
      session: null,
      error: new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }),
    };
  }
  if (!allowedRoles.includes(session.role)) {
    return {
      session: null,
      error: new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }),
    };
  }
  return { session, error: null };
}

/**
 * Standard API error response helper
 */
export function apiError(message: string, status: number = 400) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Standard API success response helper
 */
export function apiSuccess<T>(data: T, status: number = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Check if a given YYYY-MM period is locked in system settings.
 * Pass the locked_periods system setting value (JSON array of strings).
 */
export function isPeriodLocked(lockedPeriods: string[], periodMonth: string): boolean {
  return lockedPeriods.includes(periodMonth);
}
