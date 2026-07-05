import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifyToken, SESSION_COOKIE } from "@/lib/auth/session";

export default async function HomePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    redirect("/login");
  }

  const payload = await verifyToken(token);
  if (!payload) {
    redirect("/login");
  }

  // Redirect to the correct dashboard based on role
  switch (payload.role) {
    case "system_administrator":
      redirect("/system/users");
    case "finance_officer":
      redirect("/finance/dashboard");
    case "admin_officer":
    default:
      redirect("/admin/dashboard");
  }
}
