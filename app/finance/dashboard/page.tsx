"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Expense {
  id: string;
  amount: string;
  description: string;
  status: string;
}

function StatCard({
  label,
  value,
  sub,
  color,
  icon,
}: {
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-slate-800/50 border border-white/5 rounded-xl p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-400 text-sm">{label}</p>
          <p className="text-white text-2xl font-bold mt-1">{value}</p>
          {sub && <p className="text-slate-500 text-xs mt-1">{sub}</p>}
        </div>
        <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function FinanceDashboard() {
  const [stats, setStats] = useState({
    totalIncome: 0,
    pendingExpenses: 0,
  });
  const [pendingList, setPendingList] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load general stats
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => {
        if (data) setStats(data);
      })
      .catch(() => {});

    // Load pending approvals list
    fetch("/api/finance/expenses?status=pending")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setPendingList(data.slice(0, 3)); // show top 3 pending
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Finance Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Treasury overview and pending approvals</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Income"
          value={loading ? "—" : `$${stats.totalIncome.toFixed(2)}`}
          sub="Tithes + Offerings"
          color="bg-green-500/20"
          icon={
            <svg
              className="w-5 h-5 text-green-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />
        <StatCard
          label="Pending Approvals"
          value={loading ? "—" : stats.pendingExpenses}
          sub="Expense requests"
          color="bg-amber-500/20"
          icon={
            <svg
              className="w-5 h-5 text-amber-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path strokeLinecap="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="This Month Expenses"
          value="$0.00"
          sub="Approved only"
          color="bg-rose-500/20"
          icon={
            <svg
              className="w-5 h-5 text-rose-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z"
              />
            </svg>
          }
        />
        <StatCard
          label="Active Pledges"
          value="$0.00"
          sub="Outstanding balance"
          color="bg-violet-500/20"
          icon={
            <svg
              className="w-5 h-5 text-violet-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path strokeLinecap="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-slate-800/50 border border-white/5 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <h2 className="text-white font-semibold mb-4">Pending Expense Approvals</h2>
            {loading ? (
              <p className="text-slate-500 text-sm text-center py-6">Loading pending approvals…</p>
            ) : pendingList.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-6">No pending approvals</p>
            ) : (
              <div className="space-y-3">
                {pendingList.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center bg-slate-900/30 p-3 rounded-lg border border-white/5"
                  >
                    <div>
                      <p className="text-white text-sm font-medium">{item.description}</p>
                      <p className="text-slate-500 text-xs mt-0.5">Status: pending</p>
                    </div>
                    <span className="text-white font-mono font-semibold">
                      ${parseFloat(item.amount).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <Link
            href="/finance/expenses"
            className="block w-full text-center py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition mt-4 cursor-pointer"
          >
            View All Expenses →
          </Link>
        </div>
        <div className="bg-slate-800/50 border border-white/5 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <h2 className="text-white font-semibold mb-4">Budget Utilisation</h2>
            <p className="text-slate-500 text-sm text-center py-6">No budget data available</p>
          </div>
          <Link
            href="/finance/budgets"
            className="block w-full text-center py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-medium rounded-lg transition mt-4 cursor-pointer"
          >
            Manage Budgets →
          </Link>
        </div>
      </div>
    </div>
  );
}
