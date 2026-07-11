"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Category {
  id: string;
  name: string;
}

interface BudgetItemInput {
  categoryId: string;
  allocatedAmount: string;
  notes: string;
}

export default function NewBudgetPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [branchId, setBranchId] = useState("");
  const [name, setName] = useState("");
  const [period, setPeriod] = useState<"monthly" | "annual">("annual");
  const [periodLabel, setPeriodLabel] = useState(String(new Date().getFullYear()));
  const [totalAmount, setTotalAmount] = useState("");
  const [items, setItems] = useState<BudgetItemInput[]>([
    { categoryId: "", allocatedAmount: "", notes: "" },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch default branch
    fetch("/api/branches")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setBranchId(data[0].id);
        }
      })
      .catch(() => {});

    // Fetch expense categories for items allocation
    fetch("/api/expense-categories")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const unique = Array.from(new Map(data.map((c: any) => [c.name, c])).values());
          setCategories(unique);
        }
      })
      .catch(() => {});
  }, []);

  const handleAddItem = () => {
    setItems((prev) => [...prev, { categoryId: "", allocatedAmount: "", notes: "" }]);
  };

  const handleRemoveItem = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleItemChange = (idx: number, field: keyof BudgetItemInput, value: string) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    // Validation
    const cleanItems = items.filter((item) => item.categoryId && item.allocatedAmount);
    if (cleanItems.length === 0) {
      setError("Please add at least one budget item with category and amount.");
      return;
    }

    setLoading(true);

    const body = {
      branchId,
      name,
      period,
      periodLabel,
      totalAmount,
      items: cleanItems.map((item) => ({
        categoryId: item.categoryId,
        allocatedAmount: item.allocatedAmount,
        notes: item.notes || undefined,
      })),
    };

    try {
      const res = await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to create budget");
        setLoading(false);
        return;
      }

      router.push("/finance/budgets");
    } catch {
      setError("A network error occurred.");
      setLoading(false);
    }
  }

  const inputCls =
    "w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition";
  const labelCls = "block text-sm font-medium text-slate-300 mb-1.5";

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Create New Budget</h1>
        <p className="text-slate-400 text-sm mt-1">
          Set up a new monthly or annual budget plan.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-slate-800/50 border border-white/5 rounded-xl p-6 space-y-5">
          <h2 className="text-white font-semibold text-base">General Information</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Budget Name *</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className={inputCls}
                placeholder="Annual Operations Budget 2026"
              />
            </div>
            <div>
              <label className={labelCls}>Total Budget Amount *</label>
              <input
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                required
                className={inputCls}
                placeholder="100000.00"
                pattern="^\d+(\.\d{1,2})?$"
                title="Enter a valid decimal number"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Period Type *</label>
              <select
                value={period}
                onChange={(e) => {
                  const val = e.target.value as "monthly" | "annual";
                  setPeriod(val);
                  setPeriodLabel(
                    val === "annual"
                      ? String(new Date().getFullYear())
                      : `${new Date().getFullYear()}-01`
                  );
                }}
                className={inputCls}
              >
                <option value="annual">Annual</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>
                {period === "annual" ? "Year (YYYY) *" : "Month (YYYY-MM) *"}
              </label>
              <input
                type={period === "annual" ? "number" : "month"}
                value={periodLabel}
                onChange={(e) => setPeriodLabel(e.target.value)}
                required
                className={inputCls}
              />
            </div>
          </div>
        </div>

        {/* Budget Items allocation list */}
        <div className="bg-slate-800/50 border border-white/5 rounded-xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-semibold text-base">Allocations by Category</h2>
            <button
              type="button"
              onClick={handleAddItem}
              className="px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white rounded font-medium transition cursor-pointer"
            >
              + Add Allocation
            </button>
          </div>

          <div className="space-y-3">
            {items.map((item, idx) => (
              <div key={idx} className="flex flex-wrap items-center gap-3 bg-slate-900/30 p-3 rounded-lg border border-white/5">
                <div className="flex-1 min-w-48">
                  <select
                    value={item.categoryId}
                    onChange={(e) => handleItemChange(idx, "categoryId", e.target.value)}
                    required
                    className={inputCls}
                  >
                    <option value="">Select category…</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-32">
                  <input
                    value={item.allocatedAmount}
                    onChange={(e) => handleItemChange(idx, "allocatedAmount", e.target.value)}
                    required
                    className={inputCls}
                    placeholder="Allocated Amount"
                    pattern="^\d+(\.\d{1,2})?$"
                    title="Enter a valid decimal number"
                  />
                </div>
                <div className="flex-1 min-w-40">
                  <input
                    value={item.notes}
                    onChange={(e) => handleItemChange(idx, "notes", e.target.value)}
                    className={inputCls}
                    placeholder="Notes (optional)"
                  />
                </div>
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition cursor-pointer"
                    title="Remove item"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {error && (
          <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading || !branchId}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition disabled:opacity-60 cursor-pointer"
          >
            {loading ? "Creating…" : "Create Budget Plan"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg transition cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
