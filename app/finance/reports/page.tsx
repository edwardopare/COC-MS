import type { Metadata } from "next";

export const metadata: Metadata = { title: "Finance Reports" };

const REPORT_TYPES = [
  { group: "Administrative", items: ["Member List", "New Members", "Attendance Report", "Department Attendance", "User Activity"] },
  { group: "Financial", items: ["Tithe Report", "Offering Report", "Donation Report", "Pledge Report", "Outstanding Pledges", "Expense Report", "Budget Variance"] },
  { group: "Reconciliation", items: ["Income & Expenditure", "Treasury Summary", "Bank Reconciliation", "Audit Trail"] },
];

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Reports</h1>
        <p className="text-slate-400 text-sm mt-1">Generate and export financial and administrative reports</p>
      </div>

      <div className="bg-slate-800/50 border border-white/5 rounded-xl p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Report Type</label>
            <select id="report-type-select" className="w-full px-3 py-2.5 bg-slate-900 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              {REPORT_TYPES.map(group => (
                <optgroup key={group.group} label={`── ${group.group}`}>
                  {group.items.map(item => <option key={item} value={item.toLowerCase().replace(/ /g, "-")}>{item}</option>)}
                </optgroup>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">From Date</label>
            <input type="date" className="w-full px-3 py-2.5 bg-slate-900 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">To Date</label>
            <input type="date" className="w-full px-3 py-2.5 bg-slate-900 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="flex flex-col justify-end gap-2">
            <button id="generate-report-btn" className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition">Generate Report</button>
          </div>
        </div>
      </div>

      {/* Report preview area */}
      <div className="bg-slate-800/50 border border-white/5 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold">Report Preview</h2>
          <div className="flex gap-2">
            <button id="export-pdf-btn" className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/20 rounded-lg text-xs font-medium transition">Export PDF</button>
            <button id="export-excel-btn" className="px-3 py-1.5 bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-500/20 rounded-lg text-xs font-medium transition">Export Excel</button>
          </div>
        </div>
        <div className="text-center py-12 text-slate-500">
          <svg className="w-12 h-12 mx-auto mb-3 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          <p>Select a report type and date range, then click Generate Report</p>
        </div>
      </div>
    </div>
  );
}
