"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Category {
  id: string;
  name: string;
  description: string | null;
}

export default function NewExpensePage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [branchId, setBranchId] = useState("");
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

    // Fetch expense categories
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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const body = {
      branchId,
      categoryId: form.get("categoryId") as string,
      amount: form.get("amount") as string,
      description: form.get("description") as string,
      periodMonth: form.get("periodMonth") as string,
    };

    try {
      const res = await fetch("/api/finance/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to submit expense request");
        setLoading(false);
        return;
      }

      router.push("/admin/expenses");
    } catch {
      setError("A network error occurred.");
      setLoading(false);
    }
  }

  const inputCls =
    "w-full px-3 py-2.5 bg-slate-800 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition";
  const labelCls = "block text-sm font-medium text-slate-300 mb-1.5";

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Submit Expense Request</h1>
        <p className="text-slate-400 text-sm mt-1">
          Submit a new request for church operational expenses.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-slate-800/50 border border-white/5 rounded-xl p-6 space-y-5"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Expense Category *</label>
            <select name="categoryId" required className={inputCls}>
              <option value="">Select category…</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Amount *</label>
            <input
              name="amount"
              type="text"
              required
              className={inputCls}
              placeholder="150.00"
              pattern="^\d+(\.\d{1,2})?$"
              title="Enter a valid decimal number (e.g. 150 or 150.00)"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Period (Month) *</label>
            <input
              name="periodMonth"
              type="month"
              required
              className={inputCls}
            />
          </div>
        </div>

        <div>
          <label className={labelCls}>Description *</label>
          <textarea
            name="description"
            rows={3}
            required
            className={inputCls}
            placeholder="Describe the reason for the expense in detail…"
          />
        </div>

        {error && (
          <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading || !branchId}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition disabled:opacity-60 cursor-pointer"
          >
            {loading ? "Submitting…" : "Submit Request"}
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
