"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Pledge {
  id: string;
  campaignId: string;
  memberId: string;
  pledgedAmount: string;
  paidAmount: string;
  dueDate: string | null;
  status: string;
}

interface Member {
  id: string;
  firstName: string;
  lastName: string;
}

interface Campaign {
  id: string;
  name: string;
}

export default function PledgesPage() {
  const [pledges, setPledges] = useState<Pledge[]>([]);
  const [members, setMembers] = useState<Record<string, string>>({});
  const [campaigns, setCampaigns] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [pledgeRes, memRes, campRes] = await Promise.all([
          fetch("/api/finance/pledges"),
          fetch("/api/members?limit=100"),
          fetch("/api/finance/pledges/campaigns"),
        ]);

        if (pledgeRes.ok) {
          const pledgesData = await pledgeRes.json();
          setPledges(pledgesData);
        }

        if (memRes.ok) {
          const memData = await memRes.json();
          const memMap: Record<string, string> = {};
          if (memData && Array.isArray(memData.data)) {
            memData.data.forEach((m: Member) => {
              memMap[m.id] = `${m.firstName} ${m.lastName}`;
            });
          }
          setMembers(memMap);
        }

        if (campRes.ok) {
          const campData = await campRes.json();
          const campMap: Record<string, string> = {};
          if (Array.isArray(campData)) {
            campData.forEach((c: Campaign) => {
              campMap[c.id] = c.name;
            });
          }
          setCampaigns(campMap);
        }
      } catch {
        /* silent */
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Member Pledges</h1>
          <p className="text-slate-400 text-sm mt-1">Monitor pledged contributions and campaigns</p>
        </div>
        <Link
          href="/finance/pledges/new"
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition flex items-center gap-2 cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Record Pledge
        </Link>
      </div>

      <div className="bg-slate-800/50 border border-white/5 rounded-xl overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b border-white/5 bg-slate-900/30">
              <th className="px-4 py-3 text-slate-400 font-medium">Campaign</th>
              <th className="px-4 py-3 text-slate-400 font-medium">Member</th>
              <th className="px-4 py-3 text-slate-400 font-medium">Pledged</th>
              <th className="px-4 py-3 text-slate-400 font-medium">Paid</th>
              <th className="px-4 py-3 text-slate-400 font-medium">Balance</th>
              <th className="px-4 py-3 text-slate-400 font-medium">Due Date</th>
              <th className="px-4 py-3 text-slate-400 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                  Loading pledges...
                </td>
              </tr>
            ) : pledges.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                  No pledges found. Click{" "}
                  <Link href="/finance/pledges/new" className="text-indigo-400 font-medium hover:underline">
                    Record Pledge
                  </Link>{" "}
                  to record the first member contribution pledge.
                </td>
              </tr>
            ) : (
              pledges.map((pledge) => {
                const pledged = parseFloat(pledge.pledgedAmount);
                const paid = parseFloat(pledge.paidAmount);
                const balance = Math.max(0, pledged - paid);
                return (
                  <tr key={pledge.id} className="border-b border-white/5 hover:bg-white/5 transition">
                    <td className="px-4 py-3.5 text-white font-medium">
                      {campaigns[pledge.campaignId] ?? "Unknown Campaign"}
                    </td>
                    <td className="px-4 py-3.5 text-slate-300">
                      {members[pledge.memberId] ?? "Unknown Member"}
                    </td>
                    <td className="px-4 py-3.5 text-white font-mono font-semibold">
                      ${pledged.toFixed(2)}
                    </td>
                    <td className="px-4 py-3.5 text-green-400 font-mono">
                      ${paid.toFixed(2)}
                    </td>
                    <td className="px-4 py-3.5 text-amber-400 font-mono">
                      ${balance.toFixed(2)}
                    </td>
                    <td className="px-4 py-3.5 text-slate-400">
                      {pledge.dueDate ? new Date(pledge.dueDate).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-xs border capitalize ${
                          pledge.status === "fulfilled"
                            ? "bg-green-500/10 text-green-400 border-green-500/20"
                            : pledge.status === "active"
                            ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                            : "bg-red-500/10 text-red-400 border-red-500/20"
                        }`}
                      >
                        {pledge.status}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
