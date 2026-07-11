"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className={`bg-slate-800/50 border border-white/5 rounded-xl p-5 flex items-center gap-4`}>
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-slate-400 text-sm">{label}</p>
        <p className="text-white text-2xl font-bold mt-0.5">{value}</p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalMembers: 0,
    newMembersThisMonth: 0,
    eventsThisWeek: 0,
    pendingExpenses: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => {
        if (data) setStats(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Overview of church administration</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Members"
          value={loading ? "—" : stats.totalMembers}
          color="bg-indigo-500/20"
          icon={
            <svg
              className="w-6 h-6 text-indigo-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path strokeLinecap="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" />
            </svg>
          }
        />
        <StatCard
          label="New This Month"
          value={loading ? "—" : stats.newMembersThisMonth}
          color="bg-green-500/20"
          icon={
            <svg
              className="w-6 h-6 text-green-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          }
        />
        <StatCard
          label="Events This Week"
          value={loading ? "—" : stats.eventsThisWeek}
          color="bg-amber-500/20"
          icon={
            <svg
              className="w-6 h-6 text-amber-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18" />
            </svg>
          }
        />
        <StatCard
          label="Pending Expenses"
          value={loading ? "—" : stats.pendingExpenses}
          color="bg-rose-500/20"
          icon={
            <svg
              className="w-6 h-6 text-rose-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"
              />
            </svg>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-slate-800/50 border border-white/5 rounded-xl p-5">
          <h2 className="text-white font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              ["Add Member", "/admin/members/new"],
              ["Record Attendance", "/admin/attendance"],
              ["Create Event", "/admin/events/new"],
              ["Submit Expense", "/admin/expenses/new"],
            ].map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className="flex items-center justify-center px-4 py-3 bg-white/5 hover:bg-indigo-500/10 border border-white/5 hover:border-indigo-500/20 rounded-lg text-slate-300 hover:text-indigo-300 text-sm font-medium transition cursor-pointer"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
        <div className="bg-slate-800/50 border border-white/5 rounded-xl p-5">
          <h2 className="text-white font-semibold mb-4">Recent Activity</h2>
          <p className="text-slate-500 text-sm text-center py-6">No recent activity to display</p>
        </div>
      </div>
    </div>
  );
}
