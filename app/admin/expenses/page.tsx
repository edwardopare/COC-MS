"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface Expense {
  id: string;
  amount: string;
  description: string;
  status: "pending" | "approved" | "rejected" | "paid" | "cancelled";
  periodMonth: string;
  createdAt: string;
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  approved: "bg-green-500/10 text-green-400 border-green-500/20",
  rejected: "bg-red-500/10 text-red-400 border-red-500/20",
  paid: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  cancelled: "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

export default function ExpensesPage() {
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get("status") ?? "all";
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  const loadExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const url = new URL("/api/finance/expenses", window.location.origin);
      if (statusFilter !== "all") {
        url.searchParams.append("status", statusFilter);
      }
      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        setExpenses(data);
      }
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Expense Requests</h1>
          <p className="text-slate-400 text-sm mt-1">Submit and track expense claims</p>
        </div>
        <Link
          href="/admin/expenses/new"
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition flex items-center gap-2 cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Expense
        </Link>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2">
        {["all", "pending", "approved", "rejected"].map((s) => (
          <Link
            key={s}
            href={`?status=${s}`}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition capitalize ${
              statusFilter === s
                ? "bg-indigo-600 text-white"
                : "bg-white/5 hover:bg-white/10 text-slate-300"
            }`}
          >
            {s === "all" ? "All" : s}
          </Link>
        ))}
      </div>

      <div className="bg-slate-800/50 border border-white/5 rounded-xl overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b border-white/5 bg-slate-900/30">
              <th className="px-4 py-3 text-slate-400 font-medium">Description</th>
              <th className="px-4 py-3 text-slate-400 font-medium">Amount</th>
              <th className="px-4 py-3 text-slate-400 font-medium">Period</th>
              <th className="px-4 py-3 text-slate-400 font-medium">Status</th>
              <th className="px-4 py-3 text-slate-400 font-medium">Submitted</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                  Loading requests...
                </td>
              </tr>
            ) : expenses.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                  No expense requests found.
                </td>
              </tr>
            ) : (
              expenses.map((expense) => (
                <tr key={expense.id} className="border-b border-white/5 hover:bg-white/5 transition">
                  <td className="px-4 py-3.5 text-white font-medium">{expense.description}</td>
                  <td className="px-4 py-3.5 text-white font-mono">${parseFloat(expense.amount).toFixed(2)}</td>
                  <td className="px-4 py-3.5 text-slate-300">{expense.periodMonth}</td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                        STATUS_STYLES[expense.status] ?? STATUS_STYLES.pending
                      }`}
                    >
                      {expense.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-400">
                    {new Date(expense.createdAt).toLocaleDateString()}
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
