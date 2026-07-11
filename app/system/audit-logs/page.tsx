"use client";

import { useState, useEffect } from "react";

interface AuditLog {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  tableAffected: string | null;
  recordId: string | null;
  timestamp: string;
  ipAddress: string | null;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  async function loadLogs() {
    setLoading(true);
    try {
      const res = await fetch(`/api/audit?page=${page}&limit=50`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLogs();
  }, [page]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">System Audit Logs</h1>
          <p className="text-slate-400 text-sm mt-1">
            Track user activities and system operations
          </p>
        </div>
        <button
          onClick={loadLogs}
          className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-semibold rounded-lg transition"
        >
          Refresh
        </button>
      </div>

      {/* Table */}
      <div className="bg-slate-800/50 border border-white/5 rounded-xl overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b border-white/5 bg-slate-900/30">
              <th className="px-4 py-3 text-slate-400 font-medium">Timestamp</th>
              <th className="px-4 py-3 text-slate-400 font-medium">User Email</th>
              <th className="px-4 py-3 text-slate-400 font-medium">Action</th>
              <th className="px-4 py-3 text-slate-400 font-medium">Target</th>
              <th className="px-4 py-3 text-slate-400 font-medium">IP Address</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                  Loading audit logs...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                  No audit logs recorded yet.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="border-b border-white/5 hover:bg-white/5 transition">
                  <td className="px-4 py-3.5 text-slate-300 font-mono text-xs">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-3.5 text-white font-medium">{log.userEmail}</td>
                  <td className="px-4 py-3.5 text-indigo-400 font-semibold text-xs font-mono uppercase">
                    {log.action}
                  </td>
                  <td className="px-4 py-3.5 text-slate-400 text-xs">
                    {log.tableAffected ? `${log.tableAffected} (${log.recordId ?? "N/A"})` : "—"}
                  </td>
                  <td className="px-4 py-3.5 text-slate-400 font-mono text-xs">
                    {log.ipAddress ?? "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="px-4 py-3 border-t border-white/5 flex items-center justify-between bg-slate-900/10">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-xs bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-slate-300 rounded transition font-medium"
          >
            Previous
          </button>
          <span className="text-slate-400 text-xs">Page {page}</span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={logs.length < 50}
            className="px-3 py-1.5 text-xs bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-slate-300 rounded transition font-medium"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
