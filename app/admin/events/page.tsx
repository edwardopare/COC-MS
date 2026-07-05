import type { Metadata } from "next";

export const metadata: Metadata = { title: "Events" };

export default function EventsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Events</h1>
          <p className="text-slate-400 text-sm mt-1">Schedule and manage church events</p>
        </div>
        <a href="/admin/events/new" className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition flex items-center gap-2">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
          New Event
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {["Upcoming Events", "This Week", "Past Events"].map(label => (
          <div key={label} className="bg-slate-800/50 border border-white/5 rounded-xl p-5 text-center">
            <p className="text-slate-400 text-sm mb-1">{label}</p>
            <p className="text-white text-3xl font-bold">—</p>
          </div>
        ))}
      </div>

      <div className="bg-slate-800/50 border border-white/5 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left px-4 py-3 text-slate-400 font-medium">Event</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium">Date</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium">Type</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium">Venue</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={5} className="px-4 py-10 text-center text-slate-500">Connect your database to see events.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
