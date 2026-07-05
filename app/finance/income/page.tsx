import type { Metadata } from "next";

export const metadata: Metadata = { title: "Income" };

export default function IncomePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Income Records</h1>
          <p className="text-slate-400 text-sm mt-1">Tithes, offerings, and donations</p>
        </div>
        <div className="flex gap-2">
          <a href="/finance/income/tithe/new" className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-medium rounded-lg transition">+ Record Tithe</a>
          <a href="/finance/income/offering/new" className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition">+ Record Offering</a>
        </div>
      </div>

      <div className="flex gap-2">
        {["All", "Tithes", "Offerings", "Donations"].map(tab => (
          <button key={tab} className="px-4 py-2 text-sm font-medium rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition">{tab}</button>
        ))}
      </div>

      {/* Date filter */}
      <div className="flex gap-3 items-center">
        <input type="month" className="px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        <select className="px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">All Service Types</option>
          <option>Sunday Service</option>
          <option>Midweek</option>
          <option>Special Event</option>
        </select>
      </div>

      <div className="bg-slate-800/50 border border-white/5 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left px-4 py-3 text-slate-400 font-medium">Receipt #</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium">Type</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium">Member</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium">Amount</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium">Service</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={6} className="px-4 py-10 text-center text-slate-500">Connect your database to see income records.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
