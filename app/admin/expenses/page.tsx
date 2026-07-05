import type { Metadata } from "next";

export const metadata: Metadata = { title: "Expenses" };

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  approved: "bg-green-500/10 text-green-400 border-green-500/20",
  rejected: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function ExpensesPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Expense Requests</h1>
          <p className="text-slate-400 text-sm mt-1">Submit and track expense claims</p>
        </div>
        <a href="/admin/expenses/new" className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition flex items-center gap-2">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
          New Expense
        </a>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2">
        {["all", "pending", "approved", "rejected"].map(s => (
          <a key={s} href={`?status=${s}`} className="px-4 py-2 text-sm font-medium rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition capitalize">{s === "all" ? "All" : s}</a>
        ))}
      </div>

      <div className="bg-slate-800/50 border border-white/5 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left px-4 py-3 text-slate-400 font-medium">Description</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium">Amount</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium">Period</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium">Status</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium">Submitted</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={6} className="px-4 py-10 text-center text-slate-500">Connect your database to see expenses.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
