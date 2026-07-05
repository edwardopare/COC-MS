import type { Metadata } from "next";

export const metadata: Metadata = { title: "Audit Logs" };

export default function AuditLogsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Audit Trail</h1>
          <p className="text-slate-400 text-sm mt-1">Immutable record of all system actions</p>
        </div>
        <button className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-medium rounded-lg transition flex items-center gap-2">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
          Export
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <input type="date" className="px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        <input type="date" className="px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        <input type="text" placeholder="Filter by user email…" className="px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-48" />
        <input type="text" placeholder="Filter by action…" className="px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-40" />
      </div>

      <div className="bg-slate-800/50 border border-white/5 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left px-4 py-3 text-slate-400 font-medium">Timestamp</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium">User</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium">Action</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium">Table</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium">IP Address</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                Connect your Neon database to view audit logs.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
