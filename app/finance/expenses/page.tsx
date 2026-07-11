"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";

interface Expense {
  id: string;
  amount: string;
  description: string;
  status: "pending" | "approved" | "rejected" | "paid" | "cancelled";
  periodMonth: string;
  createdAt: string;
  initiatedByUserId: string;
  initiatedByFirstName?: string;
  initiatedByLastName?: string;
  userEmail?: string;
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  approved: "bg-green-500/10 text-green-400 border-green-500/20",
  rejected: "bg-red-500/10 text-red-400 border-red-500/20",
  paid: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

export default function FinanceExpensesPage() {
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get("status") ?? "pending";
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, string>>({});
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Load expenses based on filter
      const url = new URL("/api/finance/expenses", window.location.origin);
      if (statusFilter !== "all") {
        url.searchParams.append("status", statusFilter);
      }
      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        setExpenses(data);
      }

      // Load stats (all expenses to compute status counts)
      const allRes = await fetch("/api/finance/expenses?status=");
      if (allRes.ok) {
        const allData: Expense[] = await allRes.json();
        let pending = 0;
        let approved = 0;
        let rejected = 0;
        allData.forEach((item) => {
          if (item.status === "pending") pending++;
          if (item.status === "approved") approved++;
          if (item.status === "rejected") rejected++;
        });
        setStats({ pending, approved, rejected });
      }
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDecision = async (id: string, action: "approved" | "rejected") => {
    setSubmitting(id);
    try {
      const res = await fetch(`/api/finance/expenses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          comments: comments[id] ?? "",
        }),
      });

      if (res.ok) {
        loadData();
      } else {
        const data = await res.json();
        alert(data.error ?? "Failed to save decision.");
      }
    } catch {
      alert("A network error occurred.");
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Expense Approvals</h1>
        <p className="text-slate-400 text-sm mt-1">Review and approve or reject pending expense requests</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Pending Review", value: stats.pending, textClass: "text-amber-400" },
          { label: "Approved This Month", value: stats.approved, textClass: "text-green-400" },
          { label: "Rejected This Month", value: stats.rejected, textClass: "text-red-400" },
        ].map((card) => (
          <div key={card.label} className="bg-slate-800/50 border border-white/5 rounded-xl p-4">
            <p className="text-slate-400 text-sm">{card.label}</p>
            <p className={`text-2xl font-bold mt-1 ${card.textClass}`}>{card.value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        {["pending", "approved", "rejected", "all"].map((s) => (
          <a
            key={s}
            href={`?status=${s}`}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition capitalize ${
              statusFilter === s
                ? "bg-indigo-600 text-white"
                : "bg-white/5 hover:bg-white/10 text-slate-300"
            }`}
          >
            {s}
          </a>
        ))}
      </div>

      <div className="bg-slate-800/50 border border-white/5 rounded-xl overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b border-white/5 bg-slate-900/30">
              <th className="px-4 py-3 text-slate-400 font-medium">Description</th>
              <th className="px-4 py-3 text-slate-400 font-medium">Amount</th>
              <th className="px-4 py-3 text-slate-400 font-medium">Submitted By</th>
              <th className="px-4 py-3 text-slate-400 font-medium">Period</th>
              <th className="px-4 py-3 text-slate-400 font-medium">Status</th>
              <th className="px-4 py-3 text-slate-400 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                  Loading claims...
                </td>
              </tr>
            ) : expenses.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                  No expense requests to review.
                </td>
              </tr>
            ) : (
              expenses.map((expense) => (
                <tr key={expense.id} className="border-b border-white/5 hover:bg-white/5 transition">
                  <td className="px-4 py-3.5 text-white font-medium">
                    {expense.description}
                  </td>
                  <td className="px-4 py-3.5 text-white font-mono">
                    GH₵{parseFloat(expense.amount).toFixed(2)}
                  </td>
                  <td className="px-4 py-3.5 text-slate-300">
                    {expense.initiatedByFirstName
                      ? `${expense.initiatedByFirstName} ${expense.initiatedByLastName}`
                      : "Unknown User"}
                  </td>
                  <td className="px-4 py-3.5 text-slate-300">{expense.periodMonth}</td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`px-2 py-0.5 rounded text-xs border capitalize ${
                        STATUS_STYLES[expense.status] ?? STATUS_STYLES.pending
                      }`}
                    >
                      {expense.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right space-y-2">
                    {expense.status === "pending" ? (
                      <div className="flex flex-col items-end gap-1.5 max-w-xs ml-auto">
                        <input
                          type="text"
                          placeholder="Approver comments (optional)"
                          value={comments[expense.id] ?? ""}
                          onChange={(e) =>
                            setComments((prev) => ({ ...prev, [expense.id]: e.target.value }))
                          }
                          className="w-full px-2 py-1 bg-slate-900 border border-white/10 rounded text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDecision(expense.id, "approved")}
                            disabled={submitting === expense.id}
                            className="px-2.5 py-1 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white text-xs font-semibold rounded transition cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleDecision(expense.id, "rejected")}
                            disabled={submitting === expense.id}
                            className="px-2.5 py-1 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-semibold rounded transition cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-500 text-xs">—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
