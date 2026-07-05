import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken, SESSION_COOKIE } from "@/lib/auth/session";
import Sidebar from "@/components/layout/Sidebar";
import NotificationBell from "@/components/layout/NotificationBell";

export default async function SystemLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) redirect("/login");
  const payload = await verifyToken(token);
  if (!payload || payload.role !== "system_administrator") redirect("/unauthorized");

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      <Sidebar role="system_administrator" userName={payload.email} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-end gap-3 px-6 py-3 border-b border-white/5 bg-slate-900/50 backdrop-blur">
          <NotificationBell />
          <div className="w-8 h-8 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
            <span className="text-violet-300 text-xs font-bold">{payload.email[0].toUpperCase()}</span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
