"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface IncomeRow {
  id: string;
  receiptNumber: string | null;
  type: "Tithe" | "Offering";
  memberId?: string;
  amount: string;
  paymentMethod: string;
  createdAt: string;
}

export default function IncomePage() {
  const [income, setIncome] = useState<IncomeRow[]>([]);
  const [members, setMembers] = useState<Record<string, string>>({});
  const [typeFilter, setTypeFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch members map
      const membersRes = await fetch("/api/members?limit=100");
      if (membersRes.ok) {
        const data = await membersRes.json();
        const map: Record<string, string> = {};
        if (data && Array.isArray(data.data)) {
          data.data.forEach((m: { id: string; firstName: string; lastName: string }) => {
            map[m.id] = `${m.firstName} ${m.lastName}`;
          });
        }
        setMembers(map);
      }

      // Fetch Tithes and Offerings in parallel
      const [tithesRes, offeringsRes] = await Promise.all([
        fetch("/api/finance/tithes"),
        fetch("/api/finance/offerings"),
      ]);

      const rows: IncomeRow[] = [];

      if (tithesRes.ok) {
        const tithesData = await tithesRes.json();
        if (Array.isArray(tithesData)) {
          tithesData.forEach((t) => {
            rows.push({
              id: t.id,
              receiptNumber: t.receiptNumber,
              type: "Tithe",
              memberId: t.memberId,
              amount: t.amount,
              paymentMethod: t.paymentMethod,
              createdAt: t.createdAt,
            });
          });
        }
      }

      if (offeringsRes.ok) {
        const offeringsData = await offeringsRes.json();
        if (Array.isArray(offeringsData)) {
          offeringsData.forEach((o) => {
            rows.push({
              id: o.id,
              receiptNumber: o.receiptNumber,
              type: "Offering",
              amount: o.amount,
              paymentMethod: o.paymentMethod,
              createdAt: o.createdAt,
            });
          });
        }
      }

      // Sort by newest first
      rows.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setIncome(rows);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredIncome = income.filter((item) => {
    if (typeFilter === "All") return true;
    return item.type === typeFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Income Records</h1>
          <p className="text-slate-400 text-sm mt-1">Tithes, offerings, and donations</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/finance/income/tithe/new"
            className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-medium rounded-lg transition cursor-pointer"
          >
            + Record Tithe
          </Link>
          <Link
            href="/finance/income/offering/new"
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition cursor-pointer"
          >
            + Record Offering
          </Link>
        </div>
      </div>

      <div className="flex gap-2">
        {["All", "Tithe", "Offering"].map((tab) => (
          <button
            key={tab}
            onClick={() => setTypeFilter(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
              typeFilter === tab
                ? "bg-indigo-600 text-white"
                : "bg-white/5 hover:bg-white/10 text-slate-300"
            }`}
          >
            {tab === "All" ? "All" : tab + "s"}
          </button>
        ))}
      </div>

      <div className="bg-slate-800/50 border border-white/5 rounded-xl overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b border-white/5 bg-slate-900/30">
              <th className="px-4 py-3 text-slate-400 font-medium">Receipt #</th>
              <th className="px-4 py-3 text-slate-400 font-medium">Type</th>
              <th className="px-4 py-3 text-slate-400 font-medium">Member</th>
              <th className="px-4 py-3 text-slate-400 font-medium">Amount</th>
              <th className="px-4 py-3 text-slate-400 font-medium">Payment Method</th>
              <th className="px-4 py-3 text-slate-400 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                  Loading income records...
                </td>
              </tr>
            ) : filteredIncome.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                  No income records found.
                </td>
              </tr>
            ) : (
              filteredIncome.map((row) => (
                <tr key={row.id} className="border-b border-white/5 hover:bg-white/5 transition">
                  <td className="px-4 py-3.5 text-indigo-400 font-mono text-xs font-semibold">
                    {row.receiptNumber ?? "—"}
                  </td>
                  <td className="px-4 py-3.5 text-white font-medium">
                    <span
                      className={`px-2 py-0.5 rounded text-xs border ${
                        row.type === "Tithe"
                          ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                          : "bg-teal-500/10 text-teal-400 border-teal-500/20"
                      }`}
                    >
                      {row.type}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-300">
                    {row.memberId ? members[row.memberId] ?? "Unknown Member" : "N/A (General Offering)"}
                  </td>
                  <td className="px-4 py-3.5 text-white font-mono font-semibold">
                    ${parseFloat(row.amount).toFixed(2)}
                  </td>
                  <td className="px-4 py-3.5 text-slate-300 capitalize">
                    {row.paymentMethod.replace("_", " ")}
                  </td>
                  <td className="px-4 py-3.5 text-slate-400">
                    {new Date(row.createdAt).toLocaleDateString()}
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
