"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Pencil, X, Save } from "lucide-react";

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

  // Edit modal state
  const [editExpense, setEditExpense] = useState<Expense | null>(null);
  const [editForm, setEditForm] = useState<Record<string, string>>({});
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

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

  const openEdit = (expense: Expense) => {
    setEditError("");
    setEditExpense(expense);
    setEditForm({
      description: expense.description || "",
      amount: expense.amount || "",
      periodMonth: expense.periodMonth || "",
    });
  };

  const handleEditSave = async () => {
    if (!editExpense) return;
    setEditLoading(true);
    setEditError("");

    try {
      const res = await fetch(`/api/finance/expenses/${editExpense.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        setEditExpense(null);
        loadExpenses();
      } else {
        const data = await res.json();
        setEditError(data.error || "Failed to update expense.");
      }
    } catch {
      setEditError("A network error occurred.");
    } finally {
      setEditLoading(false);
    }
  };

  const inputCls = "w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500";
  const labelCls = "block text-xs font-medium text-slate-400 mb-1";

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
              <th className="px-4 py-3 text-slate-400 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                  Loading requests...
                </td>
              </tr>
            ) : expenses.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                  No expense requests found.
                </td>
              </tr>
            ) : (
              expenses.map((expense) => (
                <tr key={expense.id} className="border-b border-white/5 hover:bg-white/5 transition">
                  <td className="px-4 py-3.5 text-white font-medium">{expense.description}</td>
                  <td className="px-4 py-3.5 text-white font-mono">GH₵{parseFloat(expense.amount).toFixed(2)}</td>
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
                  <td className="px-4 py-3.5 text-right">
                    {expense.status === "pending" && (
                      <button
                        onClick={() => openEdit(expense)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg transition"
                      >
                        <Pencil className="w-3 h-3" /> Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-800 border border-white/10 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Edit Expense</h2>
              <button onClick={() => setEditExpense(null)} className="text-slate-400 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            {editError && (
              <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{editError}</p>
            )}

            <div className="space-y-4">
              <div>
                <label className={labelCls}>Description *</label>
                <input value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Amount (GH₵) *</label>
                <input type="number" step="0.01" min="0" value={editForm.amount} onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Period (YYYY-MM) *</label>
                <input type="month" value={editForm.periodMonth} onChange={(e) => setEditForm({ ...editForm, periodMonth: e.target.value })} className={inputCls} />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-white/5">
              <button onClick={() => setEditExpense(null)} className="px-4 py-2 text-sm bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg transition">Cancel</button>
              <button onClick={handleEditSave} disabled={editLoading} className="flex items-center gap-2 px-5 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-lg transition">
                <Save className="w-3.5 h-3.5" /> {editLoading ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
