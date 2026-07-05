import type { Metadata } from "next";

export const metadata: Metadata = { title: "Budgets" };

export default function BudgetsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Budget Management</h1>
          <p className="text-slate-400 text-sm mt-1">Create and monitor annual and monthly budgets</p>
        </div>
        <a href="/finance/budgets/new" className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition flex items-center gap-2">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
          New Budget
        </a>
      </div>

      <div className="bg-slate-800/50 border border-white/5 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left px-4 py-3 text-slate-400 font-medium">Name</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium">Period</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium">Total Budget</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium">Spent</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium">Remaining</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium">Utilisation</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={7} className="px-4 py-10 text-center text-slate-500">Connect your database to see budgets.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
