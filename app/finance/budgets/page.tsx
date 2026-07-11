"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Budget {
  id: string;
  name: string;
  period: "monthly" | "annual";
  periodLabel: string;
  totalAmount: string;
  status: "draft" | "active" | "locked" | "closed";
}

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBudgets() {
      try {
        const res = await fetch("/api/budgets");
        if (res.ok) {
          const data = await res.json();
          setBudgets(data);
        }
      } catch {
        /* silent */
      } finally {
        setLoading(false);
      }
    }

    loadBudgets();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Budget Management</h1>
          <p className="text-slate-400 text-sm mt-1">Create and monitor annual and monthly budgets</p>
        </div>
        <Link
          href="/finance/budgets/new"
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition flex items-center gap-2 cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Budget
        </Link>
      </div>

      <div className="bg-slate-800/50 border border-white/5 rounded-xl overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b border-white/5 bg-slate-900/30">
              <th className="px-4 py-3 text-slate-400 font-medium">Name</th>
              <th className="px-4 py-3 text-slate-400 font-medium">Period</th>
              <th className="px-4 py-3 text-slate-400 font-medium">Total Budget</th>
              <th className="px-4 py-3 text-slate-400 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-slate-500">
                  Loading budgets...
                </td>
              </tr>
            ) : budgets.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-slate-500">
                  No budgets created yet. Click{" "}
                  <Link href="/finance/budgets/new" className="text-indigo-400 font-medium hover:underline">
                    New Budget
                  </Link>{" "}
                  to create your first budget plan.
                </td>
              </tr>
            ) : (
              budgets.map((b) => (
                <tr key={b.id} className="border-b border-white/5 hover:bg-white/5 transition">
                  <td className="px-4 py-3.5 text-white font-medium">{b.name}</td>
                  <td className="px-4 py-3.5 text-slate-300 capitalize">
                    {b.period} ({b.periodLabel})
                  </td>
                  <td className="px-4 py-3.5 text-white font-mono font-semibold">
                    ${parseFloat(b.totalAmount).toFixed(2)}
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`px-2 py-0.5 rounded text-xs border capitalize ${
                        b.status === "active"
                          ? "bg-green-500/10 text-green-400 border-green-500/20"
                          : b.status === "draft"
                          ? "bg-slate-500/10 text-slate-400 border-slate-500/20"
                          : "bg-red-500/10 text-red-400 border-red-500/20"
                      }`}
                    >
                      {b.status}
                    </span>
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
