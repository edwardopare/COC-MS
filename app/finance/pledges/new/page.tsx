"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Member {
  id: string;
  memberId: string;
  firstName: string;
  lastName: string;
}

interface Campaign {
  id: string;
  name: string;
}

export default function NewPledgePage() {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [branchId, setBranchId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Campaign quick-create state
  const [showNewCampaign, setShowNewCampaign] = useState(false);
  const [newCampaignName, setNewCampaignName] = useState("");
  const [newCampaignTarget, setNewCampaignTarget] = useState("");

  const loadInitialData = async () => {
    try {
      // Fetch members
      const memRes = await fetch("/api/members?limit=100");
      if (memRes.ok) {
        const memData = await memRes.json();
        if (memData && Array.isArray(memData.data)) {
          setMembers(memData.data);
        }
      }

      // Fetch campaigns
      const campRes = await fetch("/api/finance/pledges/campaigns");
      if (campRes.ok) {
        const campData = await campRes.json();
        if (Array.isArray(campData)) {
          setCampaigns(campData);
        }
      }

      // Fetch default branch
      const branchRes = await fetch("/api/branches");
      if (branchRes.ok) {
        const branchData = await branchRes.json();
        if (branchData && branchData.length > 0) {
          setBranchId(branchData[0].id);
        }
      }
    } catch {
      /* silent */
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleCreateCampaign = async () => {
    if (!newCampaignName) return;
    setError("");
    try {
      const res = await fetch("/api/finance/pledges/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCampaignName,
          targetAmount: newCampaignTarget || undefined,
          startDate: new Date().toISOString(),
          branchId,
        }),
      });

      if (res.ok) {
        setNewCampaignName("");
        setNewCampaignTarget("");
        setShowNewCampaign(false);
        // Refresh campaigns
        const campRes = await fetch("/api/finance/pledges/campaigns");
        if (campRes.ok) {
          const campData = await campRes.json();
          setCampaigns(campData);
        }
      } else {
        const data = await res.json();
        setError(data.error ?? "Failed to create campaign.");
      }
    } catch {
      setError("A network error occurred.");
    }
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const body = {
      campaignId: form.get("campaignId") as string,
      memberId: form.get("memberId") as string,
      pledgedAmount: form.get("pledgedAmount") as string,
      dueDate: (form.get("dueDate") as string) || undefined,
      notes: (form.get("notes") as string) || undefined,
    };

    try {
      const res = await fetch("/api/finance/pledges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to record pledge");
        setLoading(false);
        return;
      }

      router.push("/finance/pledges");
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
        <h1 className="text-2xl font-bold text-white">Record Member Pledge</h1>
        <p className="text-slate-400 text-sm mt-1">
          Pledges recorded here can be tracked against campaigns.
        </p>
      </div>

      {/* Campaign Quick Create trigger */}
      {!showNewCampaign ? (
        <button
          onClick={() => setShowNewCampaign(true)}
          className="px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/20 rounded-lg text-xs font-semibold transition cursor-pointer"
        >
          + Create New Campaign
        </button>
      ) : (
        <div className="bg-slate-800/30 border border-white/5 p-4 rounded-xl space-y-3">
          <p className="text-white text-xs font-semibold">New Pledge Campaign</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Campaign Name (e.g. Building Fund 2026)"
              value={newCampaignName}
              onChange={(e) => setNewCampaignName(e.target.value)}
              className={inputCls}
            />
            <input
              type="text"
              placeholder="Target Amount (e.g. 50000)"
              value={newCampaignTarget}
              onChange={(e) => setNewCampaignTarget(e.target.value)}
              className={inputCls}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setShowNewCampaign(false)}
              className="px-3 py-1.5 text-slate-400 text-xs hover:text-slate-200 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateCampaign}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-semibold transition"
            >
              Save Campaign
            </button>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-slate-800/50 border border-white/5 rounded-xl p-6 space-y-5"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Campaign *</label>
            <select name="campaignId" required className={inputCls}>
              <option value="">Choose campaign…</option>
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Member *</label>
            <select name="memberId" required className={inputCls}>
              <option value="">Choose member…</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.firstName} {m.lastName} ({m.memberId})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Pledged Amount *</label>
            <input
              name="pledgedAmount"
              type="text"
              required
              className={inputCls}
              placeholder="500.00"
              pattern="^\d+(\.\d{1,2})?$"
              title="Enter a valid decimal amount"
            />
          </div>
          <div>
            <label className={labelCls}>Due Date</label>
            <input name="dueDate" type="date" className={inputCls} />
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
            disabled={loading || campaigns.length === 0}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition disabled:opacity-60 cursor-pointer"
          >
            {loading ? "Recording…" : "Record Pledge"}
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
