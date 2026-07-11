"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Event {
  id: string;
  name: string;
  eventDate: string;
}

interface Category {
  id: string;
  name: string;
}

export default function NewOfferingPage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [branchId, setBranchId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch events
    fetch("/api/events")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const unique = Array.from(new Map(data.map((e: any) => [e.name, e])).values());
          setEvents(unique);
        }
      })
      .catch(() => {});

    // Fetch income categories
    fetch("/api/income-categories")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const unique = Array.from(new Map(data.map((c: any) => [c.name, c])).values());
          setCategories(unique);
        }
      })
      .catch(() => {});

    // Fetch branches
    fetch("/api/branches")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setBranchId(data[0].id);
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
      eventId: (form.get("eventId") as string) || undefined,
      categoryId: (form.get("categoryId") as string) || undefined,
      amount: form.get("amount") as string,
      paymentMethod: form.get("paymentMethod") as string,
      referenceNumber: (form.get("referenceNumber") as string) || undefined,
      notes: (form.get("notes") as string) || undefined,
    };

    try {
      const res = await fetch("/api/finance/offerings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to record offering");
        setLoading(false);
        return;
      }

      router.push("/finance/income");
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
        <h1 className="text-2xl font-bold text-white">Record Offering</h1>
        <p className="text-slate-400 text-sm mt-1">
          Record service offerings, tithes, or other collections.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-slate-800/50 border border-white/5 rounded-xl p-6 space-y-5"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Category</label>
            <select name="categoryId" className={inputCls}>
              <option value="">Choose category… (optional)</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Event / Service</label>
            <select name="eventId" className={inputCls}>
              <option value="">Choose event… (optional)</option>
              {events.map((evt) => (
                <option key={evt.id} value={evt.id}>
                  {evt.name} — {new Date(evt.eventDate).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Amount *</label>
            <input
              name="amount"
              type="text"
              required
              className={inputCls}
              placeholder="250.00"
              pattern="^\d+(\.\d{1,2})?$"
              title="Enter a valid decimal amount (e.g. 250 or 250.00)"
            />
          </div>
          <div>
            <label className={labelCls}>Payment Method *</label>
            <select name="paymentMethod" required className={inputCls}>
              <option value="cash">Cash</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="cheque">Cheque</option>
              <option value="mobile_money">Mobile Money</option>
              <option value="online">Online</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Reference Number</label>
            <input
              name="referenceNumber"
              className={inputCls}
              placeholder="TXN123456789 (optional)"
            />
          </div>
        </div>

        <div>
          <label className={labelCls}>Notes</label>
          <textarea
            name="notes"
            rows={2}
            className={inputCls}
            placeholder="Additional details…"
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
            {loading ? "Recording…" : "Record Offering"}
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
