import type { Metadata } from "next";

export const metadata: Metadata = { title: "Attendance" };

export default function AttendancePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Attendance</h1>
          <p className="text-slate-400 text-sm mt-1">Record and track event attendance</p>
        </div>
        <div className="flex gap-2">
          <button id="bulk-upload-btn" className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-medium rounded-lg transition flex items-center gap-2">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
            CSV Upload
          </button>
          <button id="record-attendance-btn" className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition flex items-center gap-2">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
            Record Attendance
          </button>
        </div>
      </div>

      {/* Event selector */}
      <div className="bg-slate-800/50 border border-white/5 rounded-xl p-5 flex flex-wrap gap-4">
        <div className="flex-1 min-w-48">
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Select Event</label>
          <select className="w-full px-3 py-2.5 bg-slate-900 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">Choose an event…</option>
          </select>
        </div>
        <div className="flex-1 min-w-36">
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Service Type</label>
          <select className="w-full px-3 py-2.5 bg-slate-900 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="sunday_service">Sunday Service</option>
            <option value="midweek">Midweek</option>
            <option value="special_event">Special Event</option>
          </select>
        </div>
        <div className="flex items-end">
          <button className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition">Load</button>
        </div>
      </div>

      <div className="bg-slate-800/50 border border-white/5 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
          <span className="text-white font-medium text-sm">Member Attendance List</span>
          <span className="text-slate-500 text-xs">Select an event to load members</span>
        </div>
        <div className="px-4 py-10 text-center text-slate-500 text-sm">
          Select an event above to load the member attendance roster. <br/>
          CSV format: <code className="text-indigo-400">member_id, present (true/false), notes</code>
        </div>
      </div>
    </div>
  );
}
