import type { Metadata } from "next";

export const metadata: Metadata = { title: "Finance Expenses" };

export default function FinanceExpensesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Expense Approvals</h1>
        <p className="text-slate-400 text-sm mt-1">Review and approve or reject pending expense requests</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[["Pending Review", "—", "bg-amber-500/20 text-amber-400"], ["Approved This Month", "—", "bg-green-500/20 text-green-400"], ["Rejected This Month", "—", "bg-red-500/20 text-red-400"]].map(([l, v, c]) => (
          <div key={l} className="bg-slate-800/50 border border-white/5 rounded-xl p-4">
            <p className="text-slate-400 text-sm">{l}</p>
            <p className={`text-2xl font-bold mt-1 ${c.split(" ")[1]}`}>{v}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        {["pending", "approved", "rejected", "all"].map(s => (
          <a key={s} href={`?status=${s}`} className="px-4 py-2 text-sm font-medium rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition capitalize">{s}</a>
        ))}
      </div>

      <div className="bg-slate-800/50 border border-white/5 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left px-4 py-3 text-slate-400 font-medium">Description</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium">Amount</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium">Submitted By</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium">Period</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium">Status</th>
              <th className="px-4 py-3 text-slate-400 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={6} className="px-4 py-10 text-center text-slate-500">Connect your database to see expense requests.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
