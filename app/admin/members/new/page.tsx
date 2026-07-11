"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewMemberPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(""); setLoading(true);
    const form = new FormData(e.currentTarget);
    const body = Object.fromEntries(form.entries());
    const res = await fetch("/api/members", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? "Failed to register member"); setLoading(false); return; }
    router.push(`/admin/members`);
  }

  const inputCls = "w-full px-3 py-2.5 bg-slate-800 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition";
  const labelCls = "block text-sm font-medium text-slate-300 mb-1.5";

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Register New Member</h1>
        <p className="text-slate-400 text-sm mt-1">All required fields are marked with *</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-800/50 border border-white/5 rounded-xl p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div><label className={labelCls}>First Name *</label><input name="firstName" required className={inputCls} placeholder="John" /></div>
          <div><label className={labelCls}>Middle Name</label><input name="middleName" className={inputCls} placeholder="(optional)" /></div>
          <div><label className={labelCls}>Last Name *</label><input name="lastName" required className={inputCls} placeholder="Doe" /></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className={labelCls}>Phone *</label><input name="phone" required className={inputCls} placeholder="+1234567890" /></div>
          <div><label className={labelCls}>Email</label><input name="email" type="email" className={inputCls} placeholder="john@email.com" /></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div><label className={labelCls}>Gender</label>
            <select name="gender" className={inputCls}><option value="">Select</option><option value="male">Male</option><option value="female">Female</option></select>
          </div>
          <div><label className={labelCls}>Date of Birth</label><input name="dateOfBirth" type="date" max={new Date().toISOString().split("T")[0]} className={inputCls} /></div>
          <div><label className={labelCls}>Marital Status</label>
            <select name="maritalStatus" className={inputCls}><option value="">Select</option><option value="single">Single</option><option value="married">Married</option><option value="widowed">Widowed</option><option value="divorced">Divorced</option></select>
          </div>
        </div>

        <div><label className={labelCls}>Residential Address</label><textarea name="address" rows={2} className={inputCls} placeholder="Street, City, State" /></div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className={labelCls}>Occupation</label><input name="occupation" className={inputCls} placeholder="Teacher, Engineer…" /></div>
          <div><label className={labelCls}>Join Date</label><input name="joinDate" type="date" max={new Date().toISOString().split("T")[0]} className={inputCls} /></div>
        </div>

        <div className="flex items-center gap-3">
          <input id="isBaptized" name="isBaptized" type="checkbox" value="true" className="w-4 h-4 rounded border-white/20 text-indigo-500" />
          <label htmlFor="isBaptized" className="text-sm text-slate-300">Member is baptized</label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className={labelCls}>Emergency Contact Name</label><input name="emergencyContactName" className={inputCls} placeholder="Jane Doe" /></div>
          <div><label className={labelCls}>Emergency Contact Phone</label><input name="emergencyContactPhone" className={inputCls} placeholder="+1234567890" /></div>
        </div>

        {/* branchId will be fetched dynamically in production */}
        <input type="hidden" name="branchId" value="" />

        {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition disabled:opacity-60">
            {loading ? "Saving…" : "Register Member"}
          </button>
          <button type="button" onClick={() => router.back()} className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg transition">Cancel</button>
        </div>
      </form>
    </div>
  );
}
